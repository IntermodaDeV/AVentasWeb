import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { APIURL } from 'utils/Enviroment';
import { IsAllow } from 'components/Seguridad/Permisos';
import AddCircleIcon from '@material-ui/icons/AddCircle';
const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScrollMaxHeight: {
                maxHeight: 'unset !important',
            }
        },
        MUIDataTableBodyRow: {
            root: {
                '&:nth-child(odd)': {
                    backgroundColor: '#f8f8f8'
                }
            }
        },
    }
});

const DatatableOptions = {
    filter: true,
    filterType: "dropdown",
    responsive: "scrollMaxHeight",
    print: false,
    download: false,
    selectableRows: 'none',
    customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage) => (
        <TableFooter>
            <TableRow>
                <TablePagination
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={(_, page) => changePage(page)}
                    onChangeRowsPerPage={event => changeRowsPerPage(event.target.value)}
                    rowsPerPageOptions={[10, 15, 100]}
                    ActionsComponent={CustomFooter}
                    labelRowsPerPage="Filas por página:"
                />
            </TableRow>
        </TableFooter>
    ),
    textLabels: {
        body: {
            noMatch: "No se han encontrado razones de no venta",
            toolTip: "Ordenar",
        },
        pagination: {
            next: "Siguiente",
            previous: "Anterior",
            rowsPerPage: "Filas por página:",
            displayRows: "de",
        },
        toolbar: {
            search: "Buscar",
            downloadCsv: "Descargar CSV",
            print: "Imprimir",
            viewColumns: "Ver Columnas",
            filterTable: "Filtrar Tabla",
        },
        filter: {
            all: "Todos",
            title: "Filtros",
            reset: "Quitar",
        },
        viewColumns: {
            title: "Mostrar Columnas",
            titleAria: "Mostrar/Esconder Columnas",
        },
        selectedRows: {
            text: "Fila(s) seleccionadas",
            delete: "Borrar",
            deleteAria: "Borrar Filas Seleccionadas",
        },
    }
};

let Header = [
    {
        name: "motivo",
        label: "Motivo tiempo fuera",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "estado",
        label: "Estado",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value) => {
                return (
                    <span style={{ color: (value === "Activo") ? 'green' : 'red', fontWeight: 'bolder' }}>{value}</span>
                );
            }
        }
    },
    {
        name: "acciones",
        label: "Acciones",
        options: {
            filter: false,
            sort: false,
        }
    },
];

export const MotivosTiempoFuera = props => {
    const [motivosTiempoFuera, setMotivosTiempoFuera] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [motivo, setMotivo] = useState(null);

    const cargarMotivosTiempoFuera = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/tiemposfuera/motivotiempofuera/admin`);
            setMotivosTiempoFuera(request.data);
        } catch (err) {

        }
    }

    const registrarMotivoTiempoFuera = async () => {
        try {

            await axios.post(`${APIURL}/api/tiemposfuera/motivotiempofuera`, { motivo });
            setMostrarModal(false)
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarMotivosTiempoFuera();
            });

        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha registrado.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const modificarEstado = async (id) => {
        try {
            await axios.post(`${APIURL}/api/tiemposfuera/motivotiempofuera/estado/${id}`);
            cargarMotivosTiempoFuera();
            Swal.fire({
                title: '¡Modificado con exito!',
                text: "Se ha cambiado el estado con exito.",
                type: 'success',
                confirmButtonText: 'OK',
            });
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se pudo modificar el estado.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'OK',
            });
        }
    }

    const obtenerData = () => {
        return motivosTiempoFuera.map((motivo) => ({
            motivo: motivo.descripcion,
            estado: motivo.activo ? "Activo" : "Inactivo",
            acciones: <button onClick={() => { modificarEstado(motivo.id) }} className="btn btn-info">{motivo.activo ? "Inactivar" : "Activar"}</button>
        }));
    }

    useEffect(() => {

        cargarMotivosTiempoFuera();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="container-fluid">
            <h2 style={{ textAlign: 'center' }}>Motivos tiempo fuera</h2>
            <div class="text-right">
                <button className="btn btn-success" onClick={() => { setMostrarModal(true) }}>Registrar Nuevo <AddCircleIcon /></button>
            </div>
            {
                <Dialog open={mostrarModal} aria-labelledby="form-dialog-title">
                    <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">Registrar motivo tiempo fuera</DialogTitle>
                    <DialogContent>
                        <div className="row">
                            <div className="col-12 py-1">
                                <TextField
                                    label="Motivo tiempo fuera"
                                    name="RazonNoVenta"
                                    className="w-100"

                                    onChange={(e) => setMotivo(e.target.value)}
                                    margin="normal"
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => setMostrarModal(false)} color="primary">
                            Cancelar
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            className={"py-1"}
                            style={{ height: '35px' }}
                            onClick={() => registrarMotivoTiempoFuera()}>
                            Guardar
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    data={obtenerData()}
                    columns={Header}
                    options={DatatableOptions}
                />
            </MuiThemeProvider>
        </div>
    )

}