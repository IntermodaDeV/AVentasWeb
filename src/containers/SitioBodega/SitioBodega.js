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

let HeaderSitios = [
    {
        name: "sitio",
        label: "Codigo Sitio",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "nombre",
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

export const SitioBodega = props => {
    const [sitios, setSitios] = useState([]);

    const cargarSitios = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/sitios`);
            setSitios(request.data);
        } catch (err) {

        }
    }

    const modificarEstado = async (id) => {
        try {
            await axios.post(`${APIURL}/api/sitios/modificar/${localStorage.getItem('codigo')}/${id}`);
            cargarSitios();
            Swal.fire({
                title: '¡Modificado con exito!',
                text: "Se ha cambiado el estado del sitio con exito.",
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
        return sitios.map((sitio) => ({
            sitio: sitio.Sitio,
            nombre: sitio.Nombre,
            empresa: sitio.Empresa,
            estatus: sitio.Estatus ? "Activo" : "Inactivo",
            acciones: <button onClick={() => { modificarEstado(sitio.SitioId) }} className="btn btn-primary">{sitio.Estatus ? "Inactivar" : "Activar"}</button>
        }));
    }

    useEffect(() => {
        if (!IsAllow("/configuracion-sitio")) {
            props.history.push('/home');
        }

        cargarSitios();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="container-fluid">
            <h2 style={{ textAlign: 'center' }}>Mantenimiento sitios</h2>
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Mantenimiento sitios"}
                    data={obtenerData()}
                    columns={HeaderSitios}
                    options={DatatableOptions}
                />
            </MuiThemeProvider>
        </div>
    )

}