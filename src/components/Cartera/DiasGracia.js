import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import moment from 'moment';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import EditIcon from '@material-ui/icons/Edit';
import { numberWithCommas } from 'utils/common';
import { APIURL } from 'utils/Enviroment';

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

const HeaderDocumentoPendientes = [
    {
        name: "documento",
        label: "Documento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "numero",
        label: "Número",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "fecha",
        label: "Fecha",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "vencimiento",
        label: "Vencimiento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "valor",
        label: "Valor",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "saldo",
        label: "Saldo",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "descuento",
        label: "Descuento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "vencimientoDescuento",
        label: "Vencimiento Descuento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "diasGracia",
        label: "Días de Gracia",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "editarDiasGracia",
        label: "Agregar Días",
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

export const DiasGracia = (props) => {
    const { cliente } = props;
    const [facturas, setFacturas] = useState([]);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState();
    const [diasfactSelec, setdiasfactSelec] = useState();
    const [diasFactura, setDiasFactura] = useState();
    const [mostrarModal, setMostrarModal] = useState(false);

    const obtenerdiasgracia = async () => {
        try {

            const request = await axios.get(`${APIURL}/api/factura/facturasDiasGracias/${cliente.Codigo}`);
            const data = request.data;
            const facturas = data.map(({ Tipo, FechaFactura, DiasGracia, FechaVencimiento, TotalFactura, Saldo, Descuento, Factura, FechaMaxDescuento }) => ({
                documento: Tipo,
                numero: Factura,
                diasGracia: DiasGracia,
                fecha: moment(FechaFactura).format("DD/MM/YYYY"),
                vencimiento: moment(FechaVencimiento).format("DD/MM/YYYY"),
                valor: numberWithCommas(TotalFactura),
                saldo: numberWithCommas(Saldo),
                descuento: numberWithCommas(Descuento),
                vencimientoDescuento: moment(FechaMaxDescuento).format("DD/MM/YYYY"),
                editarDiasGracia: <button onClick={() => { setMostrarModal(true); setFacturaSeleccionada(Factura); setdiasfactSelec(DiasGracia) }} className={`btn btn-success`}><EditIcon /></button>
            }));
            setFacturas(facturas);
        } catch (err) {

        }
    }

    const actualizarDias = async () => {
        try {
            await axios.put(`${APIURL}/api/factura/diasgraciafactura/${cliente.Codigo}/${facturaSeleccionada}/${diasFactura}`);
            setMostrarModal(false)
            await obtenerdiasgracia();
        } catch (err) {

        }
    }

    useEffect(() => {
        if (cliente !== undefined) {
            obtenerdiasgracia();
        }
    }, [cliente]);

    if (cliente === undefined) {
        return <h3 style={styles.center}>Seleccione un cliente.</h3>
    }

    return (
        <div>
            <Dialog open={mostrarModal} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">Agregar días de gracia a la factura: {facturaSeleccionada}</DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col-12 py-1">
                            <TextField
                                defaultValue={diasfactSelec}
                                label="Días de gracia"
                                name="DiasGracia"
                                className="w-100"
                                onChange={(e) => setDiasFactura(e.target.value)}
                                margin="normal"
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <button variant="outlined" onClick={() => setMostrarModal(false)} color="primary">
                        Cancelar
                    </button>
                    <button
                        variant="outlined"
                        color="primary"
                        className={"py-1"}
                        style={{ height: '35px' }}
                        onClick={() => actualizarDias()}>
                        Guardar
                    </button>
                </DialogActions>
            </Dialog>
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    data={facturas}
                    columns={HeaderDocumentoPendientes}
                    options={DatatableOptions}
                />
            </MuiThemeProvider>
        </div>
    )
}