import React, { useEffect, useState } from 'react';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';

import { APIURL } from 'utils/Enviroment';
import { ModalEditar } from './components/ModalEditar';
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

let HeaderAlmacenes = [
    {
        name: "almacen",
        label: "Almacen",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "nombre",
        label: "Nombre",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "etiqueta",
        label: "Etiqueta",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "sitio",
        label: "Sitio",
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
            customBodyRender: (value, tableMeta, updateValue) => {
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
            noMatch: "No se han encontrado pedidos",
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

export const AlmacenSitio = props => {
    const [almacenes, setAlmacenes] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [estado, setEstado] = useState(null);
    const [etiqueta, setEtiqueta] = useState(null);
    const [id, setId] = useState(null);


    const cargarAlmacenes = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/almacenes`);
            setAlmacenes(request.data);
        } catch (err) {

        }
    }

    const modificarEstado = async (id) => {
        try {
            await axios.post(`${APIURL}/api/almacenes/modificar/estado/${id}`);
            cargarAlmacenes();
            Swal.fire({
                title: '¡Modificado con exito!',
                text: "Se ha cambiado el estado del almacen con exito.",
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

    const mostrarEditar = (ide, estatus, etiqu) => {
        setEstado(estatus);
        setEtiqueta(etiqu);
        setId(ide)
        setMostrar(true);
    }

    const obtenerData = () => {
        return almacenes.map((x) => ({
            sitio: x.Sitio,
            almacen: x.Almacen,
            nombre: x.Nombre,
            empresa: x.Empresa,
            etiqueta: x.Etiqueta,
            estatus: x.Estatus ? "Activo" : "Inactivo",
            acciones: (<div>
                <button onClick={() => { mostrarEditar(x.Id, x.Estatus, x.Etiqueta) }} className="btn btn-warning mr-2">Editar</button>
                <button onClick={() => { modificarEstado(x.Id) }} className="btn btn-primary">{x.Estatus ? "Inactivar" : "Activar"}</button>
            </div>)
        }));
    }

    useEffect(() => {
        if (!IsAllow("/configuracion-almacenes")) {
            props.history.push('/home');
        }
        cargarAlmacenes();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="container-fluid">
            <h2 style={{ textAlign: 'center' }}>Mantenimiento almacenes</h2>
            <ModalEditar cerrar={() => { setMostrar(false) }} mostrar={mostrar} etiqueta={etiqueta} estatus={estado} id={id} cargarAlmacenes={cargarAlmacenes} />
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Mantenimiento almacenes"}
                    data={obtenerData()}
                    columns={HeaderAlmacenes}
                    options={DatatableOptions}
                />
            </MuiThemeProvider>
        </div>
    )
}