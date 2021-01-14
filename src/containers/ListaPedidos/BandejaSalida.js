import React, { useState, useEffect } from 'react';
import Loader from 'components/Global/Loader';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Dialog } from "@material-ui/core";
import { PrintOutlined } from '@material-ui/icons';
import moment from "moment";
import 'moment/locale/es';
import {APIURL} from 'utils/Enviroment';
import ImprimirBandejaSalida from 'components/ListadoPedidos/ImprimirBandejaSalida';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import  TableFooter from "@material-ui/core/TableFooter";
import  TableRow from "@material-ui/core/TableRow";
import  TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import {IsAllow} from 'components/Seguridad/Permisos';
import {useSelector,useDispatch} from 'react-redux';
import axios from 'axios';
import { FiAlertTriangle } from 'react-icons/fi';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import { verificarConexion } from 'utils/http';
moment.locale('es');

const BandejaSalida = (props) => {
    const urlApi = APIURL;

    const [state, setState] = useState({
        error: false,
        isLoaded: false,
        pedidos: [],
        clientes: [],
        pedido: null,
        Detalle:[],
    });
    const [showDialog, setShowDialog] = useState(false);
    const [DialogPedido, setDialogPedido] = useState(null);
    const [loading,setLoading] = useState(false);
    const PedidosCache = useSelector(p=>p.PedidoSincronizar);
    const dispatch = useDispatch();

    useEffect(() => {
        if(!IsAllow("/lista-pedidos-BandejaSalida"))
        {
            props.history.push('/home');
        }
        // eslint-disable-next-line
        setState({
            ...state,
            isLoaded: true,
            pedidos: PedidosCache
        });
        // eslint-disable-next-line
    }, []);

    const mostrarAdvertencia = (title,text,type)=>{
        Swal.fire({
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Ok',
        })
    }
    const Sincronizar = async (pedidoId) =>{
        let isOnline = await verificarConexion();
        try {
            if (localStorage.getItem("Conexion") === "offline") {
                mostrarAdvertencia("Modo Offline", "Se encuentra en modo offline, no puede actualizar registros.", "warning");
            } else {
                if (!isOnline) {
                    mostrarAdvertencia('Sin internet', 'Necesita internet para poder actualizar los registros.', 'warning');
                } else  {
                setLoading(true);
                const pedido = PedidosCache.find(x => x.PedidoId === pedidoId);
                const request = await axios.post(urlApi + '/api/PedidosXCliente', pedido, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        'Content-Type': 'application/json'
                    },
                });

                if (request.data) {
                    const nuevosPedidos = PedidosCache.filter(x => x.PedidoId !== pedidoId);
                    dispatch({ type: "SET_RESETPEDIDOSINCRONIZAR", payload: nuevosPedidos });
                    setState((prevState) => ({ ...prevState, pedidos: nuevosPedidos }));

                    Swal.fire({
                        type: 'success',
                        title: 'Sincronizado',
                        text: "Pedido sincronizado correctamente",
                    });
                }
                setLoading(false);
            }
            }
        }
        catch (err) {
            setLoading(false);
        }
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
    const DataPedidos = () => {
        let DataPedidos = [];
        state.pedidos.map(pedido => {
                let data = [
                    pedido.NumeroReferencia !== "" ? pedido.NumeroReferencia : "En Proceso",
                    pedido.CodigoCliente,
                    moment(pedido.FechaActual).format('DD/MM/YYYY') !== "Invalid date" ? moment(pedido.FechaActual).format('DD/MM/YYYY') : "",
                    "No",
                    "En Proceso",
                    pedido.Linea,
                    pedido.CodigoColeccion,
                    pedido.TipoPedido.TipoPedido, //Credito
                    "En Cache", //Estado
                    moment(pedido.FechaEntrega).format('DD/MM/YYYY') !== "Invalid date" ? moment(pedido.FechaEntrega).format('DD/MM/YYYY') : "",
                    <div>

                        <span className="mr-1">
                            <Button className='my-1' variant="outlined" onClick={() => Sincronizar(pedido.PedidoId)} size="small" color={"primary"}>Sincronizar</Button>
                        </span>
                        <span className="ml-1">
                            <Button className='my-1' variant="outlined" onClick={() => ImpresionPedido(pedido)} size="small" color={"primary"}>
                                <PrintOutlined />
                            </Button>
                        </span >
                    </div>
                ]

                DataPedidos.push(data);
            //}
            return false;

        });

        return DataPedidos;
    }

    const hidePrint = () => {
        setShowDialog(false);
        setDialogPedido(null);
    }
    // eslint-disable-next-line
    let Productos = [];
    const ImpresionPedido = (Pedido) => {
        // eslint-disable-next-line
        Pedido.DetallePedido.map((producto, index1) => {
            let agregado = false;
            if(Productos.length> 0){
                Productos.forEach((productoUnico, index2) => {
                    if(productoUnico.Codigo === producto.CodigoProducto)
                    {
                        productoUnico.Colores.forEach((colores, index3) => {
                                let color = productoUnico.Colores.filter(c => c.CodigoColor === producto.CodigoColor);
                                if(color.length > 0 && colores.CodigoColor === producto.CodigoColor)
                                {
                                    colores.Tallas.push({Talla : producto.Talla, Cantidad : producto.Cantidad, Precio : producto.PrecioUnitario});
                                    agregado = true;
                                }
                                else if(color.length <= 0)
                                {
                                    let nuevoColor = {
                                        CodigoColor: producto.CodigoColor,
                                        NombreColor: producto.NombreColor,
                                        Tallas: [{
                                            Talla : producto.Talla,
                                            Cantidad : producto.Cantidad,
                                            Precio : producto.PrecioUnitario
                                        }]
                                    };
                                    productoUnico.Colores.push(nuevoColor);
                                    agregado = true;
                                }
                        });
                    }
                    
                });
            }
           

            if(!agregado)
            {
                let Producto = {
                    Codigo : producto.CodigoProducto,
                    NombreProducto : producto.NombreProducto,
                    Colores : [{
                        CodigoColor: producto.CodigoColor,
                        NombreColor: producto.NombreColor,
                        Tallas: [{
                            Talla : producto.Talla,
                            Cantidad : producto.Cantidad,
                            Precio : producto.PrecioUnitario
                        }],
                    }]
                };
                Productos.push(Producto)
            }
        });

        setState({
            ...state,
            Detalles: Productos,
        });
        setDialogPedido(Pedido);
        setShowDialog(true);
    }
    if (!state.isLoaded) {
        return <Loader interval={1800} />;
    }
    if (state.error) {
        return <div>Error: {state.error.message}</div>;
    }
      return (
            <div className="px-3">
                <Dialog
                    disableBackdropClick 
                    scroll={'paper'}
                    open={loading}
                    >
                        <DialogTitle className="text-center" id="scroll-dialog-title">
                            <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                Sincronizando
                        </div>
                        </DialogTitle>
                        <DialogContent>
                        
                        <div className="d-flex flex-grow-1 align-items-center justify-content-center">
                                <div className="row">
                                    <div className="col-12 text-center">
                                        <CircularProgress disableShrink/>
                                    </div>
                                </div>
                            </div>
                        
                            
                        </DialogContent>
                </Dialog>
                <div style ={{textAlign:'center',fontSize: '28px'}} className="alert alert-danger alert-dismissible fade show" role="alert">
                    <FiAlertTriangle style={{ fontSize: '32px', color: 'red'}} /> Los pedidos mostrados en esta pantalla están registrados únicamente en su dispositivo.
                </div>
                <div>
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Bandeja de Salidad de Pedidos"}
                            data={DataPedidos()}
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
                        DialogPedido &&
                        <ImprimirBandejaSalida
                            hidePrint={hidePrint}
                            Pedido={DialogPedido}
                            Detalle ={state.Detalles}
                        />
                    }
                </Dialog >

            </div>
        );
}


const HeadersListaPedidos = [
    "No. Pedido",
    "Cliente",
    "Fecha Pedido",
    "Sincronizado",
    "Num. Pedido Ax",
    "Línea",
    "Paquete",
    'Tipo Crédito',
    "Estado",
    "Fecha Entrega",
    {
        label: "Acciones",
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


export default BandejaSalida;
