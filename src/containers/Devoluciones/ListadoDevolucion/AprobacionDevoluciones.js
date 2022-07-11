import React, { useEffect, useState } from 'react';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Dialog from "@material-ui/core/Dialog";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import PrintOutlined from '@material-ui/icons/PrintOutlined';
import axios from 'axios';
import styles from 'containers/Agenda/Agenda.module.css';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import { ScaleLoader } from 'react-spinners';
import { APIURL } from 'utils/Enviroment';
import { Button } from "@material-ui/core";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ImprimirPedidoDevolucion } from 'components/Devoluciones/ImprimirPedidoDevolucion';

export const AprobacionDevolucion = (props) => {
    const [devoluciones, setDevoluciones] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [showModalCancelar, setshowModalCancelar] = useState(false);
    const [devolucion, setDevolucion] = useState(null);
    const [observacion, setobservacion] = useState("");
    const [detalleDevolucion, setDetalleDevolucion] = useState([]);

    useEffect(() => {
        getDevoluciones();
        // eslint-disable-next-line
    }, [])

    const hidePrint = () => {
        setShowDialog(false);
    }

    const showModalCancelado = (devolucionSeleccionada) => {
        setshowModalCancelar(true);
        setDevolucion(devolucionSeleccionada);
        setobservacion("")
    }

    const obtenerObservaciones = (event) => {
        setobservacion(event.target.value);
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

    const ObtenerlistadoDevoluciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/listadoDevPendienteAprobar`, {
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

    const CancelarDevolucion = async () => {
        try {
            await axios.post(`${APIURL}/api/devolucion/rechazarDevoluciones/${devolucion.NumDevolucion}/${observacion}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            setshowModalCancelar(false);
            getDevoluciones();
        } catch (err) {

        }
    }

    const AprobarDevolucion = async (id) => {
        try {
            const request = await axios.post(`${APIURL}/api/devolucion/aprobarDevoluciones/${id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha aprobado la encuesta exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                getDevoluciones();
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
            label: "Linea",
            name: "Linea",
            options: {
                filter: true,
            }
        },
        {
            label: "Factura",
            name: "FacturaOrigen",
            options: {
                filter: true,
            }
        },
        {
            label: "Numero Pedido",
            name: "PedidoOrigen",
            options: {
                filter: true,
            }
        },
        {
            label: "Cantidad",
            name: "TotalUnidades",
            options: {
                filter: true,
            }
        },
        {
            label: "Estado",
            name: "Estado",
            options: {
                filter: true,
            }
        },
        {
            label: "Acciones",
            name: "acciones",
            options: {
                filter: true,
            }
        }
    ]

    const Data = () => {
        return devoluciones.map(p => (
            [
                p.NumDevolucion,
                p.CodigoCliente,
                p.NombreCliente,
                p.MotivoDevolucion,
                p.Linea,
                p.FacturaOrigen,
                p.PedidoOrigen,
                p.TotalUnidades,
                p.Estado,
                <div>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => showModalCancelado(p)} size="small" color={"primary"}>Cancelar</Button>
                    </span>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => AprobarDevolucion(p.IdDevAprobacion)} size="small" color={"primary"}>Aprobar</Button>
                    </span>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => obtenerDetalleDevolucion(p)} size="small" color={"primary"}><PrintOutlined /></Button>
                    </span>
                </div>
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
                        title={"Devoluciones pendientes por aprobar"}
                        data={Data()}
                        columns={HeadersListaPedidos}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>

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

                <Dialog
                    scroll={'paper'}
                    open={showModalCancelar}
                    className={styles.AtenderContainer}
                    onClose={() => setshowModalCancelar(false)}
                    aria-labelledby="No-Atendido-Modal">
                    <DialogTitle
                        className="text-center"
                        id="scroll-dialog-title">
                        <div
                            style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif', padding: 2 }}>
                            Cancelar Devolución
                        </div>
                    </DialogTitle>
                    <DialogContent >
                        {
                            <div className="col-12 my-1">
                                <TextField
                                    label="Observación"
                                    className="w-100"
                                    multiline
                                    rowsMax="8"
                                    rows="2"
                                    value={observacion}
                                    onChange={(e) => { obtenerObservaciones(e) }}
                                    margin="normal"
                                />
                            </div>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => setshowModalCancelar(false)} color="primary">
                            Cancelar
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            className={"py-1"}
                            style={{ height: '35px' }}
                            onClick={() => CancelarDevolucion()}
                        >
                            Aceptar
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );

}