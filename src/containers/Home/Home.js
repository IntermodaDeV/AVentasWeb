import React, { useState } from 'react';
import { APIURL } from 'utils/Enviroment';
import { useDispatch } from 'react-redux';
import { Loading } from 'components/Global/Loading';
import { get } from 'utils/http';
import SteperSync from 'containers/Home/SteperSync';
import { getLocalStorage } from 'utils/http';
import moment from 'moment';
import axios from 'axios';

export const Home = (props) => {
    const dispatch = useDispatch();
    const [loading, setloading] = useState(false);  
    const [mensaje,setMensaje] = useState('');

    const CargarModuloConfiguraciones = () => {
        setloading(true);
        ObtenerPermisos();
        cargarEmpresas();
        cargarAbreviacionMonedas();
        cargarClientesContado();
        cargarComunidadAutonoma();
        cargarMonedas();
        cargarConfiguraciones();
        cargarTipoVisitas();
        setloading(false);
    }

    const CargaModuloRecibo = () => {
        setloading(true);
        cargarBancos();
        cargarClientesRecibos();
        cargarTipoPago();
        setloading(false);
    }

    const CargaModuloPedidos = () => {
        setloading(true);
        cargarMaestroLinea();
        cargarTiposColeccion();
        cargarTiposPedido();
        cargarEmpresasTransporte();
        cargarPrecioCajas();
        cargarImpuestoClientes();
        cargarImpuestoProductos();
        cargarClientesPedidos();
        setloading(false);
    }
    const ObtenerPermisos = () => {
        fetch(`${APIURL}/api/Accesos/${localStorage.getItem('codigo')}`)
            .then(res => {
                if (res.status === 401) {
                    window.location.reload();
                }
                if (res.status === 200) {
                    res.json()
                        .then(data => {
                            dispatch({ type: 'SET_PERMISOS', payload: data });
                        },
                            (error) => {
                                console.log(error)
                            }
                        )
                }
            })
    }

    const cargarComunidadAutonoma = async () => {
        setloading(true);
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/transporte/comunidadautonoma`, "comunidadesAutonomas");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'SET_COMUNIDADAUTONOMA', payload: data });
        }
    }
   
    const cargarEmpresas = async () => {
        setloading(true);
        setMensaje('Cargando Empresas');
        const { data, error } = await get(`${APIURL}/api/empresa/empresas`, "Empresas");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'SET_EMPRESAS', payload: data });
        }
    }

    const cargarAbreviacionMonedas = async () => {
        setloading(true);
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/moneda`, "AbreviacionMonedas");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'SET_ABREVACIONMONEDAS', payload: data });
        }
    }

    const cargarMonedas = async () => {
        setloading(true);
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/moneda/monedas`, "MonedasGlobal");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: "SET_MONEDASGLOBAL", payload: data });
        }
    }

    const cargarConfiguraciones = async () => {
        setloading(true);
        setMensaje('Cargando Configuraciones');
        const { data, error } = await get(`${APIURL}/api/configuraciones`, "Configuraciones");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: "SET_CONFIGURACIONES", payload: data });
        }
    }

    const cargarTipoVisitas = async () => {
        setloading(true);
        setMensaje('Cargando Tipo Visitas');
        const { data, error } = await get(`${APIURL}/api/TipoVisitaCliente`, "TipoVisita");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: "SET_TIPOVISITA", payload: data });
        }
    }

    const cargarClientesContado = async () => {
        setloading(true);
        setMensaje('Cargando Clientes de Contado');
        const { data, error } = await get(`${APIURL}/api/clientecontado/${localStorage.getItem('codigo')}`, "clientesContado");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: "SET_CLIENTESCONTADO", payload: data });
        }
    }

    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE RECIBOS --------------------------------------*/

    const cargarClientesRecibos = async () => {
        setloading(true);
        setMensaje('Cargando Clientes de Recibo');
        const { data, error } = await get(`${APIURL}/api/cliente/cuenta`, "Recibo", "clientes");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: data });
        }
    }

    const cargarTipoPago = async () => {
        setloading(true);
        setMensaje('Cargando tipo de pago');
        const { data, error } = await get(`${APIURL}/api/tipopago`, "TipoPagoGlobal");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: "SET_TIPOPAGOGLOBAL", payload: data });
        }
    }

    const cargarBancos = async () => {
        setloading(true);
        setMensaje('Cargando Bancos');
        const { data, error } = await get(`${APIURL}/api/banco`, "BancosGlobal");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: "SET_BANCOSGLOBAL", payload: data });
        }
    }
    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE PEDIDOS--------------------------------------*/

    const cargarMaestroLinea = async () => {
        setloading(true);
        setMensaje('Cargando lineas');
        const { data, error } = await get(`${APIURL}/api/maestrolinea`, "MaestroLineas");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'STORE_MAESTROLINEA', maestroLineas: data });
        }
    }
    const cargarTiposColeccion = async () => {
        setloading(true);
        setMensaje('Cargando Tipos Coleccion');
        const { data, error } = await get(`${APIURL}/api/TiposColeccion`, "TiposColeccion");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'STORE_TIPOS_COLECCION', TiposColeccion: data });
        }
    }

    const cargarTiposPedido = async () => {
        setloading(true);
        setMensaje('Cargando Tipos de Pedidos');
        const { data, error } = await get(`${APIURL}/api/tipopedido`, "TiposPedido");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'STORE_TIPO_PEDIDO', TipoPedido: data });
        }
    }
   
    const cargarEmpresasTransporte = async () => {
        setloading(true);
        setMensaje('Cargando Empresas Transporte');
        const { data, error } = await get(`${APIURL}/api/transporte/empresas`, "EmpresaTransporteGlobal");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'SET_EMPRESASTRANSPORTEGLOBAL', payload: data });
        }
    }

    const cargarPrecioCajas = async () => {
        setloading(true);
        setMensaje('Cargando Precio Cajas');
        const { data, error } = await get(`${APIURL}/api/transporte/preciocaja`, "PrecioCajasGlobal");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'SET_PRECIOCAJASGLOBAL', payload: data });
        }
    }

    const cargarImpuestoClientes = async () => {
        setloading(true);
        setMensaje('Cargando Impuestos Clientes');
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Clientes`, "ClienteImpuestosGlobal");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'SET_CLIENTEIMPUESTOSGLOBAL', payload: data });
        }
    }

    const cargarImpuestoProductos = async () => {
        setloading(true);
        setMensaje('Cargando Impuestos Productos')
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Articulos`, "ProductoImpuestosGlobal");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            dispatch({ type: 'SET_PRODUCTOIMPUESTOSGLOBAL', payload: data });
        }
    }

    const cargarClientesPedidos = async () => {
        setloading(true);
        setMensaje('Cargando Cliente Pedidos')
        const { data, error } = await get(`${APIURL}/api/cliente/pedido`, "clientes");
        if (error) {
            setloading(false);
            console.log(error);
        } else {
            setloading(false);
            cargarListaPrecios(data);
            dispatch({ type: 'STORE_CLIENTES', clientes: data });
        }
    }

    const cargarListaPrecios = (clientes) => {
        setloading(true);
        setMensaje('Cargando Colecciones')
        let data = getLocalStorage("ListaPrecios");

        if (data) {
            setloading(false);
            dispatch({ type: 'SET_LISTAPRECIOS', payload: data });
        } else {
            const listaPrecios = [...new Set(clientes.map(x => x.GrupoPrecio))];
            const paises = [...new Set(clientes.map(x => x.EmpresaId))];

            axios.get(APIURL + "/api/colecciones/listaprecios", {
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    ListaPrecios: listaPrecios,
                    Paises: paises
                }
            })
                .then(res => {
                    dispatch({ type: 'SET_LISTAPRECIOS', payload: res.data });
                    let fecha = moment(new Date()).format("YYYY-MM-DD");
                    localStorage.setItem(`expiracion-ListaPrecios`, moment(`${fecha} 23:59:59`));
                    setloading(false);
                })
                .catch(err => {
                    console.log(err)
                    setloading(false);
                });
        }
    }

    return (
        <div style={{ height: '100%' }} className="container-fluid">
            <div class="card-body text-center">
                <Loading open={loading} title={mensaje}/>
                <h1 class="card-title">¡Bienvenido(a) {localStorage.getItem('asesor')}!</h1>
                <hr />
                <SteperSync
                    CargaModuloRecibo={CargaModuloRecibo}
                    CargarModuloConfiguraciones={CargarModuloConfiguraciones}
                    CargaModuloPedidos={CargaModuloPedidos}
                    loading={loading}>
                </SteperSync>
            </div>
        </div>
    )
}