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
import TablaEncuestas from 'components/Encuestas/Encuestas/TablaEncuestas';
import { APIURL } from 'utils/Enviroment';
import { DatePicker } from "@material-ui/pickers";

export const Encuesta = props => {
    const [encuestas, setEncuestas] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [encuesta, setEncuesta] = useState(null);
    const [fechaInicio, setFechaInicio] = useState(new Date());
    const [fechaFin, setfechaFin] = useState(new Date());
   
    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Descripcion: yup.string().required('La descripción es obligatoria'),
            Empresa: yup.string()
        });

        useEffect(() => {
            cargarEncuestas();
        }, [])
        
    const cargarEncuestas = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Encuesta`);
            setEncuestas(request.data);
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

    const registrarEncuesta = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/Encuesta/registrar`,data);
            setMostrar(false)
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado la encuesta exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarEncuestas();
            });

        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha registrado la encuesta.";

            if(err.response){
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

    const ModificarEncuestas = async (data)=>{
        setMostrar(false)
        try{
            await axios.post(`${APIURL}/api/Encuesta/modificar`,data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el tipo de ingreso exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarEncuestas();
            });

        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado la pantalla.";

            if(err.response){
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
        setEncuesta(encuesta);
        setMostrar(true);
    }

    const Mostrar = () => {
        setEncuesta(null);
        setMostrar(true);
    }
   
    let initialValues,edit;

    if(encuesta)
    {
        initialValues={
            Id: encuesta.Id,
            Nombre: encuesta.Nombre,
            Descripcion: encuesta.Descripcion,
            Empresa: encuesta.Empresa,
            FechaInicio: encuesta.FechaInicio,
            FechaFin: encuesta.FechaFin,
            CreatedBy: localStorage.getItem('codigo')
        }
        edit=true;
    }
    else
    {
        initialValues={
            Nombre: '',
            Descripcion: '',
            Empresa: '',
            FechaInicio: new Date(),
            FechaFin: new Date(),
            CreatedBy: localStorage.getItem('codigo')
        }
        edit=false;
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
                         onSubmit={(values)=>{
                            registrarEncuesta(values)
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
                                            label="Descripcion"
                                            name="Descripcion"
                                            error={!!errors.Descripcion}
                                            helperText={errors.Descripcion}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Field
                                            label="empresa"
                                            name="empresa"
                                            error={!!errors.Empresa}
                                            helperText={errors.Empresa}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <DatePicker
                                            autoOk
                                            label="Fecha Inicio"
                                            name="FechaInicio"
                                            variant="inline"
                                            format={"DD/MM/YYYY"}
                                            style={{ marginRight: '110px', fontSize: '40px' }}
                                            invalidDateMessage={"Fecha no es válida"}
                                            value={fechaInicio}
                                            onChange={(date) => setFechaInicio(date)}
                                        />
                                        <DatePicker
                                            autoOk
                                            label="Fecha Final"
                                            name="FechaFin"
                                            variant="inline"
                                            format={"DD/MM/YYYY"}
                                            style={{ marginRight: '20px', fontSize: '40px' }}
                                            invalidDateMessage={"Fecha no es válida"}
                                            value={fechaFin}
                                            onChange={(date) => setfechaFin(date)}
                                        />
                                    </div>
                                    <DialogActions>
                                        <Button onClick={()=>{setMostrar(false)}} color="primary">
                                            Cancelar
                                        </Button>
                                        {edit && <Button type="button" onClick={()=>{ModificarEncuestas(values)}} color="sucess"> Guardar</Button>}
                                        {!edit && <Button type="submit" color="sucess">Guardar</Button>}
                                    </DialogActions>
                                </Form>
                            </div>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
         
            <TablaEncuestas Encuestas={encuestas} setMostrar={Mostrar} openEdit = {openEdit}/>
        </div>
    )
}