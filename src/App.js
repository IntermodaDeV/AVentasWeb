import React from 'react'
import { STATE_LOGIN } from 'components/Authorize/AuthForm'
import componentQueries from 'react-component-queries'
import { BrowserRouter as Router, Redirect, Switch } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { getGeopostion } from './utils/geopostioning'

// pages
import { EmptyLayout, LayoutRoute, MainLayout } from 'components/Layout'
import AuthModalPage from 'containers/Authorize/AuthModalPage'
import AuthPage from 'containers/Authorize/AuthPage'
import Pedidos from 'containers/Pedidos/Pedidos'
import Recibos from 'containers/Recibos/Recibos'
import Fotografia from 'containers/Fotografias/Fotografias'
import CuentaCorriente from 'containers/CuentaCorriente/CuentaCorriente'
import EstadisticaVisita from 'containers/EstadisticaVisita/EstadisticaVisita'
//import Coordenadas from 'containers/Coordenadas/Coordenadas'
//import CoordenadasGlobal from 'containers/Coordenadas/CoordenadasGlobal'
import ListaPedidos from 'containers/ListaPedidos/ListaPedidos'
import ListaRecibos from 'containers/ListaRecibos/ListaRecibos'
import AsignacionPage from 'containers/Asignacion/Asignacion'
import AgendaPage from 'containers/Agenda/Agenda'
import Sincronizacionlista from 'containers/Sincronizacion/Sincronizacionlista'
import SincronizacionListaMonitor from 'containers/Sincronizacion/SincronizacionListaMonitor'
import './styles/reduction.scss'
import './App.css'
import { Mantenimiento } from 'containers/Seguridad/Mantenimiento/Mantenimiento'
import {Relacional} from 'containers/Seguridad/Relacional/Relacional';
import {Home} from 'containers/Home/Home';
import { ListaPedidosPendientes } from 'containers/ListaPedidos/ListaPedidosPendientes';
import { ListaReciboPendiente } from 'containers/ListaRecibos/ListaReciboPendiente';
import { ListaReciboCreditos } from 'containers/ListaRecibos/ListaReciboCreditos';
import { Cartera } from 'containers/Cartera/Cartera';
import { CoordenadasAsesor } from 'containers/Coordenadas/CoordenadasAsesor';
import BandejaSalida from 'containers/ListaPedidos/BandejaSalida';
import BadejaSalidaRecibos from 'containers/ListaRecibos/BadejaSalidaRecibos';
import { SincronizacionColeccionEspecifica } from 'containers/Sincronizacion/SincronizacionColeccionEspecifica'
const isLogged = () => {
  var token = localStorage.getItem('token')
  if (token !== null && token !== '') {
    return true
  }
  return false
  // localStorage.setItem(id, JSON.stringify(array));
}

const App = props => {
  if (isLogged()) {
    window.setInterval(() => {
      getGeopostion()
    }, 60000)

    return (
      <SnackbarProvider dense maxSnack={3}>
        <Router>
          <Switch>
            <LayoutRoute
              exactz
              path='/login-modal'
              layout={MainLayout}
              component={AuthModalPage}
            />
            <LayoutRoute
              path='/pedidos'
              layout={MainLayout}
              component={Pedidos}
            />
            <LayoutRoute
              exact
              path='/asignacion'
              layout={MainLayout}
              component={AsignacionPage}
            />
            <LayoutRoute
              exact
              path='/coordenadas-asesor'
              layout={MainLayout}
              component={CoordenadasAsesor}
            />
            <LayoutRoute
              exact
              path='/lista-pedidos'
              layout={MainLayout}
              component={ListaPedidos}
            />
            <LayoutRoute
              exact
              path='/lista-pedidos-pendientes'
              layout={MainLayout}
              component={ListaPedidosPendientes}
            />
            <LayoutRoute
              exact
              path='/DashBoard-Comercial'
              layout={MainLayout}
              component={()=>( <iframe title="reporte" frameBorder="0" src="http://cubo-intermoda/tableros/powerbi/Comercial/Operativo%20Comercial?rs:Embed=true" position="relative" top="0" height="100%" width="100%" /> )}
            />
            <LayoutRoute
              path='/lista-pedidos-BandejaSalida'
              layout={MainLayout}
              component={BandejaSalida}
            />
            <LayoutRoute
              exact
              path='/lista-recibos-pendientes'
              layout={MainLayout}
              component={ListaReciboPendiente}
            />
            <LayoutRoute
              exact
              path='/lista-recibos-creditos'
              layout={MainLayout}
              component={ListaReciboCreditos}
            />
            <LayoutRoute
              path='/cartera'
              layout={MainLayout}
              component={Cartera}
            />
            {/*<LayoutRoute
              exact
              path='/coordenadas'
              layout={MainLayout}
              component={Coordenadas}
            />*/}
            {/*<LayoutRoute
              exact
              path='/coordenadas-global'
              layout={MainLayout}
              component={CoordenadasGlobal}
            />*/}
            <LayoutRoute
              exact
              path='/agenda'
              layout={MainLayout}
              component={AgendaPage}
            />

            <LayoutRoute
              path='/recibos'
              layout={MainLayout}
              component={Recibos}
            />
            <LayoutRoute
              exact
              path='/lista-recibos'
              layout={MainLayout}
              component={ListaRecibos}
            />
             <LayoutRoute
              exact
              path='/lista-recibos-BandejaSalida'
              layout={MainLayout}
              component={BadejaSalidaRecibos}
            />
            <LayoutRoute
              exact
              path='/devoluciones'
              layout={MainLayout}
              component={blank}
            />
            <LayoutRoute
              exact
              path='/inventarios'
              layout={MainLayout}
              component={blank}
            />
            <LayoutRoute
              exact
              path='/fotografias'
              layout={MainLayout}
              component={Fotografia}
            />
            <LayoutRoute
              exact
              path='/cuenta-corriente'
              layout={MainLayout}
              component={CuentaCorriente}
            />
            <LayoutRoute
              exact
              path='/estadistica-visita'
              layout={MainLayout}
              component={EstadisticaVisita}
            />
            <LayoutRoute
              exact
              path='/sincronizacionlista'
              layout={MainLayout}
              component={Sincronizacionlista}
            />
            <LayoutRoute
              exact
              path='/sincronizacion-especifica-coleccion'
              layout={MainLayout}
              component={SincronizacionColeccionEspecifica}
            />
            <LayoutRoute
              exact
              path='/sincronizacionListaMonitor'
              layout={MainLayout}
              component={SincronizacionListaMonitor}
            />
            <LayoutRoute
              path='/seguridad-mantenimiento'
              layout={MainLayout}
              component={Mantenimiento}
            />
            <LayoutRoute
              path='/seguridad-permisos'
              layout={MainLayout}
              component={Relacional}
            />
             <LayoutRoute
              exact
              path='/home'
              layout={MainLayout}
              component={Home}
            />
            <Redirect to='/home' />
          </Switch>
        </Router>
      </SnackbarProvider>
    )
  } else {
    return (
      <SnackbarProvider>
        <Router>
          <Switch>
            <LayoutRoute
              exact
              path='/Login'
              layout={EmptyLayout}
              component={props => (
                <AuthPage {...props} authState={STATE_LOGIN} />
              )}
            />
            <Redirect to='/Login' />
          </Switch>
        </Router>
      </SnackbarProvider>
    )
  }
}

const query = ({ width }) => {
  if (width < 575) {
    return { breakpoint: 'xs' }
  }

  if (width > 576 && width < 767) {
    return { breakpoint: 'sm' }
  }

  if (width > 768 && width < 991) {
    return { breakpoint: 'md' }
  }

  if (width > 992 && width < 1199) {
    return { breakpoint: 'lg' }
  }

  if (width > 1200) {
    return { breakpoint: 'xl' }
  }

  return { breakpoint: 'xs' }
}
const blank = () => {
  return <div />
}
export default componentQueries(query)(App)
