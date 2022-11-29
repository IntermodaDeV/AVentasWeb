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
import TablaGrupoImpuesto from './TablaGrupoImpuesto';
import { APIURL } from 'utils/Enviroment';


export const GrupoImpuesto = props => {
    const [grupoImpuestos, setGrupoImpuestos] = useState([]);
    const [grupoImpuesto, setGrupoImpuesto] = useState(null);
    const [mostrar, setMostrar] = useState(false);
    const context = useRef();
    const cargarGrupoImpuestos = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/GrupoImpuesto`);
            setGrupoImpuestos(request.data);
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado los tipos de gastos.";

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
            await axios.post(`${APIURL}/api/ActualizarGrupoImpuesto`, data).then(resp => {
                Swal.fire({
                    title: 'Confirmado',
                    text: "Se ha Actualizado el grupo de impuesto exitosamente.",
                    type: 'success',
                    confirmButtonText: 'Ok',
                }).then(e => {
                    cargarGrupoImpuestos();
                });
            })
        } catch (err) {
            console.log(err)
            let mensaje = "Ha ocurrido un error y no se ha Actualizado el grupo de impuestos.";

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
    const openEdit = (grupo) => {
        setGrupoImpuesto(grupo);
        setMostrar(true);

    }
    let initialValues;
    if (grupoImpuesto) {
        initialValues = {
            empresaID: grupoImpuesto.empresaID,
            grupoImpuestoGravado: grupoImpuesto.grupoImpuestoGravado,
            grupoImpuestoArticuloGravado: grupoImpuesto.grupoImpuestoArticuloGravado,
            grupoImpuestoExento: grupoImpuesto.grupoImpuestoExento,
            grupoImpuestoArticuloExento: grupoImpuesto.grupoImpuestoArticuloExento,
        }
    }
    useEffect(() => {
        cargarGrupoImpuestos()
    }, [])

    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title"> Grupo Impuestos</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                    >
                        {({ errors, resetForm, values, setValues }) => (
                            <div ref={context}>
                                <Form>
                                    <div className="form-group">
                                        <Field
                                            label="Empresa"
                                            name="empresaID"
                                            error={!!errors.empresaID}
                                            helperText={errors.empresaID}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            disabled={true}
                                            className="form-control"
                                        />
                                        <br />
                                        <Field
                                            label="Grupo impuesto Gravado"
                                            name="grupoImpuestoGravado"
                                            error={!!errors.grupoImpuestoGravado}
                                            helperText={errors.grupoImpuestoGravado}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            disabled={false}
                                            className="form-control"
                                        />
                                        <br />
                                        <Field
                                            label="Grupo impuesto Articulo Gravado"
                                            name="grupoImpuestoArticuloGravado"
                                            error={!!errors.grupoImpuestoArticuloGravado}
                                            helperText={errors.grupoImpuestoArticuloGravado}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            disabled={false}
                                            className="form-control"
                                        />
                                        <br />
                                        <Field
                                            label="Grupo impuesto Exento"
                                            name="grupoImpuestoExento"
                                            error={!!errors.grupoImpuestoExento}
                                            helperText={errors.grupoImpuestoExento}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            disabled={false}
                                            className="form-control"
                                        />
                                        <br />
                                        <Field
                                            label="Grupo impuesto Articulo Exento"
                                            name="grupoImpuestoArticuloExento"
                                            error={!!errors.grupoImpuestoArticuloExento}
                                            helperText={errors.grupoImpuestoArticuloExento}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            disabled={false}
                                            className="form-control"
                                        />
                                    </div>
                                    <DialogActions>
                                        <Button onClick={() => { setMostrar(false) }} color="primary">
                                            Cancelar
                                        </Button>
                                        <Button type="button" onClick={() => { modificar(values) }} color="sucess">
                                            Guardar
                                        </Button>
                                    </DialogActions>
                                </Form>
                            </div>
                        )
                        }

                    </Formik>
                </DialogContent>

            </Dialog>
            <TablaGrupoImpuesto GrupoImpuesto={grupoImpuestos} openEdit={openEdit} />
        </div>
    )
}