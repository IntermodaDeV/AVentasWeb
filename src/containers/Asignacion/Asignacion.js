import React, { Component } from 'react';
import { DatePicker, TimePicker } from "@material-ui/pickers";
import { Radio, RadioGroup, FormControl, FormLabel, FormControlLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
// import { green, red, blue, } from '@material-ui/core/colors';
import { Dropdown } from "semantic-ui-react";
import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Button, Select, MenuItem } from '@material-ui/core';
import { ScaleLoader } from 'react-spinners';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { APIURL } from 'utils/Enviroment';
import Loader from 'components/Global/Loader';
import 'containers/Asignacion/Asignacion.css';
import styles from './Asignacion.module.css';
import AsignacionModal from 'components/Agenda/AsignacionModal';
import CargarAsignaciones from 'components/Agenda/CargarAsignaciones';
import { IsAllow } from 'components/Seguridad/Permisos';
import 'sweetalert2/src/sweetalert2.scss'
import { verificarConexion } from 'utils/http';
import {
    Card,
    CardBody,
    CardHeader
} from 'reactstrap';
import { connect } from 'react-redux';
import moment from "moment";
import axios from 'axios'
moment.locale('es');

class Asignacion extends Component {
    urlApi = APIURL;
    state = {
        startDate: new Date(),
        endDate: new Date((new Date()).valueOf() + (1000 * 60 * 60 * 24) * 6 + 1),
        ShowTable: false,
        isLoaded: false,
        clientes: null,
        Asignaciones: [],
        ShowDialog: false,
        HoraDialogInicio: new Date(),
        HoraDialogFin: new Date(),
        RadioValue: 3,
        GuardarAsignacion: false,
        LoadedTiempoEstimado: false,
        Configuraciones: null,
        FechaFinDialog: '',
        Rutas: [],
        RutaSelected: null,
        TiposVisitaCliente: [],
        PrioridadesAsignacion: [],
        TipoVisitaClienteDialogValue: '',
        TipoValues: [],
        TipoInitialValues: [],
        ArrayTipoValues: [],
        showCargar: false,
        Asesores: [],
        AsesorSelected: null,
        RutasSinFiltro: [],
        IdAsignacion: null,
        limpiarAsignacionesShow: false,
    }

    setCargar = (show) => {
        this.setState((prevState) => ({ ...prevState, showCargar: show }))
    }

    limpiarAsignacionesShow = async (show) => {
        this.setState({ limpiarAsignacionesShow: show })
    }

    mostrarAdvertencia = (title, text, type) => {
        Swal.fire({
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Ok',
        })
    }

    limpiarAsignaciones = async () => {

        this.setState({ limpiarAsignacionesShow: false })
        try {
            const request = await axios.post(`${APIURL}/api/asignaciones/limpiarAsignaciones/${this.state.AsesorSelected}`);
            console.log(request.data)
            if (request.data > 0) {
                this.mostrarAdvertencia("Asignaciones", "Se limpiaron las asignaciones corectamente", "success")
                return;
            } else {
                this.mostrarAdvertencia("Asignaciones", "No se encontraron asignaciones para limpiar", "warning")
                return;
            }

        } catch (err) {
            this.mostrarAdvertencia("Error", "No se pudo limpiar las asignaciones", "error");
        }
    }

    cargarClientes = () => {
        fetch(this.urlApi + "/api/cliente/asignacion", {
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
                                /*let RutaCodigo = '';
                                let Rutas = result.map(cliente => {
                                    return { Ruta: cliente.Ruta, Codigo: cliente.CodigoRuta };
                                }).filter((value, index, self) => {
                                        if (self[self.indexOf(value)].Codigo !== RutaCodigo) {
                                            RutaCodigo = self[self.indexOf(value)].Codigo;
                                            return true;
                                        }
                                        return false;
                                    });*/
                                let Asesor = Array.from(new Set(result.map(s => s.Asesor)));
                                let Asesores = [];
                                let AsesorSelect = null;
                                // eslint-disable-next-line
                                Asesor.map((Ase, index) => {
                                    if (index === 0) {
                                        AsesorSelect = Ase;
                                    }
                                    let Valores = { key: Ase, value: Ase, text: Ase }
                                    Asesores.push(Valores);
                                })

                                let Rutas = Array.from(new Set(result.map(s => s.CodigoRuta)))
                                    .map(CodigoRuta => {
                                        return {
                                            Ruta: result.find(s => s.CodigoRuta === CodigoRuta).Ruta,
                                            Codigo: CodigoRuta,
                                            Asesor: result.find(s => s.CodigoRuta === CodigoRuta).Asesor,
                                        };
                                    });

                                let DropdownRutas = [];
                                let RutaSelected = null;

                                Rutas.filter(r => r.Asesor === AsesorSelect).map((Ruta, ind) => {
                                    if (ind === 0) {
                                        RutaSelected = Ruta.Ruta;
                                    }
                                    let Opciones = { key: Ruta.Codigo, value: Ruta.Ruta, text: Ruta.Codigo + " - " + Ruta.Ruta }
                                    DropdownRutas.push(Opciones);
                                    return true;
                                })

                                this.setState({
                                    RutaSelected: RutaSelected,
                                    Rutas: DropdownRutas,
                                    clientes: result,
                                    isLoaded: true,
                                    Asesores: Asesores,
                                    AsesorSelected: AsesorSelect,
                                    RutasSinFiltro: Rutas
                                })

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
    cargarAsignaciones = (FechaInicio, FechaFin) => {
        var inicio = moment(FechaInicio).format();
        var fin = moment(FechaFin).format();
        var asesor = null;
        fetch(this.urlApi + `/api/Asignaciones?FechaInicio=${inicio}&FechaFin=${fin}&Asesor=${asesor}`, {
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
                                    Asignaciones: result,
                                    ShowTable: true,
                                });
                            },
                        )
                }

            })
    }

    cargarTiposAsignacionCliente = () => {
        this.setState((prevState) => ({ ...prevState, TiposVisitaCliente: this.props.TipoVisita }));
        this.getTipos(this.props.TipoVisita);
    }

    cargarTiempoEstimado = () => {
        this.setState((prevState) => ({ ...prevState, LoadedTiempoEstimado: true, Configuraciones: this.props.Configuraciones }))
    }

    cargarPrioridadesAsignacion = () => {
        fetch(this.urlApi + "/api/PrioridadAsignacion", {
            // headers: {
            //     'Authorization':
            //         'Bearer ' + localStorage.getItem('token'),
            // }
        })
            .then(res => {
                if (res.status === 200) {

                    res.json()
                        .then(
                            (result) => {
                                this.setState({
                                    PrioridadesAsignacion: result,
                                });
                            },
                        )
                }

            })
    }

    getTiempoEstimado() {

        if (this.state.Configuraciones) {
            let { IN, MV } = this.state.Configuraciones;

            let Tiempos = [];
            let Interval = parseInt(IN);
            let Max = parseInt(MV);
            for (let val = Interval; val <= Max; val += Interval) {

                let label = this.getLabelTiempoEstimado(val);
                let valueMinutes = parseInt(val / 60);
                let item = <MenuItem key={val} value={valueMinutes}>{label}</MenuItem>

                Tiempos.push(item);
            }

            let MenuItems = Tiempos.map(Item => Item);

            return MenuItems;
        }
    }

    getTiempos() {

        if (this.props.Configuraciones) {
            let { IN, MV } = this.props.Configuraciones;

            let Tiempos = [];
            let Interval = parseInt(IN);
            let Max = parseInt(MV);
            for (let val = Interval; val <= Max; val += Interval) {

                let label = this.getLabelTiempoEstimado(val);
                let valueMinutes = parseInt(val / 60);
                let item = { "Label": label, "Value": valueMinutes }

                Tiempos.push(item);
            }

            return Tiempos;
        }
    }

    getTipos(tipos) {

        let ArrayValues = [];

        tipos.map((tipo) => {
            ArrayValues.push({ "Nombre": tipo.Nombre, "Tiempo": '', "Id": tipo.idTipoVisita })
            return false;
        });

        let ArrayInitalValues = [];

        tipos.map((tipo) => {
            ArrayInitalValues.push({ "Nombre": tipo.Nombre, "Tiempo": '', "Id": tipo.idTipoVisita })
            return false;
        });

        this.setState({
            TipoValues: ArrayValues,
            TipoInitialValues: ArrayInitalValues,
            ArrayTipoValues: ArrayInitalValues
        });
    }

    getLabelTiempoEstimado = (seconds) => {
        let date = new Date(seconds * 1000).toISOString().substr(11, 8);

        var res = date.split(":");

        let Horas = parseInt(res[0]);
        let Minutos = parseInt(res[1]);

        let label = "";

        if (Horas !== 0) {
            label += Horas + (Horas === 1 ? " Hora" : " Horas")
        }

        if (Horas !== 0 && Minutos !== 0) {
            label += " y "
        }

        if (Minutos !== 0) {
            label += Minutos + " Minutos"
        }
        return label;
    }

    async componentDidMount() {
        if (!IsAllow("/asignacion")) {
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

            this.cargarClientes();
            this.cargarAsignaciones(this.state.startDate, this.state.endDate);
            this.cargarTiposAsignacionCliente();
            this.cargarPrioridadesAsignacion();
            this.cargarTiempoEstimado();
        }
    }

    eliminarAsignacion = async () => {
        try {
            await axios.post(`${APIURL}/api/asignaciones/eliminar/${this.state.IdAsignacion}`)
            this.handleInputChange(this.state.ButtonQuitarDisabled, this.state.ClienteCodigo, this.state.fechaAsignacion);
            alert("Asignación eliminada con exito.");
        } catch (err) {
            alert("No se pudo eliminar la asignación.");
        }
    }


    render() {
        const { error, isLoaded, LoadedTiempoEstimado } = this.state;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded || !LoadedTiempoEstimado) {
            return <Loader />
        } else {
            return (
                <>
                    <div className="px-2">
                        <Card>
                            <CardHeader>
                                Asignar Trabajo
                            </CardHeader>

                            <CardBody>

                                <div className="row">
                                    <div className='col-lg-1 my-lg-0 col-6 my-1'>
                                        <DatePicker
                                            disableToolbar
                                            autoOk
                                            label={"Fecha Inicio"}
                                            variant="inline"
                                            format={"DD/MM/YYYY"}
                                            disablePast
                                            value={this.state.startDate}
                                            onChange={(date) => this.handleFechaInicio(date)}
                                        />

                                    </div>
                                    <div className='col-lg-1 my-lg-0 col-6 my-1'>
                                        <DatePicker
                                            disableToolbar
                                            autoOk
                                            label={"Fecha Fin"}
                                            variant="inline"
                                            minDate={this.state.startDate}
                                            format={"DD/MM/YYYY"}
                                            value={this.state.endDate}
                                            onChange={(date) => this.handleFechaFin(date)}
                                        />
                                    </div>

                                    <div className={styles.ComboBoxContainer + ' col-lg-2 mb-lg-0 col-12 mb-1'}>
                                        <div className="row" style={{ fontWeight: 300, fontSize: 13 }}>
                                            <span>Asesor</span>
                                        </div>
                                        <Dropdown
                                            placeholder="Asesor"
                                            selection
                                            className={styles.ComboBoxOnTop}
                                            onChange={(e, { value }) => this.handleOnChangeAsesor(value)}
                                            options={this.state.Asesores}
                                            noResultsMessage={"No hay resultados"}
                                            closeOnChange={true}
                                            value={this.state.AsesorSelected}
                                        />
                                    </div>

                                    <div className={styles.ComboBoxContainer + ' col-lg-3 mb-lg-0 col-12 mb-1'}>
                                        <div className="row" style={{ fontWeight: 300, fontSize: 13 }}>
                                            <span>Ruta</span>
                                        </div>
                                        <Dropdown
                                            placeholder="Rutas"
                                            selection
                                            className={styles.ComboBoxOnTop}
                                            onChange={(e, { value }) => this.handleOnChange(value)}
                                            options={this.state.Rutas}
                                            noResultsMessage={"No hay resultados"}
                                            closeOnChange={true}
                                            value={this.state.RutaSelected}
                                        />
                                    </div>

                                    <div className="col-lg-1 my-lg-0 col-6 my-1" style={{ paddingTop: 15 }}>

                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            disabled={this.state.Asignaciones.length === 0}
                                            onClick={() => this.onClick()}>
                                            {this.state.GuardarAsignacion ?
                                                <ScaleLoader
                                                    css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                                                    size={'20px'}
                                                    color={'#3f51b5'}
                                                    loading={this.state.GuardarAsignacion} /> : 'Asignar'
                                            }
                                        </Button>
                                    </div>
                                    <div className="col-lg-2 my-lg-0 col-6 my-1" style={{ paddingTop: 15 }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => { this.setCargar(true) }}>
                                            Cargar asignaciones
                                        </Button>
                                    </div>

                                    <div style={{ paddingTop: 15 }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => { this.limpiarAsignacionesShow(true) }}>
                                            Liberar Asignaciones
                                        </Button>
                                    </div>

                                </div>

                                {/* <LimpiarAsignaciones
                                showDialog={this.state.limpiarAsignacionesShow}
                                AsesorSelected={this.state.AsesorSelected}
                                /> */}

                                 <Dialog
                                    open={this.state.limpiarAsignacionesShow}
                                >
                                    <DialogTitle id="scroll-dialog-title">
                                        <h2>Liberar asignaciones</h2>
                                    </DialogTitle>
                                    <DialogContent>
                                        <div >
                                            <p>¿Estas seguro de liberar las asignaciones de <strong>{this.state.AsesorSelected}</strong>?</p>
                                        </div>
                                        <br>
                                        </br>
                                        <br>
                                        </br>

                                        <Button
                                            onClick={() => { this.limpiarAsignacionesShow(false) }}
                                            color="primary"
                                            variant="outlined">
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={() => { this.limpiarAsignaciones() }}
                                            color="primary"
                                            variant="outlined">
                                            Limpiar
                                        </Button>
                                    </DialogContent>
                                </Dialog> 

                                <div>
                                    {
                                        this.state.ShowTable &&
                                        <div style={{ marginTop: 20, marginBottom: 10 }}>
                                            {this.Table()}
                                        </div>
                                    }
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <AsignacionModal
                        setDialog={this.setDialog}
                        ShowDialog={this.state.ShowDialog}
                        ButtonQuitarDisabled={this.state.ButtonQuitarDisabled}
                        ClienteNombre={this.state.ClienteNombre}
                        ClienteCodigo={this.state.ClienteCodigo}
                        HoraDialogInicio={this.state.HoraDialogInicio}
                        handleFechaDialogInicio={this.handleFechaDialogInicio}
                        handleInputChange={this.handleInputChange}
                        handleInputEdit={this.handleInputEdit}
                        TipoValues={this.state.TipoInitialValues}
                        fechaAsignacion={this.state.FechaAsignacion} />

                    <CargarAsignaciones
                        showDialog={this.state.showCargar}
                        setDialog={this.setCargar}
                    />

                    <Dialog
                        fullWidth={false}
                        maxWidth={'md'}
                        classes={{
                            paper: styles.PaperDialog
                        }}
                        open={this.state.ShowDialog}
                        onClose={() => this.setDialog(false)}
                        scroll={'paper'}
                        aria-labelledby="scroll-dialog-title"
                    >
                        <DialogTitle id="scroll-dialog-title">
                            {
                                this.state.ButtonQuitarDisabled ? "Asignar Hora" : "Editar Hora"
                            }
                        </DialogTitle>
                        {/* <DialogContent style={{ overflow: 'auto' }}>
                            <DialogContentText>
                                Cliente:  {this.state.ClienteNombre}
                            </DialogContentText>
                            <div className="row justify-content-around">
                                <div className="col-md-6 col-12 py-1">
                                    <h6>Hora Inicio:</h6>
                                    <TimePicker
                                        value={this.state.HoraDialogInicio}
                                        onChange={(date) => this.handleFechaDialogInicio(date)}
                                    />
                                </div>

                                <div className="col-md-6 col-12 py-1">
                                    <h6>Tiempo Estimado:</h6>

                                    <Select
                                        value={this.state.FechaFinDialog}
                                        className={"DropdownAsignacionTiempo"}
                                        onChange={this.handleTiempoEstimadoChange('FechaFinDialog')}
                                    >
                                        {
                                            this.getTiempoEstimado()
                                        }
                                    </Select>
                                </div>

                                <div className="col-md-6 col-12 py-md-3 py-1">
                                    <FormControl component="fieldset" style={{ width: '100%' }}>
                                        <FormLabel component="legend">Prioridad</FormLabel>
                                        <RadioGroup aria-label="position" name="position" value={this.state.RadioValue ? this.state.RadioValue.toString() : ''} style={{ justifyContent: 'space-around' }} onChange={(event) => this.handlePrioridadRadio(event)} row>
                                            {this.state.PrioridadesAsignacion.map((priAsig, index) => {
                                                return (
                                                    <FormControlLabel
                                                        key={index}
                                                        value={priAsig.idPrioridad.toString()}
                                                        control={getRadio(priAsig.ColorBorde, priAsig.ColorRelleno)}
                                                        label={priAsig.NombrePrioridad}
                                                        labelPlacement="bottom"
                                                    />

                                                );
                                            })}
                                        </RadioGroup>
                                    </FormControl>
                                </div>
                                <div className="col-md-6 col-12 py-md-3 py-1 order-md-last order-first">
                                    <h6>Tipo Visita:</h6>

                                    <Select
                                        value={this.state.TipoVisitaClienteDialogValue}
                                        className={"DropdownAsignacionTiempo"}
                                        onChange={this.handleTipoVisitaClienteChange('TipoVisitaClienteDialogValue')}
                                    >
                                        {this.state.TiposVisitaCliente.map((tipVisCli, index) => {
                                            return (
                                                <MenuItem key={index} value={tipVisCli.idTipoVisita}> {tipVisCli.Nombre}</MenuItem>

                                            );
                                        })}
                                    </Select>
                                </div>
                            </div>

                        </DialogContent> */}
                        <DialogContent style={{ overflow: 'auto' }}>
                            <DialogContentText>
                                Cliente:  {this.state.ClienteNombre}
                            </DialogContentText>
                            <div className="row justify-content-around">
                                <div className="col-md-6 col-12 p-0">
                                    <div className="col-12 py-1">
                                        <h6>Hora Inicio:</h6>
                                        <TimePicker
                                            value={this.state.HoraDialogInicio}
                                            onChange={(date) => this.handleFechaDialogInicio(date)}
                                        />
                                    </div>
                                    <div className="col-12 py-md-3 py-1">
                                        <FormControl component="fieldset" style={{ width: '100%' }}>
                                            <FormLabel component="legend">Prioridad</FormLabel>
                                            <RadioGroup aria-label="position" name="position" value={this.state.RadioValue ? this.state.RadioValue.toString() : ''} style={{ justifyContent: 'space-around' }} onChange={(event) => this.handlePrioridadRadio(event)} row>
                                                {this.state.PrioridadesAsignacion.map((priAsig, index) => {
                                                    return (
                                                        <FormControlLabel
                                                            key={index}
                                                            value={priAsig.idPrioridad.toString()}
                                                            control={getRadio(priAsig.ColorBorde, priAsig.ColorRelleno)}
                                                            label={priAsig.NombrePrioridad}
                                                            labelPlacement="bottom"
                                                        />
                                                    );
                                                })}
                                            </RadioGroup>
                                        </FormControl>
                                    </div>
                                </div>
                                <div className="col-md-6 col-12 p-0">

                                    <div className="col-12">
                                        <table className={"table table-responsive-xl table-striped " + styles.TableContainer}>
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Tipo
                                                    </th>
                                                    <th>
                                                        Tiempo
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.TipoValues.map((tipVisCli, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td>
                                                                {tipVisCli.Nombre}
                                                            </td>
                                                            <td>
                                                                <Select
                                                                    value={tipVisCli.Tiempo}
                                                                    className={"DropdownAsignacionTiempo " + styles.SelectTiempo}
                                                                    onChange={this.onChangeTipos(index, this.state.TipoValues, 'FechaFinDialog')}
                                                                >
                                                                    {
                                                                        this.getTiempos().map((tiempo) => {
                                                                            return <MenuItem key={tiempo.Label} value={tiempo.Value}>{tiempo.Label}</MenuItem>
                                                                        })
                                                                    }
                                                                </Select>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </DialogContent>
                        <DialogActions>
                            <div className="row justify-content-around w-100 m-0">
                                <Button onClick={() => this.setDialog(false)} color="primary">
                                    Cancelar
                                </Button>
                                {
                                    this.state.ButtonQuitarDisabled ? null :
                                        <>
                                            <Button onClick={() => this.handleInputChange(this.state.ButtonQuitarDisabled, this.state.ClienteCodigo, this.state.fechaAsignacion)} color="primary">
                                                Quitar
                                            </Button>
                                            {this.state.IdAsignacion && (<Button onClick={this.eliminarAsignacion} color="primary">
                                                Eliminar
                                            </Button>)}
                                        </>
                                }

                                <Button onClick={() => this.state.ButtonQuitarDisabled ? this.handleInputChange(this.state.ButtonQuitarDisabled, this.state.ClienteCodigo, this.state.fechaAsignacion) : this.handleInputEdit(this.state.ButtonQuitarDisabled, this.state.ClienteCodigo, this.state.fechaAsignacion)} color="primary">
                                    Guardar
                                </Button>
                            </div>

                        </DialogActions>
                    </Dialog>
                </>

            );
        }

    }

    handleFechaInicio = (fecha) => {

        var date = moment(fecha).toDate();

        var fech = moment(fecha).toDate();
        fech.setDate(date.getDate() + 7);

        this.setState({
            startDate: date,
            endDate: fech,
        })
    }


    onChangeTipos = (Index, tipos, name) => event => {

        let ArrayTipos = [...tipos];

        ArrayTipos[Index].Tiempo = event.target.value;

        let TiempoTotal = 0;
        tipos.map(tipo => {
            if (tipo.Tiempo !== '') {
                TiempoTotal += tipo.Tiempo;
            }
            return false;
        })

        let olddate = new moment(this.state.HoraDialogInicio).toDate();
        let fecha = TiempoTotal;
        let date = new moment(olddate).add(fecha, 'minutes').toDate();
        this.setState({
            HoraDialogFin: date,
            [name]: Number(fecha),
            TipoValues: ArrayTipos,
        });
    }

    OnChangeFechaInicio = (HoraInicio) => {
        let olddate = new moment(HoraInicio).toDate();
        let fecha = this.state.FechaFinDialog;
        let date = new moment(olddate).add(fecha, 'minutes').toDate();

        this.setState({
            HoraDialogFin: date,
        });
    }

    handleFechaFin = (fecha) => {
        var date = moment(fecha).toDate();

        const diffTime = new Date(date) - new Date(this.state.startDate);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays > 0) {
            this.setState({
                endDate: date,
            })
        }
        else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
            });

            Toast.fire({
                type: 'error',
                title: 'Ingrese Fecha Válida',
            })
            var fech = new Date();
            fech.setDate(this.state.startDate.getDate() + 6);
            this.setState({
                endDate: fech,
            })
        }

    }


    handleOnChange = (value) => {
        this.setState({
            RutaSelected: value,
        });
    }
    handleOnChangeAsesor = (value) => {
        let RutaFiltrada = this.state.RutasSinFiltro.filter(r => r.Asesor === value);
        let DropdownRutas = [];
        let RutaSelected = null;

        RutaFiltrada.map((Ruta, ind) => {
            if (ind === 0) {
                RutaSelected = Ruta.Ruta;
            }
            let Opciones = { key: Ruta.Codigo, value: Ruta.Ruta, text: Ruta.Codigo + " - " + Ruta.Ruta }
            DropdownRutas.push(Opciones);
            return true;
        })
        this.setState({
            AsesorSelected: value,
            Rutas: DropdownRutas,
            RutaSelected: RutaSelected
        });
    }
    handleFechaDialogInicio = (fecha) => {
        var date = moment(fecha).toDate();
        this.setState({
            HoraDialogInicio: date,
            //FechaFinDialog: '',
        });
        this.OnChangeFechaInicio(date)
    }

    handleTiempoEstimadoChange = name => event => {
        let olddate = new moment(this.state.HoraDialogInicio).toDate();
        let fecha = event.target.value;
        let date = new moment(olddate).add(fecha, 'minutes').toDate();

        this.setState({
            HoraDialogFin: date,
            [name]: Number(fecha)
        });
    }

    handleTipoVisitaClienteChange = name => event => {
        this.setState({
            [name]: Number(event.target.value)
        });
    }

    handlePrioridadRadio = (event) => {
        this.setState({
            RadioValue: parseInt(event.target.value)
        });
    }

    onClick = async () => {
        let isOnline = await verificarConexion();
        if (isOnline) {
            this.setState({
                GuardarAsignacion: true,
            })

            fetch(this.urlApi + "/api/Asignaciones", {
                headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(this.state.Asignaciones),

            })
                .then(res => {
                    if (res.status === 200) {
                        res.json()
                            .then(
                                (result) => {
                                    this.setState({
                                        GuardarAsignacion: false,
                                    });
                                },
                            )
                    }
                    else if (res.status === 204) {
                        this.setState({
                            GuardarAsignacion: false,
                        })

                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000
                        });

                        Toast.fire({
                            type: 'success',
                            title: 'Asignación Guardada',
                        })
                    }
                    else {
                        this.setState({
                            GuardarAsignacion: false,
                        })
                    }

                })
        }
        else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
            });

            Toast.fire({
                type: 'error',
                title: 'Sin conexión a internet',
            })
        }

    }

    handleSelect = (item) => {
        this.setState({
            asesorSelected: item,
            Asignaciones: [],
        });
    }

    handleCheckbox = (evento, cliente, current_datetime) => {

        var dia = new Date(current_datetime)
        let fecha = dia.getDate() + "-" + (dia.getMonth() + 1) + "-" + dia.getFullYear();

        var dateInicio = current_datetime;
        var dateFin = current_datetime;
        var prioridad = 3;
        var tipoVisita = '';
        var tiempoEstimado = '';
        var asignaciones = [...this.state.Asignaciones];
        if (!evento) {
            if (asignaciones.length > 0) {
                var index = 0;
                var found = false;
                asignaciones.forEach((asignacion, ind) => {
                    var day = new Date(asignacion.fecha)
                    var fechaAsignacion = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear()
                    if (fechaAsignacion === fecha) {
                        index = ind;
                        found = true;
                        return 0;
                    }
                })

                if (found) {
                    var ListaAsignaciones = [...asignaciones[index].asignaciones];
                    var encontrado = false;
                    var asignacionIndex = 0;
                    ListaAsignaciones.forEach((asignacion, ind) => {
                        if (asignacion.cliente === cliente.Codigo) {
                            encontrado = true;
                            asignacionIndex = ind;
                            return 0;
                        }
                    });
                    if (encontrado) {
                        dateInicio = ListaAsignaciones[asignacionIndex].HoraInicio;
                        if (!this.isValidDate(this.state.dateInicio)) {
                            dateInicio = new moment(dateInicio).toDate();
                        };

                        dateFin = ListaAsignaciones[asignacionIndex].HoraFin;

                        if (!this.isValidDate(this.state.dateFin)) {
                            dateFin = new moment(dateFin).toDate();
                        };
                        var diffMs = Math.abs(dateFin - dateInicio);
                        tiempoEstimado = ~~((diffMs / 1000) / 60);

                        prioridad = ListaAsignaciones[asignacionIndex].IdPrioridad;
                        tipoVisita = ListaAsignaciones[asignacionIndex].IdTipoVisita
                        this.setState((prevState) => ({ ...prevState, IdAsignacion: ListaAsignaciones[asignacionIndex].IdAsignacionxAsesor }));
                    }

                }
            }
        }

        this.setState({
            ShowDialog: true,
            ButtonQuitarDisabled: evento,
            ClienteNombre: cliente.Nombre,
            ClienteCodigo: cliente.Codigo,
            fechaAsignacion: current_datetime,
            HoraDialogInicio: dateInicio,
            HoraDialogFin: dateFin,
            FechaFinDialog: tiempoEstimado,
            RadioValue: prioridad,
            TipoVisitaClienteDialogValue: tipoVisita
        })


    }


    handleInputEdit = (evento, cliente, current_datetime) => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000
        });

        if (Date.parse(this.state.HoraDialogInicio) > Date.parse(this.state.HoraDialogFin)) {

            Toast.fire({
                type: 'error',
                title: 'Ingrese Fecha Válida',
            })
            return false;
        }

        let finTiempoValid = this.state.FechaFinDialog === "";
        if (finTiempoValid) {
            Toast.fire({
                type: 'error',
                title: 'Ingrese Fecha Válida',
                customClass: {
                    container: styles.ToastOnTopModal,
                }
            })
            return;
        }


        // if (this.state.TipoVisitaClienteDialogValue === '') {

        //     Toast.fire({
        //         type: 'error',
        //         title: 'Seleccione Tipo Visita',
        //         customClass: {
        //             container: styles.ToastOnTopModal,
        //         }
        //     })
        //     return false;
        // }

        let dia = new Date(current_datetime);
        let fecha = dia.getDate() + "-" + (dia.getMonth() + 1) + "-" + dia.getFullYear()
        var asignaciones = [...this.state.Asignaciones];

        if (asignaciones.length > 0) {
            let index = 0;
            let found = false;
            asignaciones.forEach((asignacion, ind) => {
                var day = new Date(asignacion.fecha);
                var fechaAsignacion = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear()
                if (fechaAsignacion === fecha) {
                    index = ind;
                    found = true;
                    return 0;
                }
            })

            if (found) {
                let ListaAsignaciones = [...asignaciones[index].asignaciones];

                let horarioChoca = false;
                ListaAsignaciones.some((asignacion) => {

                    if (horarioChoca === false) {
                        let fechaAsignacionIni = moment(asignacion.HoraInicio).toDate();
                        let fechaAsignacionFin = moment(asignacion.HoraFin).toDate();
                        horarioChoca = ((fechaAsignacionIni > this.state.HoraDialogInicio && fechaAsignacionIni < this.state.HoraDialogFin) || (this.state.HoraDialogInicio > fechaAsignacionIni && this.state.HoraDialogInicio < fechaAsignacionFin));
                    }

                    return false;
                });
                if (horarioChoca) {
                    Toast.fire({
                        type: 'error',
                        title: 'La fecha choca con otra asignación',
                        customClass: {
                            container: styles.ToastOnTopModal,
                        }
                    })
                    return false;
                }
            }
        }

        this.handleInputChange(false, cliente, current_datetime);
        this.handleInputChange(true, cliente, current_datetime);
    }

    handleInputChange = (evento, cliente, current_datetime) => {


        const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000
        });

        if (Date.parse(this.state.HoraDialogInicio) > Date.parse(this.state.HoraDialogFin)) {

            Toast.fire({
                type: 'error',
                title: 'Ingrese Fecha Válida',
                customClass: {
                    container: styles.ToastOnTopModal,
                }
            })
            return false;
        }
        let dia = new Date(current_datetime);
        let fecha = dia.getDate() + "-" + (dia.getMonth() + 1) + "-" + dia.getFullYear()

        var asignaciones = [...this.state.Asignaciones];

        if (evento) {
            let fechainiValid = this.isValidDate(this.state.HoraDialogInicio);
            let fechafinValid = this.isValidDate(this.state.HoraDialogFin);
            let finTiempoValid = this.state.FechaFinDialog !== "";
            let fechasValidas = fechainiValid && fechafinValid && finTiempoValid;

            if (!fechasValidas) {

                Toast.fire({
                    type: 'error',
                    title: 'Ingrese Fecha Válida',
                    customClass: {
                        container: styles.ToastOnTopModal,
                    }
                })
                return false;
            }

            // if (this.state.TipoVisitaClienteDialogValue === '') {

            //     Toast.fire({
            //         type: 'error',
            //         title: 'Seleccione Tipo Visita',
            //         customClass: {
            //             container: styles.ToastOnTopModal,
            //         }
            //     })
            //     return false;
            // }

            if (asignaciones.length > 0) {
                let index = 0;
                let found = false;
                asignaciones.forEach((asignacion, ind) => {
                    var day = new Date(asignacion.fecha);
                    var fechaAsignacion = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear()
                    if (fechaAsignacion === fecha) {
                        index = ind;
                        found = true;
                        return 0;
                    }
                })

                if (found) {
                    let ListaAsignaciones = [...asignaciones[index].asignaciones];

                    let encontrado = false;
                    let asignacionIndex = 0;
                    let horarioChoca = false;
                    ListaAsignaciones.some((asignacion, ind) => {
                        if (Date.parse(asignacion.HoraInicio) > Date.parse(this.state.HoraDialogInicio) && asignacion.Asesor === this.state.AsesorSelected) {
                            encontrado = true;
                            asignacionIndex = ind;
                            return true;
                        }

                        if (horarioChoca === false) {
                            let fechaAsignacionIni = moment(asignacion.HoraInicio).toDate();
                            let fechaAsignacionFin = moment(asignacion.HoraFin).toDate();
                            horarioChoca = ((fechaAsignacionIni > this.state.HoraDialogInicio && fechaAsignacionIni < this.state.HoraDialogFin && asignacion.Asesor === this.state.AsesorSelected) || (this.state.HoraDialogInicio > fechaAsignacionIni && this.state.HoraDialogInicio < fechaAsignacionFin && asignacion.Asesor === this.state.AsesorSelected));
                        }

                        return false;
                    });
                    if (horarioChoca) {
                        Toast.fire({
                            type: 'error',
                            title: 'La fecha choca con otra asignación',
                            customClass: {
                                container: styles.ToastOnTopModal,
                            }
                        })
                        return false;
                    }
                    if (encontrado) {
                        ListaAsignaciones.splice(asignacionIndex, 0, { cliente: cliente, HoraInicio: moment(this.state.HoraDialogInicio).format(), HoraFin: moment(this.state.HoraDialogFin).format(), IdPrioridad: this.state.RadioValue, IdTipoVisita: this.state.TipoVisitaClienteDialogValue, Asesor: this.state.AsesorSelected });
                    }
                    else {
                        ListaAsignaciones.push({ cliente: cliente, HoraInicio: moment(this.state.HoraDialogInicio).format(), HoraFin: moment(this.state.HoraDialogFin).format(), IdPrioridad: this.state.RadioValue, IdTipoVisita: this.state.TipoVisitaClienteDialogValue, Asesor: this.state.AsesorSelected });
                    }

                    asignaciones[index].asignaciones = ListaAsignaciones;
                }
                else {
                    let dia = { fecha: current_datetime, asignaciones: [{ cliente: cliente, HoraInicio: moment(this.state.HoraDialogInicio).format(), HoraFin: moment(this.state.HoraDialogFin).format(), IdPrioridad: this.state.RadioValue, IdTipoVisita: this.state.TipoVisitaClienteDialogValue, Asesor: this.state.AsesorSelected }] }
                    asignaciones.push(dia);
                }
            } else {
                let dia = { fecha: current_datetime, asignaciones: [{ cliente: cliente, HoraInicio: moment(this.state.HoraDialogInicio).format(), HoraFin: moment(this.state.HoraDialogFin).format(), IdPrioridad: this.state.RadioValue, IdTipoVisita: this.state.TipoVisitaClienteDialogValue, Asesor: this.state.AsesorSelected }] }
                asignaciones.push(dia);
            }

            this.setState({
                Asignaciones: asignaciones,
                ShowDialog: false,
                TipoValues: this.state.TipoInitialValues
            })
            this.cargarTiposAsignacionCliente();

        } else {
            if (asignaciones.length > 0) {
                let index = 0;
                let found = false;
                asignaciones.forEach((asignacion, ind) => {
                    var day = new Date(asignacion.fecha);
                    var fechaAsignacion = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear()
                    if (fechaAsignacion === fecha) {
                        index = ind;
                        found = true;
                        return 0;
                    }
                })

                if (found) {
                    let ListaAsignaciones = [...asignaciones[index].asignaciones];
                    let indexAsignacion = 0;
                    let encontrado = false;
                    ListaAsignaciones.forEach((el, inde) => {
                        if (el.cliente === cliente) {
                            indexAsignacion = inde;
                            encontrado = true;
                            return 0;
                        }
                    })

                    if (encontrado) {
                        ListaAsignaciones.splice(indexAsignacion, 1);
                        asignaciones[index].asignaciones = ListaAsignaciones;
                    }
                }

                // if (asignaciones[index].asignaciones.length === 0) {
                //     asignaciones.splice(index, 1);
                // }
            }
            this.setState({
                Asignaciones: asignaciones,
                ShowDialog: false,
            })
        }
    }

    isValidDate = (date) => {
        return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
    }

    Table = () => {
        var fecha = this.state.startDate;


        var header = [];
        var days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        do {
            var di = new Date(fecha);
            var dayName = days[di.getDay()];

            header.push({ dia: dayName, fecha: di })
            fecha = fecha.valueOf() + (1000 * 60 * 60 * 24);
        } while (fecha < this.state.endDate);

        return (
            <table className="table table-striped table-responsive">
                <thead>
                    <tr>
                        <th className={styles.StickyHeader}>Codigo</th>
                        <th className={styles.StickyHeader}>Clientes / Días</th>
                        {/* <th className={styles.StickyHeader}>Ruta</th> */}
                        <th className={styles.StickyHeader}>Ciudad</th>
                        {
                            header.map((dia) => {
                                return (
                                    <th className={styles.StickyHeader} style={{ textAlign: 'center' }} key={dia.dia}>{dia.dia}</th>
                                )
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.clientes.map((cliente, ind) => {

                            if (cliente.Asesor === this.state.AsesorSelected && cliente.Ruta === this.state.RutaSelected) {
                                var filas = this.Filas(header, cliente);

                                return (
                                    <tr key={ind}>
                                        <td className="font-weight-bold">{cliente.Codigo}</td>
                                        <td className="font-weight-bold">{cliente.Nombre}</td>
                                        {/* <td>{cliente.Ruta}</td> */}
                                        <td>{cliente.Direccion}</td>
                                        {
                                            filas.map(elemento => elemento)
                                        }
                                    </tr>
                                );
                            }
                            return null;
                        })
                    }
                </tbody>
            </table>
        )
    }

    Filas = (fechas, cliente) => {
        var array = [];

        fechas.map((dia) => {
            var diaAsignado = new Date(dia.fecha);
            var diaAsignacion = diaAsignado.getDate() + "-" + (diaAsignado.getMonth() + 1) + "-" + diaAsignado.getFullYear();
            var asignaciones = this.state.Asignaciones;
            var found = false;
            var index = "";
            var key = diaAsignacion + cliente.Codigo;
            asignaciones.forEach((asignacion) => {
                var day = new Date(asignacion.fecha);

                var fechaAsignacion = day.getDate() + "-" + (day.getMonth() + 1) + "-" + day.getFullYear();

                if (fechaAsignacion === diaAsignacion) {

                    asignacion.asignaciones.forEach((el, ind) => {
                        if (el.cliente === cliente.Codigo) {
                            found = true;
                            index = ind + 1;
                            return 0;
                        }
                    })

                }
                if (found)
                    return 0;
            })
            var row =
                <td key={key} style={{ textAlign: 'center', verticalAlign: 'middle', }}>
                    <FormControlLabel
                        control={

                            <input
                                type="checkbox"
                                checked={found}
                                style={{ height: 25, width: 25, marginRight: '5px' }}
                                onChange={(evento) => this.handleCheckbox(evento.target.checked, cliente, dia.fecha)} />
                        }
                        label={index}
                        style={{ margin: 0 }}
                    />


                </td>;

            array.push(row);
            return 0;
        })

        return array;
    }

    setDialog = (state) => {
        this.setState({
            TipoValues: this.state.TipoInitialValues,
            ShowDialog: state
        })
    }
}

const getRadio = (Color, ColorChecked) => {
    const RadioColor = withStyles({
        root: {
            color: Color,
            '&$checked': {
                color: ColorChecked,
            },
        },
        checked: {},
    })(props => <Radio color="default" {...props} />);

    return <RadioColor />;
}

const mapStateToProps = state => ({
    Configuraciones: state.Configuraciones,
    TipoVisita: state.TipoVisita
})

export default connect(mapStateToProps)(Asignacion);