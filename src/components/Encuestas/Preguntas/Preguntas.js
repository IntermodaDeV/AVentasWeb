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
import { APIURL } from 'utils/Enviroment';
import CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TablaPreguntas from 'components/Encuestas/Preguntas/TablaPreguntas'
import { useSelector } from 'react-redux';

export const Preguntas = props => {
    const Preguntas = useSelector(e => e.PreguntasEncuesta);
    const TipoIngreso = useSelector(e => e.TipoIngreso);
    const GrupoOpciones = useSelector(g => g.GrupoOpciones);
    const [mostrar, setMostrar] = useState(false);
    const [respuesta, setRespuesta] = useState(null);
    const [requiereGrupoOpciones, setRequiereGrupoOpciones] = useState("visible");

    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Obligatorio: yup.boolean(),
            RespuestaObligatorio: yup.boolean(),
            Status: yup.boolean(),
        });
    
    const registrarPreguntas = async (data) => {
        try {
            await axios.post(`${APIURL}/api/preguntas/registrar`, data);
            setMostrar(false)
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado la pregunta exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                props.cargarPreguntas(data.SeccionEncuestaId);
            });

        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha registrado la pregunta.";

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
            await axios.post(`${APIURL}/api/preguntas/modificar`, data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado la pregunta exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                props.cargarPreguntas(data.SeccionEncuestaId);
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
            await axios.post(`${APIURL}/api/preguntas/estado/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                props.cargarPreguntas(Preguntas[0].SeccionId);
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

    useEffect(() => {
         // eslint-disable-next-line
    }, [])

    const openEdit = (resp) => {
        let requiereGrupoOpciones =TipoIngreso.length > 0 ? TipoIngreso.find(t => t.value === resp.TipoIngresoId).RequiereGrupoOpciones : "collapse";
        setRequiereGrupoOpciones(requiereGrupoOpciones);
        setRespuesta(resp);
        setMostrar(true);
    }

    const Mostrar = () => {
        setRespuesta(null);
        setMostrar(true);
    }

    const handleOnChange = (Id) => {
        //console.log("Id",Id)
       // console.log("props.tipoIngreso",props.tipoIngreso)
        ///console.log("grupo",props.tipoIngreso.find(t => t.value ===Id))
        //let requiereGrupoOpciones =props.tipoIngreso.length > 0 ? props.tipoIngreso.find(t => t.value === Id).RequiereGrupoOpciones : "collapse";
        //setRequiereGrupoOpciones(requiereGrupoOpciones);
    }

    let initialValues, edit;
    if (respuesta) {
       
        initialValues = {
            Id: respuesta.Id,
            SeccionEncuestaId: respuesta.SeccionEncuestaId,
            TipoIngresoId: respuesta.TipoIngresoId,
            GrupoOpcionesId: respuesta.GrupoOpcionesId,
            Nombre: respuesta.Nombre,
            Descripcion: respuesta.Descripcion,
            Status: respuesta.Status,
            Obligatorio: respuesta.Obligatorio,
            RespuestaObligatorio: respuesta.RespuestaObligatorio,
            RequiereGrupoOpciones: respuesta,
            Usuario: localStorage.getItem('codigo')
        }
        edit = true;
    }
    else {
        initialValues = {
            Id: '',
            SeccionEncuestaId: Preguntas[0].SeccionId,
            TipoIngresoId: TipoIngreso.length > 0 ? TipoIngreso[0].value : '',
            GrupoOpcionesId: GrupoOpciones.length > 0 ? GrupoOpciones[0].value : '',
            RequiereGrupoOpciones: GrupoOpciones.length > 0 ? GrupoOpciones[0].RequiereGrupoOpciones : '',
            Nombre: '',
            Descripcion: '',
            Status: false,
            Obligatorio: false,
            RespuestaObligatorio: false,
            Usuario: localStorage.getItem('codigo')
        }
        edit = false;
    }
    console.log("Preguntas",Preguntas)
    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">REGISTRAR PREGUNTAS</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {

                            registrarPreguntas(values)
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
                                            style={{ width: '450px', marginRight: '20px', fontSize: '40px' }}
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
                                            style={{ width: '450px', marginRight: '20px', fontSize: '40px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="TipoIngreso">Tipo Ingreso</label>
                                        <Field id="Opcion" name="TipoIngresoId" as='select' /*onChange={(e)=> {handleOnChange(e.target.value)}}*/ className="form-control" style={{ width: '450px', marginRight: '20px' }}>
                                            {
                                                TipoIngreso.map(tig => {
                                                    return (
                                                        <option key={tig.value} value={tig.value} grupoopciones = {tig.RequiereGrupoOpciones}>
                                                            {tig.key}
                                                        </option>
                                                    )
                                                })
                                            }
                                        </Field>
                                    </div>

                                    <div className="form-group" /*style={{ visibility: requiereGrupoOpciones }}*/>
                                        <label htmlFor="GrupoOpciones">Grup de Opciones</label>
                                        <Field id="Opcion" name="GrupoOpcionesId" as='select' className="form-control" style={{ width: '450px', marginRight: '20px' }}>
                                            {
                                                GrupoOpciones.map(grupo => {
                                                    return (
                                                        <option key={grupo.value} value={grupo.value}>
                                                            {grupo.key}
                                                        </option>
                                                    )
                                                })
                                            }
                                        </Field>
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
                                                name="Obligatorio"
                                                checked={values.Obligatorio}
                                                as={CheckBox}
                                            />
                                        }
                                        label={"Obligatorio"}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Field
                                                type="checkbox"
                                                name="RespuestaObligatorio"
                                                checked={values.RespuestaObligatorio}
                                                as={CheckBox}
                                            />
                                        }
                                        label={"Respuesta Obligatoria"}
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
            <TablaPreguntas Preguntas={Preguntas[0].Preguntas} setMostrar={Mostrar} openEdit={openEdit} ModificarEstado={modificarEstado} />
        </div>
    )
}