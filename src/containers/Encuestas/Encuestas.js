import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ClipLoader } from 'react-spinners';
import EncuestaBreadCrumb from 'containers/Encuestas/EncuestaBreadCrumb'
import { APIURL } from 'utils/Enviroment';
import { Route, Switch, matchPath } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/es';
import axios from 'axios';
import { useDispatch,useSelector } from 'react-redux';
import {Encuesta} from 'components/Encuestas/Encuestas/Encuestas'
import {SeccionesEncuesta} from 'components/Encuestas/Secciones/Secciones'
import {Preguntas} from 'components/Encuestas/Preguntas/Preguntas'
moment.locale('es');
const Encuestas = (props) => {
  const dispatch = useDispatch();
  const Secciones = useSelector(e => e.SeccionEncuesta);
  const Pregunta = useSelector(e => e.PreguntasEncuesta);
  const [loading, setLoading] = useState(false);
  const [grupoOpcionesDetalle, setGrupoOpcionesDetalle] = useState([]);

  useEffect(() => {
    if (matchPath(props.match.url,
        {
          path: props.location.pathname,
          exact: true,
        }
      )){
        setLoading(false)
      }
    // eslint-disable-next-line
  }, [])

  const NavHome = () => {
    props.history.push(`/Encuesta`);
  }
  const cargarSeccion = async (encuestaId,nombreEncuesta) => {
    try {
        const request = await axios.get(`${APIURL}/api/Encuesta/Seccion/${encuestaId}`);
        let Seccion = []
        let valores = {Secciones: request.data, EncuestaId: encuestaId, NombreEncuesta: nombreEncuesta}
        Seccion.push(valores);
        dispatch({ type: 'SET_SECCIONESENCUESTA',payload: Seccion });
        props.history.push("/Encuesta/Seccion");
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
      props.history.push("/Encuesta/Seccion/preguntas")
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
      let GrupoOpciones = [{key: "Seleccione..." , value: ''}];
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
  const BreadCrumb = () => {
    return (
      <EncuestaBreadCrumb
        match={props.match}
        cancelarEncuesta={cancelarEncuesta}
        clickBreadCrumb={clickBreadCrumb}>
      </EncuestaBreadCrumb >
    )
  }

  const clickBreadCrumb = (nuevaRuta) => {
    props.history.push(nuevaRuta);
  }

  const cancelarEncuesta = () => {
    NavHome();
  }


  if (loading) {
    return (
      <div className="m-auto">
        <ClipLoader
          size={40}
          color={'#31547C'}
          loading={loading} />
      </div>
    );
  }
  return (
    <>
    <Switch>
   
      <Route path={props.match.url} exact render={() => (
         <>
        <div className="text-center">
        <h4>{"Encuestas"}</h4>
        <hr />
      </div>
        <div className="row">
          <div className="col-12">
            <Encuesta
             setLoading = {setLoading}
             cargarSeccion= {cargarSeccion} />
          </div>
        </div>
          </>
      )} />
      <Route path={props.match.url + '/Seccion'} exact render={() => (
        <>
          {BreadCrumb()}
          <div className="text-center">
            <h4>{"Sección de Encuesta: " + Secciones[0].NombreEncuesta}</h4>
            <hr />
          </div>
          <div className="row">
            <div className="col-12">
              <SeccionesEncuesta
               cargarSeccion = {cargarSeccion}
               cargarPreguntas = {cargarPreguntas}/>
            </div>
          </div>
        </>
      )} />
        <Route path={props.match.url + '/Seccion/preguntas'} exact render={() => (
          <>
            {BreadCrumb()}
            <div className="text-center">
              <h4>{"Preguntas de la Sección: " + Pregunta[0].NombreSeccion}</h4>
              <hr />
            </div>
            <div className="row">
              <div className="col-12">
                <Preguntas
                  cargarPreguntas={cargarPreguntas}
                  grupoOpcionesDetalle = {grupoOpcionesDetalle}
                  cargarGrupoOpcionesDetalle = {cargarGrupoOpcionesDetalle}/>
              </div>
            </div>
          </>
        )} />
    </Switch>
    </>
  )
}

export default Encuestas;
