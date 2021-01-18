import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import {TablaEncuesta} from 'components/Encuestas/Encuestas/TablaEncuesta';
import { APIURL } from 'utils/Enviroment';
import { DatePicker } from "@material-ui/pickers";
import moment from 'moment';
import { MdPlaylistAdd } from "react-icons/md";

export const Encuesta = (props) => {
    const [encuestas, setEncuestas] = useState([]);
    const [encuestasInactivas, setEncuestasInactivas] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [encuesta, setEncuesta] = useState(null);
    const [fechaInicio, setFechaInicio] = useState(new Date());
    const [fechaFin, setfechaFin] = useState(new Date());
    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Descripcion: yup.string().required('La descripción es obligatoria'),       
        });

    useEffect(() => {
        cargarEncuestas();
    }, [])
    const cargarEncuestas = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Encuesta`);
            let fecha =  moment().format('YYYY-MM-DDTHH:mm');
            let EncuestasActivas = request.data.filter(e =>e.FechaFin >= fecha);
            let EncuestasInactivas = request.data.filter(e =>e.FechaFin < fecha);
            setEncuestasInactivas(EncuestasInactivas);
            setEncuestas(EncuestasActivas);
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado las encuestas.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const registrarEncuesta = async (data) => {
        try {
            await axios.post(`${APIURL}/api/Encuesta/registrar`, data);
            setMostrar(false)
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado la encuesta exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarEncuestas();
            });

        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha registrado la encuesta.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const ModificarEncuestas = async (data) => {
        setMostrar(false)
        try {
            await axios.post(`${APIURL}/api/Encuesta/modificar`, data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado la encuesta exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarEncuestas();
            });

        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha modificado la pantalla.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const openEdit = (encuesta) => {
        setFechaInicio(encuesta.FechaInicio)
        setfechaFin(encuesta.FechaFin)
        setEncuesta(encuesta);
        setMostrar(true);
    }

    const Modificar = (valores) => {
        valores.FechaInicio = moment(fechaInicio).toDate();
        valores.FechaFin = moment(fechaFin).toDate();
        ModificarEncuestas(valores)
    }
    const Mostrar = () => {
        setEncuesta(null);
        setMostrar(true);
    }

    let initialValues, edit;

    if (encuesta) {

        initialValues = {
            Id: encuesta.Id,
            Nombre: encuesta.Nombre,
            Descripcion: encuesta.Descripcion,
            FechaInicio: encuesta.FechaInicio,
            FechaFin: encuesta.FechaFin,
            Usuario: localStorage.getItem('codigo')
        }

        edit = true;
    }
    else {
        initialValues = {
            Nombre: '',
            Descripcion: '',
            FechaInicio: new Date(),
            FechaFin: new Date(),
            Usuario: localStorage.getItem('codigo')
        }
        edit = false;
    }
    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">REGISTRAR NUEVA ENCUESTA</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            values.FechaInicio = moment(fechaInicio).toDate();
                            values.FechaFin = moment(fechaFin).toDate();
                            registrarEncuesta(values)
                        }}>
                        {({ errors, resetForm, values, setValues, setFieldValue }) => (
                            <div ref={context}>
                                <Form>
                                    <div className="form-group">
                                        <Field
                                            label="Nombre"
                                            name="Nombre"
                                            error={!!errors.Nombre}
                                            helperText={errors.Nombre}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Field
                                            label="Descripción"
                                            name="Descripcion"
                                            error={!!errors.Descripcion}
                                            helperText={errors.Descripcion}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <DatePicker
                                            autoOk
                                            label={"Fecha Inicio"}
                                            variant="inline"
                                            format={"DD/MM/YYYY"}
                                            id="FechaInicio"
                                            style={{ marginRight: '110px', fontSize: '40px' }}
                                            value={fechaInicio}
                                            onChange={(date) => setFechaInicio(date)}
                                        />
                                        <DatePicker
                                            autoOk
                                            label={"Fecha Final"}
                                            variant="inline"
                                            format={"DD/MM/YYYY"}
                                            id="FechFin"
                                            style={{ marginRight: '20px', fontSize: '40px' }}
                                            value={fechaFin}
                                            onChange={(date) => setfechaFin(date)}
                                        /> 
                                    </div>
                                    <DialogActions>
                                        <Button onClick={() => { setMostrar(false) }} color="primary">
                                            Cancelar
                                        </Button>
                                        {edit && <Button type="button" onClick={() => { Modificar(values) }} color="sucess"> Guardar</Button>}
                                        {!edit && <Button type="submit" color="sucess">Guardar</Button>}
                                    </DialogActions>
                                </Form>
                            </div>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
            <div className="col">
                <div class="card-body text-center">
                    <div class="text-right">
                        <button className="btn btn-primary" onClick={() => { Mostrar() }}>Registrar Nuevo <MdPlaylistAdd /></button>
                    </div>
                </div>
                <div style={{ marginTop: '20px' }} className="container-fluid">
                    <div className="row">
                        <div className="col">
                            <TablaEncuesta titulo="Encuestas Activas" cabeceras={["Nombre", "Descripción", "",""]} valores={encuestas} setMostrar={Mostrar} openEdit={openEdit} cargarSecciones={props.cargarSeccion} />
                        </div>
                        <div className="col">
                            <TablaEncuesta titulo="Encuestas Inactivas" cabeceras={["Nombre", "Descripción", "",""]} valores={encuestasInactivas} setMostrar={Mostrar} openEdit={openEdit} cargarSecciones={props.cargarSeccion} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}