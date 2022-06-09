import React, { useState, useEffect } from 'react';
import Loader from 'components/Global/Loader';
import { DatePicker } from "@material-ui/pickers";
import MUIDataTable from "mui-datatables";
//import Swal from 'sweetalert2/dist/sweetalert2.js';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Button, Dialog } from "@material-ui/core";
import DetallePedido from 'components/ListadoPedidos/DetallePedido';
import { PrintOutlined } from '@material-ui/icons';
import moment from "moment";
import 'moment/locale/es';
import { APIURL } from 'utils/Enviroment';
import ImprimirPedido from 'components/ListadoPedidos/ImprimirPedido';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { IsAllow } from 'components/Seguridad/Permisos';
import { Dropdown } from "semantic-ui-react";
import { useSelector } from 'react-redux';
import { verificarConexion } from 'utils/http';
import Swal from 'sweetalert2/dist/sweetalert2.js';
moment.locale('es');

const ListaPedidos = (props) => {
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
        Asesores: [],
        ListaPedidos: [],
    });
    const [showDialog, setShowDialog] = useState(false);
    const [DialogPedido, setDialogPedido] = useState(null);
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30));
    const [fechaFin, setFechaFin] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);
    useEffect(() => {
        if (!IsAllow(props.match.url)) {
            props.history.push('/home');
        }
        setAsesorSelected(AsesoresUsuario[0].Usuario);
        cargarPedidos("1900-01-01", "1900-01-01");
        //cargarClientes();
        // eslint-disable-next-line
    }, []);


    const cargarPedidos = async (FechaInicio, FechaFin) => {
        let isOnline = await verificarConexion();
        if (!isOnline || localStorage.getItem("Conexion")==="offline") {
            Swal.fire({
                title: "Sin internet",
                text: "Necesita internet para poder visualizar esta pagina.",
                type: "warning",
                confirmButtonText: 'Ok',
            });
            setState((prevState)=>({...prevState,isLoaded:true}))
        } else if(localStorage.getItem("Conexion")==="Online" && isOnline){
            var Inicio = moment(FechaInicio).format("YYYY-MM-DD");
            var Fin = moment(FechaFin).format("YYYY-MM-DD");
            let Asesor = AsesorSelected == null ? AsesoresUsuario[0].Usuario : AsesorSelected;
            fetch(urlApi + "/api/PedidosXCliente/" + Asesor + "/" + Inicio + "/" + Fin, {
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
                                    let asesores = [];
                                    AsesoresUsuario.map((Ase) => {
                                        let Valores = { key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }
                                        asesores.push(Valores);
                                        return true;
                                    })
                                    setState({
                                        ...state,
                                        isLoaded: true,
                                        pedidos: result,
                                        Asesores: asesores,
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

        var fech = moment(fecha).add(30, 'days')
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
        state.pedidos.filter(p => p.Asesor === AsesorSelected).map(pedido => {
            //if (moment(fechaIni) < moment(pedido.FechaActual) && moment(pedido.FechaActual) < moment(fechaFin)) {
            let data = [
                [pedido.PedidoId, pedido.Sincronizado],
                [pedido.Cliente.Codigo, pedido.Sincronizado],
                [pedido.Cliente.Nombre, pedido.Sincronizado],
                [moment(pedido.FechaActual).format('DD/MM/YYYY'), pedido.Sincronizado],
                [pedido.Sincronizado],
                [pedido.NumeroPedido, pedido.Sincronizado],
                [pedido.Linea.Linea, pedido.Sincronizado],
                [pedido.NombreColeccion, pedido.Sincronizado],
                (pedido.BodegaEspecifica===null?"No":pedido.BodegaEspecifica?"Si":"No"),
                [pedido.TotalUnidades, pedido.Sincronizado],
                [pedido.TotalXPedido, pedido.TotalXPedido],
                [moment(pedido.FechaEntrega).format('DD/MM/YYYY'), pedido.Sincronizado],
                <div>

                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => GetPedidoDetalle(pedido, false)} size="small" color={"primary"}>Detalle</Button>
                    </span>

                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" onClick={() => GetPedidoDetalle(pedido, true)} size="small" color={"primary"}>
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

    const GetPedidoDetalle = async (Pedido, EsImpresion) => {
        let isOnline = await verificarConexion();
        if (!isOnline || localStorage.getItem("Conexion") === "offline") {
            Swal.fire({
                title: "Sin internet",
                text: "Necesita internet para poder visualizar esta pagina.",
                type: "warning",
                confirmButtonText: 'Ok',
            });
            setState((prevState) => ({ ...prevState, isLoaded: true }))
        } else {
            let EnDetalle = EsImpresion ? null : Pedido;
            fetch(`${APIURL}/api/PedidoDetalle/${Pedido.PedidoId}`)
                .then(res => res.json())
                .then(data => {
                    setState({
                        ...state,
                        Detalles: data,
                        pedido: EnDetalle,
                    });
                    if (EsImpresion) {
                        setShowDialog(true);
                    }
                });
            setDialogPedido(Pedido);
        }
    }

    const hidePrint = () => {
        setShowDialog(false);
        setDialogPedido(null);
    }


    const RegresarListaPedidos = () => {
        setState({ ...state, pedido: null });
    }

    const handleOnChangeAsesor = (value) => {
        setAsesorSelected(value);
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
                gruposXDetPed={state.Detalles} />
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
                            maxDate={moment(fechaInicio).add(365, 'days')}
                            label={"Fecha Fin"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            value={fechaFin}
                            onChange={(date) => handleFechaFin(date)}
                        />
                    </div>
                    <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                        <Dropdown
                            placeholder="Asesor"
                            selection
                            style={{ zIndex: 999 }}
                            onChange={(e, { value }) => handleOnChangeAsesor(value)}
                            options={state.Asesores}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            value={AsesorSelected}
                        />
                    </div>
                    <div className="col-lg-2 col-sm-4 col-6" style={{ paddingTop: 10 }}>
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
                        DialogPedido && state.Detalles !== null &&
                        <ImprimirPedido
                            hidePrint={hidePrint}
                            Pedido={DialogPedido}
                            gruposXDetPed={state.Detalles}
                        />
                    }
                </Dialog >

            </div>
        );
    }

}


const HeadersListaPedidos = [
    {
        name: "No. Pedido",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        name: "Codigo Cliente",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        name: "Cliente",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        name: "Fecha Pedido",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        name: "Sincronizado",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[0]) ? 'green' : 'orange', fontWeight: 'bold' }}>{value[0] ? "Si" : "No"}</p>
                );
            }
        }
    },
    {
        name: "Num Pedido Ax",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'green' : 'orange', fontWeight: 'bold' }}>{value[0] === "" ? "No disponible" : value[0]}</p>
                );
            }
        }
    },
    {
        name: "Linea",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        name: "Paquete",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        label: "Bodega Especifica",
        options: {
            filter: true,
            sort: false,
        }
    },
    {
        name: "Total unidades",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        name: "Total Pedido",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        name: "Fecha Entrega",
        options: {
            filter: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{ color: (value[1]) ? 'black' : 'orange', fontWeight: (value[1]) ? 'normal' : 'bold' }}>{value[0]}</p>
                );
            }
        }
    },
    {
        label: "Acciones",
        options: {
            filter: false,
            sort: false,
        }
    },
];

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


export default ListaPedidos;
