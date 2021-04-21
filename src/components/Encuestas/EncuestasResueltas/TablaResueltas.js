import React from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import moment from 'moment';

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

let HeaderEncuestasResueltas = [
    {
        name: "Encuesta",
        label: "Encuesta",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Cliente",
        label: "Cliente",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Usuario",
        label: "Usuario",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Fecha",
        label: "Fecha",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Detalle",
        label: "Detalle",
        options: {
            filter: false,
            sort: true,
        }
    }
];

const DatatableOptions = {
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
            noMatch: "No se han encontrado recibos",
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

export const TablaResueltas = props => {
    const { encuestasResueltas, detalleEncuesta } = props;
    
    const obtenerData = () => {
        return encuestasResueltas.map(e => (
            [
                e.Encuesta,
                e.Cliente,
                e.Usuario,
                moment(e.Fecha).format("DD/MM/YYYY"),
                <button className="btn btn-primary" onClick={() => { detalleEncuesta(e.EncuestaId, e.RespuestaId) }}>Ver detalle</button>
            ]
        ));
    }

    return <MuiThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
            title={"Encuestas resueltas"}
            data={obtenerData()}
            columns={HeaderEncuestasResueltas}
            options={DatatableOptions}
        />
    </MuiThemeProvider>
}