import React, { useState, useEffect } from 'react';
import styles from 'components/Pedidos/SelectCliente/SelectCliente.module.css';
import Historico from 'components/Pedidos/SelectCliente/Historico';
import { Dropdown } from "semantic-ui-react";
import { FiAlertTriangle } from 'react-icons/fi';
import MySnackbarContentWrapper from 'components/Global/snackbar'
import 'semantic-ui-css/semantic.min.css'
import { SyncLoader } from 'react-spinners';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import {
    Button,
    Slide,
    Grow,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Snackbar
} from '@material-ui/core';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import ClienteContado from './ClienteContado';
import {useDispatch,useSelector} from 'react-redux';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import logo from './iconfinder_Close_2001866.png';
import {numberWithCommas} from 'utils/common';
import CachedIcon from '@material-ui/icons/Cached';
import RoomIcon from '@material-ui/icons/Room';
import axios from 'axios';
import { Loading } from 'components/Global/Loading';
import { APIURL } from 'utils/Enviroment';
import { verificarConexion } from 'utils/http';
import { ObtenerCoordenadas } from 'utils/common';
import{ reemplazarUrl } from 'utils/common';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { ReservadoDetalleLinea } from './ReservadoDetalleLinea';

const TransitionGrow = React.forwardRef(function Transition(props, ref) {
    return <Grow ref={ref} {...props} />;
});

const TransitionSlide = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles(theme => ({
    appBar: {
        position: 'sticky',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
}));

const SelectCliente = (props) => {
    const [open, setOpen] = useState(false);
    const [Value, setValue] = useState(null);
    const [openContado,setOpenContado] = useState(false);
    const dispatch = useDispatch();
    const clienteContado = useSelector(e=>e.clienteContado);
    const clientes = useSelector(e=>e.clientesContado);
    const Monedas = useSelector(e=>e.AbreviacionMonedas);
    const Comunidad = useSelector(e=>e.comunidadesAutonomas);
    const BloqueoCredito = useSelector(e=>e.Permisos[0].BloqueoCredito);
    const [loading,setLoading] = useState(false);
    const [mensaje,setMensaje] = useState("Cargando clientes")
    const PedidosCache = useSelector(p=>p.PedidoSincronizar);
    const clientesPedido = useSelector(c=>c.clientes);
    const clientesRecibo = useSelector(c=>c.Recibo);
    const permisos = useSelector(e=>e.Permisos[0]);
    const Configuraciones = useSelector(e=>e.Configuraciones);
    const direccionEntrega = useSelector(e=>e.direccionEntrega);
    const [openModalDirecciones,setOpenModalDirecciones] = useState(false);
    const [verPedidoPendientes, setVerPedidoPendientes] = useState(false);
    const [detalleColeccion, setDetalleColeccion] = useState([]);

    useEffect(() => {
        if (props.codigoClientePreseleccionado !== null && props.clientes.length > 0) {
            let cliente = props.clientes.find(cl => {
                return cl.Codigo === props.codigoClientePreseleccionado;
            });
            if (cliente) {
                setValue(JSON.stringify(cliente));
                props.onSelect((cliente));
            }
        }

        // eslint-disable-next-line
    }, [props.clientes]);

    useEffect(() => {
        if (props.autocompleteValue) {
            const direccionPrincipal = props.autocompleteValue.Direcciones.find(x => x.principal);
            if (direccionPrincipal) {
                dispatch({ type: "SET_DIRECCIONENTREGA", payload: direccionPrincipal });
            }
        }

    }, [props.autocompleteValue]);

    const classes = useStyles();
    let infoCliente = null;
    let FacturacionEntrega = null;
    //let empresa = localStorage.getItem('empresa');
    var alerta = false;
    //var EsVisible = false;
    var options = [];

    const mostrarAdvertencia = (title,text,type)=>{
        Swal.fire({
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Ok',
        })
    }

    const recargarClientes = async () =>{
        let isOnline = await verificarConexion();
        if (localStorage.getItem("Conexion") === "offline") {
            mostrarAdvertencia("Modo Offline", "Se encuentra en modo offline, no puede actualizar registros.", "warning");
        } else {
            if (!isOnline) {
                mostrarAdvertencia('Sin internet', 'Necesita internet para poder actualizar los registros.', 'warning');
            } else {
                setLoading(true)
                axios.get(APIURL + "/api/cliente/pedido", {
                    headers: {
                        'Authorization':
                            'Bearer ' + localStorage.getItem('token')
                    }
                }).then(data => {
                    dispatch({ type: 'STORE_CLIENTES', clientes: data.data })
                    recargarListaPrecios(data.data);
                }).catch(err => {
                    console.log(err);
                    setLoading(false)
                })
            }
        }
    }

    const recargarListaPrecios = data => {
        setMensaje("Cargando colecciones y productos")
        const listaPrecios = [...new Set(data.map(x => x.GrupoPrecio))];
        const paises = [...new Set(data.map(x => x.EmpresaId))];

        axios.get(APIURL + "/api/colecciones/listaprecios", {
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                ListaPrecios: listaPrecios,
                Paises: paises
            }
        })
            .then(data => { 
                setMensaje("Cargando Imagenes")
                let listaPrecios = data.data;
                listaPrecios.forEach(e => {
                    e.Edades.forEach(edades => {
                        edades.ProductosXEdad.forEach(prod => {
                             ///Imagenes generales del producto
                            prod.ListaImagenes.forEach(async function (img){
                                let imagenBlob = reemplazarUrl(img.FotografiaProducto,Configuraciones.UrlImages, Configuraciones.UrlImagesOffline);
                                if (imagenBlob) {
                                    img.FotografiaProducto = imagenBlob;
                                }
                            })
        
                              ///Imagenes por color del producto
                              prod.ListaColores.forEach(color => {
                                color.ListaImagenes.forEach( async function (img) {
                                    let imagenColorBlob = reemplazarUrl(img.FotografiaProducto,Configuraciones.UrlImages, Configuraciones.UrlImagesOffline);
                                    if (imagenColorBlob) {
                                        img.FotografiaProducto = imagenColorBlob;
                                    }
                                })
                            })
                        })
                    })
                })
                //setTimeout(()=>{
                    dispatch({type:'SET_LISTAPRECIOS',payload:listaPrecios});
                    setLoading(false);
                    setMensaje("Cargando clientes")
                //},75000)
              
            })
            .catch(err => {
                setLoading(false);
                console.log(err)
            });
    }

    /*const convertirBlob = async (url)=>{
        try{
            const request = await axios.get(url, { responseType: 'blob' });
            return request.data;
        }catch(err){
            return null;
        }
    }*/

    const guardarExcel = csvData => {
        const fileName = `Visitas-${props.autocompleteValue.Nombre}`;
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    const convertirHora = (time) => {
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) {
            time = time.slice(1);
            time[5] = +time[0] < 12 ? 'AM' : 'PM';
            time[0] = +time[0] % 12 || 12;
        }
        return time.join('');
    }

    const convertirData = (data) => {
        return data.map((el) => {
            const { $id, ...asignacion } = el;

            return {
                ...asignacion,
                Hora_Inicio: convertirHora(asignacion.Hora_Inicio),
                Hora_Final: convertirHora(asignacion.Hora_Final)
            }
        })
    }

    const obtenerReporteAsignaciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/asignaciones/reporte/${props.autocompleteValue.Codigo}`);

            if (request.data.length === 0) {
                mostrarAdvertencia("Asignaciones", "No se han encontrado registros para este cliente", "warning")
                return;
            }

            const dataTransformada = convertirData(request.data);
            guardarExcel(dataTransformada);
            mostrarAdvertencia("¡Documento Descargado!", "Revise su panel de notificaciones o su carpeta de descargas.", "success");
        } catch (err) {
            mostrarAdvertencia("Error", "No se pudo obtener las asignaciones", "error");
        }
    }

    const handleRecarga = ()=>{
        Swal.fire({
            title: 'Aviso',
            text: '¿Desea actualizar la información en el modulo de pedidos?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                recargarClientes();
                props.ModuloConfiguraciones();
            }
        })
    }

    const continuarPedido = () => {
        if (props.autocompleteValue.FacturacionEntrega === "Todo") {
            Swal.fire({
                title: 'Bloqueado',
                text: 'Actualmente no se tiene relación comercial con el cliente. Su cuenta ha sido bloqueada para todo tipo de transacción.',
                type: 'error',
                confirmButtonText: 'OK',
            });
        } else if (props.autocompleteValue.FacturacionEntrega === "No" && props.autocompleteValue.Credito[0].Disponible === 1) {
            Swal.fire({
                title: 'Aviso',
                text: 'El cliente no tiene credito disponible, el pedido no sera autorizado automaticamente. Comunicarse con el departamento de créditos.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    props.setCliente();
                }
            })
        } else if (props.autocompleteValue.Credito[0].Disponible <= 1  && props.autocompleteValue.FacturacionEntrega === "Factura") {
            Swal.fire({
                title: 'Aviso',
                text: 'El cliente actualmente se encuentra deshabilitado y sin credito disponible, su cuenta esta en mora. El pedido no sera autorizado automticamente.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    props.setCliente();
                }
            })
        } else if (props.autocompleteValue.Credito[0].Disponible > 1  && props.autocompleteValue.FacturacionEntrega === "Factura") {
            Swal.fire({
                title: 'Aviso',
                text: 'El cliente actualmente se encuentra deshabilitado, su cuenta esta en mora. El pedido no sera autorizado automáticamente.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.value) {
                    props.setCliente();
                }
            })
        } else {
            props.setCliente();
        }
        dispatch({ type: "SET_BODEGASELECCIONADA", payload: null });
        props.onSetTableValue({});
        props.onSetTotalPedido(0);
        props.onSetNumeroOrden(null);
        localStorage.removeItem("ColeccionSeleccionada");
    }

    const validacionPedidosCache = ()=>{
        if (PedidosCache.length > 0 && localStorage.getItem("Conexion") === "Online") {
            Swal.fire({
              title: 'Pendiente a Sincronizar',
              text: 'Tiene pedidos en bandeja de salida, debera sincronizar para poder registrar un nuevo pedido.',
              type: 'error',
              confirmButtonText: 'OK',
          });
        }
        else{
            continuarPedido();
        }
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleOnChange = (value) => {
        var val = JSON.parse(value);

        setValue(value);
        props.onSelect(val);
        dispatch({type:'DELETE_CLIENTECONTADO'});
        dispatch({type:'DELETE_REQUIEREENTREGA'});
        dispatch({type:'DELETE_FLETE'});
        localStorage.setItem('Impuesto',0);
    }

    props.clientes.forEach(el => {
        var cliente = { key: el.Codigo, value: JSON.stringify(el), text: el.Codigo + ' - ' + el.Nombre }
        options.push(cliente);
    })

    if(props.autocompleteValue != null && props.autocompleteValue.FacturacionEntrega === "Todo"){
        FacturacionEntrega = (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <FiAlertTriangle style={{ fontSize: '20px', color: 'red' }} />  El cliente actualmente se encuentra bloqueado.
            </div>
        )

        if (props.autocompleteValue !== null && props.autocompleteValue !== false) {
            alerta = true;
        }
    }

    if(props.autocompleteValue != null && props.autocompleteValue.FacturacionEntrega === "Factura"){
        FacturacionEntrega = (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <FiAlertTriangle style={{ fontSize: '20px', color: 'red' }} />  El cliente actualmente se encuentra deshabilitado por mora.
            </div>
        )

        if (props.autocompleteValue !== null && props.autocompleteValue !== false) {
            alerta = true;
        }
    }

    const mensajeError = () => {
        if (props.autocompleteValue !== null) {
            if (props.autocompleteValue.FacturacionEntrega === "Todo") return "El cliente actualmente se encuentra bloqueado.";
            if (props.autocompleteValue.FacturacionEntrega === "Factura") return "El cliente actualmente se encuentra deshabilitado por mora.";
        }
    }

    const actualizarCoordenadasPedido = (longitud, latitud) => {
        let copiaClientes = clientesPedido;
        let indice = copiaClientes.map(x => x.Codigo).indexOf(props.autocompleteValue.Codigo);
        copiaClientes[indice].Longitud = longitud;
        copiaClientes[indice].Latitud = latitud;
        props.refrescarClienteSeleccionado(copiaClientes[indice]);
        setValue(JSON.stringify(copiaClientes[indice]));
        dispatch({ type: 'STORE_CLIENTES', clientes: copiaClientes });
    }

    const actualizarCoordenadasRecibo = (longitud, latitud) => {
        let copiaClientes = clientesRecibo.clientes;
        let indice = copiaClientes.map(x => x.Codigo).indexOf(props.autocompleteValue.Codigo);
        copiaClientes[indice].Longitud = longitud;
        copiaClientes[indice].Latitud = latitud;
        dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: copiaClientes });
    }

    const actualizarData = request => {
        const { latitud, longitud } = request.data;
        actualizarCoordenadasPedido(longitud, latitud);
        actualizarCoordenadasRecibo(longitud, latitud);
    }

    const enviarCoordenadasApi = async (coor) => {
        try {
            const data = {
                cliente: props.autocompleteValue.Codigo,
                latitud: coor.latitude,
                longitud: coor.longitude
            }
            const request = await axios.post(`${APIURL}/api/cliente/coordenadas`, data);
            actualizarData(request);
            Swal.fire({
                title: 'Confirmado',
                text: "Coordenadas del cliente han sido actualizadas con éxito.",
                type: 'success',
                confirmButtonText: 'OK',
            });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: "Ha ocurrido un error y no se pudo obtener las coordenadas.",
                type: 'error',
                confirmButtonText: 'OK',
            });
        }
    }

    const mensajeErrorCoordenadas = () => {
        Swal.fire({
            title: 'Error',
            text: "Ha ocurrido un error y no se pudo obtener las coordenadas.",
            type: 'error',
            confirmButtonText: 'OK',
        });
    }

    const confirmacionCoordenadas = async () => {
        let isOnline = await verificarConexion();
        if (localStorage.getItem("Conexion") === "Online" && isOnline) {
            Swal.fire({
                title: 'Confirmar',
                text: `¿Está seguro de realizar el pinneo en la ubicacón actual?`,
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#06bf53',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí',
                cancelButtonText: 'No',
            }).then((result) => {
                if (result.value) {
                    ObtenerCoordenadas((position) => {
                        enviarCoordenadasApi({
                            longitude: position.coords.longitude,
                            latitude: position.coords.latitude
                        })
                    }, (error) => {
                        Swal.fire({
                            title: 'Error',
                            text: "Ha ocurrido un error y no se pudo obtener las coordenadas.",
                            type: 'error',
                            confirmButtonText: 'OK',
                        });
                    });
                }
            })
        } else {
            mostrarAdvertencia("Modo Offline", "Se encuentra en modo offline, no puede actualizar registros.", "warning");
        }
    }

    const verificarObtencionCoordenadas = () => {
        navigator.permissions.query({ name: 'geolocation' }).then(res => {
            if (res.state === "granted") {
                confirmacionCoordenadas();
            } else {
                Swal.fire({
                    title: 'Advertencia',
                    text: "Habilite la geoposición en su dispositivo para realizar esta acción.",
                    type: 'warning',
                    confirmButtonText: 'OK',
                });
            }
        }).catch(err => {
            mensajeErrorCoordenadas()
        })
    }

    /*if (props.autocompleteValue != null && props.autocompleteValue.EmpresaId.toUpperCase() !== empresa.toUpperCase() && props.autocompleteValue !== false) {
        EsVisible = true;
    }*/

    const reservadoCliente = () => {
        if (props.autocompleteValue.ReservadoClientePorLinea && props.autocompleteValue.ReservadoClientePorLinea.length === 0) {
            return <h5 style={{ textAlign: "center", marginTop: 10 }}>Sin pedidos pendientes de facturar.</h5>
        }

        let Abreviacion = props.autocompleteValue.Moneda ? Monedas.find(e => e.IdMoneda === props.autocompleteValue.Moneda) ? Monedas.find(e => e.IdMoneda === props.autocompleteValue.Moneda).Abreviacion : "" : "";

        return (
            <><span className={styles["TCenterContainer"]}>
                <h5 className={styles["TCenter"]}>Pendiente Facturación</h5>
            </span>
                <table className="table table-responsive-xl">
                    <thead>
                        <tr>
                            <th>Linea</th>
                            <th>Monto</th>
                            <th>Unidades</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.autocompleteValue.ReservadoClientePorLinea.map((reservado, index) => {

                            return (
                                <tr key={index}>
                                    <td>{reservado.Linea}</td>
                                    <td>{numberWithCommas(reservado.MontoPendiente)}</td>
                                    <td>{numberWithCommas(reservado.UnidadesPendientes)}</td>
                                    <td> <button onClick={() => { setVerPedidoPendientes(true); setDetalleColeccion(reservado) }} style={{ display: "block" }} className="btn btn-secondary">Ver detalle</button></td>

                                </tr>
                            )
                        })}
                        <tr>
                            <td><b>Total Reservado</b></td>
                            <td >{Abreviacion} {numberWithCommas(props.autocompleteValue.ReservadoClientePorLinea.reduce((prev, curr) => prev + curr.MontoPendiente, 0))}</td>
                            <td >{numberWithCommas(props.autocompleteValue.ReservadoClientePorLinea.reduce((prev, curr) => prev + curr.UnidadesPendientes, 0))}</td>
                            <td></td>
                        </tr>
                        <tr>
                        <td style={{color:"red"}}><b>VALORES DE LOS PEDIDOS NO INCLUYEN ISV.</b></td>
                        </tr>
                    </tbody>
                </table>
                        
                <ReservadoDetalleLinea open={verPedidoPendientes} detalle={detalleColeccion} close={()=>{setVerPedidoPendientes(false)}} abreviacion={Abreviacion} />

            </>)
    }

    if (props.autocompleteValue) {
        let DisponibleTotal = 0;
        let ValorCreditoTotal = 0;
        let CXCTotal = 0;
        let Depto = props.autocompleteValue.ComunidadAutonoma? Comunidad.find(x=>x.STATEID===props.autocompleteValue.ComunidadAutonoma) ? Comunidad.find(x=>x.STATEID===props.autocompleteValue.ComunidadAutonoma).NAME : '' : '';
        let Abreviacion = props.autocompleteValue.Moneda ? Monedas.find(e=>e.IdMoneda === props.autocompleteValue.Moneda) ? Monedas.find(e=>e.IdMoneda === props.autocompleteValue.Moneda).Abreviacion : "" : "";
        infoCliente = (
            <Card>
                <CardContent>
                    <div className="row">
                        <div className="col-md-6">
                            <span className={styles["TCenterContainer"]}>
                                <h5 className={styles["TCenter"]}>Información General</h5>
                            </span>
                            <table className='table table-responsive-xl' style={{ border: "none" }}>
                                <tbody>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Codigo: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Codigo}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Nombre:'}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Nombre}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Conocido como:'}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Alias}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Bloqueo Crediticio: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.FacturacionEntrega}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Grupo Precios: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {`${props.autocompleteValue.GrupoPrecio} - ${props.autocompleteValue.NombreGrupoPrecio}`}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel} >
                                            {'Departamento: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Departamento}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel} >
                                            {'Ciudad: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Ciudad}
                                        </td>
                                    </tr>                                                                        
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Dirección: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Direccion}</td>
                                    </tr>
                                    {(permisos.AsesoresUsuario.length === 1 ) &&
                                        <tr>
                                            <td className={styles.InfoLabel}>
                                                Pinear Coordenada
                                            </td>
                                            <td className={styles.InfoLabelDetail}>
                                                <Button style={{ marginLeft: 15 }} onClick={verificarObtencionCoordenadas} variant="contained" color="primary">Guardar <RoomIcon /></Button>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </table>

                            <div>
                                {FacturacionEntrega}
                            </div>

                        </div>
                        {(!BloqueoCredito) &&
                        <div className="col-md-6">
                            <span className={styles["TCenterContainer"]}>
                                <h5 className={styles["TCenter"]}>Información Crediticia</h5>
                            </span>                           
                            <table className="table table-responsive-xl">
                                <thead>
                                    <tr>
                                        <th>
                                            Tipo
                                    </th>
                                        <th>
                                            Valor Credito
                                    </th>
                                    <th>
                                            Saldo CxC
                                    </th>
                                        <th>
                                            Disponible
                                    </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.autocompleteValue.Credito.map((credito, index) => {
                                        DisponibleTotal = DisponibleTotal + credito.Disponible;
                                        ValorCreditoTotal = ValorCreditoTotal + credito.Valor;
                                        CXCTotal = CXCTotal + credito.SaldoTotal;
                                        return (
                                            <tr key={index}>

                                                <td>{credito.Tipo}</td>
                                                <td style={{color:credito.Valor>0?'green':'red'}}>{credito.Valor ? numberWithCommas(credito.Valor) : 0}</td>
                                                <td>{credito.SaldoTotal ? numberWithCommas(credito.SaldoTotal) : 0}</td>
                                                <td style={{color:credito.Disponible>0?'green':'red'}}>{credito.Disponible ? numberWithCommas(credito.Disponible) : 0}</td>
                                            </tr>
                                        )
                                    })}
                                    <tr>
                                        <td>{<b>Total</b>}</td>
                                        <td style={{color:parseFloat(numberWithCommas(ValorCreditoTotal))>0?'green':'red'}}>{Abreviacion} {numberWithCommas(ValorCreditoTotal)}</td>
                                        <td>{Abreviacion} {numberWithCommas(CXCTotal)}</td>
                                        <td style={{color:parseFloat(numberWithCommas(DisponibleTotal))>0?'green':'red'}}>{Abreviacion} {numberWithCommas(DisponibleTotal)}</td>
                                    </tr>
                                    <tr>
                                        {props.autocompleteValue.Nombre.includes('CONSUMIDOR FINAL') && <td><Button onClick={()=>setOpenContado(true)} variant="contained" color="primary">{(clienteContado===null)?'Crear cliente contado':'Editar cliente contado'}</Button></td>}
                                        {props.autocompleteValue.Nombre.includes('CONSUMIDOR FINAL') && <td>
                                        <Dropdown
                                                placeholder="Seleccione cliente contado"
                                                fluid
                                                search
                                                selection
                                                onChange={(e, { value }) =>{
                                                    let cliente = clientes.find(x=>x.id===value);
                                                    dispatch({type:'SET_CLIENTECONTADO',payload:cliente});
                                                }}
                                                options={clientes.map(cliente => {
                                                    return {key:cliente.id, value:cliente.id,text:cliente.Nombre}
                                                })}
                                                noResultsMessage={"No hay resultados"}
                                                closeOnChange={true}
                                        />
                                            </td>}
                                        {props.autocompleteValue.Nombre.includes('CONSUMIDOR FINAL') && <td>Cliente Seleccionado: {clienteContado===null?'Ninguno':clienteContado.Nombre}</td>}
                                    </tr>
                                </tbody>
                            </table>
                            <div>
                                <span className={styles["TCenterContainer"]}>
                                    <h5 className={styles["TCenter"]}>Reporte visitas</h5>
                                </span>
                                <button onClick={obtenerReporteAsignaciones} style={{ display: "block" }} className="btn btn-secondary">Generar reporte</button>
                            </div>
                            <div className='mt-5'>

                            {reservadoCliente()}
                            </div>
                        </div>}
                        
                        
                            
                                       
                    </div>

                </CardContent>
            </Card>
        );
    }
    return (
        <>
        {
            PedidosCache.length > 0 && localStorage.getItem("Conexion") === "Online" &&
            <div style={{ textAlign: 'center', fontSize: '24px' }} className="alert alert-danger alert-dismissible fade show" role="alert">
                <FiAlertTriangle style={{ fontSize: '28px', color: 'red' }} /> Tiene pedidos en bandeja de salida, necesita sincronizar para poder registrar un nuevo pedido.
            </div>
        }
        <div className="col">
            <Dialog
            disableBackdropClick 
            scroll={'paper'}
            open={openContado}
            >
                <img alt="closeicon" src={logo} style={{width:'30px',height:'30px',marginLeft:'500px'}} onClick={()=>{setOpenContado(false)}}/>
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Cliente Contado
                    </div>
                </DialogTitle>
                <DialogContent>
                
                   { props.autocompleteValue!==null && <ClienteContado cliente={clienteContado} validacion={false}/>}
                    
                </DialogContent>
        </Dialog>
            <Card style={{ overflow: 'unset' }}>

                <CardContent>
                    <div className="row mt-2">
                        <div className="col">
                            <h5 className="font-weight-light">
                                Nuevo Pedido
                                </h5>
                            <hr />
                        </div>
                    </div>
                    <div className={'row mb-3'}>
                        <div className={'col-xl-10 col-lg-10 col-sm-9 col-12 mt-2'} >
                            <Dropdown
                                className="Holis"
                                placeholder="Ingrese Cliente"
                                fluid
                                search
                                selection
                                onChange={(e, { value }) => handleOnChange(value)}
                                options={options}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                                value={Value}
                            />
                        </div>

                        <div className={'col-xl-2 col-lg-2 col-sm-3 col-12 mt-2 text-lg-left text-right'}>
                            <Button
                                disabled={props.autocompleteValue ? false : true}
                                onClick={validacionPedidosCache}
                                variant="contained"
                                color="primary">
                                Continuar
                                </Button>
                                <Button style={{marginLeft:15}} onClick={handleRecarga} variant="contained" color="primary"><CachedIcon/></Button>
                        </div>
                    </div>

                        {(props.autocompleteValue && direccionEntrega) && (<div className={'row mt-3'}>
                            <div className={'col-xl-10 col-lg-10 col-sm-9 col-12 mt-2'} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <p><b>Dirección Entrega: </b> <b>{direccionEntrega.nombreDireccion}</b> - {direccionEntrega.direccion} </p>
                            </div>
                            <div className={'col-xl-2 col-lg-2 col-sm-3 col-12 mt-2 text-lg-left text-right'}>
                                <Button style={{ marginLeft: 15 }} onClick={() => setOpenModalDirecciones(true)} variant="contained" color="primary">Cambiar dirección entrega</Button>
                            </div>
                        </div>)}

                </CardContent>


            </Card>

            {/* <div>
                        <SignatureCanvas canvasProps={{width: 400, height: 400, className: 'sigCanvas'}}
                            ref={sigPad} />
                    </div> */}
            <div style={{ textAlign: "center", marginTop: '25px' }}>
                <SyncLoader
                    size={20}
                    color={'#31547C'}
                    loading={props.loading} />
            </div>
            {infoCliente}

            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} style={{ zIndex: 10 }} open={alerta} TransitionComponent={TransitionGrow}>
                <MySnackbarContentWrapper
                    variant="error"
                    message={mensajeError()}
                />
                </Snackbar>

            {/*<Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} style={{ zIndex: 10 }} open={EsVisible} TransitionComponent={TransitionGrow}>
                        <MySnackbarContentWrapper
                            variant="error"
                            message="El cliente seleccionado no pertenece a su pais"
                        />
                </Snackbar>*/}

            {
                props.autocompleteValue &&
                <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={TransitionSlide}>
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" className={classes.title}>
                                Histórico
                            </Typography>
                            <Button color="inherit" onClick={handleClose}>
                                Cerrar
                            </Button>
                        </Toolbar>
                    </AppBar>

                    <Historico nombre={props.autocompleteValue.Nombre} />

                </Dialog>
            }
            <Loading open={loading} title={mensaje}/>
            <ModalDirecciones cerrar={()=>setOpenModalDirecciones(false)} open={openModalDirecciones} direcciones={props.autocompleteValue == null?[]:props.autocompleteValue.Direcciones}/>
        </div>
        </>
    );
}

const ModalDirecciones = ({ open, direcciones, cerrar }) => {
    const dispatch = useDispatch();

    const onClickDireccion = (e) => {
        dispatch({ type: "SET_DIRECCIONENTREGA", payload: e });
        cerrar();
    }

    return (
        <Dialog
            scroll={'paper'}
            open={open}
            onClose={cerrar}
        >
            <DialogTitle className="text-center" id="scroll-dialog-title">
                <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Seleccionar dirección entrega
                </div>
            </DialogTitle>
            <DialogContent>

                <div style={{ width: '100%' }}>
                    <div style={{ display: 'inline-block' }}>
                        <ul className="list-group">
                            {direcciones.map(x => (<li style={{ cursor: 'pointer' }} onClick={() => onClickDireccion(x)} className={`list-group-item d-flex justify-content-between align-items-center mt-3`} key={x.postalAddress}>
                                <div>
                                    <p><b>Nombre dirección:</b> {x.nombreDireccion}</p>
                                    <p><b>Dirección:</b> {x.direccion}</p>
                                    <p><b>Tipo:</b> {x.principal ? "Principal" : "Secundaria"}</p>
                                </div>
                            </li>))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default SelectCliente;



