import React, { useState, useEffect } from 'react';
import Loader from 'components/Global/Loader';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Dialog } from "@material-ui/core";
import DetallePedido from 'components/ListadoPedidos/DetallePedido';
import moment from "moment";
import 'moment/locale/es';
import {APIURL} from 'utils/Enviroment';
import ImprimirPedido from 'components/ListadoPedidos/ImprimirPedido';
import  TableFooter from "@material-ui/core/TableFooter";
import  TableRow from "@material-ui/core/TableRow";
import  TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import {IsAllow} from 'components/Seguridad/Permisos';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { FiAlertTriangle } from 'react-icons/fi';

moment.locale('es');

export const ListaPedidosPendientes = (props) => {
    const urlApi = APIURL;

    const [state, setState] = useState({
        error: false,
        isLoaded: false,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        pedidos: [],
        clientes: [],
        pedido: null,
        Detalles: [],
    });
    const [showDialog, setShowDialog] = useState(false);
    const [DialogPedido, setDialogPedido] = useState(null);

    useEffect(() => {
        if(!IsAllow("/lista-pedidos"))
        {
            props.history.push('/home');
        }
        cargarPedidos("1900-01-01", "1900-01-01");
        // eslint-disable-next-line
    }, []);


    const cargarPedidos = async (FechaInicio, FechaFin) => {
        var Inicio = moment(FechaInicio).format("YYYY-MM-DD");
        var Fin = moment(FechaFin).format("YYYY-MM-DD");
        let Asesor = localStorage.getItem('codigo');
        fetch(urlApi + "/api/PedidosXCliente/Pendientes/"+ Asesor + "/" + Inicio + "/" + Fin, {
            headers: {
                'Authorization':
                    'Bearer ' + localStorage.getItem('token')

            }
        })
            .then(res => {
                if (res.status === 401) {
                    localStorage.setItem('token', '');
                    window.location.reload();
                }
                if (res.status === 200) {
                    res.json()
                        .then(
                            (result) => {

                                setState({
                                    ...state,
                                    isLoaded: true,
                                    pedidos: result
                                });
                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                setState({
                                    ...state,
                                    isLoaded: true,
                                    error
                                });
                            }
                        )
                }
            })
    }

    const sincronizarPedido = async (pedido)=>{
        try{
            const request = await axios.post(urlApi + "/api/PedidosXCliente/sincronizar/"+pedido);
            Swal.fire({
                type: 'success',
                title: 'Sincronizado',
                text: request.data,
            });

            cargarPedidos("1900-01-01", "1900-01-01");
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se pudo sincronizar el pedido con AX.";

                if(err.response){
                    mensaje = err.response.data.Message;
                }

                Swal.fire({
                    type: 'error',
                    title: 'Error',
                    text: mensaje,
                })
        }

        console.log(pedido);
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


            //if (moment(fechaIni) < moment(pedido.FechaActual) && moment(pedido.FechaActual) < moment(fechaFin)) {
                let data = [
                    pedido.PedidoId,
                    pedido.Cliente.Nombre,
                    moment(pedido.FechaActual).format('DD/MM/YYYY') !== "Invalid date" ? moment(pedido.FechaActual).format('DD/MM/YYYY') : "",
                    pedido.Linea.Linea,
                    pedido.NombreColeccion,
                    pedido.TotalUnidades,
                    moment(pedido.FechaEntrega).format('DD/MM/YYYY') !== "Invalid date" ? moment(pedido.FechaEntrega).format('DD/MM/YYYY') : "",
                    pedido.ErrorAx,
                    <div>

                        <span className="mr-1">
                            <Button className='my-1' variant="outlined" onClick={() => GetPedidoDetalle(pedido, false)} size="small" color={"primary"}>Detalle</Button>
                        </span>

                        <span className="ml-1">
                            <Button className='my-1' variant="outlined" disabled={pedido.Procesando} onClick={() => sincronizarPedido(pedido.PedidoId)} size="small" color={"primary"}>
                                {pedido.Procesando ? "Procesando":"Sincronizar"}
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

    const GetPedidoDetalle = (Pedido, EsImpresion) =>{
        let EnDetalle = EsImpresion ? null : Pedido;
        fetch(`${APIURL}/api/PedidoDetalle/${Pedido.PedidoId}`)
        .then(res=>res.json())
        .then(data=>{
            setState({
                ...state,
                Detalles: data,
                pedido: EnDetalle,
            });
            if(EsImpresion)
            {
                setShowDialog(true);
            }
        });
        setDialogPedido(Pedido);
    }

    const hidePrint = () => {
        setShowDialog(false);
        setDialogPedido(null);
    }


    const RegresarListaPedidos = () => {
        setState({ ...state, pedido: null });
    }

    if (!state.isLoaded) {
        return <Loader interval={1800} />;
    }
    if (state.error) {
        return <div>Error: {state.error.message}</div>;
    }
    if (state.pedido != null && state.Detalles !== null) {
        return (
            <DetallePedido
                clientes={state.clientes}
                pedido={state.pedido}
                RegresarListaPedidos={RegresarListaPedidos}
                gruposXDetPed = {state.Detalles} />
        )
    } else {
        return (
            <div className="px-3">
                <div className="row mb-3">
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                    <FiAlertTriangle style={{ fontSize: '20px', color: 'orange'}} /> Los pedidos mostrados en esta pantalla estan registrados unicamente en la nube pero no en AX.
                </div>
                </div>
                <div>
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Listado Pedidos"}
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
                        DialogPedido && state.Detalles !== null &&
                        <ImprimirPedido
                            hidePrint={hidePrint}
                            Pedido={DialogPedido}
                            gruposXDetPed = {state.Detalles}
                        />
                    }
                </Dialog >

            </div>
        );
    }

}


const HeadersListaPedidos = [
    "No. Pedido",
    "Cliente",
    "Fecha Pedido",
    "Línea",
    "Paquete",
    "Total Unidades",
    "Fecha Entrega",
    "Ultimo mensaje de error",
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
