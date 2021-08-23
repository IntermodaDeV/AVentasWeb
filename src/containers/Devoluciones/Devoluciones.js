import React, { useState } from 'react';
import { APIURL } from 'utils/Enviroment';
import { Route, Switch } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/es';
import axios from 'axios';
import ClienteSelected from 'components/Devoluciones/ClienteSelected'
import { ProductosDevolucion } from 'components/Devoluciones/ProductosDevolucion'
import DevolucionesBreadCrumb from './DevolucionesBreadCrumb'
import { Container } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
moment.locale('es');
export const Devoluciones = (props) => {
  const dispatch = useDispatch();
  const cliente = useSelector(e => e.Devolucion.clienteSelected);
  const [Clientes, setClientes] = useState([]);

  const NavHome = () => {
    props.history.push(`/devolucion`);
  }
  const BreadCrumb = () => {
    return (
      <DevolucionesBreadCrumb
        match={props.match}
        cancelarDevolucion={cancelarDevolucion}
        clickBreadCrumb={clickBreadCrumb}
        cliente={cliente}>
      </DevolucionesBreadCrumb >
    )
  }

  const clickBreadCrumb = (nuevaRuta) => {

    props.history.push(nuevaRuta);
  }

  const cancelarDevolucion = () => {
    NavHome();
  }

  const cargarClientes = async () => {
    try {
      const request = await axios.get(`${APIURL}/api/cliente/sincronizacion`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      });
      setClientes(request.data)
    } catch (err) {
      console.log("Ha ocurrido un error", err.response)
    }
  }

  const cargarProductoDevolucion = (cliente) => {
    props.history.push("/devolucion/productos");
    dispatch({ type: 'STORE_DEVOLUCION_CLIENTESELECTED', clienteSelected: JSON.parse(cliente) })
  }

  return (
    <>
      <Switch>
        <Route path={props.match.url} exact render={() => (

          <div className="row">
            <div className="col-12">
              <ClienteSelected
                clientes={Clientes}
                cargarClientes={cargarClientes}
                cargarProductoDevolucion={cargarProductoDevolucion}
              />
            </div>
          </div>
        )} />

        <Route path={props.match.url + "/productos"} exact render={() => (
          <>
            <Container fluid={true}>
              {BreadCrumb()}
              <div className="row">
                <div className="col-12">
                  <ProductosDevolucion
                    clientes={Clientes} />
                </div>
              </div>
            </Container>
          </>
        )} />
      </Switch>
    </>
  )
}