//Libraries
import React from 'react';
import { connect } from 'react-redux'
import { Route, Switch, Redirect } from 'react-router-dom';
import moment from "moment";
import 'moment/locale/es';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import withReactContent from 'sweetalert2-react-content';
import { StickyContainer, Sticky } from 'react-sticky';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core/styles';
import { APIURL } from 'utils/Enviroment';
import { Radio } from 'semantic-ui-react';
//import { Link } from "react-scroll";
import { Checkbox, Dropdown } from 'element-react';
import { /*Button,*/ Col, Container, Row, } from 'reactstrap';
import {Button } from '@material-ui/core';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import { FaSignOutAlt, FaShoppingCart, FaArrowCircleLeft, FaAlignJustify } from 'react-icons/fa';
import { IoIosArrowRoundUp } from "react-icons/io";
import { FiAlertTriangle } from "react-icons/fi";
import Media from 'react-media';
import {
    ExpansionPanel as MuiExpansionPanel,
    ExpansionPanelSummary as MuiExpansionPanelSummary,
    ExpansionPanelDetails as MuiExpansionPanelDetails,
} from '@material-ui/core';
import axios from 'axios';
import CachedIcon from '@material-ui/icons/Cached';
import { post,postPedidoStorage } from 'utils/http';

//Components
import NavigationBreadcrumb from 'components/Pedidos/NavigationBreadcrumb/NavigationBreadcrumb'
import Colecciones from 'components/Pedidos/Colecciones/ColeccionesList';
import Productos from 'components/Pedidos/ProductoLista/ProductosList';
import ModalFiltros from 'components/Pedidos/ProductoLista/ModalFiltros';
import VistaRapidaProducto from 'components/Pedidos/ProductoLista/VistaRapidaProducto';
import VistaProducto from 'components/Pedidos/ProductoDetalle/VistaProducto';
import SelectCliente from 'components/Pedidos/SelectCliente/SelectCliente';
import SelectTipoPedido from 'components/Pedidos/SelectTipoPedido/SelectTipoPedido';
import SelectLinea from 'components/Pedidos/SelectLinea/SelectLinea';
import MatrizResumen from 'components/Pedidos/MatrizResumen/MatrizResumen';
import MatrizResumenExpandable from 'components/Pedidos/MatrizResumen/MatrizResumenExpandable';
import ResumenPedido from 'components/Pedidos/ResumenPedido/ResumenPedido';
import TotalXPedido from 'components/Pedidos/TotalXPedido/TotalXPedido';
import PedidosBreadCrumb from 'components/Pedidos/PedidosBreadCrumb/PedidosBreadCrumb';
import SearchButton from 'components/Pedidos/ProductoLista/SearchButton'
import Countdown from "components/Pedidos/Global/Countdown";
import GuardPedidoActivo from 'containers/Pedidos/GuardPedidoActivo';
import Loader from 'components/Global/Loader';
import ImprimirPedidoOriginal from 'components/Pedidos/ResumenPedido/ImprimirPedidoOriginal';
import {IsAllow} from 'components/Seguridad/Permisos';
//Styles
import styles from './Pedidos.module.css'
import './Filtros.css'
import 'sweetalert2/src/sweetalert2.scss';
import FiltroChips from 'components/Pedidos/ProductoLista/FiltroChips';
import honduras from 'utils/img/honduras.png';
import costarica from 'utils/img/costarica.png';
import guatemala from 'utils/img/guatemala.png';


const ReactSwal = withReactContent(Swal)


moment.locale('es');

var time;
class Pedidos extends React.Component {
   

    IsEncabezadoCreado = false;
    PedidoId = null;

    urlApi = APIURL;

    NotFoundImage = "http://www.quesoselllanojaral.com/img/nodisponible.png";

    scroll = React.createRef();
    CantidadProductos = React.createRef();
    state = {
        error: null,
        isLoaded: false,
        collapse: false,
        autocompleteValue: null,
        nombreColeccionAutocompleteValue1: '',
        nombreColeccionAutocompleteValue2: '',
        numbervalue: 1,
        ProductoPorAgregar: {},
        imagenProductoDialogSeleccionada: '',
        filtroEdad: null,
        filtroAtributos: {},
        tableValue: {},
        unidadesCarrito: 0,
        activeTab: '1',
        activeCollapse: [],
        productoDialog: {},
        mostrarAlertaBackButton: false,
        mostrarAlertaPrimerBackButton: false,
        selectClienteLoading: false,
        buscador: '',
        buscadorFiltros: '',
        expandable: true,
        NoStock: true,
        loading: false,
        loadingColecciones: false,
        //Resumen Pedido
        mostrarResumen: false,
        mostrarRecibo: false,
        loadingRecibo: false,
        errorEnviarRecibo: false,
        firmaPedido: null,
        fechaEntregaPedido: null,
        NumPedido: '#',
        clientes:[],
        clientesFiltrados:[],
        paisSeleccionado:null
    };



    cargarData = () => {
        Promise.all([this.cargarClientes(),
        this.cargarMaestroLinea(),
        this.cargarTiposColeccion(),
        this.cargarTiposPedido()]).then(this.setState({
            isLoaded: true,
        }));
    }
    cargarColecciones = (grupoPrecio, empresa) => {
        let colecciones = this.props.ListaPrecios.filter((x)=>x.GrupoPrecio===grupoPrecio && x.EmpresaId===empresa);
        this.props.onStoreColecciones(colecciones);
    }
    
    cargarMaestroLinea = () => {
        fetch(this.urlApi + "/api/maestrolinea/")
            .then(res => {

                if (res.status === 401) {
                    localStorage.setItem('token', '');
                    window.location.reload();
                }
                if (res.status === 200) {

                    res.json().then(
                        (result) => {
                            this.props.onStoreMaestroLinea(result);

                        },
                        // Note: it's important to handle errors here
                        // instead of a catch() block so that we don't swallow
                        // exceptions from actual bugs in components.
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
    cargarClientes = () => {
        fetch(this.urlApi + "/api/cliente/pedido", {
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
                                this.props.onStoreClientes(result);
                                this.setState((prevState)=>({...prevState,clientes:result,clientesFiltrados:result}));
                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                this.setState({

                                    error
                                });
                                this.setState((prevState)=>({...prevState,clientes:this.props.clientes,clientesFiltrados:this.props.clientes}));
                            }
                        )
                }

            })
            this.setState((prevState)=>({...prevState,clientes:this.props.clientes,clientesFiltrados:this.props.clientes}));
    }

    recargarClientes = () =>{
        axios.get(this.urlApi + "/api/cliente/pedido", {
            headers: {
                'Authorization':
                    'Bearer ' + localStorage.getItem('token')
            }
        }).then(data => {
            this.props.onStoreClientes(data.data);
            this.recargarListaPrecios(data.data);
        }).catch(err => console.log(err))
    }

    recargarListaPrecios = data => {
        const listaPrecios = [...new Set(data.map(x => x.GrupoPrecio))];
        const paises = [...new Set(data.map(x => x.EmpresaId))];

        axios.get(this.urlApi + "/api/colecciones/listaprecios", {
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                ListaPrecios: listaPrecios,
                Paises: paises
            }
        })
            .then(data => { this.props.onSaveListaPrecios(data.data) })
            .catch(err => console.log(err));
    }

    cargarTiposPedido = () => {
        fetch(this.urlApi + "/api/tipopedido")
            .then(res => res.json())
            .then(
                (result) => {
                    this.props.onStoreTipoPedido(result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({

                        error
                    });
                }
            )
    }

    cargarMonedas = (empresa) =>{
        ///let empresa = localStorage.getItem('empresa');
        fetch(`${this.urlApi}/api/moneda/${empresa}`)
        .then(res=>res.json())
        .then(data=>{this.props.onSaveMonedas(data)})
        .catch(error=>console.log(error))
    }
    cargarTiposColeccion = () => {
        fetch(this.urlApi + "/api/TiposColeccion")
            .then(res => res.json())
            .then(
                (result) => {
                    
                    this.props.onStoreTiposColeccion(result);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    this.setState({

                        error
                    });
                }
            )
    }

    cargarEmpresasTransporte = (empresa) =>{
        //const empresa = localStorage.getItem('empresa');

        fetch(`${this.urlApi}/api/transporte/${empresa}/empresas`)
        .then(res=>res.json())
        .then(data=>this.props.onStoreEmpresasTransporte(data))
        .catch(error=>this.setState({error}))
    }

    cargarPrecioCajas = (empresa) =>{
        //const empresa = localStorage.getItem('empresa');

        fetch(`${this.urlApi}/api/transporte/${empresa}/preciocaja`)
        .then(res=>res.json())
        .then(data=>this.props.onStorePrecioCajas(data))
        .catch(error=>this.setState({error}))
    }

    cargarImpuestoClientes = (empresa) =>{
        //const empresa = localStorage.getItem('empresa');
        fetch(`${this.urlApi}/api/gruposimpuestos/${empresa}/clientes`)
        .then(res=>res.json())
        .then(data=>this.props.onStoreImpuestoClientes(data))
        .catch(error=>this.setState({error}))
    }

    cargarImpuestoProductos = (empresa) =>{
        //const empresa = localStorage.getItem('empresa');

        fetch(`${this.urlApi}/api/gruposimpuestos/${empresa}/articulos`)
        .then(res=>res.json())
        .then(data=>this.props.onStoreImpuestoProductos(data))
        .catch(error=>this.setState({error}))
    }

    Alerta = () => {
        document.querySelector('#wrapper').classList.toggle('toggled');
    }

    componentDidMount() {

        if(!IsAllow(this.props.match.url))
        {
            this.props.history.push('/home');
        }
        this.cargarData();

        // window.onpopstate = this.onBackButtonEvent;
        this.inactivityTime();
        // window.onpopstate = this.onBackButtonEvent;
    }

    

    inactivityTime = () => {
        window.onload = this.resetTimer;
        // DOM Events
        document.onmousemove = this.resetTimer;
        document.onkeypress = this.resetTimer;
        document.onscroll = this.resetTimer;
    };

    InactivoErase = () => {
        this.props.history.push("/Pedidos/Cliente");
        this.cancelarPedido();
    }

    CargarImpresionPedido = (ValoresPedido) =>{
        this.props.history.push({pathname:`/Pedidos/ImprimirPedido`,state : JSON.stringify(ValoresPedido)});
    }

    countdownHTML = () => {

        return (
            <div>
                <Countdown
                    segundos={60}
                    inactivo={this.InactivoErase.bind(this)}
                />
            </div>
        );
    }

    inactivityTimeUp = () => {

        ReactSwal.fire({
            title: 'Su sesión expirará en',
            html: this.countdownHTML(),
            timer: 60200,

            onClose: () => {
                this.resetTimer();
            },
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Cancelar Pedido',
            cancelButtonText: 'Continuar Pedido',
        }).then((result) => {
            if (result.value) {
                this.InactivoErase();
                // this.cancelarPedido();
            }
            else {
                this.resetTimer();
            }
        });
    }

    resetTimer = () => {
        if (this.isPedidoActivo()) {
            clearTimeout(time);
            time = setTimeout(this.inactivityTimeUp, 540000)
        } else {
            clearTimeout(time);
        }

        // 1000 milliseconds = 1 second
    }

    onBackButtonEvent = (event) => {
        if (this.state.mostrarAlertaBackButton) {
            window.history.pushState(null, "", window.location.href);
            if (this.state.mostrarAlertaPrimerBackButton) {
                Swal.fire({
                    title: 'Aviso',
                    text: "Se borrará la información del pedido en curso",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Borrar',
                    cancelButtonText: 'Cancelar',
                }).then((result) => {
                    if (result.value) {
                        this.props.history.push("/Pedidos/Colecciones");
                        this.setState({
                            mostrarAlertaBackButton: false,
                            mostrarAlertaPrimerBackButton: false,
                            activeCollapse: [],
                            filtroAtributos: {}
                        });
                        this.props.onSetTableValue({});
                        this.props.onResetProductosAgreagados();

                    }
                })
            }
            else {
                this.setState({ mostrarAlertaPrimerBackButton: true });
            }

        }

    }

    setMatrizProducto = (producto) => {
        var tableValue = this.props.TableValue;
        let precio = producto.Precio.find(precioxProd => {
            return precioxProd.GrupoPrecio === this.props.cliente.GrupoPrecio;
        });
        if (precio === undefined) {
            precio = { Precio: 0 };
        }
        if (tableValue[producto.Linea.IdLinea] === undefined) {
            tableValue[producto.Linea.IdLinea] = {};
        }
        var value = tableValue[producto.Linea.IdLinea];

        if (value[producto.CodigoColeccion] === undefined) {
            value[producto.CodigoColeccion] = {};
        }
        value = value[producto.CodigoColeccion];

        if (value[producto.GrupoTalla] === undefined) {
            value[producto.GrupoTalla] = {};
            value[producto.GrupoTalla].Productos = {};
            value[producto.GrupoTalla].ListaTallas = producto.ListaTalla;
        }
        value = value[producto.GrupoTalla].Productos;

        if (value[producto.ProductoId] === undefined) {
            value[producto.ProductoId] = {};
            value[producto.ProductoId].Colores = {};
            value[producto.ProductoId].ListaTallas = producto.ListaTalla
            value[producto.ProductoId].NombreProducto = producto.NombreProducto;
            value[producto.ProductoId].Precio = producto.Precio;
            if (producto.ListaImagenes !== null && producto.ListaImagenes.length > 0) {

                value[producto.ProductoId].ListaImagenes = producto.ListaImagenes;
            }
            value = value[producto.ProductoId].Colores;

            producto.ListaColores.forEach(color => {
                value[color.CodigoColor] = {}
                value[color.CodigoColor].NombreColor = color.NombreColor;
                value[color.CodigoColor].Color = color.Color;
                value[color.CodigoColor].ListaImagenes = color.ListaImagenes;
                value[color.CodigoColor].Tallas = {}
                producto.ListaTalla.map(talla => {
                    var fisicoDisponible = producto.fisicaDisponible.find(fd => { return fd.CodigoColor === color.CodigoColor && fd.IdTalla === talla.Talla })
                    value[color.CodigoColor].Tallas[' ' + talla.Talla] = {}
                    value[color.CodigoColor].Tallas[' ' + talla.Talla].Disponible = fisicoDisponible ? fisicoDisponible.Cantidad : 0;
                    value[color.CodigoColor].Tallas[' ' + talla.Talla].Cantidad = "";
                    value[color.CodigoColor].Tallas[' ' + talla.Talla].Distribucion = talla.Distribucion;
                    if (fisicoDisponible ? fisicoDisponible.PreciosEspecificos && fisicoDisponible.PreciosEspecificos.length > 0 : false) {
                        value[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = fisicoDisponible.PreciosEspecificos[0].Precio
                    } else {
                        value[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = precio.Precio;
                    }
                    return false;
                });
                return false;
            });
            this.props.onSetTableValue(tableValue);

        }
    }


    setProductoDialog = (producto, event) => {
        event.stopPropagation();
        this.setState({
            productoDialog: { ...producto },
            dialogVistaRapida: true
        });
    }
    CerrarDialog = (producto, event) => {
        // event.stopPropagation();
        this.setState({
            dialogVistaRapida: false
        });
    }

    querySearch = (queryString, cb) => {
        const { clientes } = this.props;
        const results = queryString ? (clientes.filter(this.createFilter(queryString))).map(x => { return { ...x, value: x.Nombre } }) : clientes.map(x => { return { ...x, value: x.Nombre } });
        cb(results);
    }
    createFilter = (queryString) => {

        return (cliente) => {
            return (cliente.Nombre.toLowerCase().indexOf(queryString.toLowerCase()) !== -1);
        };
    }
    handleSelect = (item) => {
        this.setState({
            selectClienteLoading: true,
            autocompleteValue: null,
        });
        ObtenerCoordenadas((value) => {
        }, (error) => {
        });
        //if (navigator.geolocation) {
        //}

        this.setState({
            autocompleteValue: item,
            selectClienteLoading: false,
        });
        // fetch("https://aventas.devcit.com:3044/api/cliente/ActualizarCuentaCorriente/?id=" + item.Codigo, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization':
        //             'Bearer ' + localStorage.getItem('token')
        //     },
        //     method: 'GET'
        // }).then((res) => {
        //     if (res.status === 200) {
        //         res.json()
        //             .then(result => {
        //                 item.CuentaCorriente = result
        //                 this.setState({
        //                     autocompleteValue: item,
        //                     selectClienteLoading: false,
        //                 });
        //             })
        //     } else {
        //         this.setState({
        //             autocompleteValue: item,
        //             selectClienteLoading: false,
        //         });
        //     }
        // });


    }
    changeNombreColeccionAutocomplete1 = (value) => {

        this.setState({
            nombreColeccionAutocompleteValue1: value,
        });

    }
    infoCliente = (selectClienteProps, cssStyle) => {
        let FacturacionEntrega = null;
        if (!(selectClienteProps.clienteSelected != null && (selectClienteProps.clienteSelected.FacturacionEntrega === "No" || selectClienteProps.clienteSelected.FacturacionEntrega === "Nunca"))) {
            FacturacionEntrega = (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <FiAlertTriangle style={{ fontSize: '20px', color: 'red' }} />  El cliente actualmente se encuentra con bloqueo ó  en mora.
            </div>
            )


        };

        return (
            <div className="row">
                <div className={"col-md-6"}>
                    <span className={cssStyle["TCenterContainer"]}>
                        <h5 className={cssStyle["TCenter"]}>Información General</h5>
                    </span>
                    <table className='table' style={{ border: "none" }}>
                        <tbody>
                            <tr>
                                <td className={cssStyle.InfoLabel}>
                                    {'Codigo: '}
                                </td>
                                <td className={cssStyle.InfoLabelDetail}>
                                    {selectClienteProps.clienteSelected.Codigo}
                                </td>
                            </tr>
                            <tr>
                                <td className={cssStyle.InfoLabel} >
                                    {'Comunidad Autonoma: '}
                                </td>
                                <td className={cssStyle.InfoLabelDetail}>
                                    {selectClienteProps.clienteSelected.ComunidadAutonoma}
                                </td>
                            </tr>
                            {/* <tr>
                                    <td className={cssStyle.InfoLabel}>
                                        {'Facturacion Entrega: '}
                                    </td>
                                    <td> {selectClienteProps.clienteSelected.FacturacionEntrega}</td>
                                </tr> */}

                            <tr>
                                <td className={cssStyle.InfoLabel}>
                                    {'Nombre:'}
                                </td>
                                <td className={cssStyle.InfoLabelDetail}>
                                    {selectClienteProps.clienteSelected.Nombre}
                                </td>
                            </tr>
                            <tr>
                                <td className={cssStyle.InfoLabel}>
                                    {'Grupo Cliente: '}
                                </td>
                                <td className={cssStyle.InfoLabelDetail}>
                                    {selectClienteProps.clienteSelected.GrupoCliente}
                                </td>
                            </tr>
                            <tr>
                                <td className={cssStyle.InfoLabel}>
                                    {'Estado Crediticio: '}
                                </td>
                                <td className={cssStyle.InfoLabelDetail}>
                                    {selectClienteProps.clienteSelected.FacturacionEntrega}</td>
                            </tr>
                            <tr>
                                <td className={cssStyle.InfoLabel}>
                                    {'Direccion: '}
                                </td>
                                <td className={cssStyle.InfoLabelDetail}>
                                    {selectClienteProps.clienteSelected.Direccion}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div>
                        {FacturacionEntrega}
                    </div>

                </div>
                <div className={"col-md-6"}>
                    <span className={cssStyle["TCenterContainer"]}>
                        <h5 className={cssStyle["TCenter"]}>Información Crediticia</h5>
                    </span>
                    <thead>
                        <tr>
                            <th>
                                Tipo
                                    </th>
                            <th>
                                Disponible
                                    </th>
                            <th>
                                SaldoTotal
                                    </th>
                            <th>
                                C15Dias
                                    </th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectClienteProps.clienteSelected.Credito.map((credito, index) => {
                            return (
                                <tr key={index}>
                                    <td>{credito.Tipo}</td>
                                    <td>{credito.Disponible}</td>
                                    <td>{credito.SaldoTotal}</td>
                                    <td>{credito.C15Dias}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    {/* <button disabled="" className="btn btn-outline-primary disabled">Ultimo Pedido Lps. 25,000.00</button> */}
                    {/* <button disabled="" className="btn btn-outline-primary disabled">Limite de Credito Disponible Lps. 42,000.00</button> */}
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Tipo
                                    </th>
                                <th>
                                    Disponible
                                    </th>
                                <th>
                                    SaldoTotal
                                    </th>
                                <th>
                                    C15Dias
                                    </th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectClienteProps.clienteSelected.Credito.map((credito, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{credito.Tipo}</td>
                                        <td>{credito.Disponible}</td>
                                        <td>{credito.SaldoTotal}</td>
                                        <td>{credito.C15Dias}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        {/* 
                    <tbody>
                        {selectClienteProps.clienteSelected.CuentaCorriente.map((cuentaCorriente, index) => {
                            let classBold = "";
                            let classBoldDanger = "";
                            if (cuentaCorriente.Descripcion === "Saldo cupo de crédito") {
                                classBold += "font-weight-bold";
                                classBoldDanger += "font-weight-bold";

                                if (cuentaCorriente.Valor < 0) {
                                    classBoldDanger += " text-danger";
                                }
                            }
                            return (
                                <tr key={index}>
                                    <td className={classBold}>
                                        {cuentaCorriente.Descripcion}
                                    </td>
                                    <td className={classBoldDanger}>
                                        {cuentaCorriente.Valor.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                */}
                    </table>
                </div>

            </div>
        );
    }
    changeNombreColeccionAutocomplete2 = (value) => {
        this.setState({
            nombreColeccionAutocompleteValue2: value,
        });

    }
    getProducto = (producto, event) => {
        event.stopPropagation();
        this.setMatrizProducto(producto);
        this.props.onSetProducto(producto);
        this.props.history.push("/Pedidos/Colecciones/" + this.props.coleccion.ColeccionTipo + "/" + this.props.coleccion.CodigoColeccion + "/" + producto.ProductoId);
        this.setState({ mostrarAlertaBackButton: true, mostrarAlertaPrimerBackButton: false });
    }


    getColeccion = (coleccion) => {
        this.props.onSetColeccion(coleccion);
        this.props.history.push("/Pedidos/Colecciones/" + coleccion.ColeccionTipo + "/" + coleccion.CodigoColeccion);
        localStorage.setItem('ProdEnCarrito', 0)
    }
    seleccionarCliente = () => {
        if(this.state.autocompleteValue.Nombre.includes('CONSUMIDOR FINAL') && this.props.clienteContado===null)
        {
            Swal.fire({
                title: 'Error',
                text: 'Debe seleccionar un cliente contado',
                type: 'error',
                confirmButtonText: 'Ok'
              })
        }else{
            if(localStorage.getItem("Conexion")==="offline"){
                this.cargarColecciones(this.state.autocompleteValue.GrupoPrecio, this.state.autocompleteValue.EmpresaId);
            }else{
                this.cargarImpuestoClientes(this.state.autocompleteValue.EmpresaId);
                this.cargarImpuestoProductos(this.state.autocompleteValue.EmpresaId);
                this.cargarMonedas(this.state.autocompleteValue.EmpresaId);
                this.cargarEmpresasTransporte(this.state.autocompleteValue.EmpresaId);
                this.cargarPrecioCajas(this.state.autocompleteValue.EmpresaId);
                //this.cargarComunidadAutonoma(this.state.autocompleteValue.EmpresaId);
            }
            this.props.onSetCliente(this.state.autocompleteValue);
            this.props.history.push("/Pedidos/Linea");
        }
    }
    seleccionarTipoPedido = (tipoPedido, acuerdoVenta) => {
        this.props.history.push("/Pedidos/Colecciones");
        this.props.onSetTipoPedido(tipoPedido, acuerdoVenta);
    }
    textValueChange = (textValue) => {
        this.setState({
            autocompleteValue: textValue
        });
    }
    seleccionarLinea = (linea) => {
        this.props.onSetLineaSeleccionada(linea);
        this.props.history.push("/Pedidos/TipoPedido");
    }
    clickBreadCrumb = (nuevaRuta) => {
        this.props.history.push(nuevaRuta);
    }
    clickBreadCrumbColecciones = () => {
        // this.props.onSetProducto(null);
        // this.changeImageProducto('');
        this.props.history.push("/Pedidos/Colecciones/" + this.props.coleccion.ColeccionTipo + "/" + this.props.coleccion.CodigoColeccion);
    }
    

    cambiarTabColecciones = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }
    isPedidoActivo = () => {
        let isProductosSeleccionados = false;
        isProductosSeleccionados = parseInt(localStorage.getItem('ProdEnCarrito')) > 0 ? true :false; 
                /*let tableValue = { ...this.props.TableValue };
        if (this.props.LineaSeleccionada && this.props.coleccion) {
            if (tableValue[this.props.LineaSeleccionada.IdLinea] === undefined || tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion] === undefined) {
               return isProductosSeleccionados;
            }
            const gruposTalla = Object.keys(tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]);
            isProductosSeleccionados = gruposTalla.length > 0 && gruposTalla.every(grupoTalla => {
                return tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Mostrar === true;
            });

        }*/
        return isProductosSeleccionados;
    }
    toggle = () => {
        let productosSeleccionado = false;
        let tableValue = this.props.TableValue;
        try {
            let result = Object.keys(tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]).find(grupoTalla => {
                return tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Mostrar === true;
            });
            if (result) {
                productosSeleccionado = true;
            } else {
                productosSeleccionado = false;

            }
        } catch{

            productosSeleccionado = false;
        }

        if (productosSeleccionado) {
            this.props.history.push("/Pedidos/MatrizResumen");
            this.setState({ mostrarAlertaBackButton: true, mostrarAlertaPrimerBackButton: false });
        } else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
            });
            Toast.fire({
                type: 'error',
                title: 'Debe seleccionar al menos un producto',
            })
        }
    }
    alertaPrecio = (mensaje) => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000
        });
        Toast.fire({
            type: 'error',
            title: 'Producto sin ' + (mensaje ? mensaje : 'Precio') + '. Favor elegir otro producto.',
        });

    }
    calcularTipoVenta() {
        // 0 Equivale pedido Diario
        // 3 Equivale a Pedido de Venta
        let isMora = !(this.props.cliente.FacturacionEntrega === 'No' || this.props.cliente.FacturacionEntrega === 'Nunca');
        if (isMora) {
            return 0;
        }
        if (this.props.coleccion.ColeccionTipo === 'B') {
            if (this.props.cliente.CuentaCorriente === null || this.props.cliente.CuentaCorriente.length === 0) {
                return 0;
            }
        }
        return 3;
    }
    toggleSelectProducto = (producto) => {
        let tableValue = { ...this.props.TableValue };
        let isSelected = true;
        let carrito = parseInt(localStorage.getItem('ProdEnCarrito'));
        try {
            let value = tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos[producto.ProductoId]
            value.Selected = isSelected = !value.Selected;
            if (!value.Selected) {
                if (Object.keys(tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos).every(productoId => {
                    return tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos[productoId].Selected === false
                })) {
                    tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Mostrar = false;
                } else {
                    tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Mostrar = true;
                }
            } else {
                
                tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Mostrar = true;
            }
         
        } catch{
            if (tableValue[producto.Linea.IdLinea] === undefined) {
                tableValue[producto.Linea.IdLinea] = {};
            }
            let value = tableValue[producto.Linea.IdLinea];

            if (value[producto.CodigoColeccion] === undefined) {
                value[producto.CodigoColeccion] = {};
            }
            value = value[producto.CodigoColeccion];

            if (value[producto.GrupoTalla] === undefined) {
                value[producto.GrupoTalla] = {};
                value[producto.GrupoTalla].Mostrar = true;
                value[producto.GrupoTalla].Productos = {};
                value[producto.GrupoTalla].ListaTallas = producto.ListaTalla;
            }
            value = value[producto.GrupoTalla].Productos;

            if (value[producto.ProductoId] === undefined) {
                value[producto.ProductoId] = {};
                value[producto.ProductoId].Colores = {};
                value[producto.ProductoId].ListaTallas = producto.ListaTalla
                value[producto.ProductoId].Selected = true;
                value[producto.ProductoId].NombreProducto = producto.NombreProducto;
                value[producto.ProductoId].Precio = producto.Precio;
                if (producto.ListaImagenes !== null && producto.ListaImagenes.length > 0) {

                    value[producto.ProductoId].ListaImagenes = producto.ListaImagenes;
                }
                value = value[producto.ProductoId].Colores;

                producto.ListaColores.forEach(color => {
                    value[color.CodigoColor] = {}
                    value[color.CodigoColor].NombreColor = color.NombreColor;
                    value[color.CodigoColor].Color = color.Color;
                    value[color.CodigoColor].ListaImagenes = color.ListaImagenes;
                    value[color.CodigoColor].Tallas = {}
                    producto.ListaTalla.map(talla => {
                        let fisicoDisponible = producto.fisicaDisponible.find(fd => { return fd.CodigoColor === color.CodigoColor && fd.IdTalla === talla.Talla })
                        value[color.CodigoColor].Tallas[' ' + talla.Talla] = {}
                        value[color.CodigoColor].Tallas[' ' + talla.Talla].Disponible = fisicoDisponible ? fisicoDisponible.Cantidad : 0;
                        value[color.CodigoColor].Tallas[' ' + talla.Talla].Cantidad = "";
                        value[color.CodigoColor].Tallas[' ' + talla.Talla].Distribucion = talla.Distribucion;
                        if (fisicoDisponible && fisicoDisponible.PreciosEspecificos && fisicoDisponible.PreciosEspecificos.length > 0) {
                            value[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = fisicoDisponible.PreciosEspecificos[0].Precio
                        } else {

                            let precio = producto.Precio.find(precioxProd => {
                                return precioxProd.GrupoPrecio === this.props.cliente.GrupoPrecio;
                            });
                            if (precio === undefined) {
                                precio = { Precio: 0 };
                            }
                            value[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = precio.Precio;
                        }
                        // precio = { Precio: 20 };
                        return false;
                    });
                });
            } else {
                let value = tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos[producto.ProductoId];
                if (value.Selected === undefined) {
                    value.Selected = isSelected = true
                    tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Mostrar = true;
                } else {
                    value.Selected = isSelected = !value.Selected;
                    if (!value.Selected) {
                        if (Object.keys(tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos).every(productoId => {
                            return tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos[productoId].Selected === false
                        })) {
                            tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Mostrar = false;
                        } else {
                            tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Mostrar = true;
                        }
                    } else {
                        tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Mostrar = true;
                    }
                }

            }
        }
        let totalAcumulado = this.props.TotalPedido;
        
        if (isSelected) {
            localStorage.setItem('ProdEnCarrito', parseInt(carrito + 1))
            Object.keys(tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos[producto.ProductoId].Colores).forEach((codigoColor) => {
                let color = tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos[producto.ProductoId].Colores[codigoColor];

                Object.keys(color.Tallas).forEach((codigoTalla) => {
                    let valorTalla = color.Tallas[codigoTalla];
                    totalAcumulado = totalAcumulado + (valorTalla.Precio * (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10)));
                });
            });
        } else {
            localStorage.setItem('ProdEnCarrito', parseInt(carrito - 1))
            Object.keys(tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos[producto.ProductoId].Colores).forEach((codigoColor) => {
                let color = tableValue[producto.Linea.IdLinea][producto.CodigoColeccion][producto.GrupoTalla].Productos[producto.ProductoId].Colores[codigoColor];

                Object.keys(color.Tallas).forEach((codigoTalla) => {

                    let valorTalla = color.Tallas[codigoTalla];
                    totalAcumulado = totalAcumulado - (valorTalla.Precio * (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10)));
                });
            });
        }
        this.props.onSetTotalPedido(totalAcumulado)

        this.props.onSetTableValue(tableValue);
        // this.calcularTotal();
        // this.props.onToggleSelectProducto(producto)


    }
    changeImagenProductoDialogSeleccionada = (imagenProducto) => {
        this.setState({ imagenProductoDialogSeleccionada: imagenProducto })

    }

    VerificarFiltro = (atributo) => {
        var filtro = this.state.filtroAtributos;
        var tipoAtributo = Object.keys(atributo)[0];
        if (filtro[tipoAtributo] === undefined) {
            return false;
        }
        if (filtro[tipoAtributo].includes(atributo[tipoAtributo])) {
            return true
        }
        return false;

    }
    verificarExpandirFiltroAtributos = (indexFiltroAtributo) => {
        var arregloIndexFiltroAtributo = [...this.state.activeCollapse];
        return arregloIndexFiltroAtributo.includes(indexFiltroAtributo);
    }
    toggleExpandirFiltroAtributos = (indexFiltroAtributo) => {
        var arregloIndexFiltroAtributo = [...this.state.activeCollapse];
        if (this.verificarExpandirFiltroAtributos(indexFiltroAtributo)) {
            arregloIndexFiltroAtributo.splice(arregloIndexFiltroAtributo.indexOf(indexFiltroAtributo), 1);
        } else {
            arregloIndexFiltroAtributo.push(indexFiltroAtributo);
        }
        this.setState({ activeCollapse: arregloIndexFiltroAtributo });
    }
    MarcarFiltro = (atributo) => {
        // event.stopPropagation();
        var filtro = { ...this.state.filtroAtributos };
        var tipo = Object.keys(atributo)[0];
        if (filtro[tipo] === undefined) {
            filtro[tipo] = [];
        }

        var indexDescripcion = filtro[tipo].findIndex(descripcion => {
            return descripcion === atributo[tipo]
        });
        if (indexDescripcion === -1) {

            filtro[tipo].push(atributo[tipo]);
        } else {
            filtro[tipo].splice(indexDescripcion, 1);

        }
        this.setState({ filtroAtributos: filtro });
    }

    reiniciarPedido = () => {
        this.props.history.push("/Pedidos/Linea");
        this.setState({
            activeCollapse: [],
            mostrarRecibo: false,
            filtroAtributos: {}
        });
        this.props.onReinicarPedido();
    }

    guardarFirma = (imagen) => {
        this.setState({ firmaPedido: imagen })
    }

    // setExpandable = () => {
    //     this.setState({
    //         expandable: !this.state.expandable
    //     })
    // }

    setNoStock = () => {
        this.setState({
            NoStock: !this.state.NoStock
        })
    }

    EliminarProducto = (grupoTalla, codigoProducto) => {
        var tableValue = { ...this.props.TableValue };
        tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos[codigoProducto].Selected = false
        if (Object.keys(tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos).every(productoId => {
            return tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos[productoId].Selected === false
        })) {
            tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Mostrar = false;
        } else {
            tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Mostrar = true;
        }

        let totalAcumulado = this.props.TotalPedido;
        let precio = tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos[codigoProducto].Precio.find(precioxProd => {
            return precioxProd.GrupoPrecio === this.props.cliente.GrupoPrecio;
        });
        if (precio === undefined) {
            precio = { Precio: 0 };
        }
        Object.keys(tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos[codigoProducto].Colores).forEach((codigoColor) => {
            let color = tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos[codigoProducto].Colores[codigoColor];
            Object.keys(color.Tallas).forEach((codigoTalla) => {
                let valorTalla = color.Tallas[codigoTalla];
                if (valorTalla.Cantidad > 0) {
                    totalAcumulado = totalAcumulado - valorTalla.Cantidad;
                    this.props.NumeroOrden && this.CrearDetallePedidoOnline(codigoProducto, codigoColor, codigoTalla.slice(1), 0, 0);
                    valorTalla.Cantidad = 0;
                }
            });
        });
        this.props.onSetTotalPedido(totalAcumulado)
        this.props.onSetTableValue(tableValue);
    }

    setFechaEntregaPedido = (date) => {
        this.setState({
            fechaEntregaPedido: moment(date).toDate()
        });
    }
    cancelarPedido = () => {
        if (this.isPedidoActivo && !this.state.mostrarRecibo) {

            this.setState({
                autocompleteValue: null,
                activeCollapse: [],
                filtroAtributos: {}
            });
            this.props.history.push("/Pedidos/Cliente");
        } else {
            this.setState({
                autocompleteValue: null,
                activeCollapse: [],
                filtroAtributos: {},
                mostrarRecibo: false
            });
            this.props.history.push("/Pedidos/Cliente");
            this.props.onCancelarPedido();
        }

    }

    mostrarResumen = () => {
        // this.setState({ mostrarResumen: true })
        this.setState({ mostrarRecibo: false})
        this.props.history.push("/Pedidos/ResumenPedido");

    }

    obtenerUltimoCorrelativo = async () =>{
        var correlativo = "",errorCor;
        try{
            const request = await axios.get(this.urlApi + "/api/PedidosXCliente/correlativo",{headers:{
                'Content-Type': 'application/json',
                'Authorization':'Bearer ' + localStorage.getItem('token')
            }});

            return {correlativo:request.data,errorCor};
        }catch(err){
            return {correlativo,errorCor};
        }
    }

    enviarPedidoAx = async (pedido) =>{
        if(navigator.onLine){
            try{
                const request = await axios.post(this.urlApi + "/api/PedidosXCliente/postax",pedido,{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization':'Bearer ' + localStorage.getItem('token')
                    },
                    timeout:900*1000
                });

                console.log(request.data);
            }catch(err){
                let mensaje = "Ha ocurrido un error y no se pudo sincronizar el pedido con AX.";

                if(err.response){
                    mensaje = err.response.data.Message;
                }

                Swal.fire({
                    type: 'error',
                    title: 'Error',
                    text: mensaje,
                })
            }
        }
    }
    
  
    enviarPeticionPedido = async (location, correlativo) => {

        let pedido = {
            NumeroReferencia : correlativo,
            PedidoId: 100 + (Math.random() * (10000 - 100)),
            CodigoCliente: this.props.cliente.Codigo,
            Nombre : this.props.cliente.Nombre,
            Firma: this.state.firmaPedido,
            FechaEntrega: this.state.fechaEntregaPedido,
            AcuerdoVenta: this.props.AcuerdoVenta ? this.props.AcuerdoVenta.IdAcuerdoxCliente : '',
            location: location,
            EmpresaId: "imhn",
            Linea: this.props.LineaSeleccionada.IdLinea,
            CodigoColeccion: this.props.coleccion.CodigoColeccion,
            DetallePedido: [],
            TipoPedido: this.props.TipoPedido,
            TipoVenta: this.calcularTipoVenta(),
            ClienteContadoId:(this.props.clienteContado!==null) ? this.props.clienteContado.id : null,
            ModoVenta:(this.props.TipoPedido.TipoPedido==='Contado')?'Contado':'Credito',
            Flete:this.props.flete,
            RequiereEntrega:this.props.requiereEntrega,
            Impuesto:Number(localStorage.getItem('Impuesto')),
            subtotal:this.props.TotalPedido,
            Direccion: this.props.cliente.Direccion,
            MonedaCliente : this.props.cliente.Moneda
        };
        let tableValue = this.props.TableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion];

        Object.keys(tableValue).forEach(codigoGrupoTalla => {
            if (tableValue[codigoGrupoTalla].Mostrar) {
                Object.keys(tableValue[codigoGrupoTalla].Productos).forEach(codigoProducto => {
                    if (tableValue[codigoGrupoTalla].Productos[codigoProducto].Selected) {
                        this.props.coleccion.Edades.map(edad => {
                            let producto = edad.ProductosXEdad.find(prod => prod.ProductoId === codigoProducto);
                            
                            if (producto) {

                                producto.matriz = [];
                                producto.ListaColores.forEach(color => {
                            
                                    Object.keys(tableValue[codigoGrupoTalla].Productos[codigoProducto].Colores[color.CodigoColor].Tallas).forEach(talla => {
                                        let detalle = {
                                            IdProducto:producto.CodigoProducto,
                                            CodigoProducto: codigoProducto,
                                            NombreProducto: producto.NombreProducto,
                                            CodigoColor: color.CodigoColor,
                                            NombreColor:color.NombreColor,
                                            Cantidad: tableValue[codigoGrupoTalla].Productos[codigoProducto].Colores[color.CodigoColor].Tallas[talla].Cantidad,
                                            Unidad: "Und",
                                            PrecioUnitario: tableValue[codigoGrupoTalla].Productos[codigoProducto].Colores[color.CodigoColor].Tallas[talla].Precio,
                                            Talla: talla.substring(1),
                                            CodigoColeccion: this.props.coleccion.CodigoColeccion,
                                            PorcentajeDescuento: "",
                                        };
                                        if (tableValue[codigoGrupoTalla].Productos[codigoProducto].Colores[color.CodigoColor].Tallas[talla].Cantidad > 0) {
                                            pedido.DetallePedido.push(detalle);
                                        }
                                    });
                                });
                            }
                            return false;
                        })

                    }
                })
            }
        })

        if(!navigator.onLine){
            Swal.fire({
                type: 'warning',
                title: 'Advertencia',
                text: "Actualmente no dispone de internet el pedido se guardara en cache.",
            });

            const data = postPedidoStorage(pedido);
            let numPedido = data.EncabezadoPedido.PedidoId;
            this.setState({ mostrarRecibo: true, loadingRecibo: false, NumPedido: numPedido });
            this.props.onSetNumeroOrden(numPedido);
        }
        else if(pedido.NumeroReferencia === ""){
            const data = postPedidoStorage(pedido);
            let numPedido = data.EncabezadoPedido.PedidoId;
            this.setState({ mostrarRecibo: true, loadingRecibo: false, NumPedido: numPedido });
            this.props.onSetNumeroOrden(numPedido);
        }
        else{

            const { data,error } = await post(this.urlApi + "/api/PedidosXCliente",pedido,"SET_PEDIDOSINCRONIZAR");

            if(error){
                if(error.response){
                    let mensaje = error.response.data.Message;
                    Swal.fire({
                        type: 'error',
                        title: 'Error',
                        text: mensaje,
                    })
                    this.setState({ loadingRecibo: false });
                }else{
                    let numPedido = data === undefined || data === null? "No Disponible" : data.EncabezadoPedido.PedidoId;
                    this.setState({ mostrarRecibo: true, loadingRecibo: false, NumPedido: numPedido });
                    this.props.onSetNumeroOrden(numPedido);
                }
            }else{
                let numPedido = data === undefined || data === null? "No Disponible" : data.EncabezadoPedido.PedidoId;
                this.setState({ mostrarRecibo: true, loadingRecibo: false, NumPedido: numPedido });
                this.props.onSetNumeroOrden(numPedido);
            }
        }
    }

    enviarPedido = async (correlativo)=> {
        localStorage.removeItem("ColeccionSeleccionada");
        localStorage.removeItem("HoraIngreso");
        localStorage.removeItem("ProdEnCarrito");
        this.setState({ loadingRecibo: true });
        ObtenerCoordenadas((position) => {
            this.enviarPeticionPedido({
                longitude: position.coords.longitude,
                latitude: position.coords.latitude
            },correlativo)
        }, (error) => {
            this.enviarPeticionPedido(null,correlativo);
        });
    }
    FinalizarPedidoOnline = () => {
        this.setState({ mostrarRecibo: true, loadingRecibo: false, NumPedido: this.props.NumeroOrden });

    }
    CrearDetallePedidoOnline = (productoId, codigoColor, talla, valor, precio, cantidad = 0) => {
        /*if (this.props.NumeroOrden && cantidad < 3) {
            
            fetch(this.urlApi + "/api/PedidoOnline/CrearDetalle", {
                headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token'),

                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    CodigoCliente: this.props.cliente.Codigo,
                    ProductoId: productoId,
                    CodigoColor: codigoColor,
                    Talla: talla,
                    Cantidad: valor,
                    MontoLinea: precio,
                    PrecioUnitario: precio,
                }),
            })
                .then(res => {
                    if (res.status === 200) {

                        /* this.setState({
                            
            }) 
                    } else {
                        this.CrearDetallePedidoOnline(productoId, codigoColor, talla, valor, precio, cantidad + 1);
                    }
                }, error => error)
        } else {
            this.setState({

            }) 
        }*/
    }
    CrearEncabezadoPedidoOnline = (cantidad = 0) => {
        /*if (cantidad < 3) {
            if (!this.state.loading) {
                this.setState({ loading: true });
            }

            fetch(this.urlApi + "/api/PedidoOnline/CrearEncabezado", {
                headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token'),

                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    CodigoCliente: this.props.cliente.Codigo,
                    CodigoColeccion: this.props.coleccion.CodigoColeccion,
                    TipoColeccion: this.props.coleccion.ColeccionTipo,
                    IdLinea: this.props.LineaSeleccionada.IdLinea,
                    AcuerdoVenta: this.props.AcuerdoVenta ? this.props.AcuerdoVenta.IdAcuerdoxCliente : '',
                    Crear: true,
                }),
            })
                .then(res => {
                    if (res.status === 200) {
                        this.setState({ loading: false });
                        res.json().then(
                            (result) => {
                                this.props.onSetNumeroOrden(result.SalesTable.Orden);

                            })
                    } else {
                        this.CrearEncabezadoPedidoOnline(cantidad + 1);
                    }
                }, () => { this.setState({ loading: false }) })
        } else {
            this.setState({ loading: false });

        }*/
    }
    SendEmailPDF = () => {
        if (navigator.onLine) {
            var element = document.getElementById("invoice-POS");
            html2canvas(element).then(canvas => {
                var data = canvas.toDataURL('image/jpeg', 1.0);
                var pdfExportSetting = {
                    pageSize: {
                        width: 600,
                        height: 'auto'
                    },
                    content: [

                        {
                            image: data,
                            width: 500,
                        }
                    ]
                };
                pdfMake.createPdf(pdfExportSetting).getBase64((base64) => {
                    var pdf = 'data:application/pdf;base64,' + base64;

                    var email = { pdf: pdf, CodigoCliente: this.props.cliente.Codigo };

                    fetch(this.urlApi + "/api/Correo", {
                        headers: {
                            'Authorization':
                                'Bearer ' + localStorage.getItem('token'),

                            'Content-Type': 'application/json',
                        },
                        method: 'POST',
                        body: JSON.stringify(email),
                    })
                        .then(res => {
                            if (res.status === 204) {
                                this.setState({
                                    CorreoEnviado: true,
                                })
                            }
                            else {
                            }

                        })

                });
                //pdfMake.createPdf(pdfExportSetting).download("test_file.pdf");
            });
        }

    };

    detalleCarrito = () => {

        return (

            this.props.listaProductosAgregados.map((producto, index) => {
                if (producto.selected) {

                    return (
                        <li className={styles.cdcardli} key={index}>
                            <Row>
                                <Col md="auto">
                                    <img alt={"ImagenProducto"} src={producto.ListaImagenes ? producto.ListaImagenes[0].FotografiaProducto : this.NotFoundImage} className={styles.ImgCarrito}></img>
                                </Col>
                                <Col>
                                    <span className={styles['cd-qty']}>1x</span> {producto.NombreProducto}
                                    <div className={styles['cd-price']}>{"Precio: L. " +
                                        producto.Precio[0].Precio}</div>
                                    <span href="#0" onClick={this.toggleSelectProducto.bind(this, producto)} className={styles.Remove}></span>
                                </Col>
                            </Row>
                        </li>

                    );
                } else {
                    return null;
                }
            })

        );
    }
    onResetProductosAgreagados = () => {
        this.props.onResetProductosAgreagados();
        this.setState({ unidadesCarrito: 0 })
    }

    carrito = () => {
        if (this.state.collapse) {

            return (
                <div className={styles.CarritoPedido} id="cd-cart">
                    <Row style={{ marginLeft: "0", marginRight: "0" }}>
                        <div>
                            <Button style={{ border: 'none' }} className={styles.NoHover} variant='outline' color="primary" onClick={this.toggle}><FaArrowCircleLeft /></Button>
                        </div>

                        <Col>
                            <h4 className={styles.HeaderCart}>
                                Detalle del Pedido</h4>
                            <span onClick={this.onResetProductosAgreagados.bind(this)} href="#0" className={styles.Trash}></span>
                        </Col>

                    </Row>
                    <hr className={styles.hrsuccess}></hr>
                    <ul className={styles.cdcardItems}>
                        {this.detalleCarrito()}
                    </ul>

                    <div className={styles.cdcartotal} >
                        <Row>
                            <Col>
                                <span>Unidades:</span>
                            </Col>
                            <Col style={{ textAlign: "left" }}>
                                <span>{this.state.unidadesCarrito}</span>
                            </Col>

                        </Row>
                    </div>
                    <div className={styles.cdcartotal} >
                        <Row>
                            <Col>
                                <span>Subtotal:</span>
                            </Col>
                            <Col style={{ textAlign: "left" }}>
                                <span>L. 6,086.96</span>
                            </Col>

                        </Row>
                    </div>

                    <div className={styles.cdcartotal} >
                        <Row>
                            <Col>
                                <span>ISV:</span>
                            </Col>
                            <Col style={{ textAlign: "left" }}>
                                <span>L. 913.04</span>
                            </Col>

                        </Row>
                    </div>
                    <div className={styles.cdcartotal} >
                        <Row>
                            <Col>
                                <span>Total:</span>
                            </Col>
                            <Col style={{ textAlign: "left" }}>
                                <span>L. 7,000.00</span>
                            </Col>

                        </Row>
                    </div>
                    <a href="#0" className={styles.CompleteButton}>Completar Pedido</a>

                </div>
            )
        } else {
            return null;

        }

    }

    SearchProductos = (text) => {
        this.setState({
            buscador: text,
        })
    }

    ClearSearch = () => {
        this.setState({
            buscador: '',
        })
    }

    handleDeleteFiltros = (categoria, filtro) => {
        var ListaFiltros = { ...this.state.filtroAtributos };
        let filtros = ListaFiltros[categoria];

        filtros.some((filt, inde) => {
            if (filt === filtro) {
                filtros.splice(inde, 1);
                return true;
            }
            return false;
        })

        this.setState({
            filtroAtributos: ListaFiltros
        })
    }

    handleDeleteAllFiltros = () => {
        this.setState({
            filtroAtributos: {},
        })
    }

    setFiltroEdad = (data) => {
        this.setState({
            filtroEdad: data
        })
    }

    SearchFiltros = (event) => {
        this.setState({
            buscadorFiltros: event.target.value,
        })
    }
    OnClickSearch = () => {
        this.state.buscadorFiltros !== "" && this.setState({ buscadorFiltros: "" })
    }

    Filtros = () => {
        var filtros = [];
        var filtro = {};
        this.props.coleccion.AtributosXColeccion.forEach(atri => {
            if (atri.IdLinea === this.props.LineaSeleccionada.IdLinea) {
                if (filtro[atri.Tipo] === undefined) {
                    filtro[atri.Tipo] = [];
                }
                let encontrado = atri.Descripcion.toLowerCase().includes(this.state.buscadorFiltros.toLowerCase());
                if (this.state.buscadorFiltros === "") {
                    filtro[atri.Tipo].push(atri.Descripcion);
                }
                else if (encontrado) {
                    filtro[atri.Tipo].push(atri.Descripcion);
                }
                else {
                    if (filtro[atri.Tipo].length === 0) {
                        delete filtro[atri.Tipo];
                    }
                }
            }
        });
        filtros = Object.keys(filtro).map(key => {
            return {
                Tipo: key,
                Descripciones: filtro[key]
            }
        });
        return filtros;
    }

    seleccionarPais=(pais)=>{
        /*clientes:this.props.clientes,
        clientesFiltrados:[],
        paisSeleccionado:null*/
        if(this.state.paisSeleccionado===pais){
            this.setState((prevState)=>({...prevState,clientesFiltrados:prevState.clientes,paisSeleccionado:null,autocompleteValue:null}));
        }else{
            const paisFiltrado = this.state.clientes.filter(x=>x.EmpresaId===pais);
            this.setState((prevState)=>({...prevState,clientesFiltrados:paisFiltrado,paisSeleccionado:pais,autocompleteValue:null}))
        }
    }

    render() {
        const { error, isLoaded, loading } = this.state;
        var filtroActivo = false;

        Object.keys(this.state.filtroAtributos).map((categ, indCateg) => {

            return this.state.filtroAtributos[categ].map((filtro, ind) => {
                filtroActivo = true;
                return true
            });
        })
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if ((!isLoaded || loading)) {
            return <Loader interval={1800} />;
        } else {
            return (
                <div ref={this.scroll}>
                    <Route

                        path={
                            [this.props.match.url + '/Colecciones/:TipoColeccion/:CodigoColeccion',
                            this.props.match.url + '/Colecciones/:TipoColeccion/:CodigoColeccion/:CodigoProducto',
                            this.props.match.url + '/MatrizResumen']
                        }
                        render={() => {
                            return (
                                <>
                                    <GuardPedidoActivo
                                        isPedidoActivo={this.isPedidoActivo() && !this.state.mostrarRecibo}
                                        match={this.props.match}
                                        history={this.props.history}
                                        onSetTableValue={this.props.onSetTableValue}
                                        onSetTotalPedido={this.props.onSetTotalPedido}
                                        onSetNumeroOrden={this.props.onSetNumeroOrden}
                                    />

                                </>
                            )
                        }}
                    />
                    <Route

                        path={[this.props.match.url + '/ResumenPedido']}
                        render={() => {
                            return (
                                <>
                                    <GuardPedidoActivo
                                        isPedidoActivo={this.isPedidoActivo() && !this.state.mostrarRecibo}
                                        match={this.props.match}
                                        history={this.props.history}
                                        onSetTableValue={this.props.onSetTableValue}
                                        onSetTotalPedido={this.props.onSetTotalPedido}
                                        onSetNumeroOrden={this.props.onSetNumeroOrden}
                                    />

                                </>
                            )
                        }}
                    />
                    <PedidosBreadCrumb
                        match={this.props.match}
                        clickBreadCrumb={this.clickBreadCrumb}
                        clickBreadCrumbColecciones={this.clickBreadCrumbColecciones}
                        producto={this.props.producto}
                        coleccion={this.props.coleccion}
                        cancelarPedido={this.cancelarPedido}
                        cliente={this.props.cliente}
                        // cliente={this.props.cliente}
                        toggle={this.toggle}
                        TableValue={this.props.TableValue}
                        LineaSeleccionada={this.props.LineaSeleccionada}
                        TipoPedido={this.props.TipoPedido}
                    >
                    </PedidosBreadCrumb>
                    <Switch>
                        <Route
                            exact
                            path={this.props.match.url + '/MatrizResumen'}
                            render={() => {
                                return (
                                    <>
                                        <StickyContainer>
                                            {/* Other elements can be in between `StickyContainer` and `Sticky`,
        but certain styles can break the positioning logic used. */}
                                            <Sticky >
                                                {({
                                                    style,

                                                    // the following are also available but unused in this example
                                                    isSticky,
                                                    wasSticky,
                                                    distanceFromTop,
                                                    distanceFromBottom,
                                                    calculatedHeight
                                                }) => (
                                                        <header style={{ ...style, zIndex: 3 }}>
                                                            <div className="text-center" style={{
                                                                backgroundColor: '#F8F9FA',
                                                                fontSize: '15px',
                                                                marginTop: '-0.5rem',
                                                                paddingTop: '0.5rem',
                                                                fontWeight: 500,
                                                                borderBottom: '1px solid #aaa',
                                                                letterSpacing: '0.5px',
                                                            }}>
                                                                <TotalXPedido
                                                                    TableValue={this.props.TableValue[this.props.LineaSeleccionada.IdLinea] === undefined ? null : this.props.TableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]}
                                                                    // GrupoPrecioCliente={props.cliente.GrupoPrecio}
                                                                    AcuerdoVenta={this.props.AcuerdoVenta}
                                                                    cliente={this.props.cliente}
                                                                    TipoPedido={this.props.TipoPedido}
                                                                    TotalPedido={this.props.TotalPedido}
                                                                    lineal
                                                                />
                                                            </div>

                                                        </header>
                                                    )}
                                            </Sticky>
                                            {
                                                this.state.expandable ?
                                                    <MatrizResumenExpandable
                                                        tableValue={this.props.TableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]}
                                                        onValueChange={this.onchangeText.bind(this)}
                                                        futuro={this.NoEsFuturo()}
                                                        mostrarResumen={this.mostrarResumen.bind(this)}
                                                        Cliente={this.props.cliente}
                                                        Eliminar={this.EliminarProducto.bind(this)}
                                                        CrearDetallePedidoOnline={this.CrearDetallePedidoOnline}
                                                    />
                                                    :
                                                    <MatrizResumen
                                                        tableValue={this.props.TableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]}
                                                        onValueChange={this.onchangeText.bind(this)}
                                                        futuro={this.NoEsFuturo()}
                                                        mostrarResumen={this.mostrarResumen.bind(this)}
                                                        Cliente={this.props.cliente}
                                                        Eliminar={this.EliminarProducto.bind(this)}
                                                        CrearDetallePedidoOnline={this.CrearDetallePedidoOnline}
                                                    />
                                            }
                                        </StickyContainer>
                                    </>
                                )
                            }}
                        />
                        <Route
                            exact
                            path={this.props.match.url + '/ResumenPedido'}
                            render={() => {
                                return (
                                    <ResumenPedido
                                        tableValue={this.props.TableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]}
                                        enviarPedido={this.enviarPedido.bind(this)}
                                        mostrarRecibo={this.state.mostrarRecibo}
                                        loadingRecibo={this.state.loadingRecibo}
                                        Cliente={this.props.cliente}
                                        cancelarPedido={this.cancelarPedido}
                                        reiniciarPedido={this.reiniciarPedido}
                                        guardarFirma={this.guardarFirma.bind(this)}
                                        firmaPedido={this.state.firmaPedido}
                                        numPedido={this.state.NumPedido}
                                        coleccion={this.props.coleccion}
                                        guardarFecha={this.setFechaEntregaPedido}
                                        NumeroOrden={this.props.NumeroOrden}
                                        FinalizarPedidoOnline={this.FinalizarPedidoOnline}
                                        CargarImpresionPedido = {this.CargarImpresionPedido}
                                        obtenerUltimoCorrelativo={this.obtenerUltimoCorrelativo}
                                    ></ResumenPedido>
                                )
                            }}
                        />
                          <Route
                            exact
                            path={this.props.match.url + '/ImprimirPedido'}
                            render={(routeProps) => {
                                return (
                                    <ImprimirPedidoOriginal 
                                        tableValue={this.props.TableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]}
                                        firma = {this.state.firmaPedido}
                                        Cliente = {this.props.cliente}
                                        ValoresPedido={JSON.parse(routeProps.location.state)}
                                        NumeroOrden = {this.props.NumeroOrden}
                                        reiniciarPedido={this.reiniciarPedido}
                                        cancelarPedido={this.cancelarPedido}>
                                    </ImprimirPedidoOriginal>
                                )
                            }}
                        />
                        <Route
                            exact
                            path={this.props.match.url + '/TipoPedido'}
                            render={() =>
                                <Container fluid={true}>
                                    <Row style={{ marginBottom: '1rem' }}>
                                        <Col style={{ textAlign: 'left' }}>
                                            <NavigationBreadcrumb
                                                BreadcrumbItems={[
                                                    { Click: () => { this.clickBreadCrumb("/Pedidos/Linea") }, Titulo: this.props.LineaSeleccionada.Linea ? this.props.LineaSeleccionada.Linea : "Linea" },
                                                    { Titulo: 'Tipo de Pedido' }
                                                ]}
                                            />


                                        </Col>

                                        <Col style={{ textAlign: 'right' }}>
                                            <Dropdown
                                                onCommand={this.cancelarPedido.bind(this)}
                                                menu={(
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                )}
                                            >
                                                <span >
                                                    <FaSignOutAlt style={{ marginRight: '0.5rem', fontSize: '22px', color: 'black' }} />
                                                </span>
                                            </Dropdown>
                                            {"Cliente: "}
                                            {this.props.cliente.Nombre}
                                        </Col>
                                    </Row>
                                    <SelectTipoPedido
                                        setTipoPedido={this.seleccionarTipoPedido}
                                        tiposPedido={this.props.TiposPedido}
                                        Cliente={this.props.cliente}
                                    />
                                </Container>}
                        />
                        <Route
                            exact
                            path={this.props.match.url + '/Linea'}
                            render={() =>
                                <Container fluid={true}>
                                    <Row style={{ marginBottom: '0.5rem' }}>

                                        <Col style={{ textAlign: 'right' }}>
                                            <Dropdown
                                                onCommand={this.cancelarPedido.bind(this)}
                                                menu={(
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                )}
                                            >
                                                <span >
                                                    <FaSignOutAlt style={{ marginRight: '0.5rem', fontSize: '22px', color: 'black' }} />
                                                </span>
                                            </Dropdown>
                                            {"Cliente: "}
                                            {this.props.cliente.Nombre}
                                        </Col>
                                    </Row>
                                    <SelectLinea
                                        setLinea={this.seleccionarLinea}
                                        maestroLineas={this.props.MaestroLineas}
                                    />
                                </Container>}
                        />

                        <Route path={this.props.match.url + '/Colecciones/:TipoColeccion/:CodigoColeccion/:CodigoProducto'} render={(routeProps) => {
                            let listFiltros = [...this.Filtros()];
                            return (
                                <Container fluid={true} key={routeProps.match.params.CodigoProducto}>
                                    <VistaProducto
                                        // filtroEdad={this.state.filtroEdad}
                                        Click={this.getProducto}
                                        coleccion={this.props.coleccion}
                                        Linea={this.props.LineaSeleccionada}
                                        // filtroAtributos={this.state.filtroAtributos}
                                        producto={this.props.producto}
                                        futuro={this.NoEsFuturo()}
                                        toggleSelectProducto={this.toggleSelectProducto.bind(this, this.props.producto)}
                                        TableValue={this.props.TableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]}
                                        onchangeText={this.onchangeText.bind(this)}
                                        alertaPrecio={this.alertaPrecio}
                                        Cliente={this.props.cliente}
                                        CrearDetallePedidoOnline={this.CrearDetallePedidoOnline}
                                        NoStock={this.state.NoStock}

                                        //ModalFiltrosProps
                                        styles={styles}
                                        OnClickSearch={this.OnClickSearch}
                                        buscadorFiltros={this.state.buscadorFiltros}
                                        SearchFiltros={this.SearchFiltros}
                                        Filtros={listFiltros}
                                        toggleExpandirFiltroAtributos={this.toggleExpandirFiltroAtributos}
                                        verificarExpandirFiltroAtributos={this.verificarExpandirFiltroAtributos}
                                        VerificarFiltro={this.VerificarFiltro}
                                        MarcarFiltro={this.MarcarFiltro}

                                        //FiltroChipsProps
                                        filtroActivo={filtroActivo}
                                        filtroAtributos={this.state.filtroAtributos}
                                        filtroEdad={this.state.filtroEdad}
                                        setFiltroEdad={this.setFiltroEdad}
                                        handleDeleteAllFiltros={this.handleDeleteAllFiltros}
                                        handleDeleteFiltros={this.handleDeleteFiltros}

                                    />
                                    {this.carrito()}
                                </Container>
                            )
                        }} />

                        <Route path={this.props.match.url + '/Colecciones/:TipoColeccion/:CodigoColeccion'} exact render={(routeProps) => {
                            // this.CrearEncabezadoPedidoOnline();

                            if (this.props.coleccion === null) {
                                this.props.onSetColeccion(this.props.colecciones.find(col => col.CodigoColeccion === this.props.codigoColeccionActiva));
                                return null;
                            } else {
                                return (
                                    <section>
                                        <StickyContainer>
                                            {/* Other elements can be in between `StickyContainer` and `Sticky`,
        but certain styles can break the positioning logic used. */}
                                            <Sticky>
                                                {({
                                                    style,

                                                    // the following are also available but unused in this example
                                                    isSticky,
                                                    wasSticky,
                                                    distanceFromTop,
                                                    distanceFromBottom,
                                                    calculatedHeight
                                                }) => (
                                                        <header style={style} className="Especial2 p-0 shadow">
                                                            <div className="row align-items-center">
                                                                <div className="col-md-2 col-6 pr-0">
                                                                    <div className="col-12 pr-0">
                                                                        <Media queries={{
                                                                            mobile: "(max-width: 767px)",
                                                                            desktop: "(min-width: 768px)"
                                                                        }}>
                                                                            {matches => (
                                                                                <>
                                                                                    {
                                                                                        matches.mobile &&
                                                                                        <span style={{ fontSize: "20px" }} id="menu-toggle-mobile" onClick={() => this.Alerta()}><FaAlignJustify /></span>
                                                                                    }
                                                                                    {
                                                                                        matches.desktop &&
                                                                                        <span style={{ fontSize: "20px" }} id="menu-toggle" onClick={() => this.Alerta()}><FaAlignJustify /> Filtros</span>
                                                                                    }
                                                                                </>
                                                                            )}
                                                                        </Media>
                                                                    </div>
                                                                </div>


                                                                <div className="order-md-last col-md-1 col-6 text-right py-1 pl-0" style={{ zIndex: 3 }}>
                                                                    <SearchButton onSearch={this.SearchProductos} clear={this.ClearSearch} />
                                                                    {/* {!this.props.NumeroOrden ? <Button style={{ marginLeft: '0.5rem', display: 'inline' }} onClick={() => { this.CrearEncabezadoPedidoOnline() }} outline>C</Button> : null} */}
                                                                    <Button variant="outlined" color="primary" onClick={this.toggle} style={{ marginLeft: '0.5rem' }}  startIcon ={<FaShoppingCart/>}>
                                                                        {parseInt(localStorage.getItem('ProdEnCarrito'))}
                                                                    </Button>                   
                                                                </div>

                                                                <div className="col-md-9 text-right" style={{ zIndex: 2 }}>
                                                                    <div className="row align-items-center justify-content-around justify-content-md-start">
                                                                        {this.props.coleccion.Edades.map((edad, index0, self) => {
                                                                            if (self.map(e => e.IdEdad).indexOf(edad.IdEdad) === index0) {
                                                                                return (
                                                                                    <div
                                                                                        key={index0}
                                                                                        className={this.state.filtroEdad === edad.IdEdad ? "especiala especialaActive" : "especiala"}
                                                                                        onClick={() => this.SelectFiltroEdad(edad.IdEdad)}
                                                                                    >
                                                                                        {edad.Edad}
                                                                                    </div>
                                                                                    // <Link
                                                                                    //     key={index0}
                                                                                    //     className="especiala"
                                                                                    //     activeClass="especialaActive"
                                                                                    //     to={'section' + edad.IdEdad}
                                                                                    //     spy={true}
                                                                                    //     smooth={"easeOutCubic"}
                                                                                    //     offset={-70}
                                                                                    //     duration={1500}
                                                                                    // >
                                                                                    //     {edad.Edad}
                                                                                    // </Link>
                                                                                )
                                                                            }
                                                                            return null;
                                                                        })}

                                                                    </div>

                                                                </div>
                                                            </div>
                                                            <div className="row" style={{ backgroundColor: '#90B9CB', fontSize: '15px' }}>
                                                                {/* <div className="2">

                                                                </div> */}
                                                                <div className={"col-md-12 col-12 p-0"}>
                                                                    <TotalXPedido
                                                                        TableValue={this.props.TableValue[this.props.LineaSeleccionada.IdLinea] === undefined ? null : this.props.TableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion]}
                                                                        // GrupoPrecioCliente={props.cliente.GrupoPrecio}
                                                                        AcuerdoVenta={this.props.AcuerdoVenta}
                                                                        color={'white'}
                                                                        lineal
                                                                        cliente={this.props.cliente}
                                                                        TotalPedido={this.props.TotalPedido}
                                                                        TipoPedido={this.props.TipoPedido}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </header>
                                                    )}
                                            </Sticky>
                                            <div className={"col-12 p-0 bg-white"}>

                                                <div className="row" id="wrapper">

                                                    <Media queries={{
                                                        mobile: "(max-width: 767px)",
                                                        desktop: "(min-width: 768px)"
                                                    }}>
                                                        {
                                                            matches => {
                                                                let listFiltros = [...this.Filtros()];
                                                                return (
                                                                    <>
                                                                        {matches.mobile &&
                                                                            <ModalFiltros
                                                                                IdNode={'menu-toggle-mobile'}
                                                                                styles={styles}
                                                                                OnClickSearch={this.OnClickSearch}
                                                                                buscadorFiltros={this.state.buscadorFiltros}
                                                                                SearchFiltros={this.SearchFiltros}
                                                                                Filtros={listFiltros}
                                                                                toggleExpandirFiltroAtributos={this.toggleExpandirFiltroAtributos}
                                                                                verificarExpandirFiltroAtributos={this.verificarExpandirFiltroAtributos}
                                                                                VerificarFiltro={this.VerificarFiltro}
                                                                                MarcarFiltro={this.MarcarFiltro}
                                                                            />
                                                                        }
                                                                        {
                                                                            matches.desktop &&
                                                                            <div className="col-xl-2 col-sm-4 col-5" id="sidebar-wrapper">
                                                                                <div className="list-group list-group-flush">

                                                                                    <div className={"mt-2 p-0 shadow-sm"}>
                                                                                        <div className={"col-12 px-0 my-2"}>
                                                                                            <div className={styles.SearchFiltrosIcon}>
                                                                                                <div
                                                                                                    className={this.state.buscadorFiltros !== "" ? styles.searchToggle + " " + styles.active : styles.searchToggle}
                                                                                                    onClickCapture={() => this.OnClickSearch()} >
                                                                                                </div>
                                                                                            </div>
                                                                                            <input type="text" value={this.state.buscadorFiltros} onChange={event => this.SearchFiltros(event)} placeholder={"Buscar"} className={"pr-2 " + styles.SearchFiltros} />

                                                                                        </div>
                                                                                        {
                                                                                            this.Filtros().length !== 0 ?
                                                                                                this.Filtros().map((atributoXcoleccion, index) => {
                                                                                                    return (
                                                                                                        <ExpansionPanel key={index} square expanded={this.verificarExpandirFiltroAtributos("panel" + index.toString())} onChange={this.toggleExpandirFiltroAtributos.bind(this, "panel" + index.toString())}>
                                                                                                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls={"panel" + index.toString() + "d-content"} id={"panel" + index.toString() + "d-header"}>
                                                                                                                {atributoXcoleccion.Tipo}

                                                                                                            </ExpansionPanelSummary>
                                                                                                            <ExpansionPanelDetails>
                                                                                                                <div style={{ overflow: 'auto' }}>

                                                                                                                    {atributoXcoleccion.Descripciones.map((Descripcion, index2) => {
                                                                                                                        var atrib = {
                                                                                                                            [atributoXcoleccion.Tipo]: Descripcion
                                                                                                                        };
                                                                                                                        return (
                                                                                                                            <p key={index2}>
                                                                                                                                <Checkbox
                                                                                                                                    checked={this.VerificarFiltro(atrib)}
                                                                                                                                    onChange={this.MarcarFiltro.bind(this, atrib)}
                                                                                                                                >
                                                                                                                                    {Descripcion}</Checkbox>
                                                                                                                                <br />
                                                                                                                            </p>

                                                                                                                        )
                                                                                                                    })}
                                                                                                                </div>

                                                                                                            </ExpansionPanelDetails>
                                                                                                        </ExpansionPanel>
                                                                                                    )
                                                                                                })
                                                                                                :
                                                                                                <div className="text-center">
                                                                                                    Sin Resultados
                                                                                        </div>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                    </>
                                                                )
                                                            }
                                                        }
                                                    </Media>

                                                    <div className="col">
                                                        <div className="container-fluid mt-4 p-0">

                                                            <div className="row" style={{ paddingBottom: '5px', borderBottom: '2px solid #90B9CB', }}>
                                                                <div className={"col-md-9 col-8 " + styles.ChipContainer} >
                                                                    <FiltroChips
                                                                        filtroActivo={filtroActivo}
                                                                        filtroAtributos={this.state.filtroAtributos}
                                                                        filtroEdad={this.state.filtroEdad}
                                                                        setFiltroEdad={this.setFiltroEdad}
                                                                        handleDeleteAllFiltros={this.handleDeleteAllFiltros}
                                                                        handleDeleteFiltros={this.handleDeleteFiltros}
                                                                    />
                                                                </div>

                                                                <div className="col-md-3 col-4 text-right pl-0">

                                                                    <div ref={this.CantidadProductos} className={"col-12 " + styles.CantidadProductosLabel}>

                                                                    </div>

                                                                    {/* <div className="col-12 p-0">
                                                                        <Radio style={{ transform: 'scale(0.94)', zIndex: 2 }}
                                                                            slider
                                                                            label={"Expandible"}
                                                                            onChange={() => this.setExpandable()}
                                                                            checked={this.state.expandable} />
                                                                    </div> */}

                                                                    <div className="col-12 p-0">
                                                                        <Radio style={{ transform: 'scale(0.94)', zIndex: 2 }}
                                                                            slider
                                                                            label={"Stock"}
                                                                            onChange={() => this.setNoStock()}
                                                                            checked={this.state.NoStock} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <VistaRapidaProducto
                                                                visible={this.state.dialogVistaRapida}
                                                                producto={this.state.productoDialog}
                                                                imagenProducto={this.state.imagenProductoDialogSeleccionada}
                                                                changeImageProducto={this.changeImagenProductoDialogSeleccionada.bind(this)}
                                                                toggleSelectProducto={this.toggleSelectProducto.bind(this)}
                                                                TableValue={this.props.TableValue}
                                                                alertaPrecio={this.alertaPrecio}
                                                                Cliente={this.props.cliente}
                                                                CerrarDialog={this.CerrarDialog.bind(this)}
                                                                futuro={this.NoEsFuturo()}
                                                            />
                                                            <Productos
                                                                filtroEdad={this.state.filtroEdad}
                                                                Click={this.getProducto}
                                                                ClickVistaRapida={this.setProductoDialog}
                                                                coleccion={this.props.coleccion}
                                                                Linea={this.props.LineaSeleccionada}
                                                                toggleSelectProducto={this.toggleSelectProducto.bind(this)}
                                                                filtroAtributos={this.state.filtroAtributos}
                                                                listaProductosAgregados={this.props.listaProductosAgregados}
                                                                TableValue={this.props.TableValue}
                                                                GrupoPrecioCliente={this.props.cliente.GrupoPrecio}
                                                                alertaPrecio={this.alertaPrecio}
                                                                buscador={this.state.buscador}
                                                                CantidadProductos={this.CantidadProductos}
                                                                LimiteVenta={this.props.Limite}
                                                                TotalPedido={this.props.TotalPedido}
                                                                alertaLimiteCredito={this.alertaLimiteCredito}
                                                                NoStock={this.state.NoStock}
                                                            ></Productos>
                                                            {this.carrito()}

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-outline-primary" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 10 }} onClick={() => { this.ScrollToTop(this.scroll) }}><IoIosArrowRoundUp style={{ fontSize: '20px' }} /></button>

                                        </StickyContainer>

                                    </section>
                                )
                            }

                        }

                        }
                        />
                        <Route path={this.props.match.url + '/Colecciones/:TipoColeccion'} exact render={(routeProps) => {
                            if (this.state.activeCollapse.length !== 0 && Object.keys(this.state.filtroAtributos).length !== 0) {
                                this.setState({
                                    activeCollapse: [],
                                    filtroAtributos: {}
                                });
                            }
                            if (this.state.loadingColecciones) {
                                return (
                                    <div className={styles.contenedorLoadingColecciones}>
                                        <Loader interval={1800} />
                                    </div>
                                )
                            }
                            return (
                                <Container fluid={true} >
                                    <Colecciones
                                        {...routeProps}
                                        Click={this.getColeccion}
                                        colecciones={this.props.colecciones}
                                        TiposColeccion={this.props.TiposColeccion}
                                        LineaSeleccionada={this.props.LineaSeleccionada}
                                    />
                                </Container>
                            )
                        }

                        }
                        />
                        <Redirect from={this.props.match.url + '/Colecciones'} to={this.props.match.url + '/Colecciones/B'} />
                        <div>
                            <Button style={{height:45,float:'right',zIndex:9}} onClick={this.recargarClientes} variant="contained" color="primary"><CachedIcon/></Button>
                            {this.props.Paises.length>1 &&
                            <div className="container-fluid" style={{display:'flex',marginBottom:'10px'}}>
                                <h4>Filtro por pais</h4>
                                <div>
                                    {
                                    // eslint-disable-next-line
                                    this.props.Paises.map(pais=>{
                                        if(pais.EmpresaId==="IMHN"){
                                            let stylePaises={width:'30px',height:'30px',marginLeft:'25px'};
                                            if(this.state.paisSeleccionado==="IMHN"){
                                               stylePaises = {width:'30px',height:'30px',marginLeft:'25px',outline:'5px solid green'}
                                            }

                                            return <img alt="honduras" src={honduras} style={stylePaises} onClick={()=>{this.seleccionarPais(pais.EmpresaId)}}/>
                                        }else if(pais.EmpresaId==="IMCR"){
                                            let stylePaises={width:'30px',height:'30px',marginLeft:'25px'};
                                            if(this.state.paisSeleccionado==="IMCR"){
                                                stylePaises = {width:'30px',height:'30px',marginLeft:'25px',outline:'5px solid green'};
                                            }
                                            return <img alt="costarica" src={costarica} style={stylePaises} onClick={()=>{this.seleccionarPais(pais.EmpresaId)}}/>
                                        }else if(pais.EmpresaId==="IMGT"){
                                            let stylePaises={width:'30px',height:'30px',marginLeft:'25px'}
                                            if(this.state.paisSeleccionado==="IMGT"){
                                                stylePaises = {width:'30px',height:'30px',marginLeft:'25px',outline:'5px solid green'};
                                            }
                                            return <img alt="guatemala" src={guatemala} style={stylePaises} onClick={()=>{this.seleccionarPais(pais.EmpresaId)}}/>
                                        }
                                    })}
                                </div>
                            </div>
                        }
                        <SelectCliente
                            clientes={this.state.clientesFiltrados}
                            value={this.state.autocompleteValue}
                            textValue={this.textValueChange}
                            fetchSuggestions={this.querySearch}
                            onSelect={this.handleSelect}
                            setCliente={this.seleccionarCliente}
                            autocompleteValue={this.state.autocompleteValue}
                            loading={this.state.selectClienteLoading}
                            codigoClientePreseleccionado={this.props.location.state ? this.props.location.state.CodigoCliente : null}
                            infoCliente={this.infoCliente}
                            onSetTableValue={this.props.onSetTableValue}
                            onSetTotalPedido={this.props.onSetTotalPedido}
                            onSetNumeroOrden={this.props.onSetNumeroOrden}
                        />
                        </div>
                    </Switch>
                </div>

            );
        }
    }

    ScrollToTop = (ref) => {
        ref.current.scrollIntoView({ behavior: 'smooth' });
    }

    NoEsFuturo = () => {
        let noFuturo = this.props.coleccion.ColeccionTipo !== "F";
        return noFuturo;
    }

    SelectFiltroEdad = (edadSelected) => {
        this.setState({ filtroEdad: edadSelected })
    }

    Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        background:'red',
        timer: 3000,
      })


    alertaLimiteCredito() {

        this.Toast.fire({
            title: "<span style='color:#FFF'>Excede el limite de crédito disponible.<span>",
            icon: 'error'
        });
    }

    onchangeText(text, productoId, codigoColor, grupoTalla, talla, precio) {
        this.props.onSetBloqueo(false);
        let tableValue = { ...this.props.TableValue };
        const valor = (text.target.validity.valid) ? text.target.value : tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos[productoId].Colores[codigoColor].Tallas[talla].Cantidad;
        let valorPrevio = tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos[productoId].Colores[codigoColor].Tallas[talla];
        let totalAcumulado = this.props.TotalPedido - (valorPrevio.Cantidad - valor) * precio;
        if (this.props.TipoPedido.Restrictivo) {
            if (this.props.AcuerdoVenta) {
                if (!(this.props.AcuerdoVenta.Saldo >= totalAcumulado)) {
                    this.props.onSetBloqueo(true);
                    this.alertaLimiteCredito();
                }
            } else {
                if (!(this.props.cliente.LimiteCredito >= totalAcumulado)) {
                    this.alertaLimiteCredito();
                }


            }
        }
        valorPrevio.Cantidad = valor;
        if (tableValue[this.props.LineaSeleccionada.IdLinea][this.props.coleccion.CodigoColeccion][grupoTalla].Productos[productoId].Selected) {
            this.props.onSetTotalPedido(totalAcumulado)
            // this.CrearDetallePedidoOnline(productoId, codigoColor, talla.slice(1) , valor, precio);
        }
        this.props.onSetTableValue(tableValue);
    }

    AgregarProducto = () => {
        var id = 'ProdId' + this.props.producto.ProductoId;
        var prods = JSON.parse(localStorage.getItem(id));
        var array = this.props.TableValue;
        localStorage.setItem(id, JSON.stringify(array));


        var found = false;
        var agregados = this.props.listaProductosAgregados;
        

        var contador = this.state.unidadesCarrito;

        agregados.map((agregado) => {
            if (this.props.producto.ProductoId === agregado.ProductoId) {
                if (agregado.selected) {
                    found = true;
                }
            }
            return false;
        })

        if (found) {
            contador = this.state.unidadesCarrito;
            prods.map((color, indexC) => {
                color.map((talla, indexT) => {
                    contador -= parseInt((prods[indexC])[indexT]);
                    return false;
                })
                return false;
            })

            array.map((color, indexC) => {
                color.map((talla, indexT) => {
                    contador += parseInt((array[indexC])[indexT]);
                    return false;
                })
                return false;
            })

            this.setState({ unidadesCarrito: contador });
        }
        else {
            this.toggleSelectProducto(this.props.producto);
        }

    }
}


const mapStateToProps = state => {
    return {
        colecciones: state.colecciones,
        producto: state.producto,
        coleccion: state.coleccion,
        clientes: state.clientes,
        cliente: state.cliente,
        listaProductosAgregados: state.listaProductosAgregados,
        TiposPedido: state.TiposPedido,
        TipoPedido: state.TipoPedido,
        MaestroLineas: state.MaestroLineas,
        LineaSeleccionada: state.LineaSeleccionada,
        TableValue: state.TableValue,
        PedidoEnCurso: state.PedidoEnCurso,
        CodigoColeccionActiva: state.codigoColeccionActiva,
        AcuerdoVenta: state.AcuerdoVenta,
        TotalPedido: state.TotalPedido,
        Limite: state.Limite,
        NumeroOrden: state.NumeroOrden,
        TiposColeccion: state.TiposColeccion,
        clienteContado:state.clienteContado,
        flete:state.flete,
        requiereEntrega:state.requiereEntrega,
        impuesto:state.Impuesto,
        Paises:state.Permisos[0].EmpresasUsuarios,
        ListaPrecios:state.ListaPrecios
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onSetBloqueo:(valor)=>dispatch({ type: 'SET_BLOQUEO', payload: valor }),
        onStoreColecciones: (colecciones) => dispatch({ type: 'STORE_COLECCIONES', colecciones: colecciones }),
        onStoreClientes: (clientes) => dispatch({ type: 'STORE_CLIENTES', clientes: clientes }),
        onStoreTipoPedido: (TipoPedido) => dispatch({ type: 'STORE_TIPO_PEDIDO', TipoPedido: TipoPedido }),
        onSetProducto: (producto) => dispatch({ type: 'SET_PRODUCTO', producto: producto }),
        onSetColeccion: (coleccion) => dispatch({ type: 'SET_COLECCION', coleccion: coleccion }),
        onSetCliente: (cliente) => dispatch({ type: 'SET_CLIENTE', cliente: cliente }),
        onSetTipoPedido: (tipoPedido, acuerdoVenta) => dispatch({ type: 'SET_PEDIDO', TipoPedido: tipoPedido, AcuerdoVenta: acuerdoVenta }),
        onCancelarPedido: () => dispatch({ type: 'CANCELAR_PEDIDO' }),
        onReinicarPedido: () => dispatch({ type: 'REINICIAR_PEDIDO' }),
        onToggleSelectProducto: (producto) => dispatch({ type: 'TOGGLE_SELECT_PRODUCTO', producto: producto }),
        onResetProductosAgreagados: () => dispatch({ type: 'RESET_PRODUCTOS_AGREGADOS' }),
        onStoreMaestroLinea: (maestroLineas) => dispatch({ type: 'STORE_MAESTROLINEA', maestroLineas: maestroLineas }),
        onSetLineaSeleccionada: (lineaSeleccionada) => dispatch({ type: 'SET_LINEA', LineaSeleccionada: lineaSeleccionada }),
        onSetTableValue: (tableValue) => dispatch({ type: 'SET_TABLEVALUE', TableValue: tableValue }),
        onSetPedidoEnCurso: (pedidoEnCurso) => dispatch({ type: 'SET_PEDIDOENCURSO', pedidoEnCurso: pedidoEnCurso }),
        onSetTotalPedido: (TotalPedido) => dispatch({ type: 'SET_TOTALPEDIDO', TotalPedido: TotalPedido }),
        onSetNumeroOrden: (NumeroOrden) => dispatch({ type: 'SET_NUMEROORDEN', NumeroOrden: NumeroOrden }),
        onStoreTiposColeccion: (TiposColeccion) => dispatch({ type: 'STORE_TIPOS_COLECCION', TiposColeccion: TiposColeccion }),
        onStoreDatosParaPedido: (colecciones, clientes, TiposPedido, maestroLineas) => dispatch(
            { type: 'STORE_DATOSPARAPEDIDO', colecciones: colecciones, clientes: clientes, TiposPedido: TiposPedido, maestroLineas: maestroLineas }),
        onStoreEmpresasTransporte:(empresas)=>dispatch({type:'SET_EMPRESASTRANSPORTE',payload:empresas}),
        onStorePrecioCajas:(precioCajas)=>dispatch({type:'SET_PRECIOCAJAS',payload:precioCajas}),
        onStoreImpuestoClientes:(impuestos)=>dispatch({type:'SET_CLIENTEIMPUESTOS',payload:impuestos}),
        onStoreImpuestoProductos:(impuestos)=>dispatch({type:'SET_PRODUCTOIMPUESTOS',payload:impuestos}),
        onSaveMonedas:(monedas)=>{dispatch({type:'SET_MONEDAS',payload:monedas})},
        onSaveListaPrecios:(precios)=>{dispatch({type:'SET_LISTAPRECIOS',payload:precios})}
    };
};
/* const linkButton = {
                            background: "none",
                    border: "none",
                }; */
const ExpansionPanel = withStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
        },
    },
    expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
    root: {
        backgroundColor: 'rgba(255,255,255)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: 56,
        '&$expanded': {
            minHeight: 56,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiExpansionPanelDetails);

const ObtenerCoordenadas = (resolve, reject) => {
    const timeout = new Promise((resolve, reject) => {
        setTimeout(reject, 10000);
    });

    const geolocationPromise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve(position);
            },
            (error) => { reject(error) },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    });
    Promise.race([timeout, geolocationPromise]).then((value) => resolve(value)).catch((error) => reject(error))
}

export default connect(mapStateToProps, mapDispatchToProps)(Pedidos);