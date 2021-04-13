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
    const Preg = useSelector(e => e.PreguntasEncuesta);
    const TipoIngreso = useSelector(e => e.TipoIngreso);
    const GrupoOpciones = useSelector(g => g.GrupoOpciones);
    const [mostrar, setMostrar] = useState(false);
    const [pregunta, setPregunta] = useState(null);
    const [requiereGrupoOpciones, setRequiereGrupoOpciones] = useState(false);
    const [tipoIngreso, setTipoIngreso] = useState(TipoIngreso.length > 0 ? TipoIngreso[0].value : '');
    const [grupoOpcion, setGrupoOpcion] = useState(null);
    const [grupoOpcionPregunta, setgrupoOpcionPregunta] = useState([]);
    const [modalPreguntaAnidada, setmodalPreguntaAnidada] = useState(false);
    const [EditarPreguntaAnidada, setEditarPreguntaAnidada] = useState(false);
    const [preguntasAnidadas, setPreguntasAnidadas] = useState([]);
    const [PreguntaOpcion, setPreguntaOpcion] = useState('');
    const [render, setrender] = useState(true);
    const [mensaje, setmensaje] = useState("");
    const context = useRef();
    const validationSchema = yup.object().shape(
        {
            Nombre: yup.string().required('La pregunta es obligatoria'),
            Obligatorio: yup.boolean(),
            RespuestaObligatorio: yup.boolean(),
            Status: yup.boolean(),
        });

    const Validaciones = yup.object().shape(
        {
            Nombre: yup.string().required('La pregunta es obligatoria'),
            PreguntasOpcionesId: yup.string().required('El campo es obligatorio'),
            RespuestaObligatorio: yup.boolean(),
            Status: yup.boolean(),
        });

    useEffect(() => {
        // eslint-disable-next-line
    }, [])

    const cargarPreguntasAnidadas = async (preguntaOpcionesId) => {
        try {
            return await axios.get(`${APIURL}/api/preguntas/anidadas/${preguntaOpcionesId}`);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const cargarPreguntasOpciones = async (preguntaId) => {
        try {
            const request =  await axios.get(`${APIURL}/api/preguntasOpciones/SinAnidada/${preguntaId}`);
            let GrupoOpcion = [];
            setPreguntaOpcion(request.data[0].Id);
            request.data.forEach(preg =>{
                let Valores = { key: preg.GrupoOpcionesDetalle, value: preg.Id }
                GrupoOpcion.push(Valores);
            })
            setgrupoOpcionPregunta(GrupoOpcion);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const registrarPreguntas = async (data) => {
        data.GrupoOpcionesId = grupoOpcion;
        data.TipoIngresoId = tipoIngreso;
        data.RequiereOpciones = requiereGrupoOpciones;
        if (data.GrupoOpcionesId != null && data.GrupoOpcionesDetalle.length === 0 && data.RequiereOpciones === true) {
            setmensaje("Este campo es obligatorio")
        }
        else {
            try {
                await axios.post(`${APIURL}/api/preguntas/registrar`, data);
                setMostrar(false)
                Swal.fire({
                    title: 'Confirmado',
                    text: "Se ha creado la pregunta exitosamente.",
                    type: 'success',
                    confirmButtonText: 'Ok',
                }).then(e => {
                    setmensaje("");
                    props.cargarPreguntas(data.SeccionEncuestaId, props.NombreSeccion);
                });

            } catch (err) {
                setmensaje("");
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
    }

    const registrarPreguntasAnidadas = async (data) => {
        data.GrupoOpcionesId = grupoOpcion;
        data.TipoIngresoId = tipoIngreso;
        data.RequiereOpciones = requiereGrupoOpciones;
        data.PreguntasOpcionesId = PreguntaOpcion;
        if (data.GrupoOpcionesId != null && data.GrupoOpcionesDetalle.length === 0 && data.RequiereOpciones === true) {
            setmensaje("Este campo es obligatorio")
        }
        else {
            try {
                await axios.post(`${APIURL}/api/preguntas/Anidadas`, data);
                setmodalPreguntaAnidada(false)
                Swal.fire({
                    title: 'Confirmado',
                    text: "Se ha creado la pregunta exitosamente.",
                    type: 'success',
                    confirmButtonText: 'Ok',
                }).then(e => {
                    setgrupoOpcionPregunta([]);
                })

            } catch (err) {
                setmensaje("");
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
    }

    const modificar = async (data) => {
        data.TipoIngresoId = tipoIngreso;
        data.GrupoOpcionesId = grupoOpcion;
        data.RequiereOpciones = requiereGrupoOpciones;
        pregunta.PreguntaOpciones.forEach(element => {
            data.GrupoOpcionesDetalle.push(element.GrupoOpcionesDetalleId)
        });

        if (data.GrupoOpcionesId != null && data.GrupoOpcionesDetalle.length === 0) {
            setmensaje("Este campo es obligatorio")
        }
        else {
            try {
                await axios.post(`${APIURL}/api/preguntas/modificar`, data);
                setMostrar(false)
                Swal.fire({
                    title: 'Confirmado',
                    text: "Se ha modificado la pregunta exitosamente.",
                    type: 'success',
                    confirmButtonText: 'Ok',
                }).then(e => {
                    props.cargarPreguntas(data.SeccionEncuestaId, props.NombreSeccion);
                });
                setmensaje("")
            } catch (err) {
                let mensaje = "Ha ocurrido un error y no se ha modificado la pantalla.";
                setmensaje("")
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
    }

    const modificarPreguntaAnidada = async (data) => {
        data.TipoIngresoId = tipoIngreso;
        data.GrupoOpcionesId = grupoOpcion;
        data.RequiereOpciones = requiereGrupoOpciones;
        preguntasAnidadas.PreguntaOpciones.forEach(element => {
            data.GrupoOpcionesDetalle.push(element.GrupoOpcionesDetalleId)
        });

        if (data.GrupoOpcionesId != null && data.GrupoOpcionesDetalle.length === 0) {
            setmensaje("Este campo es obligatorio")
        }
        else {
            try {
                await axios.post(`${APIURL}/api/preguntasAnidadas/modificar`, data);
                setmodalPreguntaAnidada(false)
                Swal.fire({
                    title: 'Confirmado',
                    text: "Se ha modificado la pregunta exitosamente.",
                    type: 'success',
                    confirmButtonText: 'Ok',
                })
                setmensaje("")
            } catch (err) {
                let mensaje = "Ha ocurrido un error y no se ha modificado la pantalla.";
                setmensaje("")
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
                props.cargarPreguntas(Preg[0].SeccionId, props.NombreSeccion);
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

    const openEditarPreguntaAnidada = (resp) => {
        setrender(true)
        if (resp.PreguntaOpciones.length > 0) {
            let GrupoOpcion = [];
            let count = 0;
            resp.PreguntaOpciones.forEach(async (op, Index) => {
                let Pregunta = await cargarPreguntasAnidadas(op.Id);
                if (Pregunta.data.length > 0) {
                    let Valores = { key: op.GrupoOpcionesDetalle, value: op.Id }
                    GrupoOpcion.push(Valores);

                    if (count === 0) {
                        let requiereGrupoOpciones = TipoIngreso.length > 0 ? TipoIngreso.find(t => t.value === Pregunta.data[0].TipoIngresoId).RequiereGrupoOpciones : false;
                        setTipoIngreso(Pregunta.data[0].TipoIngresoId);
                        setGrupoOpcion(Pregunta.data[0].GrupoOpcionesId);
                        setPreguntasAnidadas(Pregunta.data[0]);
                        setPreguntaOpcion(Pregunta.data[0].preguntaOpcionId);
                        setRequiereGrupoOpciones(requiereGrupoOpciones);
                        if (requiereGrupoOpciones === false) {
                            props.cargarGrupoOpcionesDetalle(0);
                        }
                        if (Pregunta.data[0].GrupoOpcionesId !== null) {
                            props.cargarGrupoOpcionesDetalle(Pregunta.data[0].GrupoOpcionesId);
                        }
                    }
                    count++;
                }
            });
            setgrupoOpcionPregunta(GrupoOpcion);
            setPregunta(resp);
            setmodalPreguntaAnidada(true);
            setEditarPreguntaAnidada(true);
        }
    }

    const cerrarModalAnidado = () => {
        setgrupoOpcionPregunta([]);
        setmodalPreguntaAnidada(false);
        setEditarPreguntaAnidada(false);
    }

    const openEdit = (resp) => {
        let requiereGrupoOpciones = TipoIngreso.length > 0 ? TipoIngreso.find(t => t.value === resp.TipoIngresoId).RequiereGrupoOpciones : false;
        setRequiereGrupoOpciones(requiereGrupoOpciones);
        setTipoIngreso(resp.TipoIngresoId);
        if (requiereGrupoOpciones === false) {
            props.cargarGrupoOpcionesDetalle(0);
        }
        setGrupoOpcion(resp.GrupoOpcionesId);
        if (resp.GrupoOpcionesId !== null) {
            props.cargarGrupoOpcionesDetalle(resp.GrupoOpcionesId);
        }
        setPregunta(resp);
        setMostrar(true);
    }

    const openModalAnidado = (resp) => {
        if (resp.PreguntaOpciones.length > 0) {
            cargarPreguntasOpciones(resp.Id);
        }
        setRequiereGrupoOpciones(false);
        setGrupoOpcion(null);
        props.cargarGrupoOpcionesDetalle(0);
        setTipoIngreso(TipoIngreso.length > 0 ? TipoIngreso[0].value : '');
        setPregunta(resp);
        setmodalPreguntaAnidada(true);
        setEditarPreguntaAnidada(false);
    }

    const Mostrar = () => {
        setRequiereGrupoOpciones(false)
        setGrupoOpcion(null)
        props.cargarGrupoOpcionesDetalle(0);
        setTipoIngreso(TipoIngreso.length > 0 ? TipoIngreso[0].value : '');
        setPregunta(null);
        setMostrar(true);
    }

    const handleOnChange = (Id) => {
        // eslint-disable-next-line
        let requiereOpciones = TipoIngreso.find(t => t.value == Id).RequiereGrupoOpciones;
        setRequiereGrupoOpciones(requiereOpciones);
        setTipoIngreso(Id);
        if (requiereOpciones === false) {
            setGrupoOpcion(null);
        }
        setrender(false)
    }

    const grupoOpcionDetalle = (Id) => {
        props.cargarGrupoOpcionesDetalle(Id);
        setGrupoOpcion(Id);
        setrender(false);
    }

    const GrupoOpcions = (value) => {
        if (pregunta !== null) {
            pregunta.PreguntaOpciones = pregunta.PreguntaOpciones.filter(p => p.GrupoOpcionesDetalleId !== value);
            setPregunta(pregunta);
        }
    }

    const GrupoOpcionesAnidadas = (value) => {
        if (preguntasAnidadas !== null) {
            preguntasAnidadas.PreguntaOpciones = preguntasAnidadas.PreguntaOpciones.filter(p => p.GrupoOpcionesDetalleId !== value);
            setPreguntasAnidadas(preguntasAnidadas);
        }
    }

    const changePreguntaAnidada = async (Id) => {
        setPreguntaOpcion(Id);
        if (EditarPreguntaAnidada) {
            setrender(true)
            let Pregunta = await cargarPreguntasAnidadas(Id);
            if (Pregunta.data.length > 0) {
                setTipoIngreso(Pregunta.data[0].TipoIngresoId);
                setGrupoOpcion(Pregunta.data[0].GrupoOpcionesId);
                setPreguntasAnidadas(Pregunta.data[0])
                let requiereGrupoOpciones = TipoIngreso.length > 0 ? TipoIngreso.find(t => t.value === Pregunta.data[0].TipoIngresoId).RequiereGrupoOpciones : false;
                setRequiereGrupoOpciones(requiereGrupoOpciones);
                if (Pregunta.data[0].GrupoOpcionesId !== null) {
                    props.cargarGrupoOpcionesDetalle(Pregunta.data[0].GrupoOpcionesId);
                }
            }
        }

    }

    let initialValues, edit;

    if (pregunta && modalPreguntaAnidada === false) {

        initialValues = {
            Id: pregunta.Id,
            SeccionEncuestaId: pregunta.SeccionEncuestaId,
            TipoIngresoId: pregunta.TipoIngresoId,
            RequiereOpciones: requiereGrupoOpciones,
            GrupoOpcionesId: pregunta.GrupoOpcionesId,
            GrupoOpcionesDetalle: [],
            GrupoOpcion: pregunta.PreguntaOpciones,
            Nombre: pregunta.Nombre,
            Descripcion: pregunta.Descripcion,
            Status: pregunta.Status,
            Obligatorio: pregunta.Obligatorio,
            RespuestaObligatorio: pregunta.RespuestaObligatorio,
            Usuario: localStorage.getItem('codigo')
        }
        edit = true;
    }
    else if (modalPreguntaAnidada === true && EditarPreguntaAnidada === true) {
        initialValues = {
            Id: preguntasAnidadas.Id,
            SeccionEncuestaId: Preg[0].SeccionId,
            TipoIngresoId: TipoIngreso.length > 0 ? tipoIngreso : null,
            RequiereOpciones: requiereGrupoOpciones,
            GrupoOpcionesId: GrupoOpciones.length > 0 ? grupoOpcion : null,
            GrupoOpcionesDetalle: [],
            GrupoOpcion: preguntasAnidadas.PreguntaOpciones,
            Nombre: preguntasAnidadas.Nombre,
            Descripcion: preguntasAnidadas.Descripcion,
            Status: preguntasAnidadas.Status,
            RespuestaObligatorio: false,
            PreguntasOpcionesId: preguntasAnidadas.preguntaOpcionId,
            Usuario: localStorage.getItem('codigo')
        }
        edit = false;
    }
    else if (modalPreguntaAnidada === true && !EditarPreguntaAnidada) {
        initialValues = {
            Id: pregunta.Id,
            TipoIngresoId: TipoIngreso.length > 0 ? tipoIngreso : null,
            RequiereOpciones: requiereGrupoOpciones,
            GrupoOpcionesId: GrupoOpciones.length > 0 ? grupoOpcion : null,
            GrupoOpcionesDetalle: [],
            GrupoOpcion: '',
            Nombre: '',
            Descripcion: '',
            Status: true,
            RespuestaObligatorio: false,
            PreguntasOpcionesId: PreguntaOpcion,
            Usuario: localStorage.getItem('codigo')
        }
        edit = false;
    }
    else {
        initialValues = {
            Id: '',
            SeccionEncuestaId: Preg[0].SeccionId,
            TipoIngresoId: TipoIngreso.length > 0 ? tipoIngreso : null,
            RequiereOpciones: requiereGrupoOpciones,
            GrupoOpcionesId: GrupoOpciones.length > 0 ? grupoOpcion : null,
            GrupoOpcionesDetalle: [],
            GrupoOpciones: [],
            Nombre: '',
            Descripcion: '',
            Status: true,
            Obligatorio: false,
            RespuestaObligatorio: false,
            Usuario: localStorage.getItem('codigo')
        }
        edit = false;
    }
    return (
        <>
            <div>
                <Dialog open={mostrar} aria-labelledby="form-dialog-title">
                    <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">REGISTRAR PREGUNTAS</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={initialValues}
                            enableReinitialize={false}
                            validationSchema={validationSchema}
                            onSubmit={(values) => {
                                registrarPreguntas(values)
                            }}>
                            {({ errors, resetForm, values, setValues }) => (

                                <div ref={context}>
                                    <Form>
                                        <div className="form-group">
                                            <Field
                                                label="Pregunta"
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
                                            <Field id="Ingreso" name="TipoIngresoId" as='select' value={tipoIngreso} onChange={(e) => { handleOnChange(e.target.value) }} className="form-control" style={{ width: '450px', marginRight: '20px' }}>
                                                {
                                                    TipoIngreso.map(tig => {
                                                        return (
                                                            <option key={tig.value} value={tig.value}>
                                                                {tig.key}
                                                            </option>
                                                        )
                                                    })
                                                }
                                            </Field>
                                        </div>
                                        {requiereGrupoOpciones &&
                                            <div className="form-group">
                                                <label htmlFor="GrupoOpciones" style={{ width: '450px' }}>Grupo de Opciones</label>
                                                <Field id="GrupOpcion" name="GrupoOpcionesId" as='select' value={grupoOpcion} className="form-control" onChange={(e) => { grupoOpcionDetalle(e.target.value) }} style={{ width: '450px', marginRight: '20px' }}>
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
                                        }
                                        {props.grupoOpcionesDetalle.length > 0 && requiereGrupoOpciones && edit &&
                                            <>
                                                <label htmlFor="GrupoOpciones" style={{ width: '450px' }}>Grupo de Opciones Detalle</label>
                                                <div className="form-group">
                                                    <Field id="Opcion" name="GrupoOpcionesDetalleId" as='checkbox' style={{ marginRight: '20px' }}>
                                                        {
                                                            props.grupoOpcionesDetalle.map(grupo => {

                                                                return (
                                                                    <React.Fragment key={grupo.key}>
                                                                        <label htmlFor={grupo.value} style={{ marginRight: '10px' }}>{grupo.key}</label>
                                                                        <input
                                                                            type='checkbox'
                                                                            id={grupo.value}
                                                                            name="GrupoOpcionesDetalle"
                                                                            value={grupo.value}
                                                                            style={{ marginRight: '20px' }}
                                                                            checked={pregunta.PreguntaOpciones.find(g => g.GrupoOpcionesDetalleId === grupo.value)}
                                                                            onChange={(e) => GrupoOpcions(grupo.value)}
                                                                        >
                                                                        </input>
                                                                    </React.Fragment>
                                                                )
                                                            })
                                                        }
                                                    </Field>
                                                    <p style={{ color: 'red' }} >{mensaje}</p>
                                                </div>
                                            </>
                                        }

                                        {props.grupoOpcionesDetalle.length > 0 && requiereGrupoOpciones && edit === false &&
                                            <>
                                                <label htmlFor="GrupoOpciones" style={{ width: '450px' }}>Grupo de Opciones Detalle</label>
                                                <div className="form-group">
                                                    <Field id="Opcion" name="GrupoOpcionesDetalleId" as='checkbox' style={{ marginRight: '20px' }}>
                                                        {
                                                            props.grupoOpcionesDetalle.map(grupo => {

                                                                return (
                                                                    <React.Fragment key={grupo.key}>
                                                                        <label htmlFor={grupo.value} style={{ marginRight: '10px' }}>{grupo.key}</label>
                                                                        <input
                                                                            type='checkbox'
                                                                            id={grupo.value}
                                                                            name="GrupoOpcionesDetalle"
                                                                            value={grupo.value}
                                                                            style={{ marginRight: '20px' }}
                                                                        >
                                                                        </input>
                                                                    </React.Fragment>
                                                                )
                                                            })
                                                        }
                                                    </Field>
                                                    <p style={{ color: 'red' }} >{mensaje}</p>
                                                </div>
                                            </>
                                        }

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
                                            {!edit && <Button type="submit">Guardar</Button>}
                                        </DialogActions>
                                    </Form>
                                </div>
                            )}
                        </Formik>
                    </DialogContent>
                </Dialog>

                <Dialog open={modalPreguntaAnidada} aria-labelledby="form-dialog-title">
                    <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">{EditarPreguntaAnidada ? "MODIFICAR PREGUNTAS ANIDADAS" : "REGISTRAR PREGUNTAS ANIDADAS"}</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={initialValues}
                            enableReinitialize={render}
                            validationSchema={Validaciones}
                            onSubmit={(values) => {
                                registrarPreguntasAnidadas(values)
                            }}>
                            {({ errors, values }) => (
                                <div ref={context}>
                                    <Form>

                                        <label htmlFor="GrupoOpciones" style={{ width: '450px' }}>Grupo de Opciones Detalle</label>
                                        <div className="form-group">
                                            <Field
                                                style={{ width: '450px' }}
                                                className="form-control"
                                                id="PreguntasOpcionesId"
                                                name="PreguntasOpcionesId"
                                                as='select'
                                                onChange={(e) => { changePreguntaAnidada(e.target.value) }}
                                                value={PreguntaOpcion}>
                                                {
                                                    grupoOpcionPregunta.map(opcion => {
                                                        return (
                                                            <option key={opcion.value} value={opcion.value}>
                                                                {opcion.key}
                                                            </option>
                                                        )
                                                    })
                                                }
                                            </Field>
                                            <p style={{ color: 'red' }} >{mensaje}</p>
                                        </div>

                                        <div className="form-group">
                                            <Field
                                                label="Pregunta"
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
                                            <Field id="Ingreso" name="TipoIngresoId" as='select' value={tipoIngreso} onChange={(e) => { handleOnChange(e.target.value) }} className="form-control" style={{ width: '450px', marginRight: '20px' }}>
                                                {
                                                    TipoIngreso.map(tig => {
                                                        return (
                                                            <option key={tig.value} value={tig.value}>
                                                                {tig.key}
                                                            </option>
                                                        )
                                                    })
                                                }
                                            </Field>
                                        </div>
                                        {requiereGrupoOpciones &&
                                            <div className="form-group">
                                                <label htmlFor="GrupoOpciones" style={{ width: '450px' }}>Grupo de Opciones</label>
                                                <Field id="GrupOpcion" name="GrupoOpcionesId" as='select' value={grupoOpcion} className="form-control" onChange={(e) => { grupoOpcionDetalle(e.target.value) }} style={{ width: '450px', marginRight: '20px' }}>
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
                                        }
                                        {props.grupoOpcionesDetalle.length > 0 && requiereGrupoOpciones && !EditarPreguntaAnidada &&
                                            <>
                                                <label htmlFor="GrupoOpciones" style={{ width: '450px' }}>Grupo de Opciones Detalle</label>
                                                <div className="form-group">
                                                    <Field id="Opcion" name="GrupoOpcionesDetalleId" as='checkbox' style={{ marginRight: '20px' }}>
                                                        {
                                                            props.grupoOpcionesDetalle.map(grupo => {

                                                                return (
                                                                    <React.Fragment key={grupo.key}>
                                                                        <label htmlFor={grupo.value} style={{ marginRight: '10px' }}>{grupo.key}</label>
                                                                        <input
                                                                            type='checkbox'
                                                                            id={grupo.value}
                                                                            name="GrupoOpcionesDetalle"
                                                                            value={grupo.value}
                                                                            style={{ marginRight: '20px' }}
                                                                        >
                                                                        </input>
                                                                    </React.Fragment>
                                                                )
                                                            })
                                                        }
                                                    </Field>
                                                    <p style={{ color: 'red' }} >{mensaje}</p>
                                                </div>
                                            </>
                                        }

                                        {props.grupoOpcionesDetalle.length > 0 && requiereGrupoOpciones && EditarPreguntaAnidada &&
                                            <>
                                                <label htmlFor="GrupoOpciones" style={{ width: '450px' }}>Grupo de Opciones Detalle</label>
                                                <div className="form-group">
                                                    <Field id="Opcion" name="GrupoOpcionesDetalleId" as='checkbox' style={{ marginRight: '20px' }}>
                                                        {
                                                            props.grupoOpcionesDetalle.map(grupo => {

                                                                return (
                                                                    <React.Fragment key={grupo.key}>
                                                                        <label htmlFor={grupo.value} style={{ marginRight: '10px' }}>{grupo.key}</label>
                                                                        <input
                                                                            type='checkbox'
                                                                            id={grupo.value}
                                                                            name="GrupoOpcionesDetalle"
                                                                            value={grupo.value}
                                                                            style={{ marginRight: '20px' }}
                                                                            checked={preguntasAnidadas.PreguntaOpciones.find(g => g.GrupoOpcionesDetalleId === grupo.value)}
                                                                            onChange={(e) => GrupoOpcionesAnidadas(grupo.value)}
                                                                        >
                                                                        </input>
                                                                    </React.Fragment>
                                                                )
                                                            })
                                                        }
                                                    </Field>
                                                    <p style={{ color: 'red' }} >{mensaje}</p>
                                                </div>
                                            </>
                                        }
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
                                                    name="RespuestaObligatorio"
                                                    checked={values.RespuestaObligatorio}
                                                    as={CheckBox}
                                                />
                                            }
                                            label={"Respuesta Obligatoria"}
                                        />
                                        <DialogActions>
                                            <Button onClick={() => { cerrarModalAnidado() }} color="primary"> Cancelar</Button>
                                            {EditarPreguntaAnidada && <Button type="button" onClick={() => { modificarPreguntaAnidada(values) }} color="sucess"> Guardar</Button>}
                                            {!EditarPreguntaAnidada && <Button type="submit" color="sucess">Registrar Nuevo</Button>}
                                        </DialogActions>
                                    </Form>
                                </div>
                            )}
                        </Formik>
                    </DialogContent>
                </Dialog>
                <TablaPreguntas
                    Preguntas={Preg[0].Preguntas}
                    MostrarPregunta={props.MostrarPregunta}
                    setMostrarPregunta={props.setMostrarPregunta}
                    setMostrar={Mostrar}
                    openEdit={openEdit}
                    ModificarEstado={modificarEstado}
                    openModalAnidado={openModalAnidado}
                    openEditarPreguntaAnidada={openEditarPreguntaAnidada} />
            </div>
        </>
    )
}