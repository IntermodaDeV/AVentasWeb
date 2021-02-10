import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Loading } from 'components/Global/Loading';
import { APIURL } from 'utils/Enviroment';
import { useSelector, useDispatch } from 'react-redux';
import { verificarConexion } from 'utils/http';
import { IsAllow } from 'components/Seguridad/Permisos';

const HeadersListaClientes = [
    {
        label: "Codigo",
        name: "Codigo",
        options: {
            filter: false,
            sort: false
        }
    },
    {
        label: "Cliente",
        name: "Cliente",
        options: {
            filter: false,
            sort: false
        }
    },
    "Asesor",
    "Empresa",
    {
        label: "Acciones",
        name: "Acciones",
        options: {
            filter: false,
            sort: false
        }
    }
];

export const SincronizacionCliente = (props) => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const clientesCache = useSelector(e => e.Recibo.clientes);
    const clientesCartera = useSelector(e => e.Cartera);
    const permisos = useSelector(e => e.Permisos[0]);
    const dispatch = useDispatch();

    const cargarClientes = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/cliente/sincronizacion`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                }
            });
            setClientes(request.data);
        } catch (e) {

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
    });

    const cargarCliente = async (cliente) => {
        if (!permisos.UsuarioOficina) {
            if (localStorage.getItem("Conexion") === "Online") {
                let isOnline = await verificarConexion();
                if (isOnline) {
                    try {
                        let request = await axios.get(`${APIURL}/api/cliente/cuenta/${cliente}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
                        let clientesStorage = clientesCache;
                        let clientesStorageCartera = clientesCartera;
                        let indexCartera = clientesStorageCartera.map(e => e.Codigo).indexOf(cliente);
                        let index = clientesStorage.map(e => e.Codigo).indexOf(cliente);
                        clientesStorage[index] = request.data;
                        clientesStorageCartera[indexCartera].AcuerdosXTipoPedido = request.data.AcuerdosXTipoPedido;
                        dispatch({ type: 'SET_CARTERA', payload: clientesStorageCartera });
                        dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: clientesStorage });
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        }
    }

    const sincronizarCliente = async (cliente) => {
        let isOnline = await verificarConexion();
        if (isOnline) {
            try {
                setLoading(true);
                await axios.post(`${APIURL}/api/cliente/sincronizacion/${cliente}`);
                cargarCliente(cliente);
                Swal.fire({
                    title: 'Confirmado',
                    text: 'Cuenta del cliente actualizada exitosamente.',
                    type: 'success',
                    confirmButtonText: 'Ok',
                });
                setLoading(false);
            } catch (err) {
                setLoading(false);
                let mensaje = "Ha ocurrido un error y no se pudo actualizar la cuenta corriente del cliente.";

                if (err.response) {
                    mensaje = err.response.data.Message;
                }

                Swal.fire({
                    title: 'Error',
                    text: mensaje,
                    type: 'error',
                    confirmButtonText: 'Ok',
                });
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: "Necesita estar conectado a internet para poder sincronizar.",
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }

    }

    const confirmarSincronizacion = cliente => {
        Swal.fire({
            title: 'Confirmar',
            text: `¿Desea sincronizar cuenta corriente del cliente ${cliente}?`,
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#06bf53',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                sincronizarCliente(cliente);
            }
        })
    }

    const DataClientes = () => {
        return clientes.map(cliente => ([cliente.Codigo, cliente.Nombre, cliente.Asesor, cliente.EmpresaId, <button className="btn btn-success" onClick={() => { confirmarSincronizacion(cliente.Codigo) }}>Sincronizar</button>]));
    }

    useEffect(() => {
        if (!IsAllow("/sincronizacion-especifica-cliente")) {
            props.history.push('/home');
        }

        cargarClientes();

        //eslint-disable-next-line
    }, []);

    return (
        <div>
            <h1 style={{ textAlign: 'center' }}>Sincronización Cliente</h1>
            <div>
                <Loading open={loading} title="Actualizando cuenta corriente" />
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Listado Clientes"}
                        data={DataClientes()}
                        columns={HeadersListaClientes}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>
        </div>
    );
}

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