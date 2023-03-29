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
import TablaTiposGasto from './TablaTipoGasto';
import { APIURL } from 'utils/Enviroment';

export const TipoGasto = props => {
    const [tiposGasto, setTiposGasto] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [tipoGasto, setTipoGasto] = useState(null);
    const [empresas, setEmpresas] = useState([]);
    const context = useRef();

    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Diario: yup.string().required('El diario es obligatoria'),
        });

    const cargarEmpresas = async() =>{
        try{
            const request = await axios.get(`${APIURL}/api/Gira/Empresas`)
            let empresasList =[];
            request.data.forEach(empresa => {
                let valores = { key: empresa.Empresa, value: empresa.Empresa }
                empresasList.push(valores);
            });
            setEmpresas(empresasList)
            cargarTipoGasto();
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las empresas.";

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

    const cargarTipoGasto = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Gira/TipoGasto`);
            setTiposGasto(request.data);
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

    const modificarEstado = async (id) => {
        try {
            await axios.post(`${APIURL}/api/Gira/ActualizarEstadoTipo/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarTipoGasto();
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

    const registrarTipoGasto = async (data) => {
        try {
            await axios.post(`${APIURL}/api/Gira/RegistrarTipoGasto`, data);
            setMostrar(false);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado el tipo ingreso exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarTipoGasto();
            });
        } catch (err) {
            setMostrar(false)
            let mensaje = "Ha ocurrido un error y no se ha registrado el tipo de gasto.";

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
            await axios.post(`${APIURL}/api/Gira/ActualizarNombreTipo/${data.Id}/${data.Nombre}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el Tipo de Gastos exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarTipoGasto();
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

    const openEdit = (tip) => {
        setTipoGasto(tip);
        setMostrar(true);
    }

    const Mostrar = () => {
        setTipoGasto(null);
        setMostrar(true);
    }

    let initialValues, edit;

    if (tipoGasto) {
        initialValues = {
            Id: tipoGasto.Id,
            Empresa: tipoGasto.Empresa,
            Nombre: tipoGasto.Nombre,
            Diario: tipoGasto.Diario,
            Activo: tipoGasto.Activo,
        }
        edit = true
    } else {
        initialValues = {
            Empresa :empresas.length > 0 ? empresas[0].value : '',
            Nombre: '',
            Diario: '',
        }
        edit = false
    }

    useEffect(() => {
        cargarEmpresas()
        // eslint-disable-next-line
    }, [])
    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title"> {edit ? ' ' : 'Registrar'}Tipo Gasto</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            registrarTipoGasto(values)
                        }}
                    >
                        {({ errors, resetForm, values, setValues }) => (
                            <div ref={context}>
                                <Form>
                                    <div className="form-group">
                                        <Field id="Empresa" name="Empresa" as="select" className="form-control" style={{ width: '450px', marginRight: '20px' }} disabled={edit ? true : false}>
                                            {
                                                empresas.map(opcion => {
                                                    return (
                                                        <option key={opcion.value} value={opcion.value}>
                                                            {opcion.key}
                                                        </option>

                                                    )
                                                })
                                            }
                                        </Field>
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
                                            label="Diario"
                                            name="Diario"
                                            error={!!errors.Diario}
                                            helperText={errors.Diario}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            disabled={edit ? true : false}
                                            className="form-control"
                                        />
                                    </div>
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
            <TablaTiposGasto TiposGastos={tiposGasto} setMostrar={Mostrar} openEdit={openEdit} ModificarEstado={modificarEstado}></TablaTiposGasto>
        </div>

    )
}