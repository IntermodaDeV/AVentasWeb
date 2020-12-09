import React, { useState,useEffect } from 'react';
import { APIURL } from 'utils/Enviroment';
import { useDispatch } from 'react-redux';
import { get } from 'utils/http';
import SteperSync from 'containers/Home/SteperSync';
export const Home = (props) => {
    const dispatch = useDispatch();
    const [loading, setloading] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line
    }, []);

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
        const { data, error } = await get(`${APIURL}/api/cliente/cuenta`, "Recibo","clientes");
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
        fetch(APIURL + "/api/maestrolinea/")
            .then(res => {
                if (res.status === 401) {
                    localStorage.setItem('token', '');
                    window.location.reload();
                }
                if (res.status === 200) {
                    res.json().then(
                        (result) => {
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
        fetch(APIURL + "/api/TiposColeccion")
            .then(res => res.json())
            .then(
                (result) => {
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
        fetch(APIURL + "/api/tipopedido")
            .then(res => res.json())
            .then(
                (result) => {
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
        const { data, error } = await get(`${APIURL}/api/transporte/empresas`, "TransporteGlobal");
        if (error) {
            console.log(error);
        } else {
            dispatch({type:'SET_EMPRESASTRANSPORTEGLOBAL',payload:data});
        }
    }

    const cargarPrecioCajas = async () => {
        const { data, error } = await get(`${APIURL}/api/transporte/preciocaja`, "PrecioCajasGlobal");
        if (error) {
            console.log(error);
        } else {
            dispatch({type:'SET_PRECIOCAJASGLOBAL',payload:data});
        }
    }

    const cargarImpuestoClientes = async () => {
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Clientes`, "ImpuestoClientesGlobal");
        if (error) {
            console.log(error);
        } else {
            dispatch({type:'SET_CLIENTEIMPUESTOSGLOBAL',payload:data});
        }
    }

    const cargarImpuestoProductos = async () => {
        const { data, error } = await get(`${APIURL}/api/gruposimpuestos/Articulos`, "ImpuestoArticulosGlobal");
        if (error) {
            console.log(error);
        } else {
            dispatch({type:'SET_PRODUCTOIMPUESTOSGLOBAL',payload:data});
        }
    }

    const cargarClientesPedidos = async () => {
        const { data, error } = await get(`${APIURL}/api/cliente/pedido`, "ClientesPedidoGlobal");
        if (error) {
            console.log(error);
        } else {
            recargarListaPrecios(data);
            dispatch({type:'STORE_CLIENTES',payload:data});
        }
    }

    const recargarListaPrecios = async (clientes) => {
        const listaPrecios = [...new Set(clientes.map(x => x.GrupoPrecio))];
        const paises = [...new Set(clientes.map(x => x.EmpresaId))];

        const { data, error } = await get(`${APIURL}/colecciones/listaprecios`, "ListaPrecios",null,{params:{ListaPrecios:listaPrecios,Paises:paises}});
        if (error) {
            console.log(error);
        } else {
            dispatch({type:'SET_LISTAPRECIOS',payload:data});
        }

    }
    return (
        <div style={{ height: '100%' }} className="container-fluid">
            <div class="card-body text-center">
                <h1 class="card-title">¡Bienvenido(a) {localStorage.getItem('asesor')}!</h1>
                <hr/>
                <SteperSync 
                    CargaModuloRecibo = {CargaModuloRecibo} 
                    CargarModuloConfiguraciones = {CargarModuloConfiguraciones}
                    CargaModuloPedidos = {CargaModuloPedidos}
                    loading = {loading}> 
                </SteperSync>
            </div>
        </div>
    )
}