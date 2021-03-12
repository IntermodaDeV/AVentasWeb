import React from 'react';
import { Formik, Form } from 'formik';
import { Button } from "@material-ui/core";
import SendIcon from '@material-ui/icons/Send';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import FormikControl from './Formulario/FormikControl'
import * as yup from 'yup';
import { APIURL } from 'utils/Enviroment';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import moment from "moment";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import {
    Card,
    CardHeader as MuiCardHeader,
    CardContent,
} from '@material-ui/core';


const CardHeader = withStyles({
    title: {
        fontWeight: '1000',
        textAlign: 'center'
    },
})(MuiCardHeader);

const FormularioEncuesta = (props) => {
    const useStyles = makeStyles((theme) => ({
        button: {
            marginLeft: theme.spacing(2),
        },
    }));
    const classes = useStyles();
    const obtenerModelo = secciones => {
        let modelo = {};
        for (let seccion of secciones) {
            for (let pregunta of seccion.Preguntas) {
                let tipoDato = "";
                if (pregunta.TipoIngreso === "date") {
                    tipoDato = null;
                }

                modelo[pregunta.PreguntaId] = tipoDato;
            }
        }
        return modelo;
    }

    const validaciones = (secciones) => {
        let modelo = yup.object().shape();
        for (let seccion of secciones) {
            for (let pregunta of seccion.Preguntas) {
                let EsRequerido = yup.string();

                if (pregunta.RespuestaObligatorio === true) {
                    EsRequerido = yup.string().required("Este campo es requerido");
                }

                modelo.fields[pregunta.PreguntaId] = EsRequerido;
                modelo._nodes.push(String(pregunta.PreguntaId));
            }
        }
        return modelo;
    }
    let validationSchema = validaciones(props.EncuestaSelected);
    let initialValues = obtenerModelo(props.EncuestaSelected);


    const registrarRespuestas = async (data) => {
        let Info = [];
        const resp = Object.keys(data);
        let respuestas = [];

        for (let res of resp) {
            let respuestaObjeto = {};
            if (data[res] !== "") {
                for (let seccion of props.EncuestaSelected) {
                    let pregunta = seccion.Preguntas.filter(p => p.PreguntaId === Number(res));
                    if (pregunta.length > 0) {
                        let esFecha = pregunta[0].TipoIngreso === "date";
                        let ValorRespuesta = esFecha ? moment(data[res]).format("YYYY-MM-DD") : isNaN(Number(data[res])) && typeof (data[res]) === "string" ? data[res] : null
                        respuestaObjeto.PreguntaId = Number(res);
                        respuestaObjeto.RespuestaAlfanumerica = ValorRespuesta;
                        respuestaObjeto.PreguntasOpcionesId = isNaN(Number(data[res])) || esFecha ? null : Number(data[res]);
                        respuestaObjeto.PreguntasOpciones = typeof (data[res]) === "object" && esFecha === false ? data[res] : null;
                        respuestas.push(respuestaObjeto);
                    }
                }
            }
        }

        Info.push(
            {
                CodigoCliente: props.ClienteSelected.Codigo,
                Usuario: localStorage.getItem("codigo"),
                EncuestaId: props.EncuestaSelected[0].EncuestaId,
                RespuestasDetalle: respuestas
            })

        try {
            await axios.post(`${APIURL}/api/respuestas/registrar`, Info[0]);

            Swal.fire({
                title: 'Enviado Correctamente',
                text: "¡Se ha registrado correctamente!",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                props.history.push("/encuesta/selectCliente");
            });

        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha registrado.";

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

    const Preguntas = (seccion, data) =>{
        let Preguntas = []
        seccion.Preguntas.forEach(pregunta => {
            Preguntas.push(pregunta);
            if (pregunta.GrupoOpcionesId !== null) {

                pregunta.PreguntasOpciones.forEach(gp => {
                    if(gp.PreguntasAnidadas.length > 0){
                        for (let pa of gp.PreguntasAnidadas) {
                             pa.hidden = true;
                             const resp = Object.keys(data);
                                for (let res of resp) {
                                    if (data[res] !== "") {
                                        if(pa.PreguntasOpcionesId == data[res]){
                                            pa.hidden = false;
                                        }
                                    }
                                }
                            Preguntas.push(pa);
                        }
                    }
                });
            }
        })
        return Preguntas;
    }

    return (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center' }} className="container-fluid">
            <Card style={{ width: '900px' }} raised={true}>
                <CardHeader
                    titleTypographyProps={{ fontWeight: 'bold' }}
                    title={props.ClienteSelected.Codigo + " - " + props.EncuestaSelected[0].NombreEncuesta} >
                </CardHeader>
                <CardContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            registrarRespuestas(values);
                        }}>
                        {({ errors, resetForm, values, setValues }) => (
                            <div className="form-group">
                                <Form>
                                    {
                                        props.EncuestaSelected.map((seccion, index) => {
                                           let preguntas = Preguntas(seccion, values)
                                            return (
                                                <>
                                                    <div style={{ background: '#D3F2F7' }} className="form-group">

                                                        <h5 style={{ fontWeight: 'bold', paddingLeft: '10px' }}>{"Sección: " + seccion.Titulo}</h5>
                                                        <p style={{ fontStyle: 'italic', paddingLeft: '10px' }}>{seccion.Descripcion}</p>

                                                    </div>

                                                    {
                                                        preguntas.map((pregunta, index1) => {
                                                            const Opciones = [];     
                                                            if (pregunta.GrupoOpcionesId !== null) {
                                                                if (pregunta.TipoIngreso === 'select') {
                                                                    let GrupoOpciones = {}
                                                                    GrupoOpciones = { key: "Seleccione...", value: '' };
                                                                    Opciones.push(GrupoOpciones);
                                                                }
                                                                pregunta.PreguntasOpciones.forEach(gp => {
                                                                    let GrupoOpciones = {};
                                                                    GrupoOpciones = { key: gp.GOpcionesDetalleNombre, value: gp.PreguntasOpcionesId }
                                                                    Opciones.push(GrupoOpciones);
                                                                });
                                                            }
                                                            return (
                                                                <>
                                                                    {
                                                                        pregunta.GrupoOpcionesId === null &&
                                                                        <FormikControl 
                                                                        hidden = {pregunta.hidden !== undefined ? pregunta.hidden : false} 
                                                                        control={pregunta.TipoIngreso} 
                                                                        errors={errors} 
                                                                        Descripcion = {pregunta.Descripcion} 
                                                                        type={pregunta.TipoIngreso} 
                                                                        label={pregunta.RespuestaObligatorio === true ? "*" + pregunta.Nombre : pregunta.Nombre} 
                                                                        id={pregunta.preguntaAnidada ? "Anidada-" + pregunta.PreguntaId :pregunta.PreguntaId} 
                                                                        name={pregunta.preguntaAnidada ? "Anidada-" + pregunta.PreguntaId :pregunta.PreguntaId} />
                                                                    }
                                                                    {
                                                                        pregunta.GrupoOpcionesId !== null &&
                                                                        <FormikControl 
                                                                        hidden = {pregunta.hidden !== undefined ? pregunta.hidden : false} 
                                                                        control={pregunta.TipoIngreso} 
                                                                        Descripcion = {pregunta.Descripcion} 
                                                                        label={pregunta.RespuestaObligatorio === true ? "*" + pregunta.Nombre : pregunta.Nombre} 
                                                                        name={pregunta.preguntaAnidada ? "Anidada-" + pregunta.PreguntaId :pregunta.PreguntaId} 
                                                                        options={Opciones} />
                                                                    }
                                                                </>
                                                            )
                                                        })
                                                    }
                                                </>
                                            )
                                        })
                                    }
                                    <div style={{ textAlign: 'right', paddingTop: '20px' }}>
                                        <Button className={classes.button} type="submit" variant="contained" onClick={() => props.history.push("/encuesta/selectCliente")} startIcon={<HighlightOffIcon />}>Salir</Button>
                                        <Button className={classes.button} type="submit" color="primary" variant="contained" startIcon={<SendIcon />}>Enviar</Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </div>
    )
}

export default FormularioEncuesta;