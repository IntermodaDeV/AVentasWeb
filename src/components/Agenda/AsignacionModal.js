import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Button, Select, MenuItem } from '@material-ui/core';
import { TimePicker } from "@material-ui/pickers";
import { withStyles } from '@material-ui/core/styles';
import { Radio, RadioGroup, FormControl, FormLabel, FormControlLabel } from '@material-ui/core';
import styles from './AsignacionModal.module.css';
import moment from "moment";
import {APIURL} from 'utils/Enviroment';
moment.locale('es');


const Modal = (props) => {
    const [LoadedTiempoEstimado, setLoadedTiempoEstimado] = useState(false);
    const [RadioValue, setRadioValue] = useState('');
    const [HoraDialogFin, setHoraDialogFin] = useState(new Date());
    const [TiempoTotal, setTiempoTotal] = useState('');
    const [Configuraciones, setConfiguraciones] = useState(null);
    const [PrioridadesAsignacion, setPrioridadesAsignacion] = useState([]);
    const [TiposVisitaCliente, setTiposVisitaCliente] = useState([]);
    const [TipoValues, setTipoValues] = useState([]);
    const [TipoInitialValues, setTipoInitialValues] = useState([]);

    let NoWarn = "" + LoadedTiempoEstimado + HoraDialogFin + TiempoTotal + TiposVisitaCliente + TipoInitialValues;
    
    if (NoWarn === true) {
        console.log('NoWarn :', NoWarn);
    }


    const urlApi = APIURL ;
    // urlApi = "http://localhost:62630/";


    useEffect(() => {

        cargarPrioridadesAsignacion();
        cargarTiempoEstimado();
        cargarTiposAsignacionCliente();
        // eslint-disable-next-line
    }, []);

    const cargarTiposAsignacionCliente = () => {
        fetch(urlApi + "/api/TipoVisitaCliente", {
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
                                getTipos(result);
                                setTiposVisitaCliente(result);
                            },
                        )
                }

            })
    }

    const cargarTiempoEstimado = () => {
        fetch(urlApi + "/api/Configuraciones", {
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
                                setLoadedTiempoEstimado(true)
                                setConfiguraciones(result);
                            },
                        )
                }

            })
    }

    const cargarPrioridadesAsignacion = () => {
        fetch(urlApi + "/api/PrioridadAsignacion", {
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
                                setPrioridadesAsignacion(result);
                            },
                        )
                }

            })
    }

    const onChangeTipos = (Index, tipos) => event => {

        let ArrayTipos = [...tipos];

        ArrayTipos[Index].Tiempo = event.target.value;

        let TiempoTotal = 0;
        tipos.map(tipo => {
            if (tipo.Tiempo !== '') {
                TiempoTotal += tipo.Tiempo;
            }
            return false;
        })

        let olddate = new moment(props.HoraDialogInicio).toDate();
        let fecha = TiempoTotal;
        let date = new moment(olddate).add(fecha, 'minutes').toDate();


        setHoraDialogFin(date);
        setTiempoTotal(Number(fecha));
        setTipoValues(ArrayTipos);
    }

    const getTipos = (tipos) => {

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

        setTipoValues(ArrayValues);
        setTipoInitialValues(ArrayInitalValues);
    }

    const handlePrioridadRadio = (event) => {
        setRadioValue(parseInt(event.target.value));
    }


    const getTiempos = () => {

        if (Configuraciones) {
            let { IN, MV } = Configuraciones;

            let Tiempos = [];
            let Interval = parseInt(IN);
            let Max = parseInt(MV);
            for (let val = Interval; val <= Max; val += Interval) {

                let label = getLabelTiempoEstimado(val);
                let valueMinutes = parseInt(val / 60);
                let item = { "Label": label, "Value": valueMinutes }

                Tiempos.push(item);
            }

            return Tiempos;
        }
    }

    const getLabelTiempoEstimado = (seconds) => {
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


    return (
        <Dialog
            fullWidth={false}
            maxWidth={'md'}
            classes={{
                paper: styles.PaperDialog
            }}
            open={props.ShowDialog}
            onClose={() => props.setDialog(false)}
            scroll={'paper'}
            aria-labelledby="scroll-dialog-title"
        >
            <DialogTitle id="scroll-dialog-title">
                {
                    props.ButtonQuitarDisabled ? "Asignar Hora" : "Editar Hora"
                }
            </DialogTitle>
            <DialogContent style={{ overflow: 'auto' }}>
                <DialogContentText>
                    Cliente:  {props.ClienteNombre}
                </DialogContentText>
                <div className="row justify-content-around">
                    <div className="col-md-6 col-12 p-0">
                        <div className="col-12 py-1">
                            <h6>Hora Inicio:</h6>
                            <TimePicker
                                value={props.HoraDialogInicio}
                                onChange={(date) => props.handleFechaDialogInicio(date)}
                            />
                        </div>
                        <div className="col-12 py-md-3 py-1">
                            <FormControl component="fieldset" style={{ width: '100%' }}>
                                <FormLabel component="legend">Prioridad</FormLabel>
                                <RadioGroup aria-label="position" name="position" value={RadioValue ? RadioValue.toString() : ''} style={{ justifyContent: 'space-around' }} onChange={(event) => handlePrioridadRadio(event)} row>
                                    {PrioridadesAsignacion.map((priAsig, index) => {
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
                                    {TipoValues.map((tipVisCli, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    {tipVisCli.Nombre}
                                                </td>
                                                <td>
                                                    <Select
                                                        value={tipVisCli.Tiempo}
                                                        className={"DropdownAsignacionTiempo " + styles.SelectTiempo}
                                                        onChange={onChangeTipos(index, TipoValues)}
                                                    >
                                                        {
                                                            getTiempos().map((tiempo) => {
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
                        props.ButtonQuitarDisabled ? null :
                            <Button onClick={() => props.handleInputChange(props.ButtonQuitarDisabled, props.ClienteCodigo, props.fechaAsignacion)} color="primary">
                                Quitar
                            </Button>
                    }

                    <Button onClick={() => props.ButtonQuitarDisabled ? props.handleInputChange(props.ButtonQuitarDisabled, props.ClienteCodigo, props.fechaAsignacion) : props.handleInputEdit(props.ButtonQuitarDisabled, props.ClienteCodigo, props.fechaAsignacion)} color="primary">
                        Guardar
                    </Button>
                </div>

            </DialogActions>
        </Dialog>
    );
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

export default Modal;