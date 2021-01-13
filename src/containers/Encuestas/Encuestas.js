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
moment.locale('es');
const Encuestas = (props) => {
  const [loading, setLoading] = useState(false);
  const [secciones, setSecciones] = useState([]);
  const [encuestaSelected, setEncuestaSelected] = useState("");
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

  const cargarSeccion = async (encuestaId) => {
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
        <div className="row">
          <div className="col-12">
            <Encuesta
             cargarSeccion= {cargarSeccion} />
          </div>
        </div>
      )} />
      <Route path={props.match.url + '/Seccion'} exact render={() => (
        <>
          {BreadCrumb()}
          {Cliente}
          <div className="row">
            <div className="col-12">
              <SeccionesEncuesta
               secciones = {secciones}
               cargarSeccion = {cargarSeccion}
               EncuestaId ={encuestaSelected}/>
            </div>
          </div>
        </>
      )} />
      <Route path={props.match.url + '/Preguntas'} exact render={() => (
        <>
          {BreadCrumb()}
          {Cliente}
          <div className="row">
            <div className="col-12">
              <SeccionesEncuesta
               secciones = {secciones}
               cargarSeccion = {cargarSeccion}
               EncuestaId ={encuestaSelected}/>
            </div>
          </div>
        </>
      )} />
    </Switch>
    </>
  )
}

export default Encuestas;
