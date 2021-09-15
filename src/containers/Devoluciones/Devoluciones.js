import React from 'react';
import { Route, Switch } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/es';
import ClienteSelected from 'components/Devoluciones/ClienteSelected'
import { ProductosDevolucion } from 'components/Devoluciones/ProductosDevolucion'
import DevolucionesBreadCrumb from './DevolucionesBreadCrumb'
import { StickyContainer, Sticky } from 'react-sticky';
import { useDispatch, useSelector } from 'react-redux';
moment.locale('es');

export const Devoluciones = (props) => {
  const dispatch = useDispatch();
  const cliente = useSelector(e => e.Devolucion.clienteSelected);

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
                cargarProductoDevolucion={cargarProductoDevolucion}
              />
            </div>
          </div>
        )} />

        <Route path={props.match.url + "/productos"} exact render={() => (
          <>

            {BreadCrumb()}
            <section>
              <StickyContainer>
                <Sticky>
                  {({
                    style,
                  }) => (
                    <header style={style} className="Especial2 p-0 shadow">
                      <div className="row align-items-center">
                        <div className="col-12 pr-0">
                          <ProductosDevolucion />
                        </div>
                      </div>
                    </header>)}
                </Sticky>
              </StickyContainer>
            </section>
          </>
        )} />
      </Switch>
    </>
  )
}