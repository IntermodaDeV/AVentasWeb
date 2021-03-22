import React from 'react';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

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

let HeaderDocumentoPendientes = [
    {
        name: "Id",
        label: "Id",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Coleccion",
        label: "Colección",
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
        name: "Sitio",
        label: "Sitio",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Empresa",
        label: "Empresa",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Estado",
        label: "Estado",
        options: {
            filter: false,
            sort: true,
        }
    },
    {
        name: "Acciones",
        label: "Acciones",
        options: {
            filter: false,
            sort: true,
        }
    }
];

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

export const TablaPaqueteBodega = props => {

    const obtenerDatos = () => {
        return props.paquetes.map(x => ({
            Id: x.Id,
            Coleccion: x.Coleccion,
            Almacen: x.Almacen,
            Sitio: x.Sitio,
            Empresa: x.Empresa,
            Estado: <p style={{ fontWeight: 'bolder', color: x.Estado ? 'green' : 'red' }}>{x.Estado ? "Activo" : "Inactivo"}</p>,
            Acciones: <div><button onClick={() => { props.cambiarEstado(x.Id) }} className="btn btn-primary" >{x.Estado ? "Desactivar" : "Activar"}</button></div>
        }));
    }

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title={"Paquetes bodega especifico"}
                data={obtenerDatos()}
                columns={HeaderDocumentoPendientes}
                options={DatatableOptions}
            />
        </MuiThemeProvider>
    );
}