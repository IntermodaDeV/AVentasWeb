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
import TablaGrupoOpcionesDetalle from 'components/Encuestas/GrupoOpcionesDetalle/TablaGrupoOpcionesDetalle';
import { APIURL } from 'utils/Enviroment';

export const GrupoOpcionesDetalle = props => {
    const [GrupoOpcionesDetalle, setGrupoOpcionesDetalle] = useState([]);
    const [GrupoOpciones, setGrupoOpciones] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [grupoOpcionDetalle, setGrupoOpcionDetalle] = useState(null);

    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Status: yup.boolean(),
        });

    useEffect(() => {
        cargarGrupoOpcionesDetalle();
          // eslint-disable-next-line
    }, [])

    const cargarGrupoOpcionesDetalle = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/GrupoOpcionesDetalle`);
            setGrupoOpcionesDetalle(request.data);
            cargarGrupoOpciones()
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado los grupos de opciones detalle.";

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

    const cargarGrupoOpciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/GrupoOpciones`);
            let GrupoOpciones = [];
            request.data.filter(g => g.Status === true).forEach(grupo => {
                let Valores = { key: grupo.Nombre, value: grupo.Id}
                GrupoOpciones.push(Valores);
            })
            setGrupoOpciones(GrupoOpciones);
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

    const registrarGrupoOpcionesDetalle = async (data) => {
        setMostrar(false)
        try {
            await axios.post(`${APIURL}/api/GrupoOpcionesDetalle/registrar`, data);
           
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado el tipo ingreso exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarGrupoOpcionesDetalle();
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
            await axios.post(`${APIURL}/api/GrupoOpcionesDetalle/modificar`, data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el grupo de opciones exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarGrupoOpcionesDetalle();
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

    const openEdit = (opc) => {
        setGrupoOpcionDetalle(opc);
        setMostrar(true);
    }

    const Mostrar = () => {
        setGrupoOpcionDetalle(null);
        setMostrar(true);
    }

    let initialValues, edit;

    if (grupoOpcionDetalle) {
        initialValues = {
            Id: grupoOpcionDetalle.Id,
            Nombre: grupoOpcionDetalle.Nombre,
            GrupoOpcionesId: grupoOpcionDetalle.GrupoOpcionesId,
            Usuario: localStorage.getItem('codigo')
        }
        edit = true;
    }
    else {
        initialValues = {
            Nombre: '',
            GrupoOpcionesId: '',
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
                            registrarGrupoOpcionesDetalle(values)
                        }}>
                        {({ errors, resetForm, values, setValues }) => (
                            <div ref={context}>
                                <Form>
                                    <div className="form-group">
                                        <label htmlFor="GrupoOpcion">Grupo Opcion</label>
                                        <Field id="Opcion" name="GrupoOpcionesId" as='select' className="form-control" style={{ width: '450px', marginRight: '20px' }}>
                                            {
                                                GrupoOpciones.map(opcion => {
                                                    return (
                                                        <option key={opcion.value} value={opcion.value}>
                                                            {opcion.key}
                                                        </option>
                                                    )
                                                })
                                            }
                                        </Field>
                                    </div>
                                    <div className="form-group">
                                        <Field
                                            label="Nombre"
                                            name="Nombre"
                                            error={!!errors.Nombre}
                                            helperText={errors.Nombre}
                                            style={{ width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
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
            <TablaGrupoOpcionesDetalle GrupoOpcionesDetalle={GrupoOpcionesDetalle} setMostrar={Mostrar} openEdit={openEdit} />
        </div>
    )
}