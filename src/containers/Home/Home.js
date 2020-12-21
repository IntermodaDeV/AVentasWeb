import React, { useState, useEffect } from 'react';
import { APIURL } from 'utils/Enviroment';
import { useDispatch } from 'react-redux';
import { Loading } from 'components/Global/Loading';
import { get } from 'utils/http';
import SteperSync from 'containers/Home/SteperSync';
import { getLocalStorage } from 'utils/http';
import moment from 'moment';
import axios from 'axios';
import { FiAlertTriangle } from 'react-icons/fi';
import { verificarConexion } from 'utils/http';

export const Home = (props) => {
    const dispatch = useDispatch();
    const [loading, setloading] = useState(false);  
    const [mensaje,setMensaje] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [SyncDiaria, setSyncDiaria] = useState(true);  
    const [UsuarioOficina, setUsuarioOficina] = useState(false);  
    const [displaySincronizacion,setDisplaySincronizacion] = useState(false);
    
    useEffect(() => {

        async function inicioSesion() {
            const permisos = await verificarUsuario();
            if (permisos) {
                if (permisos[0].UsuarioOficina) {
                    cargarConfiguracionesUsuarioOficina();
                    dispatch({ type: 'SET_PERMISOS', payload: permisos });
                } else {
                    setDisplaySincronizacion(true);
                    let data = getLocalStorage("ListaPrecios");
                    if (data === null) {
                        dispatch({ type: 'SET_PERMISOS', payload: [] });
                        localStorage.setItem("OcurrioError", false)
                        setSyncDiaria(false);
                    }
                    else {
                        CargaPermisos();
                    }
                }
            }
        }

        inicioSesion();
        // eslint-disable-next-line
    }, [])

    const CargaPermisos  = async () => {
        let isOnline = await verificarConexion();
        if(isOnline){
            ObtenerPermisos();
        }
    }

    const cargarConfiguracionesUsuarioOficina = ()=>{
        setloading(true);
        ////Configuracion General
        cargarEmpresas();
        cargarAbreviacionMonedas();
        cargarClientesContado();
        cargarComunidadAutonoma();
        cargarMonedas();
        cargarConfiguraciones();

        ////Configuracion De Pedido
        cargarMaestroLinea();
        cargarTiposColeccion();
        cargarTiposPedido(); 
        cargarEmpresasTransporte(); 
        cargarPrecioCajas(); 
        cargarImpuestoClientes(); 
        cargarImpuestoProductos();

        /////Configuracion De Recibos
        cargarBancos();
        cargarTipoPago();
        cargarTipoVisitasOficina();
    }

    const CargarModuloConfiguraciones = () => {
        setloading(true);
        ////Configuracion General
        ObtenerPermisos();
        cargarEmpresas();
        cargarAbreviacionMonedas();
        cargarClientesContado();
        cargarComunidadAutonoma();
        cargarMonedas();
        cargarConfiguraciones();

         ////Configuracion De Pedido
         cargarMaestroLinea();
         cargarTiposColeccion();
         cargarTiposPedido(); 
         cargarEmpresasTransporte(); 
         cargarPrecioCajas(); 
         cargarImpuestoClientes(); 
         cargarImpuestoProductos();
        /////Configuracion De Recibos
        cargarBancos();
        cargarTipoPago();
        cargarTipoVisitas(); ///Siempre debe ser el Ultimo Metodo
    }
    const ModuloCarteracliente = () => {
        CarteraClientes();
    }
    const CargaModuloRecibo = () => {
        cargarClientesRecibos();///Siempre debe ser el Ultimo Metodo
    }

    const CargaModuloPedidos = () => {
        cargarClientesPedidos();///Siempre debe ser el Ultimo Metodo
        
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
        }else{
            return null;
        }
    }

    const cargarComunidadAutonoma = async () => {
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/transporte/comunidadautonoma`, "comunidadesAutonomas");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'SET_COMUNIDADAUTONOMA', payload: data });
        }
    }
   
    const cargarEmpresas = async () => {
        setMensaje('Cargando Empresas');
        const { data, error } = await get(`${APIURL}/api/empresa/empresas`, "Empresas");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'SET_EMPRESAS', payload: data });
        }
    }

    const cargarAbreviacionMonedas = async () => {
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/moneda`, "AbreviacionMonedas");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'SET_ABREVACIONMONEDAS', payload: data });
        }
    }

    const cargarMonedas = async () => {
        setMensaje('Cargando Monedas');
        const { data, error } = await get(`${APIURL}/api/moneda/monedas`, "MonedasGlobal");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: "SET_MONEDASGLOBAL", payload: data });
        }
    }

    const cargarConfiguraciones = async () => {
        setMensaje('Cargando Configuraciones');
        const { data, error } = await get(`${APIURL}/api/configuraciones`, "Configuraciones");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: "SET_CONFIGURACIONES", payload: data });
        }
    }

    const cargarTipoVisitas = async () => {
        setMensaje('Cargando Tipo Visitas');
        const { data, error } = await get(`${APIURL}/api/TipoVisitaCliente`, "TipoVisita");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
           
            if(UsuarioOficina){
                setSyncDiaria(true);
                setloading(false);
            }
            else{
                ModuloCarteracliente();
            }
        } else {
            dispatch({ type: "SET_TIPOVISITA", payload: data });
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            if(UsuarioOficina){
                setSyncDiaria(true);
                setloading(false);
                setActiveStep((prevActiveStep) => prevActiveStep + 3);
            }
            else{
                ModuloCarteracliente();
            }
        }
    }

    const cargarTipoVisitasOficina = async () => {
        setMensaje('Cargando Tipo Visitas');
        const { data, error } = await get(`${APIURL}/api/TipoVisitaCliente`, "TipoVisita");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
            setloading(false);
        } else {
            dispatch({ type: "SET_TIPOVISITA", payload: data });
            setloading(false);
        }
    }

    const cargarClientesContado = async () => {
        setMensaje('Cargando Clientes de Contado');
        const { data, error } = await get(`${APIURL}/api/clientecontado/${localStorage.getItem('codigo')}`, "clientesContado");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: "SET_CLIENTESCONTADO", payload: data });
        }
    }

    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE RECIBOS --------------------------------------*/

    const cargarClientesRecibos = async () => {
        setMensaje('Cargando Clientes de Recibo');
        const { data, error } = await get(`${APIURL}/api/cliente/cuenta`, "Recibo", "clientes");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            CargaModuloPedidos();
        } else {
            dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: data });
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            CargaModuloPedidos();
        }
    }

    const cargarTipoPago = async () => {
        setMensaje('Cargando tipo de pago');
        const { data, error } = await get(`${APIURL}/api/tipopago`, "TipoPagoGlobal");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: "SET_TIPOPAGOGLOBAL", payload: data });
        }
    }

    const cargarBancos = async () => {
        setMensaje('Cargando Bancos');
        const { data, error } = await get(`${APIURL}/api/banco`, "BancosGlobal");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: "SET_BANCOSGLOBAL", payload: data });
        }
    }
    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE PEDIDOS--------------------------------------*/

    const cargarMaestroLinea = async () => {
        setloading(true);
        setMensaje('Cargando lineas');
        const { data, error } = await get(`${APIURL}/api/maestrolinea`, "MaestroLineas");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            let Lineas = data;
            Lineas.forEach(async function (l) {
                let Imagen = await convertirBlob(l.Imagen);
                if (Imagen) {
                    l.Imagen = URL.createObjectURL(Imagen);
                }
            })
            dispatch({ type: 'STORE_MAESTROLINEA', maestroLineas: data });
        }
    }
    const cargarTiposColeccion = async () => {
        setMensaje('Cargando Tipos Coleccion');
        const { data, error } = await get(`${APIURL}/api/TiposColeccion`, "TiposColeccion");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'STORE_TIPOS_COLECCION', TiposColeccion: data });
        }
    }

    const cargarTiposPedido = async () => {
        setMensaje('Cargando Tipos de Pedidos');
        const { data, error } = await get(`${APIURL}/api/tipopedido`, "TiposPedido");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'STORE_TIPO_PEDIDO', TipoPedido: data });
        }
    }
   
    const cargarEmpresasTransporte = async () => {
        setMensaje('Cargando Empresas Transporte');
        const { data, error } = await get(`${APIURL}/api/transporte/empresas`, "EmpresaTransporteGlobal");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'SET_EMPRESASTRANSPORTEGLOBAL', payload: data });
        }
    }

    const cargarPrecioCajas = async () => {
        setMensaje('Cargando Precio Cajas');
        const { data, error } = await get(`${APIURL}/api/transporte/preciocaja`, "PrecioCajasGlobal");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'SET_PRECIOCAJASGLOBAL', payload: data });
        }
    }

    const cargarImpuestoClientes = async () => {
        setMensaje('Cargando Impuestos Clientes');
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Clientes`, "ClienteImpuestosGlobal");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'SET_CLIENTEIMPUESTOSGLOBAL', payload: data });
        }
    }

    const cargarImpuestoProductos = async () => {
        setMensaje('Cargando Impuestos Productos')
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Articulos`, "ProductoImpuestosGlobal");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'SET_PRODUCTOIMPUESTOSGLOBAL', payload: data });
        }
    }

    const cargarClientesPedidos = async () => {
        setMensaje('Cargando Cliente Pedidos')
        const { data, error } = await get(`${APIURL}/api/cliente/pedido`, "clientes");
        if (error) {
            localStorage.setItem("OcurrioError", true)
            console.log(error);
        } else {
            dispatch({ type: 'STORE_CLIENTES', clientes: data });
            cargarListaPrecios(data);
        }
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
                    localStorage.setItem("OcurrioError", true)
                    console.log(err)
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                    setSyncDiaria(true);
                    setloading(false);
                });
        }
    }

    const CargaImagenes = async (data) =>{
        setMensaje('Cargando imagenes')
        let listaPrecios = data;
        listaPrecios.forEach(e => {
            e.Edades.forEach(edades => {
                edades.ProductosXEdad.forEach(prod => {
                     ///Imagenes generales del producto
                    prod.ListaImagenes.forEach(async function (img){
                        let imagenBlob = await convertirBlob(img.FotografiaProducto);
                        if (imagenBlob) {
                            img.FotografiaProducto = URL.createObjectURL(imagenBlob);
                        }
                    })

                      ///Imagenes por color del producto
                      prod.ListaColores.forEach(color => {
                        color.ListaImagenes.forEach( async function (img) {
                            let imagenColorBlob = await convertirBlob(img.FotografiaProducto);
                            if (imagenColorBlob) {
                                img.FotografiaProducto = URL.createObjectURL(imagenColorBlob);
                            }
                        })
                    })
                })
            })
        })
        dispatch({ type: 'SET_LISTAPRECIOS', payload: listaPrecios });
        let fecha = moment(new Date()).format("YYYY-MM-DD");
        localStorage.setItem(`expiracion-ListaPrecios`, moment(`${fecha} 23:59:59`));
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSyncDiaria(true);
        setloading(false);
    }
    const convertirBlob = async (url)=>{
        try{
            const request = await axios.get(url, { responseType: 'blob' });
            return request.data;
        }catch(err){
            return null;
        }
    }

    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE CARTERA DE CLIENTES--------------------------------------*/

    const CarteraClientes = async () => {
        console.log("UsuarioOficina",UsuarioOficina)
        if (UsuarioOficina === false) {
            const { data, error } = await get(`${APIURL}/api/cliente/${localStorage.getItem("codigo")}`, "Cartera");
            if (error) {
                CargaModuloRecibo();
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                console.log(error);
            } else {
                dispatch({ type: "SET_CARTERA", payload: data });
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                CargaModuloRecibo();
            }
        }
    }

    /*--------------------------------------------------------------------------------------------------------------------*/
    return (
        <div style={{ height: '100%' }} className="container-fluid">
            <div class="card-body text-center">
                <Loading open={loading} title={mensaje} />
                <h1 class="card-title">¡Bienvenido(a) {localStorage.getItem('asesor')}!</h1>
                <hr />
                <div>
                    {displaySincronizacion && <div>
                        {
                            SyncDiaria === false &&
                            <div style={{ textAlign: 'center', fontSize: '26px' }} className="alert alert-danger alert-dismissible fade show" role="alert">
                                <FiAlertTriangle style={{ fontSize: '30px', color: 'red' }} /> ¡Necesita realizar la sincronización diaria obligatoria para acceder al sistema!
                    </div>
                        }

                        <SteperSync
                            CargarModuloConfiguraciones={CargarModuloConfiguraciones}
                            loading={loading}
                            activeStep={activeStep}>
                        </SteperSync>
                    </div>}
                </div>
            </div>
        </div>
    )
}