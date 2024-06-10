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
import {RecolocacionPedido} from 'containers/RecolocacionPedido/RecolocacionPedido' 
import {Inventario} from 'containers/Inventario/Inventario' 
import Recibos from 'containers/Recibos/Recibos'
import Fotografia from 'containers/Fotografias/Fotografias'
import CuentaCorriente from 'containers/CuentaCorriente/CuentaCorriente'
import EstadisticaVisita from 'containers/EstadisticaVisita/EstadisticaVisita'
//import Coordenadas from 'containers/Coordenadas/Coordenadas'
import CoordenadasGlobal from 'containers/Coordenadas/CoordenadasGlobal'
import ListaPedidos from 'containers/ListaPedidos/ListaPedidos'
import ListaRecibos from 'containers/ListaRecibos/ListaRecibos'
import AsignacionPage from 'containers/Asignacion/Asignacion'
import AgendaPage from 'containers/Agenda/Agenda'
import Sincronizacionlista from 'containers/Sincronizacion/Sincronizacionlista'
import SincronizacionListaMonitor from 'containers/Sincronizacion/SincronizacionListaMonitor'
import './styles/reduction.scss'
import './App.css'
import { Mantenimiento } from 'containers/Seguridad/Mantenimiento/Mantenimiento'
import { Relacional } from 'containers/Seguridad/Relacional/Relacional';
import { Home } from 'containers/Home/Home';
import { ListaPedidosPendientes } from 'containers/ListaPedidos/ListaPedidosPendientes';
import { ListaPedidosFlotante } from 'containers/ListaPedidos/ListaPedidosFlotante';
import { ListaReciboPendiente } from 'containers/ListaRecibos/ListaReciboPendiente';
import { ListaReciboCreditos } from 'containers/ListaRecibos/ListaReciboCreditos';
import { Cartera } from 'containers/Cartera/Cartera';
import { CoordenadasAsesor } from 'containers/Coordenadas/CoordenadasAsesor';
import BandejaSalida from 'containers/ListaPedidos/BandejaSalida';
import BadejaSalidaRecibos from 'containers/ListaRecibos/BadejaSalidaRecibos';
import { ListaRecibosFlotante } from 'containers/ListaRecibos/ListaRecibosFlotante';
import { SincronizacionColeccionEspecifica } from 'containers/Sincronizacion/SincronizacionColeccionEspecifica'
import { SincronizacionCliente } from 'containers/Sincronizacion/SincronizacionCliente'
import { ReconstruccionRuta } from 'containers/ReconstruccionRuta/ReconstruccionRuta'
import { getLocalStorage, verificarConexion } from 'utils/http';
import { MantenimientoEncuesta } from 'containers/Encuestas/MantenimientoEncuesta/MantenimientoEncuesta'
import Encuestas from 'containers/Encuestas/Encuestas'
import axios from 'axios'
import { APIURL, APP_VERSION } from 'utils/Enviroment'
import { EncuestasResueltas } from 'containers/Encuestas/EncuestasResueltas'
import { PaqueteBodega } from 'containers/PaqueteBodega/PaqueteBodega'
import { SitioBodega } from 'containers/SitioBodega/SitioBodega'
import { AlmacenSitio } from 'containers/AlmacenSitio/AlmacenSitio'
import { ListaReciboProforma } from 'containers/ListaRecibos/ListaRecibosProforma';
import { Ubicaciones } from 'containers/Ubicaciones/Ubicaciones';
import { Devoluciones } from 'containers/Devoluciones/Devoluciones';
import { MotivosDevolucion } from 'components/Devoluciones/MotivosDevolucion/MotivosDevolucion';
import { ListadoDevolucion } from 'containers/Devoluciones/ListadoDevolucion/ListadoDevolucion';
import { AprobacionDevolucion } from 'containers/Devoluciones/ListadoDevolucion/AprobacionDevoluciones';
import { ListadoDevolucionPendiente } from 'containers/Devoluciones/ListadoDevolucion/ListadoDevolucionPendiente'
import { AcuerdosVenta } from 'containers/AcuerdosVenta/AcuerdoVenta'
import { RazonesNoVenta } from 'containers/Agenda/RazonesNoVenta/RazonesNoVenta'
import { MantenimientoGastosAsesores } from 'containers/GastosAsesores/MantenimientoGastos/MantenimientoGastosAsesores';
import GastosPendientes from 'containers/GastosAsesores/GastosPendientes'
import Gastos from 'containers/GastosAsesores/Gastos'
import GastosNoSync from 'containers/GastosAsesores/GastosNoSync'
import { CategoriaGasto } from 'components/GastoAsesores/CategoriaGasto/CategoriaGasto'
import { GrupoImpuesto } from 'components/GastoAsesores/GrupoImpuestos/GrupoImpuesto'
import GastosRechazar from 'containers/GastosAsesores/GastosRechazar'
import { SeguimientoCalidad } from 'containers/Devoluciones/ListadoDevolucion/SeguimientoCalidad'
import { SincronizacionEspecifica } from 'containers/Sincronizacion/SincronizacionEspecifica'
import { FirmaPantalla } from 'containers/Seguridad/Firmas/FirmaPantalla'
import { MotivosTiempoFuera } from 'containers/Agenda/MotivoTiempoFuera/MotivoTiempoFuera'
import { TiemposFuera } from 'containers/Agenda/TiemposFuera/TiemposFuera'
import { BaseColorImpuesto } from 'containers/BaseColorImpuesto/BaseColorImpuesto'
import { ClasficacionProductos } from 'containers/Devoluciones/ClasificacionProductos'
import { InventarioEspecifico } from 'containers/InventarioEspecifico/InventarioEspecifico'

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

    const cargarConfiguraciones = async () => {
      if (localStorage.getItem("Operando") === "Si") {
        return;
      }
      if (verificarConexion()) {
        try {
          const request = await axios.get(`${APIURL}/api/configuraciones`);
          if (request.data.APP_VERSION !== APP_VERSION) {
            if (!window.location.href.includes("Pedidos")) {
              window.location.href = "/home";
            }
          }
        } catch (err) {
          console.log(err);
        }
      }
    }

    setInterval(() => {
      if (localStorage.getItem("Operando") === "Si") {
        return;
      }
      if (localStorage.getItem("SesionObligatorio") === null || localStorage.getItem("SesionObligatorio") === undefined) {
        localStorage.setItem("SesionObligatorio", 1);
        localStorage.removeItem("token")
        window.location.reload();
      }
      if (localStorage.getItem("UsuarioOficina") === "false") {
        let data = getLocalStorage("ListaPrecios");
        if (data === null) {
          if (!window.location.href.includes("home")) {
            window.location.href = "/home";
          }
        }
      }
    }, (2 * 60 * 1000))

    setInterval(() => {
      cargarConfiguraciones();
    }, (5 * 60 * 1000))
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
              path='/recolocacion-pedido'
              layout={MainLayout}
              component={RecolocacionPedido}
            />
            <LayoutRoute
              path='/inventario'
              layout={MainLayout}
              component={Inventario}
            />
            <LayoutRoute
              exact
              path='/asignacion'
              layout={MainLayout}
              component={AsignacionPage}
            />
            <LayoutRoute
              exact
              path='/ultima-geolocalizacion-monitoreo'
              layout={MainLayout}
              component={CoordenadasAsesor}
            />
            <LayoutRoute
              exact
              path='/recorrido-monitoreo'
              layout={MainLayout}
              component={ReconstruccionRuta}
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
              path='/lista-pedidos-flotante'
              layout={MainLayout}
              component={ListaPedidosFlotante}
            />
            <LayoutRoute
              exact
              path='/lista-recibos-flotante'
              layout={MainLayout}
              component={ListaRecibosFlotante}
            />
            <LayoutRoute
              exact
              path='/DashBoard-Comercial'
              layout={MainLayout}
              component={() => (<iframe title="reporte" frameBorder="0" src="http://cubo-intermoda/tableros/powerbi/Comercial/Operativo%20Comercial?rs:Embed=true" position="relative" top="0" height="100%" width="100%" />)}
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
            {<LayoutRoute
              exact
              path='/coordenadas-global'
              layout={MainLayout}
              component={CoordenadasGlobal}
            />}
            <LayoutRoute
              exact
              path='/agenda'
              layout={MainLayout}
              component={AgendaPage}
            />
            <LayoutRoute
              exact
              path='/tiempofueraagenda'
              layout={MainLayout}
              component={TiemposFuera}
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
              path='/sincronizacion-especifica-cliente'
              layout={MainLayout}
              component={SincronizacionCliente}
            />
            <LayoutRoute
              exact
              path='/sincronizacionListaMonitor'
              layout={MainLayout}
              component={SincronizacionListaMonitor}
            />
            <LayoutRoute
              exact
              path='/sincronizacionEspecifica'
              layout={MainLayout}
              component={SincronizacionEspecifica}
            />
            <LayoutRoute
              exact
              path='/configuracion-paquete-bodega'
              layout={MainLayout}
              component={PaqueteBodega}
            />
            <LayoutRoute
              exact
              path='/configuracion-sitio'
              layout={MainLayout}
              component={SitioBodega}
            />
            <LayoutRoute
              exact
              path='/configuracion-basecolor'
              layout={MainLayout}
              component={BaseColorImpuesto}
            />
            <LayoutRoute
              exact
              path='/configuracion-almacenes'
              layout={MainLayout}
              component={AlmacenSitio}
            />
            <LayoutRoute
              exact
              path='/configuracion-RazonesNoVenta'
              layout={MainLayout}
              component={RazonesNoVenta}
            />
            <LayoutRoute
              exact
              path='/configuracion-tiemposfuera'
              layout={MainLayout}
              component={MotivosTiempoFuera}
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
              path='/seguridad-firma'
              layout={MainLayout}
              component={FirmaPantalla}
            />
            <LayoutRoute
              path='/Mantenimiento/Encuesta'
              layout={MainLayout}
              component={MantenimientoEncuesta}
            />
            <LayoutRoute
              exact
              path='/home'
              layout={MainLayout}
              component={Home}
            />
            <LayoutRoute
              path='/encuesta'
              layout={MainLayout}
              component={Encuestas}
            />
            <LayoutRoute
              path='/encuesta/selectCliente'
              layout={MainLayout}
              component={Encuestas}
            />
            <LayoutRoute
              path='/Encuesta/Resueltas'
              layout={MainLayout}
              component={EncuestasResueltas}
            />
            <LayoutRoute
              path='/lista-recibos-proforma'
              layout={MainLayout}
              component={ListaReciboProforma}
            />
            <LayoutRoute
              path='/configuracion-ubicaciones'
              layout={MainLayout}
              component={Ubicaciones}
            />
            <LayoutRoute
              path='/devolucion'
              layout={MainLayout}
              component={Devoluciones}
            />
            <LayoutRoute
              path='/MotivosDevolucion'
              layout={MainLayout}
              component={MotivosDevolucion}
            />
            <LayoutRoute
              path='/listadoDevolucion'
              layout={MainLayout}
              component={ListadoDevolucion}
            />
            <LayoutRoute
              path='/listadoDevolucionPendiente'
              layout={MainLayout}
              component={ListadoDevolucionPendiente}
            />
            <LayoutRoute
              path='/aprobarDevoluciones'
              layout={MainLayout}
              component={AprobacionDevolucion}
            />
            <LayoutRoute
              path='/acuerdosVenta'
              layout={MainLayout}
              component={AcuerdosVenta}
            />
            <LayoutRoute
              path='/GiraAsesores/Mantenimiento'
              layout={MainLayout}
              component={MantenimientoGastosAsesores}
            />
            <LayoutRoute
              path='/GiraAsesores/Mantenimiento/Categoria'
              layout={MainLayout}
              component={CategoriaGasto}
            />
            <LayoutRoute
              path='/GiraAsesores/Mantenimiento/GrupoImpuestos'
              layout={MainLayout}
              component={GrupoImpuesto}
            />
            <LayoutRoute
              path='/GiraAsesores/HistorialGasto'
              layout={MainLayout}
              component={Gastos}
            />
            <LayoutRoute
              path='/GiraAsesores/GastosPendientes'
              layout={MainLayout}
              component={GastosPendientes}
            />
            <LayoutRoute
              path='/GiraAsesores/GastosRechazar'
              layout={MainLayout}
              component={GastosRechazar}
            />
            <LayoutRoute
              path='/GiraAsesores/GastosNoSincronizados'
              layout={MainLayout}
              component={GastosNoSync}
            />
            <LayoutRoute
              path='/seguimientoCalidad'
              layout={MainLayout}
              component={SeguimientoCalidad}
            />
            <LayoutRoute
              exact
              path='/devolucion-clasificacion'
              layout={MainLayout}
              component={ClasficacionProductos}
            />
            <LayoutRoute
              exact
              path='/configuracion-obtencion-inventario'
              layout={MainLayout}
              component={InventarioEspecifico}
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
