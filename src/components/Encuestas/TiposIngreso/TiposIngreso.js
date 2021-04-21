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
import TablaTiposIngreso from 'components/Encuestas/TiposIngreso/TablaTiposIngreso';
import { APIURL } from 'utils/Enviroment';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export const TiposIngreso = props => {
    const [tiposIngresos, setTiposIngresos] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [tipoIngreso, setTipoIngreso] = useState(null);

    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Etiqueta: yup.string().required('La etiqueta es obligatoria'),
            Status: yup.boolean(),
            RequiereGrupoOpciones: yup.boolean(),
        });

    const cargarTipoIngreso = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/TipoIngreso`);
            setTiposIngresos(request.data);
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado los tipos de ingresos.";

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

    const registrarTipoIngreso = async (data) => {
        try {
            await axios.post(`${APIURL}/api/TipoIngreso/registrar`, data);
            setMostrar(false)
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado el tipo ingreso exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarTipoIngreso();
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
                cargarTipoIngreso();
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
                cargarTipoIngreso();
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
        setTipoIngreso(tip);
        setMostrar(true);
    }

    const Mostrar = () => {
        setTipoIngreso(null);
        setMostrar(true);
    }
    useEffect(() => {
        cargarTipoIngreso();
    }, [])

    let initialValues, edit;

    if (tipoIngreso) {
        initialValues = {
            Id: tipoIngreso.$id,
            Nombre: tipoIngreso.Nombre,
            Etiqueta:tipoIngreso.Etiqueta,
            Status: tipoIngreso.Status,
            RequiereGrupoOpciones: tipoIngreso.RequiereGrupoOpciones,
            Usuario: localStorage.getItem('codigo')
        }
        edit = true;
    }
    else {
        initialValues = {
            Nombre: '',
            Etiqueta:'',
            Status: true,
            RequiereGrupoOpciones: false,
            Usuario: localStorage.getItem('codigo')
        }
        edit = false;
    }
    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">REGISTRAR TIPO DE INGRESO</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            registrarTipoIngreso(values)
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
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Field
                                            label="Etiqueta"
                                            name="Etiqueta"
                                            error={!!errors.Etiqueta}
                                            helperText={errors.Etiqueta}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
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
                                                name="RequiereGrupoOpciones"
                                                checked={values.RequiereGrupoOpciones}
                                                as={CheckBox}
                                            />
                                        }
                                        label={"Requiere Grupo de Opciones"}
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
            <TablaTiposIngreso TiposIngreso={tiposIngresos} setMostrar={Mostrar} openEdit={openEdit} ModificarEstado={modificarEstado} />
        </div>
    )
}