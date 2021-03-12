import React from 'react';
import { Formik, Form } from 'formik';
import { Button } from "@material-ui/core";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import FormikControl from './Formulario/FormikControl'
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

const FormularioRespuestas = (props) => {

    const useStyles = makeStyles((theme) => ({
        button: {
            marginLeft: theme.spacing(2),
        },
    }));
    const classes = useStyles();

    return (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center' }} className="container-fluid">
            <Card style={{ width: '900px' }} raised={true}>
                <CardHeader
                    titleTypographyProps={{ fontWeight: 'bold' }}
                    title={props.RespuestaDetalle[0].CodigoCliente + " - " + props.EncuestaSelected[0].NombreEncuesta} >
                </CardHeader>
                <CardContent>
                    <Formik enableReinitialize>
                        {({ errors }) => (
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
                                                            let ValorRespuesta = "";
                                                            let Respuesta = [];
                                                            props.RespuestaDetalle[0].RespuestasDetalle.filter(r => r.PreguntaId === pregunta.PreguntaId).forEach((respuesta, index2) => {
                                                                if (pregunta.GrupoOpcionesId === null) {
                                                                    ValorRespuesta = respuesta.RespuestaAlfanumerica !== null ? respuesta.RespuestaAlfanumerica : respuesta.RespuestaNumerica;
                                                                
                                                                    if(pregunta.TipoIngreso === "date"){
                                                                        pregunta.TipoIngreso = "input";
                                                                    }
                                                                }
                                                                else {
                                                                    if (pregunta.TipoIngreso === "checkbox") {
                                                                        Respuesta.push(respuesta.PreguntasOpcionesId);
                                                                    }
                                                                    ValorRespuesta = respuesta.PreguntasOpcionesId;
                                                                }

                                                            })
                                                            const Opciones = [];
                                                            if (pregunta.GrupoOpcionesId !== null) {
                                                                if (pregunta.TipoIngreso === 'select') {
                                                                    pregunta.PreguntasOpciones.filter(g => g.PreguntasOpcionesId === ValorRespuesta).forEach(gp => {
                                                                        let GrupoOpciones = {}
                                                                        GrupoOpciones = { key: gp.GOpcionesDetalleNombre, value: gp.PreguntasOpcionesId }
                                                                        Opciones.push(GrupoOpciones);
                                                                    });
                                                                }
                                                                else {
                                                                    pregunta.PreguntasOpciones.forEach(gp => {
                                                                        let GrupoOpciones = {}
                                                                        GrupoOpciones = { key: gp.GOpcionesDetalleNombre, value: gp.PreguntasOpcionesId }
                                                                        Opciones.push(GrupoOpciones);
                                                                    });
                                                                }
                                                            }
                                                            return (
                                                                <>
                                                                    {
                                                                        pregunta.GrupoOpcionesId === null &&
                                                                        <FormikControl
                                                                            control={pregunta.TipoIngreso}
                                                                            value={ValorRespuesta}
                                                                            errors={errors}
                                                                            Descripcion={""}
                                                                            disabled={true}
                                                                            type={pregunta.TipoIngreso}
                                                                            label={pregunta.Nombre}
                                                                            id={pregunta.PreguntaId}
                                                                            name={pregunta.PreguntaId} />
                                                                    }
                                                                    {
                                                                        pregunta.GrupoOpcionesId !== null &&
                                                                        <FormikControl
                                                                            control={pregunta.TipoIngreso}
                                                                            Descripcion={""}
                                                                            label={pregunta.Nombre}
                                                                            name={pregunta.PreguntaId}
                                                                            options={Opciones}
                                                                            Respuestas={ValorRespuesta}
                                                                            respuestaCheckBox={Respuesta} />
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
                                        <Button className={classes.button} type="submit" variant="contained" onClick={() => props.history.push("/encuesta/Resueltas")} startIcon={<HighlightOffIcon />}>Salir</Button>
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

export default FormularioRespuestas;