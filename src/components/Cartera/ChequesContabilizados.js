import React, { useEffect, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
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
        name: "NumRecibo",
        label: "Núm.Recibo",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "FechaRecepcion",
        label: "Fecha Recepción",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "NumCheque",
        label: "Núm.Cheque",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Banco",
        label: "Banco",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Valor",
        label: "Valor Cheque",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "FechaVencimiento",
        label: "Fecha Vencimiento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "TipoCheque",
        label: "Tipo Cheque",
        options: {
            filter: true,
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
            noMatch: "No se han encontrado chequesposfechados",
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

export const ChequesContabilizados = props => {
    const { cliente } = props;
    const [chequesCont, setchequesCont] = useState([]);
    const cheques = props.cliente;
    let totalSaldo = 0;

    useEffect(() => {
        if (cliente !== undefined) {
            obtenerDatos();
        }
    }, [cliente]);

    const getTotal = () => {
        return [
            {
                NumRecibo: null,
                FechaRecepcion: null,
                NumCheque: null,
                Banco: null,
                Valor: numberWithCommas(totalSaldo),
                FechaVencimiento: null,
                TipoCheque: null,
            }
        ]
    }


    const obtenerDatos = () => {
        const getCheques = cheques.chequesContabilizados.filter(x => x.CodigoCliente === cliente.Codigo).map(doc => {
            let colorFuente = moment(doc.FechaVencimiento).isBefore(moment(), 'day') ? "text-danger font-weight-bold" : "inline-block";
            return {
                NumRecibo: <span className={colorFuente}>{doc.NumeroRecibo}</span>,
                FechaRecepcion: <span className={colorFuente}>{moment(doc.FechaRecepcion).format("DD/MM/YYYY")}</span>,
                NumCheque: <span className={colorFuente}>{doc.NumeroCheque}</span>,
                Banco: <span className={colorFuente}>{doc.Banco} </span>,
                Valor: <span className={colorFuente}>{numberWithCommas(doc.ValorCheque)}  </span>,
                FechaVencimiento: <span className={colorFuente}>{moment(doc.FechaVencimiento).format("DD/MM/YYYY")}  </span>,
                TipoCheque: <span className={colorFuente}>{doc.TipoCheque}  </span>,
            }
        });

        totalSaldo = cheques.chequesContabilizados.map((che) => che.ValorCheque).reduce((a, b) => a + b, 0);
        let sumatoria = getTotal();
        let newlist = [...getCheques, ...sumatoria]
        setchequesCont(newlist);

    }

    if (!cliente) {
        return <h3 style={styles.center}>Seleccione un cliente.</h3>
    } else {
        const existenCheques = cheques.chequesContabilizados.some(e => e.CodigoCliente === cliente.Codigo);

        if (!existenCheques) {
            return <h3 style={styles.center}>El cliente no tiene cheques posfechados.</h3>
        }

        return (
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Cheques Posfechados"}
                        data={chequesCont}
                        columns={HeaderDocumentoPendientes}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>
        )
    }
}