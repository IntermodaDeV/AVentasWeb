import React, { useState, useEffect } from 'react';
import { APIURL, APP_VERSION } from 'utils/Enviroment';
import { useSelector, useDispatch } from 'react-redux';
import { Loading } from 'components/Global/Loading';
import { get, backgroundPostPedidos, backgroundPostRecibos } from 'utils/http';
import SteperSync from 'containers/Home/SteperSync';
import { getLocalStorage } from 'utils/http';
import moment from 'moment';
import axios from 'axios';
import { FiAlertTriangle } from 'react-icons/fi';
import { verificarConexion } from 'utils/http';
import{ reemplazarUrl } from 'utils/common';
import update1 from 'assets/update1.jpeg';
import update2 from 'assets/update2.jpeg';
import Swal from 'sweetalert2/dist/sweetalert2.js';

export const Home = (props) => {
    const dispatch = useDispatch();
    const [loading, setloading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [SyncDiaria, setSyncDiaria] = useState(true);
    const [UsuarioOficina, setUsuarioOficina] = useState(false);
    const [displaySincronizacion, setDisplaySincronizacion] = useState(false);
    const [update, setUpdate] = useState(false);
    const Colecciones = useSelector(e => e.ListaPrecios);
    const [ModulosError, setModulosError] = useState([]);
    const Configuraciones = useSelector(e=>e.Configuraciones);
    const [velocidad,setVelocidad] = useState(0);

    useEffect(() => {
        localStorage.setItem("Operando", "No");
        if (localStorage.getItem("SesionObligatorio") === null || localStorage.getItem("SesionObligatorio") === undefined) {
            localStorage.setItem("SesionObligatorio", 1);
            localStorage.removeItem("token")
            window.location.reload();
        }
        async function inicioSesion() {
            const permisos = await verificarUsuario();
            if (permisos) {
                let config = await cargarConfiguraciones();
                if (config.APP_VERSION === APP_VERSION) {
                    if (permisos[0].UsuarioOficina) {
                        localStorage.setItem("UsuarioOficina", true);
                        cargarConfiguracionesUsuarioOficina();
                        dispatch({ type: 'SET_PERMISOS', payload: permisos });
                    } else {
                        localStorage.setItem("UsuarioOficina", false);
                        setDisplaySincronizacion(true);
                        let data = getLocalStorage("ListaPrecios");
                        if (data === null) {
                            dispatch({ type: 'SET_PERMISOS', payload: [] });
                            setSyncDiaria(false);
                        }
                        else {
                            CargaPermisos();
                        }
                    }
                } else {
                    setUpdate(true);
                    dispatch({ type: 'SET_PERMISOS', payload: [] });
                }
            }
        }
        setModulosError([])
        inicioSesion();

        const startCalculating = () => {
            return window.setInterval(MeasureConnectionSpeed, 5000);
        };

        const MeasureConnectionSpeed = () => {
            let startTime, endTime;
            const download = new Image();
            startTime = new Date().getTime();
            const cacheBuster = '?nnn=' + startTime;
            download.src = "https://www.sammobile.com/wp-content/uploads/2019/03/keyguard_default_wallpaper_silver.png" + cacheBuster;

            download.onload = function (d) {
                endTime = new Date().getTime();
                showResults(startTime, endTime);
            };
        };

        const showResults = (startTime, endTime) => {
            const duration = (endTime - startTime) / 1000;
            const bitsLoaded = 2550420 * 8;
            const speedBps = (bitsLoaded / duration).toFixed(2);
            const speedKbps = (speedBps / 1024).toFixed(2);
            const speedMbps = (speedKbps / 1024).toFixed(2);
            setVelocidad(speedMbps);
        };

        let intervalFun = startCalculating();

        return () => {
            window.clearInterval(intervalFun);
        };
        // eslint-disable-next-line
    }, [])
    /*---------------------------INICIO SESION ---------------------------------------------------------*/
    const logSession = async () => {
        try {
            const request = await axios.get(`https://ipapi.co/json`);
            let logSession = {
                Usuario: localStorage.getItem('codigo'),
                version_navegador: window.navigator.appVersion,
                IP_Publica: request.data.ip,
                Latitud: request.data.latitude,
                Longitud: request.data.longitude,
                Version_App: APP_VERSION
            }

            registrarLogSesion(logSession);
        } catch (err) {
            console.log(err);
            return null;
        }
    }


    const registrarLogSesion = (data) => {
        fetch(APIURL + "/api/logsesion", {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result.Message)
                },
            )
    }

    const CargaPermisos = async () => {
        let isOnline = await verificarConexion();
        if (isOnline) {
            ObtenerPermisos();
        }
    }

    const ObtenerPermisos = async () => {
        fetch(`${APIURL}/api/Accesos/${localStorage.getItem('codigo')}`)
            .then(res => {
                if (res.status === 401) {
                    window.location.reload();
                }
                if (res.status === 200) {
                    res.json()
                        .then(data => {
                            setUsuarioOficina(data[0].UsuarioOficina)
                            dispatch({ type: 'SET_PERMISOS', payload: data });
                        },
                            (error) => {
                                console.log(error)
                            }
                        )
                }
            })
    }

    const cargarConfiguracionesUsuarioOficina = () => {
        setloading(true);
        ////Configuracion General
        cargarEmpresas();
        cargarAbreviacionMonedas();
        cargarClientesContado();
        cargarComunidadAutonoma();
        cargarMonedas();
        cargarMotivosDevolucion();

        ////Configuracion De Pedido
        cargarMaestroLinea();
        cargarTiposColeccion();
        cargarTiposPedido();
        cargarEmpresasTransporte();
        cargarPrecioCajas();
        cargarImpuestoClientes();
        cargarImpuestoProductos();
        cargarMaestroBodega();
        /////Configuracion De Recibos
        cargarBancos();
        cargarTipoPago();
        cargarTipoVisitasOficina();
    }

    const verificarUsuario = async () => {
        let onLine = await verificarConexion();
        if (onLine) {
            try {
                const request = await axios.get(`${APIURL}/api/Accesos/${localStorage.getItem('codigo')}`);
                return request.data;
            } catch (err) {
                console.log(err);
                return null;
            }
        } else {
            Swal.fire({
                title: 'Sin Internet',
                text: "Necesita internet para poder realizar esta accion.",
                type: 'error',
                confirmButtonText: 'Ok'
            });
            //return null;
        }
    }
    /*----------------------------------------------------MODULOS DE SINCRONIZACION-------------------------------- */
    // eslint-disable-next-line
    const ValoresModulos = [{ Nombre: "SincronizarPedidosPendiente", Valor: 0 },
    { Nombre: "SincronizarReciboPendiente", Valor: 1 },
    { Nombre: "SincronizarConfiguraciones", Valor: 2 },
    { Nombre: "SincronizarCartera", Valor: 3 },
    { Nombre: "SincronizarRecibo", Valor: 4 },
    { Nombre: "SincronizarPedidos", Valor: 5 }]

    const CargaModuloPedidosPendientes = async () => {
        setMensaje('Sincronizando Pedidos');
        let tienePedidosPendientes = await backgroundPostPedidos();
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        localStorage.setItem("PedidosPendientes", tienePedidosPendientes);
        CargaModuloRecibosPendientes();
    }

    const CargaModuloRecibosPendientes = async () => {
        setMensaje('Sincronizando Recibos');
        let tieneRecibosPendientes = await backgroundPostRecibos();
        localStorage.setItem("RecibosPendientes", tieneRecibosPendientes);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        CargarModuloConfiguraciones();
    }

    const CargarModuloConfiguraciones = () => {
        setloading(true);
        ////Documentos Pendientes
        //sincronizarDocumentosPendientes();

        ////Configuracion General
        ObtenerPermisos();
        cargarEmpresas();
        cargarAbreviacionMonedas();
        cargarClientesContado();
        cargarComunidadAutonoma();
        cargarMonedas();
        cargarMotivosDevolucion();

        ////Configuracion De Pedido
        cargarMaestroLinea();
        cargarTiposColeccion();
        cargarTiposPedido();
        cargarEmpresasTransporte();
        cargarPrecioCajas();
        cargarImpuestoClientes();
        cargarImpuestoProductos();
        cargarMaestroBodega();
        /////Configuracion De Recibos
        cargarBancos();
        cargarTipoPago();
        cargarTipoVisitas(); ///Siempre debe ser el Ultimo Metodo
    }

    const ModuloCarteracliente = () => {
        cargarDocumentosPendientes();
        CarteraClientes();
    }

    const CargaModuloRecibo = () => {
        cargarCorrelativoRecibo();
        cargarFirmaRecibo();
        cargarClientesRecibos();///Siempre debe ser el Ultimo Metodo
    }

    const CargaModuloPedidos = () => {
        cargarCorrelativoPedido();
        cargarClientesPedidos();///Siempre debe ser el Ultimo Metodo

    }

    /*------------------------------------------------------------------------------------------------------------------ */
    const cargarDocumentosPendientes = async () => {
        const { data, error } = await get(`${APIURL}/api/documentospendientes/facturas`, "DocumentosPendientes");
        dispatch({ type: "SET_DOCUMENTOSPENDIENTES", payload: data });

        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarCartera")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: "SET_DOCUMENTOSPENDIENTES", payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-DocumentosPendientes`, moment(`${fecha} 23:59:59`));
    }

    const cargarComunidadAutonoma = async () => {
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/transporte/comunidadautonoma`, "comunidadesAutonomas");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'SET_COMUNIDADAUTONOMA', payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-comunidadesAutonomas`, moment(`${fecha} 23:59:59`))
    }

    const cargarEmpresas = async () => {

        setMensaje('Cargando Empresas');
        const { data, error } = await get(`${APIURL}/api/empresa/empresas`, "Empresas");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'SET_EMPRESAS', payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-Empresas`, moment(`${fecha} 23:59:59`))
    }

    const cargarAbreviacionMonedas = async () => {
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/moneda`, "AbreviacionMonedas");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'SET_ABREVACIONMONEDAS', payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-AbreviacionMonedas`, moment(`${fecha} 23:59:59`))
    }

    const cargarMonedas = async () => {
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/moneda/monedas`, "MonedasGlobal");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: "SET_MONEDASGLOBAL", payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-MonedasGlobal`, moment(`${fecha} 23:59:59`))
    }

    const cargarConfiguraciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/configuraciones`);
            dispatch({ type: "SET_CONFIGURACIONES", payload: request.data });
            return request.data;
        } catch (err) {
            console.log(err);
        }
    }

    const cargarTipoVisitas = async () => {
        setMensaje('Cargando Tipo Visitas');
        const { data, error } = await get(`${APIURL}/api/TipoVisitaCliente`, "TipoVisita");
        if (error) {
            /*console.log(error);
            let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]));*/
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            ModuloCarteracliente();
        } else {
            dispatch({ type: "SET_TIPOVISITA", payload: data });
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            ModuloCarteracliente();
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-TipoVisita`, moment(`${fecha} 23:59:59`))
    }

    const cargarTipoVisitasOficina = async () => {
        setMensaje('Cargando Tipo Visitas');
        const { data, error } = await get(`${APIURL}/api/TipoVisitaCliente`, "TipoVisita");
        if (error) {
            console.log(error);
            setloading(false);
        } else {
            dispatch({ type: "SET_TIPOVISITA", payload: data });
            setloading(false);
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-TipoVisita`, moment(`${fecha} 23:59:59`))
    }

    const cargarClientesContado = async () => {
        setMensaje('Cargando Clientes de Contado');
        const { data, error } = await get(`${APIURL}/api/clientecontado/${localStorage.getItem('codigo')}`, "clientesContado");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: "SET_CLIENTESCONTADO", payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-clientesContado`, moment(`${fecha} 23:59:59`))
    }

    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE RECIBOS --------------------------------------*/

    const cargarClientesRecibos = async () => {
        setMensaje('Cargando Clientes de Recibo');
        const { data, error } = await get(`${APIURL}/api/cliente/cuenta`, "Recibo", "clientes");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarRecibo")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            CargaModuloPedidos();
        } else {
            dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: data });
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            CargaModuloPedidos();
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-Recibo`, moment(`${fecha} 23:59:59`))
    }

    const cargarTipoPago = async () => {
        setMensaje('Cargando tipo de pago');
        const { data, error } = await get(`${APIURL}/api/tipopago`, "TipoPagoGlobal");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: "SET_TIPOPAGOGLOBAL", payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-TipoPagoGlobal`, moment(`${fecha} 23:59:59`))
    }

    const cargarBancos = async () => {
        setMensaje('Cargando Bancos');
        const { data, error } = await get(`${APIURL}/api/banco`, "BancosGlobal");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: "SET_BANCOSGLOBAL", payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-BancosGlobal`, moment(`${fecha} 23:59:59`))
    }

    const cargarCorrelativoRecibo = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/recibos/correlativo/${localStorage.getItem('empresa')}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            localStorage.setItem("CorrelativoReciboDiario", request.data)
            dispatch({type:"SET_CORRELATIVORECIBODIARIO",payload:request.data});
        }
        catch (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarRecibo")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        }
    }

    const cargarFirmaRecibo = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/recibos/firma/${localStorage.getItem('empresa')}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            localStorage.setItem("firmarecibo", request.data)
        }
        catch (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarRecibo")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        }
    }

    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE PEDIDOS--------------------------------------*/
    const cargarCorrelativoPedido = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/PedidosXCliente/correlativo/${localStorage.getItem('empresa')}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            localStorage.setItem("CorrelativoPedidoDiario", request.data)
        }
        catch (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarPedidos")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        }
    }

    const cargarMaestroLinea = async () => {
        setloading(true);
        setMensaje('Cargando lineas');
        const { data, error } = await get(`${APIURL}/api/maestrolinea`, "MaestroLineas");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'STORE_MAESTROLINEA', maestroLineas: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-MaestroLineas`, moment(`${fecha} 23:59:59`))
    }

    const cargarTiposColeccion = async () => {
        setMensaje('Cargando Tipos Coleccion');
        const { data, error } = await get(`${APIURL}/api/TiposColeccion`, "TiposColeccion");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'STORE_TIPOS_COLECCION', TiposColeccion: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-TiposColeccion`, moment(`${fecha} 23:59:59`))
    }

    const cargarTiposPedido = async () => {
        setMensaje('Cargando Tipos de Pedidos');
        const { data, error } = await get(`${APIURL}/api/tipopedido`, "TiposPedido");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'STORE_TIPO_PEDIDO', TipoPedido: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-TiposPedido`, moment(`${fecha} 23:59:59`))
    }

    const cargarEmpresasTransporte = async () => {
        setMensaje('Cargando Empresas Transporte');
        const { data, error } = await get(`${APIURL}/api/transporte/empresas`, "EmpresaTransporteGlobal");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'SET_EMPRESASTRANSPORTEGLOBAL', payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-EmpresaTransporteGlobal`, moment(`${fecha} 23:59:59`))
    }

    const cargarPrecioCajas = async () => {
        setMensaje('Cargando Precio Cajas');
        const { data, error } = await get(`${APIURL}/api/transporte/preciocaja`, "PrecioCajasGlobal");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'SET_PRECIOCAJASGLOBAL', payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-PrecioCajasGlobal`, moment(`${fecha} 23:59:59`))
    }

    const cargarImpuestoClientes = async () => {
        setMensaje('Cargando Impuestos Clientes');
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Clientes`, "ClienteImpuestosGlobal");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'SET_CLIENTEIMPUESTOSGLOBAL', payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-ClienteImpuestosGlobal`, moment(`${fecha} 23:59:59`))
    }

    const cargarImpuestoProductos = async () => {
        setMensaje('Cargando Impuestos Productos')
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Articulos`, "ProductoImpuestosGlobal");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'SET_PRODUCTOIMPUESTOSGLOBAL', payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-ProductoImpuestosGlobal`, moment(`${fecha} 23:59:59`))
    }

    const cargarMaestroBodega = async () => {
        setMensaje('Cargando Maestro de Bodega')
        const { data, error } = await get(`${APIURL}/api/MaestroBodegaAlmacenes`, "MaestroBodegaGlobal");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarConfiguraciones")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'SET_BODEGAALMACENES', payload: data });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-MaestroBodegaGlobal`, moment(`${fecha} 23:59:59`))
    }

    const cargarMotivosDevolucion = async () => {
        const { data } = await get(`${APIURL}/api/motivos/devolucion`, "Devolucion", "motivosDevolucion");
        dispatch({ type: "SET_MOTIVOSDEVOLUCION", payload: data });
    }

    const cargarClientesPedidos = async () => {
        setMensaje('Cargando Cliente Pedidos')
        const { data, error } = await get(`${APIURL}/api/cliente/pedido`, "clientes");
        if (error) {
            /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarPedidos")
            setModulosError((prevState) => ([...prevState, step[0].Valor]))
            console.log(error);*/
        } else {
            dispatch({ type: 'STORE_CLIENTES', clientes: data });
            cargarListaPrecios(data);
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-clientes`, moment(`${fecha} 23:59:59`))
    }

    const cargarListaPrecios = (clientes) => {
        setMensaje('Cargando Colecciones y Productos')
        let data = getLocalStorage("ListaPrecios");

        if (data) {
            dispatch({ type: 'SET_LISTAPRECIOS', payload: data });
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setSyncDiaria(true);
            setloading(false);
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
                    CargaImagenes(res.data);
                })
                .catch(err => {
                    /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarPedidos")
                    setModulosError((prevState) => ([...prevState, step[0].Valor]))
                    console.log(err)*/
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                    setSyncDiaria(true);
                    setloading(false);
                });
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-ListaPrecios`, moment(`${fecha} 23:59:59`))
    }
    const CargaImagenes = async (data) => {
        let ColeccionOriginal = Colecciones;
        setMensaje('Cargando imagenes')
        let listaPrecios = data;
        listaPrecios.forEach(e => {
            let coleccion = ColeccionOriginal.filter(c => c.CodigoColeccion === e.CodigoColeccion);
            e.Edades.forEach(async function (edades) {
                let Edades;
                if (coleccion !== undefined && coleccion.length > 0) {
                    let imagenBlob = reemplazarUrl(coleccion[0].FotoPortada,Configuraciones.UrlImages, Configuraciones.UrlImagesOffline);
                    if (imagenBlob) {
                        coleccion[0].FotoPortada = imagenBlob;
                    }
                    let Edad = coleccion[0].Edades;
                    Edades = Edad.filter(e => e.IdEdad === edades.IdEdad);
                }
                edades.ProductosXEdad.forEach(prod => {
                    let ProductosXEdad;
                    if (Edades !== undefined && Edades.length > 0) {
                        ProductosXEdad = Edades[0].ProductosXEdad.filter(p => p.ProductoId === prod.ProductoId)
                    }
                    ///Imagenes generales del producto
                    prod.ListaImagenes.forEach(async function (img) {
                        let imges;
                        if (ProductosXEdad !== undefined && ProductosXEdad.length > 0) {
                            imges = ProductosXEdad[0].ListaImagenes.filter(i => i.IdFotografia === img.IdFotografia)
                        }
                        if (imges !== undefined && imges.length > 0) {
                            if (imges[0].FotografiaProducto.includes(Configuraciones.UrlImagesOffline)) {
                                img.FotografiaProducto = imges[0].FotografiaProducto;
                            }
                            else {
                                let imagenBlob = reemplazarUrl(img.FotografiaProducto,Configuraciones.UrlImages, Configuraciones.UrlImagesOffline);
                                if (imagenBlob) {
                                    img.FotografiaProducto = imagenBlob;
                                }
                            }
                        }
                        else {
                            let imagenBlob = reemplazarUrl(img.FotografiaProducto,Configuraciones.UrlImages, Configuraciones.UrlImagesOffline);
                            if (imagenBlob) {
                                img.FotografiaProducto = imagenBlob;
                            }
                        }

                    })

                    ///Imagenes por color del producto
                    prod.ListaColores.forEach(color => {
                        let colores;
                        if (ProductosXEdad !== undefined && ProductosXEdad.length > 0) {
                            colores = ProductosXEdad[0].ListaColores.filter(i => i.CodigoColor === color.CodigoColor)
                        }
                        color.ListaImagenes.forEach(async function (img) {
                            let imgColor;
                            if (colores !== undefined && colores.length > 0) {
                                imgColor = colores[0].ListaImagenes.filter(i => i.IdFotografia === img.IdFotografia)
                            }
                            if (imgColor !== undefined && imgColor.length > 0) {
                                if (imgColor[0].FotografiaProducto.includes(Configuraciones.UrlImagesOffline)) {
                                    img.FotografiaProducto = imgColor[0].FotografiaProducto;
                                }
                                else {
                                    let imagenColorBlob = reemplazarUrl(img.FotografiaProducto,Configuraciones.UrlImages, Configuraciones.UrlImagesOffline);
                                    if (imagenColorBlob) {
                                        img.FotografiaProducto = imagenColorBlob;
                                    }
                                }
                            }
                            else {
                                let imagenColorBlob = reemplazarUrl(img.FotografiaProducto,Configuraciones.UrlImages, Configuraciones.UrlImagesOffline);
                                if (imagenColorBlob) {
                                    img.FotografiaProducto = imagenColorBlob;
                                }
                            }
                        })
                    })
                })
            })
        })
        //setTimeout(() => {
        logSession();
        dispatch({ type: 'SET_LISTAPRECIOS', payload: listaPrecios });
        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-ListaPrecios`, moment(`${fecha} 23:59:59`));
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSyncDiaria(true);
        setloading(false);
        //}, 40000)
    }
    /*const convertirBlob = async (url) => {
        try {
            const request = await axios.get(url, { responseType: 'blob' });
            return request.data;
        } catch (err) {
            return null;
        }
    }*/

    /*const convertToBase64 = async (url)=>{
        try{
            const request = await axios.get(url, { responseType: 'arraybuffer' });
            const nuevoString = Buffer.from(request.data, 'binary').toString('base64');
            return `data:image/jpg;base64,${nuevoString}`;
        }catch(err){
            return null;
        }
    }*/

    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE CARTERA DE CLIENTES--------------------------------------*/

    const CarteraClientes = async () => {

        if (UsuarioOficina === false) {
            const { data, error } = await get(`${APIURL}/api/cliente/${localStorage.getItem("codigo")}`, "Cartera");
            if (error) {
                CargaModuloRecibo();
                /*let step = ValoresModulos.filter(v => v.Nombre === "SincronizarCartera")
                setModulosError((prevState) => ([...prevState, step[0].Valor]))*/
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                console.log(error);
            } else {
                localStorage.setItem("UltimaSyncCartera", new Date())
                dispatch({ type: "SET_CARTERA", payload: data });
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                CargaModuloRecibo();
            }
        }

        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-Cartera`, moment(`${fecha} 23:59:59`))
    }

    /*--------------------------------------------------------------------------------------------------------------------*/
    return (
        <div style={{ height: '100%' }} className="container-fluid">
            <div class="card-body text-center">
                <Loading open={loading} title={mensaje} />
                <h1 class="card-title">¡Bienvenido(a) {localStorage.getItem('asesor')}!</h1>
                <h3 style={{color:velocidad<8?"red":"green"}}>Velocidad internet {velocidad} Mbps</h3>
                <hr />
                <div>
                    {update && (
                        <div>
                            <h3>Nueva versión disponible. Presione shift+f5 para actualizar la aplicación.</h3>
                            <h5>Opción 1</h5>
                            <img alt="update1" style={{ width: '100%' }} src={update1} />
                            <h5>Opción 2</h5>
                            <img alt="update2" style={{ width: '100%' }} src={update2} />
                        </div>
                    )}
                    {displaySincronizacion && <div>
                        {
                            SyncDiaria === false &&
                            <div style={{ textAlign: 'center', fontSize: '26px' }} className="alert alert-danger alert-dismissible fade show" role="alert">
                                <FiAlertTriangle style={{ fontSize: '30px', color: 'red' }} /> ¡Necesita realizar la sincronización diaria obligatoria para acceder al sistema!
                            </div>
                        }

                        <SteperSync
                            CargarModuloInicial={CargaModuloPedidosPendientes}
                            loading={loading}
                            activeStep={activeStep}
                            ModulosError={ModulosError}>
                        </SteperSync>
                    </div>}
                </div>
            </div>
        </div>
    )
}