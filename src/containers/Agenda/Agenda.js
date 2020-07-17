import React, { Component } from 'react';
import Calendar from 'components/Agenda/Calendar';
import { ClipLoader } from 'react-spinners';
import GoogleMapReact from 'google-map-react';
import { ScaleLoader } from 'react-spinners';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import TextField from '@material-ui/core/TextField';
import {APIURL,APIKEY} from 'utils/Enviroment';
import FacturasModal from "components/Recibos/FacturasModal/FacturasModal";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import styles from 'containers/Agenda/Agenda.module.css';
import 'containers/Agenda/Agenda.css';
import moment from "moment";
import {connect} from 'react-redux';

import { FaEye } from "react-icons/fa";
moment.locale('es');
class Agenda extends Component {
    urlApi = APIURL;
    state = {
        Asignaciones: [],
        mostrarAcciones: true,
        isLoaded: false,
        Eventos: [],
        mostarEvento: false,
        isModalLoaded: false,
        ShowModalFacturas: false,
        DataModalFacturas: [],
        Acciones: [],
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
    }
    cargarClientes = async () => {
        fetch(this.urlApi + "/api/cliente", {
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
                                this.setState({
                                    clientes: result,
                                });

                                var fecha = this.getFechas(2);
                                this.cargarAsignaciones(fecha.Inicio, fecha.Fin);

                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                this.setState({
                                    error: true
                                });
                            }
                        )
                }

            })
    }

    cargarEmpresas = ()=>{
        fetch(`${this.urlApi}/api/empresa/empresas`)
        .then(res=>res.json())
        .then(data=>{this.props.onSaveEmpresas(data)})
        .catch(error=>console.log(error))
    }

    cargarAsignaciones = (FechaInicio, FechaFin) => {
        var inicio = moment(FechaInicio).format();
        var fin = moment(FechaFin).format();

        fetch(this.urlApi + `/api/Asignaciones?FechaInicio=${inicio}&FechaFin=${fin}`, {
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
                                var eventos = this.setAsignaciones(result);
                                this.setState({
                                    Asignaciones: result,
                                    ShowTable: true,
                                    isLoaded: true,
                                    Eventos: eventos,
                                });
                            },
                        )
                }

            })
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

        asignaciones.map(dia => {
            dia.asignaciones.map(asignacion => {
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
                    title: cliente,
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
                    },
                    cliente: objetoCliente
                }
                eventos.push(evento);
                return false;
            })
            return false;
        })

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
        });

        fetch(this.urlApi + `/api/acciones`, {
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
                                    Acciones: result,
                                    isModalLoaded: true,
                                });
                            },
                        )
                }

            })

        fetch(this.urlApi + `/api/BitacoraVisitasCliente/${info.event.extendedProps.IdAsignacion}`, {
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
                                if (result !== null) {

                                    this.setState({
                                        tipo: result.IdRazonNoVentaTipo,
                                        razon: result.IdRazonNoVentaCausa,
                                        Observacion: result.Observacion !== null ? result.Observacion : '',
                                        tipoSelected: true,
                                        razonSelected: true,
                                        noAtendido: true,
                                    })
                                }
                            },
                        )
                }

            })

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
                                DiasDescuento: moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days'),
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

    handleChangeTipo = (event) => {
        this.setState({
            tipo: event.target.value,
            tipoSelected: true,
            razon: null,
            razonSelected: false,
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

    componentDidMount() {
        this.cargarClientes();
        this.cargarRazonNoVenta();
        this.cargarEmpresas();
    }

    render() {
        let tipoDisabled = false;
        let causaDisabled = false;
        let observacionDisabled = false;

        if (!this.state.mostrarAcciones && !this.state.noAtendido) {
            causaDisabled = true;
            tipoDisabled = true;
            observacionDisabled = true;
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
                                    <Calendar onClickAgenda={this.onClickAgenda} asignaciones={this.state.Eventos} onClickEvento={this.onClickEvento} onClickAsignacion={this.onClickAsignacion} />
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
                                                <div style={{ height: '300px',display:'flex',alignItems:'center' }}>
                                                {(this.state.clienteActivo.latitud === null && this.state.clienteActivo.longitud===null)
                                                ?
                                                    <h1 className="font-weight-light">No hay coordenadas disponibles</h1>
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
                                                <h5 className="font-weight-light">Información</h5>
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
                                                        <tr>
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
                                                        </tr>
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
                                                <FormGroup row className={"mb-1"}>                                                    
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox color="default" checked={this.state.noAtendido} onChange={(event) => this.setState({ noAtendido: event.target.checked, mostarNoAtendido: true })} value="Atender" />
                                                        }
                                                        label="No se Atendió"
                                                    />
                                                </FormGroup>

                                                

                                            </div>
                                        </div>

                                    </DialogContent>
                                    <DialogActions>
                                        {
                                            this.state.Acciones.map((accion, index) => {
                                                if (accion.Estado) {
                                                    return (
                                                        <Button key={index} disabled={this.state.noAtendido} onClick={() => this.onClickModal(accion.UrlRedirect, this.state.clienteActivo.codigo)} color="primary">
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
                        open={this.state.mostarNoAtendido}
                        className={styles.AtenderContainer}
                        onClose={() => this.onCloseModalAtendido()}
                        aria-labelledby="No-Atendido-Modal">
                        <DialogTitle
                            className="text-center"
                            id="scroll-dialog-title">
                            <div
                                style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                No se Atendió
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
                                                    disabled={tipoDisabled}
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
                                                    disabled={causaDisabled}
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
                                                disabled={observacionDisabled}
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
                <FacturasModal Data={this.state.DataModalFacturas} Open={this.state.ShowModalFacturas} onClose={this.CloseModalFacturas}></FacturasModal>
            </>
        )

    }
}

const mapStateToProps = state => ({
    empresas:state.empresas
});

const mapDispatchToProps = dispatch =>({
    onSaveEmpresas:(empresas)=>{dispatch({type:'SET_EMPRESAS',payload:empresas})}
})

export default connect(mapStateToProps,mapDispatchToProps)(Agenda);