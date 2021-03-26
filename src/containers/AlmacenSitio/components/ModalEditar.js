import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import { APIURL } from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import axios from 'axios';

export const ModalEditar = props => {
    const validationSchema = yup.object().shape(
        {
            etiqueta: yup.string().required('La etiqueta es obligatoria'),
            estatus: yup.boolean(),
        });

    const initialValues = {
        id: props.id,
        etiqueta: props.etiqueta,
        estatus: props.estatus,
        usuario: localStorage.getItem('codigo')
    }

    const modificarSitio = async (data) => {
        try {
            await axios.post(`${APIURL}/api/almacenes/modificar`, data);
            props.cargarAlmacenes();
            props.cerrar();
            Swal.fire({
                title: '¡Modificado con exito!',
                text: "Se ha modificado almacen con exito.",
                type: 'success',
                confirmButtonText: 'OK',
            });
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se pudo modificar.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'OK',
            });
        }
    }

    return (
        <Dialog open={props.mostrar} aria-labelledby="form-dialog-title">
            <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">Modificar Almacen</DialogTitle>
            <DialogContent>
                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        modificarSitio(values)
                    }}>
                    {({ errors, values }) => (
                        <div>
                            <Form>
                                <div className="form-group">
                                    <Field
                                        label="Etiqueta"
                                        name="etiqueta"
                                        error={!!errors.etiqueta}
                                        helperText={errors.etiqueta}
                                        style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                        as={TextField}
                                        className="form-control"
                                    />
                                </div>
                                <FormControlLabel
                                    control={
                                        <Field
                                            type="checkbox"
                                            name="estatus"
                                            checked={values.estatus}
                                            as={CheckBox}
                                        />
                                    }
                                    label={"Activar"}
                                />
                                <DialogActions>
                                    <Button onClick={props.cerrar} color="primary">Cancelar</Button>
                                    <Button type="submit" color="sucess">Guardar</Button>
                                </DialogActions>
                            </Form>
                        </div>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    )
}