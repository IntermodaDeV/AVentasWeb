import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { APIURL } from 'utils/Enviroment';
import { IsAllow } from 'components/Seguridad/Permisos';

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
            noMatch: "No se han encontrado registros",
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

let HeaderSitios = [
    {
        name: "Ubicacion",
        label: "Ubicación",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Almacen",
        label: "Almacen",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "empresa",
        label: "Empresa",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "estatus",
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

export const Ubicaciones = props => {
    const [ubicaciones, setUbicaciones] = useState([]);

    const cargarUbicaciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/ubicacion`);
            setUbicaciones(request.data);
        } catch (err) {

        }
    }

    const modificarEstado = async (id) => {
        try {
            await axios.post(`${APIURL}/api/ubicacion/modificar/${localStorage.getItem('codigo')}/${id}`);
            cargarUbicaciones();
            Swal.fire({
                title: '¡Modificado con exito!',
                text: "Se ha cambiado el estado de la ubicación con exito.",
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
        return ubicaciones.map((item) => ({
            Ubicacion: item.CodigoUbicacion,
            Almacen: item.Almacen + " - " + item.Etiqueta,
            empresa: item.Empresa,
            estatus: item.Estatus ? "Activo" : "Inactivo",
            acciones: <button onClick={() => { modificarEstado(item.UbicacionId) }} className="btn btn-primary">{item.Estatus ? "Inactivar" : "Activar"}</button>
        }));
    }

    useEffect(() => {
        if (!IsAllow("/configuracion-ubicaciones")) {
            props.history.push('/home');
        }

        cargarUbicaciones();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="container-fluid">
            <h2 style={{ textAlign: 'center' }}>Mantenimiento de Ubicaciones</h2>
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Mantenimiento de Ubicaciones"}
                    data={obtenerData()}
                    columns={HeaderSitios}
                    options={DatatableOptions}
                />
            </MuiThemeProvider>
        </div>
    )

}