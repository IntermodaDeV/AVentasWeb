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
import TablaSecciones from 'components/Encuestas/Secciones/TablaSecciones';
import { APIURL } from 'utils/Enviroment';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Dropdown } from "semantic-ui-react";

export const SeccionesEncuesta = props => {
    const [Secciones, setSecciones] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [Seccion, setSeccion] = useState(null);

    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Titulo: yup.string().required('El Titulo es obligatorio'),
            Status: yup.boolean(),
            Obligatorio: yup.boolean(),
        });

    useEffect(() => {
        cargarSeccionesEncuesta();
    }, [])
    const cargarSeccionesEncuesta = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Encuesta/Secciones`);
            setSecciones(request.data);
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado las secciones de encuestas.";

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

    const registrarSecciones = async (data) => {
        try {
            await axios.post(`${APIURL}/api/Encuesta/Secciones/registrar`, data);
            setMostrar(false)
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado la sección exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarSeccionesEncuesta();
            });

        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha registrado el tipo ingreso.";

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

    const modificar = async (data) => {
        setMostrar(false)
        try {
            await axios.post(`${APIURL}/api/TipoIngreso/modificar`, data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el tipo de ingreso exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarSeccionesEncuesta();
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

    const modificarEstado = async (id) => {
        try {
            await axios.post(`${APIURL}/api/tipoIngreso/estado/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarSeccionesEncuesta();
            });
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha modificado el estado.";

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

    const openEdit = (tip) => {
        setSeccion(tip);
        setMostrar(true);
    }

    const Mostrar = () => {
        setSeccion(null);
        setMostrar(true);
    }

    let initialValues, edit;

    if (Seccion) {
        initialValues = {
            Id: Seccion.$id,
            Nombre: Seccion.Nombre,
            Status: Seccion.Status,
            RequiereGrupoOpciones: Seccion.RequiereGrupoOpciones,
            Usuario: localStorage.getItem('codigo')
        }
        edit = true;
    }
    else {
        initialValues = {
            Nombre: '',
            Status: false,
            RequiereGrupoOpciones: false,
            Usuario: localStorage.getItem('codigo')
        }
        edit = false;
    }
    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">REGISTRAR SECCIONES DE ENCUESTAS</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            registrarSecciones(values)
                        }}>
                        {({ errors, resetForm, values, setValues }) => (
                            <div ref={context}>
                                <Form>
                                    <div className="form-group">
                                        <Dropdown
                                            placeholder="Encuesta"
                                            selection
                                            style={{ zIndex: 999 }}
                                            onChange={(e, { value }) => alert(value)}
                                            options={values.EncuestaId}
                                            noResultsMessage={"No hay resultados"}
                                            closeOnChange={true}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Field
                                            label="Nombre"
                                            name="Nombre"
                                            error={!!errors.Nombre}
                                            helperText={errors.Nombre}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px', fontSize: '40px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Field
                                            label="Titulo"
                                            name="Titulo"
                                            error={!!errors.Titulo}
                                            helperText={errors.Titulo}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px', fontSize: '40px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Field
                                            label="Descripción"
                                            name="Descripcion"
                                            error={!!errors.Titulo}
                                            helperText={errors.Titulo}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px', fontSize: '40px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>

                                    <FormControlLabel
                                        control={
                                            <Field
                                                type="checkbox"
                                                name="Status"
                                                checked={values.Status}
                                                as={CheckBox}
                                            />
                                        }
                                        label={"Activar"}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Field
                                                type="checkbox"
                                                name="Obligarorio"
                                                checked={values.Obligatorio}
                                                as={CheckBox}
                                            />
                                        }
                                        label={"Obligatorio"}
                                    />
                                    <DialogActions>
                                        <Button onClick={() => { setMostrar(false) }} color="primary">
                                            Cancelar
                                        </Button>
                                        {edit && <Button type="button" onClick={() => { modificar(values) }} color="sucess"> Guardar</Button>}
                                        {!edit && <Button type="submit" color="sucess">Guardar</Button>}
                                    </DialogActions>
                                </Form>
                            </div>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
            <TablaSecciones Secciones={Secciones} setMostrar={Mostrar} openEdit={openEdit} ModificarEstado={modificarEstado} />
        </div>
    )
}