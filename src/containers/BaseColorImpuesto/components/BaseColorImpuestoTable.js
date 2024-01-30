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
        name: "codigobase",
        label: "Codigo Base",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "color",
        label: "Color",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "impuesto",
        label: "Impuesto",
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
        name: "estado",
        label: "Estado",
        options: {
            filter: true,
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

export const BaseColorImpuestoTable = props => {

    const obtenerDatos = () => {
        return props.combinaciones.map(x => ({
            id: x.id,
            codigobase: x.codigobase,
            color: x.color,
            impuesto: x.impuesto,
            empresa: x.empresa,
            estado: <p style={{ fontWeight: 'bolder', color: x.estado ? 'green' : 'red' }}>{x.estado ? "Activo" : "Inactivo"}</p>,
            Acciones: <div><button onClick={() => { props.cambiarEstado(x.id) }} className="btn btn-primary" >{x.estado ? "Desactivar" : "Activar"}</button></div>
        }));
    }

    return (
        <div style={{ zIndex: -99 }}>
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Combinaciones"}
                    data={obtenerDatos()}
                    columns={HeaderDocumentoPendientes}
                    options={DatatableOptions}
                />
            </MuiThemeProvider>
        </div>
    );
}