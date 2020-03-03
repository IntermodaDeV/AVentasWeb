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
import Pruebas from 'components/Global/pruebas'
import Coordenadas from 'containers/Coordenadas/Coordenadas'
import ListaPedidos from 'containers/ListaPedidos/ListaPedidos'
import ListaRecibos from 'containers/ListaRecibos/ListaRecibos'
import AsignacionPage from 'containers/Asignacion/Asignacion'
import AgendaPage from 'containers/Agenda/Agenda'
import './styles/reduction.scss'
import './App.css'

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
              path='/lista-pedidos'
              layout={MainLayout}
              component={ListaPedidos}
            />
            <LayoutRoute
              exact
              path='/coordenadas'
              layout={MainLayout}
              component={Coordenadas}
            />
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
              path='/pruebas'
              layout={MainLayout}
              component={Pruebas}
            />
            <Redirect to='/agenda' />
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
