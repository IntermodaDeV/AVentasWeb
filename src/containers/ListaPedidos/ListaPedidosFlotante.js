import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import MUIDataTable from "mui-datatables";
import DetallePedido from 'components/ListadoPedidos/DetallePedido';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import moment from "moment";
import 'moment/locale/es';

import { APIURL } from 'utils/Enviroment';
import { Loading } from 'components/Global/Loading';
import { IsAllow } from 'components/Seguridad/Permisos';

export const ListaPedidosFlotante = props => {
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

    const [loading, setLoading] = useState(false);

    const cargarPedidosFlotantes = async () => {
        try {
            setState({ ...state, isLoaded: true });
            const request = await axios.get(APIURL + "/api/pedidosxcliente/flotantes", { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            setState({
                ...state,
                isLoaded: true,
                pedidos: request.data
            });
        } catch (err) {

        }
    }

    const obtenerDetallePedido = async (Pedido, EsImpresion) => {
        let EnDetalle = EsImpresion ? null : Pedido;
        axios.get(`${APIURL}/api/PedidoDetalle/flotante/${Pedido.Id}`)
            .then(data => {
                setState({
                    ...state,
                    Detalles: data.data,
                    pedido: EnDetalle,
                });

            });
    }

    const sincronizarPedidoFlotante = async (id) => {
        try {
            setLoading(true);
            await axios.post(`${APIURL}/api/pedidosxcliente/flotantes/sincronizar/${id}`, {}, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            setLoading(false);
            cargarPedidosFlotantes();
            Swal.fire({
                title: 'Confirmado',
                text: 'Pedido sincronizado con exito.',
                type: 'success',
            })
        } catch (err) {
            setLoading(false);
            let mensaje = "Ha ocurrido un error y no se pudo aprobar el pedido.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok'
            });
        }
    }

    const peticionSincronizarPedido = (id, correlativo) => {
        Swal.fire({
            title: 'Aviso',
            text: `¿Esta seguro de aprobar el pedido flotante ${correlativo}?`,
            type: 'warning',
            width: '600px',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.value) {
                sincronizarPedidoFlotante(id);
            }
        })
    }

    const cancelarPedidoFlotante = async (id) => {
        try {
            await axios.post(`${APIURL}/api/pedidosxcliente/flotantes/cancelar/${id}`, {}, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            cargarPedidosFlotantes();
            Swal.fire({
                title: 'Confirmado',
                text: 'Pedido cancelado con exito.',
                type: 'success',
            })
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se pudo cancelar el pedido.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok'
            });
        }
    }

    const peticionCancelarPedido = (id, correlativo) => {
        Swal.fire({
            title: 'Aviso',
            text: `¿Esta seguro de cancelar el pedido flotante ${correlativo}?`,
            type: 'warning',
            width: '600px',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.value) {
                cancelarPedidoFlotante(id);
            }
        })
    }

    const DataPedidos = () => {
        let DataPedidos = [];
        state.pedidos.map(pedido => {
            let data = [
                pedido.PedidoId,
                pedido.Cliente.Nombre,
                moment(pedido.FechaActual).format('DD/MM/YYYY') !== "Invalid date" ? moment(pedido.FechaActual).format('DD/MM/YYYY') : "",
                pedido.Linea.Linea,
                pedido.NombreColeccion,
                pedido.TotalUnidades,
                moment(pedido.FechaEntrega).format('DD/MM/YYYY') !== "Invalid date" ? moment(pedido.FechaEntrega).format('DD/MM/YYYY') : "",
                pedido.Asesor,
                <div>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => obtenerDetallePedido(pedido, false)} size="small" color={"primary"}>Detalle</Button>
                    </span>
                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" onClick={() => peticionSincronizarPedido(pedido.Id, pedido.PedidoId)} size="small" color={"primary"}>Aprobar</Button>
                    </span >
                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" onClick={() => peticionCancelarPedido(pedido.Id, pedido.PedidoId)} size="small" color={"primary"}>Cancelar</Button>
                    </span >
                </div>
            ]
            DataPedidos.push(data);
            return false;
        });

        return DataPedidos;
    }

    const RegresarListaPedidos = () => {
        setState({ ...state, pedido: null });
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

    const cancelarReinicio = e => {
        if (e.which === 116) {
            e.preventDefault();
        }
    }

    useEffect(() => {
        if (!IsAllow("/lista-pedidos-flotante")) {
            props.history.push('/home');
        }

        cargarPedidosFlotantes();

        window.addEventListener('keydown', cancelarReinicio);
        return () => {
            window.removeEventListener('keydown', cancelarReinicio);
        }
        // eslint-disable-next-line
    }, [])

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
                <Loading title="Sincronizando Pedido" open={loading} />
                <h1 style={{ textAlign: 'center' }}>Pedidos Flotante</h1>
                <div>
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Listado Pedidos Flotante"}
                            data={DataPedidos()}
                            columns={HeadersListaPedidos}
                            options={DatatableOptions}
                        />
                    </MuiThemeProvider>
                </div>
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
    "Asesor",
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
                    rowsPerPageOptions={[15, 50, 100]}
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
