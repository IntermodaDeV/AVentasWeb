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
                    tipoDato = new Date();
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
                respuestaObjeto.PreguntaId = Number(res);
                respuestaObjeto.RespuestaAlfanumerica = isNaN(Number(data[res])) && typeof (data[res]) === "string" ? data[res] : null;
                respuestaObjeto.PreguntasOpcionesId = isNaN(Number(data[res])) ? null : Number(data[res]);
                respuestaObjeto.PreguntasOpciones = typeof (data[res]) === "object" ? data[res] : null;
                respuestas.push(respuestaObjeto);
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
                                            return (
                                                <>
                                                    <div style={{ background: '#D3F2F7' }} className="form-group">

                                                        <h5 style={{ fontWeight: 'bold', paddingLeft: '10px' }}>{"Sección: " + seccion.Titulo}</h5>
                                                        <p style={{ fontStyle: 'italic', paddingLeft: '10px' }}>{seccion.Descripcion}</p>

                                                    </div>

                                                    {
                                                        seccion.Preguntas.map((pregunta, index1) => {
                                                            const Opciones = [];
                                                            if (pregunta.GrupoOpcionesId !== null) {
                                                                if (pregunta.TipoIngreso === 'select') {
                                                                    let GrupoOpciones = {}
                                                                    GrupoOpciones = { key: "Seleccione...", value: '' };
                                                                    Opciones.push(GrupoOpciones);
                                                                }
                                                                pregunta.PreguntasOpciones.forEach(gp => {
                                                                    let GrupoOpciones = {}
                                                                    GrupoOpciones = { key: gp.GOpcionesDetalleNombre, value: gp.PreguntasOpcionesId }
                                                                    Opciones.push(GrupoOpciones);
                                                                });
                                                            }
                                                            return (
                                                                <>
                                                                    {
                                                                        pregunta.GrupoOpcionesId === null &&
                                                                        <FormikControl control={pregunta.TipoIngreso} errors={errors} Descripcion = {pregunta.Descripcion} type={pregunta.TipoIngreso} label={pregunta.RespuestaObligatorio === true ? "*" + pregunta.Nombre : pregunta.Nombre} id={pregunta.PreguntaId} name={pregunta.PreguntaId} />
                                                                    }
                                                                    {
                                                                        pregunta.GrupoOpcionesId !== null &&
                                                                        <FormikControl control={pregunta.TipoIngreso} Descripcion = {pregunta.Descripcion} label={pregunta.RespuestaObligatorio === true ? "*" + pregunta.Nombre : pregunta.Nombre} name={pregunta.PreguntaId} options={Opciones} />
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
                                        <Button className={classes.button} type="submit" variant="contained" onClick={() => props.history.push("/encuesta/selectCliente")} startIcon={<HighlightOffIcon />}>Cancelar</Button>
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