import React, { useEffect, useState } from 'react';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import axios from 'axios';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import PrintOutlined from '@material-ui/icons/PrintOutlined';
import { APIURL } from 'utils/Enviroment';
import { ImprimirPedidoDevolucion } from 'components/Devoluciones/ImprimirPedidoDevolucion';

export const ListadoDevolucion = (props) => {
    const [devoluciones, setDevoluciones] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [devolucion, setDevolucion] = useState(null);
    const [detalleDevolucion, setDetalleDevolucion] = useState([]);

    useEffect(() => {
        getDevoluciones();
        // eslint-disable-next-line
    }, [])

    const ObtenerlistadoDevoluciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/listado`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            return request.data;
        } catch (err) {
            console.log(err)
        }
    }

    const getDevoluciones = async () => {
        let lista = await ObtenerlistadoDevoluciones();
        setDevoluciones(lista);
    }
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
    })
    const HeadersListaPedidos = [
        {
            label: "Codigo Interno",
            name: "NumExpediente",
            options: {
                filter: true,
            }
        },
        {
            label: "Numero RMA",
            name: "numeroRMA",
            options: {
                filter: true,
            }
        },
        {
            label: "Pedido AX",
            name: "pedidoAx",
            options: {
                filter: true,
            }
        },
        {
            label: "Codigo Cliente",
            name: "codigoCliente",
            options: {
                filter: true,
            }
        },
        {
            label: "Nombre Cliente",
            name: "nombreCliente",
            options: {
                filter: true,
            }
        },
        {
            label: "Motivo de Devolucion",
            name: "motivoDev",
            options: {
                filter: true,
            }
        },
        {
            label: "Estado",
            name: "estado",
            options: {
                filter: true,
            }
        },
        {
            label: "Acciones",
            name: "acciones",
            options: {
                filter: false,
            }
        }
    ]

    const hidePrint = () => {
        setShowDialog(false);
    }

    const obtenerDetalleDevolucion = async (devolucionSeleccionada) => {
        try {
            const request = await axios.get(`${APIURL}/api//devolucion/detalle/${devolucionSeleccionada.NumDevolucion}`);
            setDevolucion(devolucionSeleccionada);
            setDetalleDevolucion(request.data);
            setShowDialog(true);
        } catch (err) {

        }
    }

    const Data = () => {
        return devoluciones.map(p => (
            [
                p.NumDevolucion,
                p.NumeroRMA,
                p.PedidoDevolucion,
                p.CodigoCliente,
                p.NombreCliente,
                p.motivoDevolucion,
                p.Estado,
                <span className="ml-1">
                    <Button className='my-1' variant="outlined" size="small" onClick={() => { obtenerDetalleDevolucion(p) }} color={"primary"}>
                        <PrintOutlined />
                    </Button>
                </span >
            ]
        ));
    }

    const DatatableOptions = {
        filter: true,
        filterType: "dropdown",
        responsive: "standard",
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
                        rowsPerPageOptions={[5, 10, 15]}
                        labelRowsPerPage="Filas por página:"
                    />
                </TableRow>
            </TableFooter>
        ),
        textLabels: {
            body: {
                noMatch: "No se han encontrado devoluciones",
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
    return (
        <div className="px-3">
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Listado de Devoluciones"}
                        data={Data()}
                        columns={HeadersListaPedidos}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>

            <Dialog
                open={showDialog}
                onClose={() => hidePrint()}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
            >

                {
                    devolucion && detalleDevolucion &&
                    <ImprimirPedidoDevolucion
                        hidePrint={hidePrint}
                        Pedido={devolucion}
                        gruposXDetPed={detalleDevolucion}
                    />
                }
            </Dialog >

        </div>
    );
}