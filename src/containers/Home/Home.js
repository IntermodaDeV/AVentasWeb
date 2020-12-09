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

    const cargarComunidadAutonoma = () => {
        fetch(`${APIURL}/api/transporte/comunidadautonoma`)
            .then(res => res.json())
            .then(data => dispatch({ type: 'SET_COMUNIDADAUTONOMA', payload: data }))
            .catch(error => this.setState({ error }))
    }

    const cargarEmpresas = () => {
        fetch(`${APIURL}/api/empresa/empresas`)
            .then(res => res.json())
            .then(data => { dispatch({ type: 'SET_EMPRESAS', payload: data }) })
            .catch(error => console.log(error))
    }

    const cargarAbreviacionMonedas = () => {
        fetch(`${APIURL}/api/moneda`)
            .then(res => res.json())
            .then(data => { dispatch({ type: 'SET_ABREVACIONMONEDAS', payload: data }) })
            .catch(error => console.log(error))
    }

    const cargarMonedas = async () => {
        const { data, error } = await get(`${APIURL}/api/moneda/monedas`, "MonedasGlobal");
        if (error) {
            console.log(error);
        } else {
            dispatch({ type: "SET_MONEDASGLOBAL", payload: data });
        }
    }

    const cargarConfiguraciones = async () => {
        const { data, error } = await get(`${APIURL}/api/configuraciones`, "Configuraciones");
        if (error) {
            console.log(error);
        } else {
            dispatch({ type: "SET_CONFIGURACIONES", payload: data });
        }
    }

    const cargarTipoVisitas = async () => {
        const { data, error } = await get(`${APIURL}/api/TipoVisitaCliente`, "TipoVisita");
        if (error) {
            console.log(error);
        } else {
            dispatch({ type: "SET_TIPOVISITA", payload: data });
        }
    }

    const cargarClientesContado = () => {
        fetch(`${APIURL}/api/clientecontado/${localStorage.getItem('codigo')}`)
            .then(res => res.json())
            .then(data => { dispatch({ type: 'SET_CLIENTESCONTADO', payload: data }) })
            .catch(error => console.log(error))
    }

    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE RECIBOS --------------------------------------*/

    const cargarClientesRecibos = async () => {
        const { data, error } = await get(`${APIURL}/api/cliente/cuenta`, "Recibo", "clientes");
        if (error) {
            console.log(error);
        } else {
            dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: data });
        }
    }

    const cargarTipoPago = async () => {
        const { data, error } = await get(`${APIURL}/api/tipopago`, "TipoPagoGlobal");
        if (error) {
            console.log(error);
        } else {
            dispatch({ type: "SET_TIPOPAGOGLOBAL", payload: data });
        }
    }

    const cargarBancos = async () => {
        const { data, error } = await get(`${APIURL}/api/banco`, "BancosGlobal");
        if (error) {
            console.log(error);
        } else {
            dispatch({ type: "SET_BANCOSGLOBAL", payload: data });
        }
    }
    /*--------- ----------------CARGA DE INFORMACION EN FLUJO DE PEDIDOS--------------------------------------*/

    const cargarMaestroLinea = () => {
        setloading(true);
        setMensaje('Cargando lineas');
        fetch(APIURL + "/api/maestrolinea/")
            .then(res => {
                if (res.status === 401) {
                    localStorage.setItem('token', '');
                    window.location.reload();
                }
                if (res.status === 200) {
                    res.json().then(
                        (result) => {
                            setloading(false);
                            dispatch({ type: 'STORE_MAESTROLINEA', maestroLineas: result });
                        },
                        (error) => {
                            this.setState({
                                isLoaded: true,
                                error
                            });
                        }
                    )
                }
            })
    }

    const cargarTiposColeccion = () => {
        setloading(true);
        setMensaje('Cargando Tipos Coleccion');
        fetch(APIURL + "/api/TiposColeccion")
            .then(res => res.json())
            .then(
                (result) => {
                    setloading(false);
                    dispatch({ type: 'STORE_TIPOS_COLECCION', TiposColeccion: result });
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }

    const cargarTiposPedido = () => {
        setloading(true);
        setMensaje('Cargando Tipos Pedido');
        fetch(APIURL + "/api/tipopedido")
            .then(res => res.json())
            .then(
                (result) => {
                    setloading(false);
                    dispatch({ type: 'STORE_TIPOS_COLECCION', TiposColeccion: result });
                },
                (error) => {
                    this.setState({

                        error
                    });
                }
            )
    }

    const cargarEmpresasTransporte = async () => {
        setloading(true);
        setMensaje('Cargando Empresas Transporte');
        const { data, error } = await get(`${APIURL}/api/transporte/empresas`, "TransporteGlobal");
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
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Clientes`, "ImpuestoClientesGlobal");
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
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Articulos`, "ImpuestoArticulosGlobal");
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
            dispatch({ type: 'STORE_CLIENTES', payload: data });
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