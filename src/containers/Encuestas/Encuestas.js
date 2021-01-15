import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ClipLoader } from 'react-spinners';
import EncuestaBreadCrumb from 'containers/Encuestas/EncuestaBreadCrumb'
import { APIURL } from 'utils/Enviroment';
import { Route, Switch, matchPath } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/es';
import axios from 'axios';
//import { verificarConexion } from 'utils/http';
import {Encuesta} from 'components/Encuestas/Encuestas/Encuestas'
import {SeccionesEncuesta} from 'components/Encuestas/Secciones/Secciones'
import {Preguntas} from 'components/Encuestas/Preguntas/Preguntas'
moment.locale('es');
const Encuestas = (props) => {
  const [loading, setLoading] = useState(false);
  const [secciones, setSecciones] = useState([]);
  const [data, setData] = useState([]);
  const [tipoIngreso, setTipoIngreso] = useState([]);
  const [grupoOpciones, setGrupoOpciones] = useState([]);
  const [encuestaSelected, setEncuestaSelected] = useState("");
  const [nombreEncuesta, setNombreEncuesta] = useState("");
  //const [DataModal, setDataModal] = useState([]);
  //const [openModal, setOpenModal] = useState(false);

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
    setNombreEncuesta(nombreEncuesta);
    setEncuestaSelected(encuestaId);
    try {
        const request = await axios.get(`${APIURL}/api/Encuesta/Seccion/${encuestaId}`);
        setSecciones(request.data);
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
      let valores = {Preguntas: request.data, SeccionId: seccionId, NombreSeccion: NombreSeccion}
      setData(valores);
      cargarTipoIngreso();
      cargarGrupoOpciones();
      props.history.push("/Encuesta/Seccion/preguntas");
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
      setTipoIngreso(TipoIngreso);
  } catch (err) {
    console.log("Ha ocurrido un error",err.response)
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

  let Cliente = (
    <div className="text-center">
      <h4>{"Encuesta"}</h4>
      <hr />
    </div>
  );

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
             cargarSeccion= {cargarSeccion} />
          </div>
        </div>
          </>
      )} />
      <Route path={props.match.url + '/Seccion'} exact render={() => (
        <>
          {BreadCrumb()}
          <div className="text-center">
            <h4>{"Sección de Encuesta: " + nombreEncuesta}</h4>
            <hr />
          </div>
          <div className="row">
            <div className="col-12">
              <SeccionesEncuesta
               secciones = {secciones}
               cargarSeccion = {cargarSeccion}
               EncuestaId ={encuestaSelected}
               cargarPreguntas = {cargarPreguntas}/>
            </div>
          </div>
        </>
      )} />
      <Route path={props.match.url + '/Seccion/preguntas'} exact render={() => (
        <>
          {BreadCrumb()}
          <div className="text-center">
            <h4>{"Preguntas de la Sección: " + data.NombreSeccion}</h4>
            <hr />
          </div>
          <div className="row">
            <div className="col-12">
              <Preguntas
               Data = {data}
               cargarPreguntas = {cargarPreguntas}
               tipoIngreso = {tipoIngreso}
               grupoOpciones = {grupoOpciones}/>
            </div>
          </div>
        </>
      )} />
    </Switch>
    </>
  )
}

export default Encuestas;
