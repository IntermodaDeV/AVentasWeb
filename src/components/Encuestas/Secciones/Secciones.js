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
import { useSelector, useDispatch } from 'react-redux';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';
import {Preguntas} from 'components/Encuestas/Preguntas/Preguntas';
export const Secciones = props => {
    const dispatch = useDispatch();
    const Pregunta = useSelector(e => e.PreguntasEncuesta);
    const [mostrar, setMostrar] = useState(false);
    const [mostrarUsuario, setMostrarUsuario] = useState(false);
    const [Seccion, setSeccion] = useState(null);
    const [UsuariosConAcceso,setUsuariosConAcceso] = useState([]);
    const [UsuariosSinAcceso,setUsuariosSinAcceso] = useState([]);
    const [seccionSelected, setSeccionSelected] = useState(null);
    const [grupoOpcionesDetalle, setGrupoOpcionesDetalle] = useState([]);
    const Secciones = useSelector(e => e.SeccionEncuesta);
    const [MostrarPregunta,setMostrarPregunta] = useState(false);
    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('El nombre es obligatorio'),
            Titulo: yup.string().required('El Titulo es obligatorio'),
            Descripcion: yup.string(),
            Status: yup.boolean(),
            Obligatorio: yup.boolean(),
        });
        useEffect(() => {
            cargarSecciones();
             // eslint-disable-next-line
        }, [])
    const cargarSecciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Encuesta/Seccion`);
            let Seccion = []
            let valores = { Secciones: request.data, EncuestaId: '', NombreEncuesta: '' }
            Seccion.push(valores);
            dispatch({ type: 'SET_SECCIONESENCUESTA', payload: Seccion });
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
                cargarSecciones();
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
            await axios.post(`${APIURL}/api/secciones/modificar`, data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado la seccion de encuesta exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarSecciones();
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
            await axios.post(`${APIURL}/api/secciones/estado/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarSecciones();
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

    const cargarUsuarios = (seccionId) => {
        cargarUsuariosConAcceso(seccionId);
        cargarUsuariosSinAcceso(seccionId);
        setSeccionSelected(seccionId);
        setMostrarUsuario(true);
    }
    const cargarUsuariosConAcceso = async (seccionId) => {
        try {
            const request = await axios.get(`${APIURL}/api/secciones/usuarios/${seccionId}`);
            setUsuariosConAcceso(request.data);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const cargarUsuariosSinAcceso = async (seccionId) => {
        try {
            const request = await axios.get(`${APIURL}/api/secciones/usuariosSinAcceso/${seccionId}`);
            setUsuariosSinAcceso(request.data);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const asignarUsuario = async (usuarioId) => {
        try{
            await axios.post(`${APIURL}/api/secciones/AsignarAccesoUsuario/${seccionSelected}/${usuarioId}/${localStorage.getItem('codigo')}`);
            cargarUsuarios(seccionSelected);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha guardado el registro";

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



    const removerUsuario = async (usuarioId) => {
        try{
            await axios.post(`${APIURL}/api/secciones/RemoverUsuario/${usuarioId}/${seccionSelected}/${localStorage.getItem('codigo')}`)
            cargarUsuarios(seccionSelected);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha guardado el registro";

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

    const cargarPreguntas = async (seccionId, NombreSeccion) => {
        try {
            const request = await axios.get(`${APIURL}/api/preguntas/${seccionId}`);
            let preguntas = [];
            let valores = {Preguntas: request.data, SeccionId: seccionId, NombreSeccion: NombreSeccion}
            preguntas.push(valores);
            cargarTipoIngreso();
            cargarGrupoOpciones();
            setGrupoOpcionesDetalle([]);
            dispatch({ type: 'SET_PREGUNTASENCUESTA',payload: preguntas });
            setMostrarPregunta(true)
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se han cargado las preguntas de encuestas.";
    
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

      const cargarTipoIngreso = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/TipoIngreso`);
            let TipoIngreso = [];
            request.data.filter(g => g.Status === true).forEach(tipo => {
              let Valores = { key: tipo.Nombre, value: tipo.Id, RequiereGrupoOpciones: tipo.RequiereGrupoOpciones}
              TipoIngreso.push(Valores);
            })
            dispatch({type: 'SET_TIPOINGRESO', payload:TipoIngreso})
        } catch (err) {
          console.log("Ha ocurrido un error",err.response)
        }
      }
    
      const cargarGrupoOpciones = async () => {
        try {
          const request = await axios.get(`${APIURL}/api/GrupoOpciones`);
          let GrupoOpciones = [{key: "Seleccione..." , value: '0'}];
          request.data.filter(g => g.Status === true).forEach(grupo => {
            let Valores = { key: grupo.Nombre, value: grupo.Id}
            GrupoOpciones.push(Valores);
          })
          dispatch({type: 'SET_GRUPOOPCIONES', payload:GrupoOpciones})
        } catch (err) {
          console.log("Ha ocurrido un error", err.response)
        }
      }
    
      const cargarGrupoOpcionesDetalle = async (GrupoOpcionId) => {
        try {
          const request = await axios.get(`${APIURL}/api/GrupoOpcionesDetalle/${GrupoOpcionId}`);
          let GrupoOpcionesDetalle = [];
          request.data.forEach(grupo => {
            let Valores = { key: grupo.Nombre, value: grupo.Id}
            GrupoOpcionesDetalle.push(Valores);
          })
          setGrupoOpcionesDetalle(GrupoOpcionesDetalle);
        } catch (err) {
          console.log("Ha ocurrido un error", err.response)
        }
      }

    const openEdit = (sec) => {
        setSeccion(sec);
        setMostrar(true);
    }

    const Mostrar = () => {
        setSeccion(null);
        setMostrar(true);
    }

    let initialValues, edit;

    if (Seccion) {
        initialValues = {
            Id: Seccion.Id,
            Nombre: Seccion.Nombre,
            Titulo: Seccion.Titulo,
            Descripcion: Seccion.Descripcion,
            Status: Seccion.Status,
            Obligatorio: Seccion.Obligatorio,
            Usuario: localStorage.getItem('codigo')
        }
        edit = true;
    }
    else {
        initialValues = {
            Nombre: '',
            Titulo: '',
            Descripcion:'',
            Status: true,
            Obligatorio: false,
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
                                            label="Titulo"
                                            name="Titulo"
                                            error={!!errors.Titulo}
                                            helperText={errors.Titulo}
                                            style={{ width: '450px', marginRight: '20px', fontSize: '40px' }}
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
                                            style={{width: '450px', marginRight: '20px', fontSize: '40px' }}
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
                                                name="Obligatorio"
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
            
            
            <Dialog open={mostrarUsuario} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">ACCESO DE USUARIOS</DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col">
                            <TablaRelacion funcion={asignarUsuario} accion="agregar" titulo="Usuarios Sin Acceso" cabeceras={["Usuarios", "Accion"]} valores={UsuariosSinAcceso} />
                        </div>
                        <div className="col">
                            <TablaRelacion funcion={removerUsuario} accion="remover" titulo="Usuarios con acceso" cabeceras={["Usuarios", "Accion"]} valores={UsuariosConAcceso} />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setMostrarUsuario(false) }} color="primary">
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
            {
                MostrarPregunta &&
                <Preguntas
                  MostrarPregunta = {MostrarPregunta}
                  setMostrarPregunta ={setMostrarPregunta}
                  cargarPreguntas={cargarPreguntas}
                  grupoOpcionesDetalle = {grupoOpcionesDetalle}
                  cargarGrupoOpcionesDetalle = {cargarGrupoOpcionesDetalle}
                  NombreSeccion = {Pregunta[0].NombreSeccion}/>
            }
            {
                MostrarPregunta === false &&
                <TablaSecciones Secciones={ Secciones.length > 0 ? Secciones[0].Secciones : []} Mostrar ={true} setMostrar={Mostrar} openEdit={openEdit} ModificarEstado={modificarEstado} cargarPreguntas={cargarPreguntas} cargarUsuarios ={cargarUsuarios}/>

            }
            
        </div>
    )
}