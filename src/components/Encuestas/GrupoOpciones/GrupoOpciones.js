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
import TablaGrupoOpciones from 'components/Encuestas/GrupoOpciones/TablaGrupoOpciones';
import { APIURL } from 'utils/Enviroment';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export const GrupoOpciones = props => {
    const [GrupoOpciones, setGrupoOpciones] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [grupoOpcion, setgrupoOpcion] = useState(null);

    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Status: yup.boolean(),
        });

        useEffect(() => {
            cargarGrupoOpciones();
        }, [])

    const cargarGrupoOpciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/GrupoOpciones`);
            setGrupoOpciones(request.data);
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado los grupos de opciones.";

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

    const registrarGrupoOpciones = async (data) => {
        try {
            await axios.post(`${APIURL}/api/GrupoOpciones/registrar`, data);
            setMostrar(false)
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado el tipo ingreso exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarGrupoOpciones();
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

    const modificarGrupoOpciones = async (data) => {
        setMostrar(false)
        try {
            await axios.post(`${APIURL}/api/GrupoOpciones/modificar`, data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el grupo de opciones exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarGrupoOpciones();
            });

        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha modificado el registro.";

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
            await axios.post(`${APIURL}/api/GrupoOpciones/estado/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarGrupoOpciones();
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
        setgrupoOpcion(tip);
        setMostrar(true);
    }

    const Mostrar = () => {
        setgrupoOpcion(null);
        setMostrar(true);
    }
    
    let initialValues, edit;

    if (grupoOpcion) {
        initialValues = {
            Id: grupoOpcion.Id,
            Nombre: grupoOpcion.Nombre,
            Status: grupoOpcion.Status,
            Usuario: localStorage.getItem('codigo')
        }
        edit = true;
    }
    else {
        initialValues = {
            Nombre: '',
            Status: true,
            Usuario: localStorage.getItem('codigo')
        }
        edit = false;
    }
    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">REGISTRAR GRUPO DE OPCIONES</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            registrarGrupoOpciones(values)
                        }}>
                        {({ errors, resetForm, values, setValues }) => (
                            <div ref={context}>
                                <Form>
                                    <div className="form-group">
                                        <Field
                                            label="Nombre"
                                            name="Nombre"
                                            error={!!errors.Nombre}
                                            helperText={errors.Nombre}
                                            style={{ width: '450px', marginRight: '20px'}}
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
                                    <DialogActions>
                                        <Button onClick={() => { setMostrar(false) }} color="primary">
                                            Cancelar
                                        </Button>
                                        {edit && <Button type="button" onClick={() => { modificarGrupoOpciones(values) }} color="sucess"> Guardar</Button>}
                                        {!edit && <Button type="submit" color="sucess">Guardar</Button>}
                                    </DialogActions>
                                </Form>
                            </div>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
            <TablaGrupoOpciones GrupoOpciones={GrupoOpciones} setMostrar={Mostrar} openEdit={openEdit} ModificarEstado={modificarEstado} />
        </div>
    )
}