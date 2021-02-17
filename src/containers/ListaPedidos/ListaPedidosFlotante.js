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
import { DatePicker } from "@material-ui/pickers";
import { Dropdown } from "semantic-ui-react";
import moment from "moment";
import { useSelector } from 'react-redux';
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
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30));
    const [fechaFin, setFechaFin] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const [estado, setEstado] = useState(0);
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);

    const cargarPedidosFlotantes = async (fechainicio, fechafin) => {
        try {
            setState({ ...state, isLoaded: true });
            let Inicio = moment(fechainicio).format("YYYY-MM-DD");
            let Fin = moment(fechafin).format("YYYY-MM-DD");
            let Asesor = AsesorSelected == null ? AsesoresUsuario[0].Usuario : AsesorSelected;
            const request = await axios.get(`${APIURL}/api/pedidosxcliente/flotantes/${Inicio}/${Fin}/${estado}/${Asesor}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            setState({
                ...state,
                isLoaded: true,
                pedidos: request.data
            });
        } catch (err) {

        }
    }

    const handleFechaInicio = (fecha) => {
        setFechaInicio(fecha);

        var fech = moment(fecha).add(30, 'days')
        setFechaFin(fech);
    }

    const handleFechaFin = (date) => {
        setFechaFin(date);
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
            cargarPedidosFlotantes(fechaInicio, fechaFin);
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
            cargarPedidosFlotantes(fechaInicio, fechaFin);
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
                pedido.PedidoGenerado,
                pedido.Asesor,
                <div>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => obtenerDetallePedido(pedido, false)} size="small" color={"primary"}>Detalle</Button>
                    </span>
                    {pedido.Estado === 0 && <>
                        <span className="ml-1">
                            <Button className='my-1' variant="outlined" onClick={() => peticionSincronizarPedido(pedido.Id, pedido.PedidoId)} size="small" color={"primary"}>Aprobar</Button>
                        </span >
                        <span className="ml-1">
                            <Button className='my-1' variant="outlined" onClick={() => peticionCancelarPedido(pedido.Id, pedido.PedidoId)} size="small" color={"primary"}>Cancelar</Button>
                        </span >
                    </>}
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
        setAsesorSelected(AsesoresUsuario[0].Usuario);
        cargarPedidosFlotantes("1900-01-01", "1900-01-01");

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
                            placeholder="Estado"
                            selection
                            style={{ zIndex: 999 }}
                            onChange={(e, { value }) => {
                                setEstado(value);
                            }}
                            options={[
                                { key: 0, value: 0, text: "Pendiente" },
                                { key: 1, value: 1, text: "Aprobado" },
                                { key: 2, value: 2, text: "Cancelado" },
                            ]}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            value={estado}
                        />
                    </div>
                    <div className='col-lg-2 my-lg-0 col-6 my-1' style={{ paddingTop: 10 }}>
                        <Dropdown
                            placeholder="Asesor"
                            selection
                            style={{ zIndex: 999 }}
                            onChange={(e, { value }) => setAsesorSelected(value)}
                            options={AsesoresUsuario.map((Ase) => ({ key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }))}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            value={AsesorSelected}
                        />
                    </div>
                    <div className="col-lg-2 col-sm-4 col-6" style={{ paddingTop: 10 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => { cargarPedidosFlotantes(fechaInicio, fechaFin) }}>Obtener
                    </Button>
                    </div>
                </div>
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
    "Pedido Generado",
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
