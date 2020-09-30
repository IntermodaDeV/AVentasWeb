import React, { useState, useEffect } from 'react';
import Loader from 'components/Global/Loader';
import { DatePicker } from "@material-ui/pickers";
import MUIDataTable from "mui-datatables";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Dialog } from "@material-ui/core";
import DetallePedido from 'components/ListadoPedidos/DetallePedido';
import { PrintOutlined } from '@material-ui/icons';
import moment from "moment";
import 'moment/locale/es';
import {APIURL} from 'utils/Enviroment';
import ImprimirPedido from 'components/ListadoPedidos/ImprimirPedido';
moment.locale('es');

const ListaPedidos = () => {
    const urlApi = APIURL;

    const [state, setState] = useState({
        error: false,
        isLoaded: false,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        pedidos: [],
        clientes: [],
        pedido: null,
    });
    const [showDialog, setShowDialog] = useState(false);
    const [DialogPedido, setDialogPedido] = useState(null);
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-7));
    const [fechaFin, setFechaFin] = useState( new Date(new Date().getFullYear(), new Date().getMonth(),  new Date().getDate()));
    useEffect(() => {
        cargarPedidos("1900-01-01", "1900-01-01");
        //cargarClientes();
        // eslint-disable-next-line
    }, []);

    const cambiarPedido = (pedido) => {
        setState({
            ...state,
            pedido: pedido,
        });
    }

    const cargarPedidos = async (FechaInicio, FechaFin) => {
        var Inicio = moment(FechaInicio).format("YYYY-MM-DD");
        var Fin = moment(FechaFin).format("YYYY-MM-DD");
        let Asesor = localStorage.getItem('codigo');
        fetch(urlApi + "/api/PedidosXCliente/"+ Asesor + "/" + Inicio + "/" + Fin, {
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

    // const cargarClientes = async () => {
    //     fetch(urlApi + "/api/cliente", {
    //         headers: {
    //             'Authorization':
    //                 'Bearer ' + localStorage.getItem('token')
    //         }
    //     })
    //         .then(res => {
    //             if (res.status === 401) {
    //                 localStorage.setItem('token', '');
    //                 window.location.reload();
    //             }
    //             if (res.status === 200) {

    //                 res.json()
    //                     .then(
    //                         (result) => {
    //                             setState({
    //                                 ...state,
    //                                 clientes: result,
    //                             });
    //                         }
    //                     )
    //             }

    //         })
    // }


    const handleFechaInicio = (fecha) => {
        setFechaInicio(fecha);

        var fech =  moment(fecha).add(7, 'days')
        setFechaFin(fech);
    }

    const handleFechaFin = (date) => {
        //var date = moment(fecha).toDate();
        setFechaFin(date);

        /*const diffTime = new Date(date) - new Date(fechaInicio);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            setState({
                ...state,
                endDate: date,
            })
        }
        else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
            });

            Toast.fire({
                type: 'error',
                title: 'Ingrese Fecha Válida',
            })
            var fech = new Date();
            fech.setDate(fechaInicio.getDate() + 6);
            setState({
                ...state,
                endDate: fech,
            })
        }*/

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
                    (pedido.Sincronizado)?"Si":"No",
                    (pedido.NumeroPedido==="")?"No disponible":pedido.NumeroPedido,
                    pedido.Linea.Linea,
                    pedido.NombreColeccion,
                    pedido.TotalUnidades,
                    "", //Credito
                    "", //Estado
                    moment(pedido.FechaEntrega).format('DD/MM/YYYY') !== "Invalid date" ? moment(pedido.FechaEntrega).format('DD/MM/YYYY') : "",
                    <div>

                        <span className="mr-1">
                            <Button className='my-1' variant="outlined" onClick={() => cambiarPedido(pedido)} size="small" color={"primary"}>Detalle</Button>
                        </span>

                        <span className="ml-1">
                            <Button className='my-1' variant="outlined" onClick={() => showPrint(pedido)} size="small" color={"primary"}>
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

    const showPrint = (pedido) => {
        setDialogPedido(pedido);
        setShowDialog(true);
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
    if (state.pedido != null) {
        return (
            <DetallePedido
                clientes={state.clientes}
                pedido={state.pedido}
                RegresarListaPedidos={RegresarListaPedidos} />
        )
    } else {
        return (
            <div className="px-3">
                <div className="row mb-3">
                <div className='col-lg-2 col-sm-4 col-12'>
                        <DatePicker
                            disableToolbar
                            autoOk
                            label={"Fecha Inicio"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            value={fechaInicio}
                            onChange={(date) => handleFechaInicio(date)}
                        />

                    </div>
                    <div className='col-lg-2 col-sm-4 col-12'>
                        <DatePicker
                            disableToolbar
                            autoOk
                            minDate={fechaInicio}
                            maxDate ={moment(fechaInicio).add(7, 'days')}
                            label={"Fecha Fin"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            value={fechaFin}
                            onChange={(date) => handleFechaFin(date)}
                        />
                    </div>

                    <div className="col-lg-2 col-sm-4 col-6" style={{ paddingTop: 15 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => cargarPedidos(fechaInicio, fechaFin)}>Obtener
                    </Button>
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
                        DialogPedido &&
                        <ImprimirPedido
                            hidePrint={hidePrint}
                            Pedido={DialogPedido}
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
    "Sincronizado",
    "Num. Pedido Ax",
    "Línea",
    "Paquete",
    "Total Unidades",
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


export default ListaPedidos;
