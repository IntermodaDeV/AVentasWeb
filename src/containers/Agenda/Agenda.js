import React, { Fragment, Component } from 'react';
import Calendar from 'components/Agenda/Calendar';
import { ClipLoader } from 'react-spinners';
import GoogleMapReact from 'google-map-react';
import { ScaleLoader } from 'react-spinners';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import TextField from '@material-ui/core/TextField';
import { APIURL } from 'utils/Enviroment';
import FacturasModal from "components/Recibos/FacturasModal/FacturasModal";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import styles from 'containers/Agenda/Agenda.module.css';
import 'containers/Agenda/Agenda.css';
import moment from "moment";
import { connect } from 'react-redux';
import { IsAllow, PermisoAdministradorVisita } from 'components/Seguridad/Permisos';
import { get, verificarConexion } from 'utils/http';
import axios from 'axios';
import { ObtenerCoordenadas } from 'utils/common';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { useSelector } from 'react-redux';
moment.locale('es');



class Agenda extends Component {
    urlApi = APIURL;
    state = {
        TiemposFuera:[],
        Asignaciones: [],
        Configuraciones : [],
        mostrarAcciones: true,
        isLoaded: false,
        Eventos: [],
        mostarEvento: false,
        isModalLoaded: false,
        ShowModalFacturas: false,
        DataModalFacturas: [],
        Acciones: [
            { Accion: "Pedidos", IdAccion: 1, Orden: 1, UrlRedirect: "/Pedidos", Estado: true },
            { Accion: "Recibos", IdAccion: 2, Orden: 2, UrlRedirect: "/Recibos", Estado: true },
            { Accion: "Devoluciones", IdAccion: 3, Orden: 3, UrlRedirect: "/devolucion", Estado: true },
            { Accion: "Promesas de Pago", IdAccion: 4, Orden: 4, UrlRedirect: null, Estado: true },
        ],
        map: null,
        maps: null,
        noAtendido: false,
        tipo: null,
        tipoSelected: false,
        razon: null,
        razonSelected: false,
        Observacion: '',
        guardandoRazon: false,
        estadoFacturasClienteActivo: null,
        mostarNoAtendido: false,
        IdAsignacion: 0,
        checkin: null,
        checkout: null,
        Asesores: [],
        AsesorSelected: null,
        OpenModalAsesor: false,
        OpenModalPromesaPago: false,
        date: new Date(),
        valorPago: 0,
        OpenModalNoVenta: false,
        RazonNoVenta: [],
        NoVentaSelected: null,
        ComentarioRazonNoVenta: ''
    }

    myRef = React.createRef();
    refCoordenadas = React.createRef();


    cargarAsesores = () => {
        let asesores = this.props.Permisos[0].AsesoresUsuario.map(s => s.Usuario);
        this.setState({
            Asesores: asesores,
            AsesorSelected: asesores[0],
        });
    }

    cargarEmpresas = () => {
        fetch(`${this.urlApi}/api/empresa/empresas`)
            .then(res => res.json())
            .then(data => { this.props.onSaveEmpresas(data) })
            .catch(error => console.log(error))
    }

    cargarClientesContado = () => {
        fetch(`${APIURL}/api/clientecontado/${localStorage.getItem('codigo')}`)
            .then(res => res.json())
            .then(data => { this.props.onSaveClientesContado(data) })
            .catch(error => console.log(error))
    }

    cargarMonedas = () => {
        fetch(`${this.urlApi}/api/moneda`)
            .then(res => res.json())
            .then(data => { this.props.onSaveMonedas(data) })
            .catch(error => console.log(error))
    }

    obtenerClientesUnicos = data => {
        let clientes = [];

        let noExistenAsignaciones = data.length === 0;
        if (noExistenAsignaciones) {
            return [];
        }

        for (let dia of data) {
            for (let asignacion of dia.asignaciones) {
                const existeCliente = clientes.find(x => x.Codigo === asignacion.cliente);
                if (existeCliente===undefined) {
                    clientes.push({ Codigo: asignacion.cliente, Nombre: asignacion.NombreCliente, Latitud: asignacion.Latitud, Longitud: asignacion.Longitud,Asesor:this.state.AsesorSelected })
                }
            }
        }

        this.setState((prev) => ({ ...prev, clientes: clientes }))
    }

    cargarAsignaciones = async () => {
        try {
            let { Inicio, Fin } = this.getFechas(1);
            let request = await axios.get(`${this.urlApi}/api/Asignaciones`, {
                params: { FechaInicio: Inicio, FechaFin: Fin, Asesor: this.state.AsesorSelected }, headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token'),
                }
            });
            let eventos = this.setAsignaciones(request.data);
            this.setState({
                Asignaciones: request.data,
                ShowTable: true,
                isLoaded: true,
                Eventos: eventos,
            });
        } catch (err) {

        }
    }

    obtenerTiemposFueraAsesorDia = async () => {
        try {
            const asesor = localStorage.getItem("codigo");
            const request = await axios.get(`${APIURL}/api/tiemposfuera/diario/${asesor}`);
            this.setState(prev => ({ ...prev, TiemposFuera: request.data }))
        } catch (err) {

        }
    }

    cargarClientes = async (clientes) => {
        try {
            let request = await axios.get(`${this.urlApi}/api/cliente/agenda`, {
                params: { clientes }, headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token'),
                }
            });
            this.setState((prev) => ({ ...prev, clientes: request.data }))
        } catch (err) {
            this.setState({
                error: true
            });
        }
    }

    cargarAsignacionesConClientes = async () => {
        try {
            let { Inicio, Fin } = this.getFechas(1);
            let request = await axios.get(`${this.urlApi}/api/Asignaciones`, {
                params: { FechaInicio: Inicio, FechaFin: Fin, Asesor: this.state.AsesorSelected }, headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token'),
                }
            });
            this.obtenerClientesUnicos(request.data);
            let eventos = this.setAsignaciones(request.data);
            this.setState({
                Asignaciones: request.data,
                ShowTable: true,
                isLoaded: true,
                Eventos: eventos,
            });
        } catch (err) {

        }
    }

    cargarRazonNoVenta = async () => {

        fetch(this.urlApi + `/api/RazonNoVenta`, {
            headers: {
                'Authorization':
                    'Bearer ' + localStorage.getItem('token'),
            }
        })
            .then(res => {
                if (res.status === 200) {

                    res.json()
                        .then(
                            (result) => {
                                this.setState({
                                    CausaNoVenta: result
                                });
                            },
                        )
                }

            })
    }

    cargarListadoRazonNoVenta = async () => {
        const { data/*, error*/ } = await get(`${this.urlApi}/api/razonnoventa/listado`);
        this.setState({ RazonNoVenta: data });

    }

    enviarCheckinApi = async (location, check) => {
        const existeTiempoAbierto = this.state.TiemposFuera.find(x => x.horaSalida === null);
        if (existeTiempoAbierto) {
            alert("Cerrar tiempos fuera de agenda abiertos.");
            return;
        }

        const isOnline = await verificarConexion();
        if (!isOnline || localStorage.getItem("Conexion") === "offline") {
            Swal.fire({
                title: "Sin internet",
                text: "Necesita internet para poder realizar esta accion.",
                type: "warning",
                confirmButtonText: 'Ok',
            });
        } else if (localStorage.getItem("Conexion") === "Online" && isOnline) {
            const fechas = this.getFechas(2);

            const parametros = {
                IdAsignacionxAsesor: this.state.IdAsignacion,
                location: location,
                Fecha: new Date(),
                Asesor: localStorage.getItem('codigo'),
                Inicio: fechas.Inicio,
                Fin: fechas.Fin,
                origen: "web"
            }

            fetch(`${this.urlApi}/api/Asignaciones/${check}`, {
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(parametros),
                method: "POST"
            }).then(res => {
                if (res.status === 200) {
                    res.json()
                        .then(resultado => {
                            Swal.fire({
                                title: 'Confirmado',
                                text: resultado.Message,
                                type: 'success',
                                confirmButtonText: 'Ok',
                                target: this.myRef.current
                            })
                        });

                    this.cargarAsignaciones();

                }

                if (res.status === 400) {
                    res.json()
                        .then(resultado => {
                            Swal.fire({
                                title: 'Error',
                                text: resultado.Message,
                                type: 'error',
                                confirmButtonText: 'Ok',
                                target: this.myRef.current
                            })
                        });
                }
            })
        }
    }

    alertPromesaPago =  (success, msjAsignacion) => {

        if (success) {
            return '<div style="background-color:#ABBAEA; border-radius: 0.5rem; padding: 20px 20px;"> <b> <FONT COLOR="black">' + msjAsignacion + '</FONT> </b> </div>';
        }
        return '<div style="background-color:red; border-radius: 0.5rem; padding: 20px 20px;"> <b> <FONT COLOR="white">' + msjAsignacion + ' </FONT> </b> </div>';
    }


    enviarPromesaPago = async () => {
        try {
            this.setState({ OpenModalPromesaPago: false, date: new Date(), valorPago: 0 })
            let postBody = {
                IdAsignacionXAsesor: this.state.IdAsignacion,
                FechaPromesa: this.state.date,
                Valor: this.state.valorPago,
            }

            await axios.post(`${APIURL}/api/promesaPago/crear`, postBody, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
            }).then((response) => {

                console.log(this.alertPromesaPago(response.data.success, response.data.msjAsignacion).toString())

                Swal.fire({
                    title: 'Registro Guardado',
                    html: response.data.msjPromesa + '<br>' +  this.alertPromesaPago(response.data.success, response.data.msjAsignacion).toString(),
                    type: 'success',
                    confirmButtonText: 'Ok',
                    target: this.myRef.current
                })
            });

        } catch (err) {
            console.log("err", err)
            Swal.fire({
                title: 'Error',
                text: err.response.data.Message,
                type: 'error',
                confirmButtonText: 'Ok',
                target: this.myRef.current
            })
        }
    }


    enviarRazonesNoVenta = async () => {
        try {
            this.setState({ OpenModalNoVenta: false, NoVentaSelected: null, ComentarioRazonNoVenta: '' })
            let postBody = {
                IdAsignacionXAsesor: this.state.IdAsignacion,
                IdRazonNoVenta: this.state.NoVentaSelected,
                Comentarios: this.state.ComentarioRazonNoVenta,
            }

            await axios.post(`${APIURL}/api/bitacoraRazonNoVenta/crear`, postBody, {
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
            });
            this.enviarCheckin("checkout")
        } catch (err) {
            console.log("err", err)
            Swal.fire({
                title: 'Error',
                text: err.response.data.Message,
                type: 'error',
                confirmButtonText: 'Ok',
                target: this.myRef.current
            })
        }
    }

    enviarCheckin = (check) => {
        ObtenerCoordenadas((position) => {
            this.enviarCheckinApi({
                longitude: position.coords.longitude,
                latitude: position.coords.latitude
            }, check)
        }, (error) => {
            this.enviarCheckinApi(null, check);
        });
    }

    getFechas = (meses) => {
        var actual = new Date();
        var inicio = new Date(actual.getFullYear(), actual.getMonth(), 1);
        var mesesdespues = new Date(inicio);
        mesesdespues = new Date(mesesdespues.setMonth(mesesdespues.getMonth() + meses));
        var fin = new Date(mesesdespues - 1);

        return { Inicio: moment(inicio).format(), Fin: moment(fin).format() }
    }


    renderMarkers() {
        if (this.state.map !== null) {
            let map = this.state.map;

            let infowindow = new this.state.maps.InfoWindow({
                content: this.state.clienteActivo.nombre,
            });
            let marker = new this.state.maps.Marker({
                position: {
                    lat: this.state.clienteActivo.latitud,
                    lng: this.state.clienteActivo.longitud,
                },
                // label: cliente.Nombre,
                map: map,
                title: this.state.clienteActivo.nombre
            });
            marker.addListener('click', function () {
                infowindow.open(map, marker);
            });
            map.addListener('click', function () {
                infowindow.close();
            });
        }

    }
    setMapsApi = (map, maps) => {
        this.setState({ map, maps });
        this.renderMarkers();
    }

    setAsignaciones = (asignaciones) => {
        var eventos = [];
        let tareas = [];

        asignaciones.map(dia => {
            // eslint-disable-next-line
            dia.asignaciones.map(asignacion => {
                if (asignacion.Asesor === this.state.AsesorSelected) {
                    let prioridad = asignacion.IdPrioridad;
                    let textColor = 'white';
                    let color = asignacion.ColorRelleno;
                    let fechainicio = moment(asignacion.HoraInicio).format();
                    let fechaFin = moment(asignacion.HoraFin).format();
                    let cliente = asignacion.cliente;
                    let latitud = 0;
                    let longitud = 0;
                    let IdAsignacion = asignacion.IdAsignacionxAsesor;
                    let objetoCliente = {};
                    let Checkin = asignacion.Checkin;
                    let Checkout = asignacion.Checkout;
                    let EsPromesaPago = (asignacion.EsPromesaPago) ? "============= VISITA PROMESA PAGO =============" : "";


                    this.state.clientes.some(clien => {

                        if (clien.Codigo === asignacion.cliente) {
                            if (!(clien.FacturacionEntrega === "No" || clien.FacturacionEntrega === "Nunca")) {
                                cliente = "⚠ " + clien.Nombre;
                            }
                            else {
                                cliente = clien.Nombre;
                            }
                            objetoCliente = { ...clien }
                            latitud = clien.Latitud;
                            longitud = clien.Longitud;
                            return true
                        }
                        return false;
                    })

                    var evento = {
                        title: cliente + EsPromesaPago,
                        start: fechainicio,
                        end: fechaFin,
                        textColor: textColor,
                        color: color,
                        extendedProps: {
                            Codigo: asignacion.cliente,
                            Longitud: longitud,
                            Latitud: latitud,
                            IdAsignacion: IdAsignacion,
                            Prioridad: prioridad,
                            Checkin,
                            Checkout
                        },
                        cliente: objetoCliente
                    }

                    let tarea = {
                        Codigo: asignacion.cliente,
                        IdAsignacion: IdAsignacion,
                        Checkin,
                        Checkout,
                        CheckinApi: Checkin,
                        CheckoutApi: Checkout,
                        Bloqueo: Checkout,
                        fechaIngreso: fechainicio
                    }

                    tareas.push(tarea);
                    eventos.push(evento);
                    return false;
                }
            })
            return false;
        })
        this.props.onSaveAsignaciones(tareas);
        return eventos;
    }

    onClickEvento = (info) => {
        let prioridad;

        switch (info.event.extendedProps.Prioridad) {
            case 1:
                prioridad = "Baja";
                break;
            case 2:
                prioridad = "Media";
                break;
            case 3:
                prioridad = "Alta";
                break;

            default:
                prioridad = "Baja";
                break;
        }

        this.setState((prevState) => ({
            ...prevState,
            IdAsignacion: info.event.extendedProps.IdAsignacion,
            checkin: info.event.extendedProps.Checkin,
            checkout: info.event.extendedProps.Checkout
        }));

        let clienteActivo = {
            nombre: info.event.title,
            fechaFin: moment(info.event.end).format("DD/MM/YYYY hh:mm A"),
            fechaInicio: moment(info.event.start).format("DD/MM/YYYY hh:mm A"),
            codigo: info.event.extendedProps.Codigo,
            latitud: info.event.extendedProps.Latitud,
            longitud: info.event.extendedProps.Longitud,
            IdAsignacion: info.event.extendedProps.IdAsignacion,
            prioridad: prioridad,
            color: info.el.style.backgroundColor,
            cliente: info.event.extendedProps.cliente
        };
        let showAcciones = true;
        if (moment(info.event.end).toDate() < new Date()) {
            showAcciones = false;
        }
        this.setState({
            mostarEvento: true,
            mostrarAcciones: showAcciones,
            noAtendido: false,
            tipoSelected: false,
            razonSelected: false,
            tipo: null,
            razon: null,
            Observacion: '',
            clienteActivo: clienteActivo,
            ComentarioRazonNoVenta: ''
        });

        this.setState({
            isModalLoaded: true
        });
    }

    onClickModal = (route, codigo) => {
        this.props.history.push(route, { CodigoCliente: codigo });
    }

    OpenModalFacturas = (futuras) => {
        let DataModal = [];
        this.state.clienteActivo.cliente.AcuerdosXTipoPedido.forEach(acuXTipPed => {
            acuXTipPed.Acuerdos.forEach(acu => {
                acu.Facturas.forEach(fact => {
                    fact.Cuotas.forEach(cuot => {
                        let vencio = true;
                        if (futuras) {
                            vencio = moment(cuot.FechaVencimiento).isBetween(moment(), moment().add(15, 'day'), 'days');
                        } else {
                            vencio = (moment().isAfter(cuot.FechaVencimiento, 'days')) || moment().isSame(cuot.FechaVencimiento, 'days')
                        }
                        if (cuot.Saldo > 0 && vencio) {
                            DataModal.push({
                                Tipo: cuot.TipoDocumento,
                                NumeroFactura: fact.Factura,
                                Fecha: moment(cuot.Factura.FechaFactura).format("DD/MM/YYYY"),
                                Vencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),
                                Dias: moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days'),
                                FechaDescuento: moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY"),
                                DiasDescuento: moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days') + 1,
                                Valor: cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                                Saldo: cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                            });
                        }
                    });
                });
            });
        });


        this.setState({
            ShowModalFacturas: true,
            DataModalFacturas: DataModal,
        });
    }
    CloseModalFacturas = (state) => {

        this.setState({
            ShowModalFacturas: state,
        });
    }

    onClickAsignacion = () => {
        this.props.history.push("/Asignacion");
    }
    onClickAsesores = () => {
        this.setState({ OpenModalAsesor: true });
    }
    onCloseModalAtendido = () => {
        let noAtendido = false;
        if (!this.state.noAtendido) {
            noAtendido = true;
        }

        this.state.isModalLoaded && this.setState({ mostarNoAtendido: false, noAtendido: noAtendido, })
    }

    onClickAgenda = (info) => {
        info.dayEl.style.backgroundColor = '#ddd';
    }

    opcionTipos = () => {
        const opciones = [];

        this.state.CausaNoVenta.map((tipo) => {
            let opcion = (
                <MenuItem key={tipo.IdRazonNoVentaTipo} value={tipo.IdRazonNoVentaTipo}>{tipo.Tipo}</MenuItem>
            )
            opciones.push(opcion);
            return false;
        });
        return opciones
    }

    opcionRazonNoVenta = () => {
        const opciones = [];
        this.state.RazonNoVenta.filter(x => x.Activo === true).map((razon) => {
            let opcion = (
                <MenuItem key={razon.razonId} value={razon.razonId}>{razon.RazonNoVenta}</MenuItem>
            )
            opciones.push(opcion);
            return false;
        });
        return opciones
    }

    opcionAsesores = () => {
        const opciones = [];

        this.state.Asesores.map((ase, index) => {

            let opcion = (
                <MenuItem key={ase} value={ase}>{ase}</MenuItem>
            )
            opciones.push(opcion);
            return false;
        });
        return opciones
    }

    opcionCausas = () => {
        const opciones = [];

        this.state.CausaNoVenta.map((tipo) => {

            if (tipo.IdRazonNoVentaTipo === this.state.tipo) {
                let Razones = tipo.RazonesNoVenta;
                Razones.map((razon) => {
                    let opcion = (
                        <MenuItem key={razon.IdRazonNoVentaCausa} value={razon.IdRazonNoVentaCausa}>{razon.Causa}</MenuItem>
                    )

                    opciones.push(opcion);
                    return false;
                })
            }
            return false;
        });
        return opciones
    }

    onChangeAsesor = () => {
        /*this.cargarClientes();
        var eventos = this.setAsignaciones(this.state.Asignaciones);
        this.setState({
            Eventos: eventos,
            OpenModalAsesor: false,
            clienteActivo : false
        })*/
        this.cargarAsignacionesConClientes();
    }

    handleOnChangeAsesor = (event) => {
        this.setState({
            AsesorSelected: event.target.value,
        });
    }

    handleChangeTipo = (event) => {
        this.setState({
            tipo: event.target.value,
            tipoSelected: true,
            razon: null,
            razonSelected: false,
        })
    }

    handleRazonNoVenta = (event) => {
        this.setState({
            NoVentaSelected: event.target.value,
        })
    }

    handleChangeCausa = (event) => {
        this.setState({
            razon: event.target.value,
            razonSelected: true,
        })
    }

    handleChangeObservacion = (event) => {
        this.setState({
            Observacion: event.target.value,
        })
    }

    handleChangeComentario = (event) => {
        this.setState({
            ComentarioRazonNoVenta: event.target.value,
        })
    }

    handleChangeValorPago = (event) => {
        this.setState({
            valorPago: event.target.value,
        })
    }

    guardarRazon = () => {
        this.setState({
            guardandoRazon: true,
        })

        let postBody = {
            Fecha: new moment().format(),
            IdRazonNoVentaTipo: this.state.tipo,
            IdRazonNoVentaCausa: this.state.razon,
            CodigoCliente: this.state.clienteActivo.codigo,
            IdAsignacionxAsesor: this.state.clienteActivo.IdAsignacion,
            Observacion: this.state.Observacion,
        }

        fetch(this.urlApi + "/api/BitacoraVisitasCliente", {
            headers: {
                'Authorization':
                    'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(postBody),

        })
            .then(res => {

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000
                });

                if (res.status === 200) {
                    res.json()
                        .then(
                            (result) => {
                                this.setState({
                                    guardandoRazon: false,
                                    mostarNoAtendido: false,
                                });
                            },
                        )
                }
                else if (res.status === 204) {
                    this.setState({
                        guardandoRazon: false,
                        mostarNoAtendido: false,
                    });

                    this.cargarAsignaciones();

                    Toast.fire({
                        type: 'success',
                        title: 'Razón Guardada',
                        customClass: {
                            container: styles.ToastOnTopModal,
                        }
                    });
                }
                else {
                    this.setState({
                        guardandoRazon: false,
                    });

                    Toast.fire({
                        type: 'error',
                        title: 'Ha ocurrido un error',
                        customClass: {
                            container: styles.ToastOnTopModal,
                        }
                    });

                }

            })
    }

    cargarConfiguraciones = async () => {
        const { data, error } = await get(`${APIURL}/api/configuraciones`, "Configuraciones");
        if (error) {
            console.log(error);
        } else {

            this.setState({
                Configuraciones: data
            });
            this.props.onSaveConfiguraciones(data);
        }
    }

    cargarTipoVisitas = async () => {
        const { data, error } = await get(`${APIURL}/api/TipoVisitaCliente`, "TipoVisita");
        if (error) {
            console.log(error);
        } else {
            this.props.onSaveTipoVisita(data);
        }
    }

    async componentDidMount() {
        if (!IsAllow("/agenda")) {
            this.props.history.push('/home');
        }

        const isOnline = await verificarConexion();
        if (!isOnline || localStorage.getItem("Conexion") === "offline") {
            Swal.fire({
                title: "Sin internet",
                text: "Necesita internet para poder visualizar esta pagina.",
                type: "warning",
                confirmButtonText: 'Ok',
            });
            this.setState((prevState) => ({ ...prevState, isLoaded: true }))
        } else if (localStorage.getItem("Conexion") === "Online" && isOnline) {
            this.cargarAsesores()
            this.cargarAsignacionesConClientes();
            this.cargarRazonNoVenta();
            this.cargarListadoRazonNoVenta();
            this.cargarTipoVisitas();
            this.cargarConfiguraciones();
            this.obtenerTiemposFueraAsesorDia();
            this.setState((prevState) => ({ ...prevState, isLoaded: true }))
        } else {
            Swal.fire({
                title: "Sin internet",
                text: "Necesita internet para poder visualizar esta pagina.",
                type: "warning",
                confirmButtonText: 'Ok',
            });
            this.setState((prevState) => ({ ...prevState, isLoaded: true }));
        }
    }

    verifyBlock = (action) => {
        const asignacion = this.props.asignaciones.find(x => x.IdAsignacion === this.state.IdAsignacion);

        if (action === "checkin") {
            let fechaActual = moment(new Date()).format("DD-MM-YYYY");
            let fechaAsignacion = moment(asignacion.fechaIngreso).format("DD-MM-YYYY");

            if (moment(fechaAsignacion).isBefore(fechaActual)) {
                return true;
            }

            return asignacion.Checkin;
        }

        if (action === "bloqueo") {
            return asignacion.Bloqueo;
        }

        return asignacion.Checkout;
    }

    verifyBlockNoseVisito = () => {
        const asignacion = this.props.asignaciones.find(x => x.IdAsignacion === this.state.IdAsignacion);

        if (asignacion.Checkin) {
            return true
        }
        return false
    }

    actualizarCoordenadasPedido = (longitud, latitud) => {
        let copiaClientes = this.props.clientesPedido;
        let indice = copiaClientes.map(x => x.Codigo).indexOf(this.state.clienteActivo.codigo);
        copiaClientes[indice].Longitud = longitud;
        copiaClientes[indice].Latitud = latitud;
        this.props.onSaveClientesPedido(copiaClientes);
    }

    actualizarCoordenadasRecibo = (longitud, latitud) => {
        let copiaClientes = this.props.clientesRecibo;
        let indice = copiaClientes.map(x => x.Codigo).indexOf(this.state.clienteActivo.codigo);
        copiaClientes[indice].Longitud = longitud;
        copiaClientes[indice].Latitud = latitud;
        this.props.onSaveClientesRecibo(copiaClientes);
    }

    actualizarDataExterna = request => {
        const { latitud, longitud } = request.data;
        this.actualizarCoordenadasPedido(longitud, latitud);
        this.actualizarCoordenadasRecibo(longitud, latitud);
    }

    actualizarData = request => {
        this.setState((prevState) => ({ ...prevState, clienteActivo: { ...prevState.clienteActivo, latitud: request.data.latitud, longitud: request.data.longitud } }));
        let copiaClientes = this.state.clientes;
        let indice = copiaClientes.map(x => x.Codigo).indexOf(this.state.clienteActivo.codigo);
        copiaClientes[indice].Latitud = request.data.latitud;
        copiaClientes[indice].Longitud = request.data.longitud;
        this.setState((prevState) => ({ ...prevState, clientes: copiaClientes }));
        let eventos = this.setAsignaciones(this.state.Asignaciones);
        this.setState({
            Eventos: eventos,
        })

        this.actualizarDataExterna(request);
    }

    enviarCoordenadasApi = async (coor) => {
        try {
            const data = {
                cliente: this.state.clienteActivo.codigo,
                latitud: coor.latitude,
                longitud: coor.longitude
            }
            const request = await axios.post(`${APIURL}/api/cliente/coordenadas`, data);
            this.actualizarData(request);
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: "Ha ocurrido un error y no se pudo obtener las coordenadas.",
                type: 'error',
                confirmButtonText: 'OK',
                target: this.refCoordenadas.current
            });
        }
    }

    mensajeErrorCoordenadas = () => {
        Swal.fire({
            title: 'Error',
            text: "Ha ocurrido un error y no se pudo obtener las coordenadas.",
            type: 'error',
            confirmButtonText: 'OK',
            target: this.refCoordenadas.current
        });
    }

    confirmacionCoordenadas = () => {
        Swal.fire({
            title: 'Confirmar',
            text: `¿Está seguro de realizar el pinneo en la ubicacón actual?`,
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#06bf53',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
            target: this.refCoordenadas.current
        }).then((result) => {
            if (result.value) {
                ObtenerCoordenadas((position) => {
                    this.enviarCoordenadasApi({
                        longitude: position.coords.longitude,
                        latitude: position.coords.latitude
                    })
                }, (error) => {
                    this.mensajeErrorCoordenadas()
                });
            }
        })
    }

    verificarObtencionCoordenadas = () => {
        navigator.permissions.query({ name: 'geolocation' }).then(res => {
            if (res.state === "granted") {
                this.confirmacionCoordenadas();
            } else {
                Swal.fire({
                    title: 'Advertencia',
                    text: "Habilite la geoposición en su dispositivo para realizar esta acción.",
                    type: 'warning',
                    confirmButtonText: 'OK',
                    target: this.refCoordenadas.current
                });
            }
        }).catch(err => {
            this.mensajeErrorCoordenadas()
        })
    }

    registrarCheckOut = async () => {
        const request = await axios.get(`${APIURL}/api/asignaciones/reporte/${this.state.clienteActivo.codigo}`);
        let visita = request.data.filter(x => moment(x.FechaAsignacion).format("DD/MM/YYYY") === moment().format("DD/MM/YYYY"))
        if (visita[0].Cobros === 0 && visita[0].Promesa_de_Pago === 0 && visita[0].Ventas === 0) {
            this.openModalRazonNoVenta()
        }
        else {
            this.enviarCheckin("checkout")
        }
    }

    openModalRazonNoVenta = () => {
        this.setState({ OpenModalNoVenta: true });
    }

    accesoPineo = () => {
        var permisos = this.props.Permisos[0].RolesUsuarios.filter(x => x.Nombre === "Registrar Pineo");
        if (permisos.length > 0) {
            return true;
        }
        return false;
    }

    eliminarAsignacion = async (asignacionId) => {
        try {
            const result = window.confirm(`¿Esta seguro de eliminar la visita?`);
            if (result) {
                await axios.post(`${this.urlApi}/api/asignaciones/eliminar/${asignacionId}`)
                alert("Asignación eliminada con exito.");
            }

        } catch (err) {
            alert("No se pudo eliminar la asignación.");
        }
    }

    render() {
        this.accesoPineo();
        let tipoDisabled = false;
        let causaDisabled = false;
        let APIKEY = this.state.Configuraciones.ApiKey_GoogleMaps;

        if (!this.state.mostrarAcciones && !this.state.noAtendido) {
            causaDisabled = true;
            tipoDisabled = true;
  
        }

        if (!this.state.tipoSelected) {
            causaDisabled = true;
        }

        return (
            <>
                <div className="row justify-content-center">
                    <div className="col-12 text-center">
                        {
                            this.state.isLoaded ?
                                <div className="col-12">
                                    <Calendar onClickAgenda={this.onClickAgenda} asignaciones={this.state.Eventos} onClickEvento={this.onClickEvento} onClickAsignacion={this.onClickAsignacion} onClickAsesores={this.onClickAsesores} AsesorSelected={this.state.AsesorSelected} />
                                </div>
                                :
                                <div style={{ marginTop: 15 }}>
                                    <ClipLoader
                                        size={40}
                                        color={'#31547C'}
                                        loading={!this.state.isLoaded} />
                                </div>

                        }



                    </div>
                </div>

                {
                    this.state.clienteActivo &&
                    <Dialog
                        maxWidth={'lg'}
                        fullWidth={true}
                        scroll={'paper'}
                        open={this.state.mostarEvento}
                        onClose={() => this.state.isModalLoaded && this.setState({ mostarEvento: false })}
                        aria-labelledby="scroll-dialog-title"
                        ref={this.myRef}
                    >
                        <DialogTitle
                            className="text-center"
                            id="scroll-dialog-title">
                            <div
                                style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                {this.state.clienteActivo.nombre}
                            </div>
                        </DialogTitle>
                        {
                            this.state.isModalLoaded ?
                                <>
                                    <DialogContent>
                                        <div className="row mb-1">
                                            <div className={'col-md-6 col-12 my-md-0 mb-3'}>
                                                <h5 className="font-weight-light">Ubicación</h5>
                                                <div style={{ height: '300px', display: 'flex', alignItems: 'center' }}>
                                                    {(this.state.clienteActivo.latitud === null && this.state.clienteActivo.longitud === null)
                                                        ?
                                                        <div ref={this.refCoordenadas}>
                                                            <h1 className="font-weight-light">No hay coordenadas disponibles</h1>
                                                            {this.state.AsesorSelected === localStorage.getItem('codigo') && <Button onClick={this.verificarObtencionCoordenadas} variant="contained" color="primary" style={{ display: 'block', margin: '0 auto' }}>Obtener coordenadas</Button>}
                                                        </div>
                                                        :
                                                        <GoogleMapReact
                                                            bootstrapURLKeys={{ key: APIKEY }}
                                                            defaultCenter={
                                                                {
                                                                    lat: this.state.clienteActivo.latitud,
                                                                    lng: this.state.clienteActivo.longitud,
                                                                }
                                                            }
                                                            center={{
                                                                lat: this.state.clienteActivo.latitud,
                                                                lng: this.state.clienteActivo.longitud,
                                                            }}
                                                            defaultZoom={16}
                                                            onGoogleApiLoaded={({ map, maps }) => { this.setMapsApi(map, maps) }}
                                                            yesIWantToUseGoogleMapApiInternals={true}
                                                        >
                                                        </GoogleMapReact>
                                                    }
                                                </div>
                                            </div>
                                            <div className={'col-md-6 col-12'}>
                                                    <div style={{display:"flex",justifyContent:"space-between"}}>
                                                        <h5 className="font-weight-light">Información</h5>
                                                        {PermisoAdministradorVisita() && <Button variant="outlined" onClick={() => { this.eliminarAsignacion(this.state.IdAsignacion) }} color="primary">Eliminar visita</Button>}
                                                    </div>
                                                <table className="table table-xl-responsive table-striped" style={{ border: '2px solid #ccc' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td className="font-weight-bold">
                                                                Código:
                                                            </td>
                                                            <td>
                                                                {this.state.clienteActivo.codigo}
                                                            </td>

                                                            <td></td>
                                                        </tr>
                                                        { /*<tr>
                                                            <td className="font-weight-bold">
                                                                Facturas Vencidas:
                                                        </td>

                                                            <td style={{ color: "#B22222" }}>

                                                                <b> {this.state.clienteActivo.cliente.NumeroFacturasVencidas} Facturas - HNL {this.state.clienteActivo.cliente.MontoFacturasVencidas.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</b>                                                               
                                                            </td>

                                                            <td>
                                                                <FaEye size={"20px"} style={{ color: "#B22222" }}
                                                                    onClick={() => {
                                                                        this.OpenModalFacturas(false);
                                                                    }
                                                                    } />
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-weight-bold">
                                                                Facturas Prox a Vencer:
                                                        </td>

                                                            <td style={{ color: "#DC9609" }}>
                                                                <b>{this.state.clienteActivo.cliente.NumeroFacturasXVencer} Facturas - HNL {this.state.clienteActivo.cliente.MontoFacturasXVencer.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</b>
                                                            </td>

                                                            <td>
                                                                <FaEye size={"20px"} style={{ color: "#DC9609" }}
                                                                    onClick={() => {
                                                                        this.OpenModalFacturas(true);
                                                                    }
                                                                    }

                                                                />
                                                            </td>
                                                        </tr>*/}
                                                        <tr>
                                                            <td className="font-weight-bold">
                                                                Prioridad:
                                                            </td>
                                                            <td>
                                                                {this.state.clienteActivo.prioridad}
                                                            </td>

                                                            <td></td>

                                                        </tr>
                                                        <tr>
                                                            <td className="font-weight-bold">
                                                                Fecha Inicio:
                                                            </td>
                                                            <td>
                                                                {this.state.clienteActivo.fechaInicio}
                                                            </td>

                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-weight-bold">
                                                                Fecha Fin:
                                                            </td>
                                                            <td>
                                                                {this.state.clienteActivo.fechaFin}
                                                            </td>

                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div>
                                                    {this.accesoPineo() === true && <FormGroup row className={"mb-1"}>
                                                        <Button style={{ marginRight: '10px' }} color="primary" variant="outlined" disabled={(this.verifyBlockNoseVisito())} onClick={() => this.setState((prevState) => ({ ...prevState, noAtendido: prevState.noAtendido, mostarNoAtendido: true }))}>Cancelar visita</Button>

                                                        {!this.verifyBlock("checkin")
                                                            ? <Button disabled={this.verifyBlock("checkin")} variant="outlined" onClick={() => { this.enviarCheckin("checkin") }} color="primary">Check In</Button>
                                                            : <Button disabled={this.verifyBlock("checkout")} variant="outlined" onClick={() => { this.registrarCheckOut() }} color="primary">Check Out</Button>}
                                                    </FormGroup>}
                                                </div>
                                            </div>
                                        </div>

                                    </DialogContent>
                                    <DialogActions>
                                        {
                                            this.state.Acciones.map((accion, index) => {
                                                if (accion.Estado) {
                                                    return (
                                                        <Button key={index} variant="outlined" disabled={this.verifyBlock("bloqueo")} onClick={() => accion.UrlRedirect == null ? this.setState({ OpenModalPromesaPago: true }) : this.onClickModal(accion.UrlRedirect, this.state.clienteActivo.codigo)} color="primary">
                                                            {accion.Accion}
                                                        </Button>
                                                    )
                                                }
                                                return false;
                                            })
                                        }
                                    </DialogActions>
                                </>
                                :
                                <>
                                    <DialogContent >
                                        <div className="text-center">
                                            <ClipLoader
                                                size={40}
                                                color={'#31547C'}
                                                loading={!this.state.isModalLoaded} />
                                        </div>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => this.setState({ mostarEvento: false })} color="primary">
                                            Cancelar
                                        </Button>
                                    </DialogActions>
                                </>
                        }
                    </Dialog>

                }

                {
                    <Dialog
                        scroll={'paper'}
                        open={this.state.OpenModalNoVenta}
                        className={styles.AtenderContainer}
                        //onClose={() => this.onCloseModalAtendido()}
                        aria-labelledby="No-Atendido-Modal">
                        <DialogTitle
                            className="text-center"
                            id="scroll-dialog-title">
                            <div
                                style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                Justificación de No Venta
                            </div>
                        </DialogTitle>
                        <DialogContent >
                            {
                                this.state.isModalLoaded &&
                                <>
                                    <h6>Razón</h6>
                                    <div className="row">
                                        <div className="col-12 my-1">
                                            <FormControl style={{ display: 'flex' }}>
                                                <InputLabel htmlFor="demo-controlled-open-select">Tipo</InputLabel>
                                                <Select
                                                    value={(this.state.NoVentaSelected === null ? '' : this.state.NoVentaSelected)}
                                                    onChange={this.handleRazonNoVenta}>
                                                    {
                                                        this.opcionRazonNoVenta()
                                                    }

                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="col-12 my-1">
                                            <TextField
                                                label="Observación"
                                                className="w-100"
                                                multiline
                                                rowsMax="6"
                                                rows="2"
                                                value={this.state.ComentarioRazonNoVenta}
                                                onChange={this.handleChangeComentario}
                                                margin="normal"
                                            />
                                        </div>
                                    </div>
                                </>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => this.setState({ OpenModalNoVenta: false, NoVentaSelected: null, ComentarioRazonNoVenta: '' })} color="primary">
                                Cancelar
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                className={"py-1"}
                                style={{ height: '35px' }}
                                onClick={() => this.enviarRazonesNoVenta()}>
                                Guardar
                            </Button>
                        </DialogActions>
                    </Dialog>
                }

                {
                    <Dialog
                        scroll={'paper'}
                        open={this.state.OpenModalAsesor}
                        className={styles.AtenderContainer}
                        onClose={() => this.setState({ OpenModalAsesor: false })}
                        aria-labelledby="No-Atendido-Modal">
                        <DialogTitle
                            className="text-center"
                            id="scroll-dialog-title">
                            <div
                                style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                Asesores Disponibles
                            </div>
                        </DialogTitle>
                        <DialogContent >
                            {
                                <>
                                    <div className="row">
                                        <div className="col-12 my-1">
                                            <FormControl style={{ display: 'flex' }}>
                                                <InputLabel htmlFor="demo-controlled-open-select">Asesor</InputLabel>
                                                <Select
                                                    value={(this.state.AsesorSelected === null ? '' : this.state.AsesorSelected)}
                                                    onChange={this.handleOnChangeAsesor}>
                                                    {
                                                        this.opcionAsesores()
                                                    }

                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                </>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => this.setState({ OpenModalAsesor: false })} color="primary">
                                Cancelar
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                className={"py-1"}
                                style={{ height: '35px' }}
                                onClick={() => this.onChangeAsesor()}>
                                Aceptar
                            </Button>
                        </DialogActions>
                    </Dialog>
                }

                {
                    <Dialog
                        scroll={'paper'}
                        open={this.state.mostarNoAtendido}
                        className={styles.AtenderContainer}
                        onClose={() => this.onCloseModalAtendido()}
                        aria-labelledby="No-Atendido-Modal">
                        <DialogTitle
                            className="text-center"
                            id="scroll-dialog-title">
                            <div
                                style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                Cancelar visita
                            </div>
                        </DialogTitle>
                        <DialogContent >
                            {
                                this.state.isModalLoaded &&
                                <>
                                    <h6>Razón</h6>
                                    <div className="row">
                                        <div className="col-12 my-1">
                                            <FormControl style={{ display: 'flex' }}>
                                                <InputLabel htmlFor="demo-controlled-open-select">Tipo</InputLabel>
                                                <Select
                                                    value={(this.state.tipo === null ? '' : this.state.tipo)}
                                                    //disabled={tipoDisabled}
                                                    onChange={this.handleChangeTipo}
                                                >
                                                    {
                                                        this.opcionTipos()
                                                    }

                                                </Select>
                                            </FormControl>
                                        </div>

                                        <div className="col-12 my-1">
                                            <FormControl style={{ display: 'flex' }}>
                                                <InputLabel htmlFor="demo-controlled-open-select">Causa</InputLabel>
                                                <Select
                                                    //disabled={causaDisabled}
                                                    value={(this.state.razon === null ? '' : this.state.razon)}
                                                    onChange={this.handleChangeCausa}
                                                >
                                                    {
                                                        this.opcionCausas()
                                                    }
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="col-12 my-1">
                                            <TextField
                                                label="Observación"
                                                className="w-100"
                                                multiline
                                                //disabled={observacionDisabled}
                                                rowsMax="6"
                                                rows="2"
                                                value={this.state.Observacion}
                                                onChange={this.handleChangeObservacion}
                                                margin="normal"
                                            />
                                        </div>
                                    </div>

                                </>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => this.onCloseModalAtendido()} color="primary">
                                Cancelar
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                className={"py-1"}
                                style={{ height: '35px' }}
                                disabled={!this.state.razonSelected || (causaDisabled && tipoDisabled)}
                                onClick={() => this.guardarRazon()}>
                                {
                                    this.state.guardandoRazon ?
                                        <ScaleLoader
                                            css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                                            size={'20px'}
                                            color={'#3f51b5'}
                                            loading={this.state.GuardarAsignacion} /> : 'Guardar'
                                }
                            </Button>
                        </DialogActions>
                    </Dialog>
                }
                {
                    <Dialog
                        scroll={'paper'}
                        open={this.state.OpenModalPromesaPago}
                        className={styles.AtenderContainer}
                        onClose={() => this.setState({ OpenModalPromesaPago: false, date: new Date(), valorPago: 0 })}
                        aria-labelledby="No-Atendido-Modal">
                        <DialogTitle
                            className="text-center"
                            id="scroll-dialog-title">
                            <div
                                style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                Promesa de Pago
                            </div>
                        </DialogTitle>
                        <DialogContent >
                            {
                                this.state.isModalLoaded &&
                                <>
                                    <div className="row">
                                        <div className="col-12 py-1">
                                            <h6>Fecha:</h6>
                                            <Fragment>
                                                <KeyboardDatePicker
                                                    value={this.state.date}
                                                    className="w-100"
                                                    onChange={d => this.setState({ date: d })}
                                                    format="DD/MM/YYYY"
                                                    minDate={new Date()}
                                                />
                                            </Fragment>
                                        </div>
                                        <div className="col-12 py-1">
                                            <TextField
                                                type="number"
                                                label="Valor Pago"
                                                className="w-100"
                                                value={this.state.valorPago}
                                                onChange={this.handleChangeValorPago}
                                                margin="normal"
                                            />
                                        </div>
                                    </div>

                                </>
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => this.setState({ OpenModalPromesaPago: false })} color="primary">
                                Cancelar
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                className={"py-1"}
                                style={{ height: '35px' }}
                                onClick={() => this.enviarPromesaPago()}>
                                {
                                    this.state.guardandoRazon ?
                                        <ScaleLoader
                                            css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                                            size={'20px'}
                                            color={'#3f51b5'}
                                            loading={this.state.GuardarAsignacion} /> : 'Guardar'
                                }
                            </Button>
                        </DialogActions>
                    </Dialog>
                }
                <FacturasModal Data={this.state.DataModalFacturas} Open={this.state.ShowModalFacturas} onClose={this.CloseModalFacturas}></FacturasModal>
            </>
        )

    }
}

const mapStateToProps = state => ({
    empresas: state.empresas,
    asignaciones: state.Asignaciones,
    Permisos: state.Permisos,
    clientesPedido: state.clientes,
    clientesRecibo: state.Recibo.clientes
});

const mapDispatchToProps = dispatch => ({
    onSaveEmpresas: (empresas) => { dispatch({ type: 'SET_EMPRESAS', payload: empresas }) },
    onSaveMonedas: (monedas) => { dispatch({ type: 'SET_ABREVACIONMONEDAS', payload: monedas }) },
    onSaveClientesContado: (clientes) => { dispatch({ type: 'SET_CLIENTESCONTADO', payload: clientes }) },
    onSaveAsignaciones: (asignaciones) => { dispatch({ type: 'SET_ASIGNACIONES', payload: asignaciones }) },
    onSaveTipoVisita: (data) => { dispatch({ type: "SET_TIPOVISITA", payload: data }) },
    onSaveConfiguraciones: (data) => { dispatch({ type: "SET_CONFIGURACIONES", payload: data }) },
    onSaveClientesPedido: (data) => { dispatch({ type: 'STORE_CLIENTES', clientes: data }) },
    onSaveClientesRecibo: (data) => { dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: data }) }
})

export default connect(mapStateToProps, mapDispatchToProps)(Agenda);