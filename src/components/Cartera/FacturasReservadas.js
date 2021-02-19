import React from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { numberWithCommas } from 'utils/common';

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

let HeaderDocumentoPendientes = [
    {
        name: "Tipo",
        label: "Tipo",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Valor",
        label: "Valor",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Moneda",
        label: "Moneda",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "FechaDocumento",
        label: "Fecha Documento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "CodigoCliente",
        label: "Codigo Cliente",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Factura",
        label: "Factura",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "NumeroDocumento",
        label: "Numero Documento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Estado",
        label: "Estado",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "CreadoPor",
        label: "Creado Por",
        options: {
            filter: false,
            sort: false,
        }
    },
    {
        name: "ReferenciaAx",
        label: "Referencia Ax",
        options: {
            filter: false,
            sort: false,
        }
    },
    {
        name: "IdentificadorAx",
        label: "Identificador Ax",
        options: {
            filter: false,
            sort: false,
        }
    },
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

const styles = {
    center: {
        textAlign: 'center'
    }
}

export const FacturasReservadas = props => {
    const { cliente } = props;
    const Pendientes = useSelector(e => e.DocumentosPendientes);

    const obtenerDatos = () => {
        return Pendientes.filter(x => x.CodigoCliente === cliente.Codigo).map(doc => {
            let valor, fecha;

            if (doc.Valor) {
                valor = numberWithCommas(doc.Valor);
            }

            if (doc.FechaDocumento) {
                fecha = moment(doc.FechaDocumento).format("DD/MM/YYYY");
            }

            return {
                Tipo: doc.Tipo,
                Valor: valor,
                Moneda: doc.Moneda,
                FechaDocumento: fecha,
                CodigoCliente: doc.CodigoCliente,
                Factura: doc.Factura,
                NumeroDocumento: doc.NumeroDocumento,
                Estado: doc.Estado,
                CreadoPor: doc.CreadoPor,
                ReferenciaAx: doc.ReferenciaAx,
                IdentificadorAx: doc.IdentificadorAx,
                NumeroFel: doc.NumeroFel
            }
        });
    }

    if (!cliente) {
        return <h3 style={styles.center}>Seleccione un cliente.</h3>
    } else {
        const existenDocumentosPendientes = Pendientes.some(e => e.CodigoCliente === cliente.Codigo);

        if (!existenDocumentosPendientes) {
            return <h3 style={styles.center}>El cliente no tiene facturas reservadas.</h3>
        }

        if (cliente.Codigo.includes('IMGT')) {
            const existeCabeceraFel = HeaderDocumentoPendientes.some(x => (x.name === "NumeroFel"));

            if (!existeCabeceraFel) {
                HeaderDocumentoPendientes.splice(6, 0, {
                    name: "NumeroFel",
                    label: "Numero Fel",
                    options: {
                        filter: true,
                        sort: true,
                    }
                })
            }
        }

        return (
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Facturas reservadas"}
                        data={obtenerDatos()}
                        columns={HeaderDocumentoPendientes}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>
        )
    }
}