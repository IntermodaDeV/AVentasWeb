import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import SelectCliente from 'components/Recibos/SelectCliente/SelectCliente'
import FacturaTable from 'components/Recibos/Facturas/FacturaTable'
// import SubFacturaTable from 'components/Recibos/Facturas/SubFacturaTable'
import CuotasTable from 'components/Recibos/Facturas/CuotasTable'
import CuotasAgrupadasTable from 'components/Recibos/Facturas/CuotasAgrupadasTable'
import DetalleRecibo from 'components/Recibos/Recibo/DetalleRecibo'
import { ClipLoader } from 'react-spinners';
import RecibosBreadCrumb from 'components/Recibos/RecibosBreadCrumb/RecibosBreadCrumb';
import FacturasModal from "components/Recibos/FacturasModal/FacturasModal";
// import TableCliente from 'components/Recibos/SelectCliente/TableClienteSelected'
import { APIURL } from 'utils/Enviroment';
import { Route, Switch, matchPath } from 'react-router-dom';
import CuentaCorrienteTable from '../CuentaCorriente/CuentaCorienteTable'
import moment from 'moment';
import 'moment/locale/es';
import { FaEye } from "react-icons/fa";
import {FiAlertTriangle} from 'react-icons/fi';
moment.locale('es');
// import styles from 'containers/Recibos/Recibos.module.css';
const Recibos = (props) => {
  const [loading, setLoading] = useState(true);
  const [isCreditoVencido,setCreditoVencido] = useState(false);
  const [DataModal, setDataModal] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const creditoVencido = (vencido)=>{
    setCreditoVencido(vencido);
    localStorage.setItem('isVencido',vencido);
  }
  const urlApi = APIURL;
  // const [tipoPedido, setTipoPedido] = useState(null);
  // const [clientePreSelected, setClientePreSelected] = useState(null);

  useEffect(() => {
    // if(props.location.state&&props.location.state.Cliente) {
    //   ? props.location.state.CodigoCliente : null
    // }
    // if(props.)
    if (matchPath(props.match.url,
      {
        path: props.location.pathname,
        exact: true,
      }
    )) {

      CargarDatos()
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [])
  useEffect(() => {
    if (props.location.state && props.location.state.CodigoCliente && props.clientes && props.clientes.length > 0) {
      let cliente = props.clientes.find(cl => {
        return cl.Codigo === props.location.state.CodigoCliente;
      });
      props.onStoreReciboClienteSelected(cliente);
      props.onStoreReciboFacturasXCliente(cliente.Facturas);
    }
    // eslint-disable-next-line
  }, [props.clientes]);
  useEffect(() => {
    if (props.clienteSelected) {
      calcularCuotasCuentaCorriente();
    }
    // eslint-disable-next-line
  }, [props.clienteSelected])

  const calcularCuotasCuentaCorriente = () => {
    let agrupacionCuentCorriente = [];
    let totalSaldo = 0;
    let totalAPagar = 0;
    props.clienteSelected.AcuerdosXTipoPedido.forEach(acuXTip => {
      acuXTip.Acuerdos.forEach(acu => {
        acu.Facturas.forEach(fact => {
          fact.Cuotas.forEach(cuot => {
            let diasVencimiento = moment().diff(cuot.FechaVencimiento, 'days') * -1;
            let diasDescuento = moment().diff(cuot.FechaMaxDescuento, 'days') * -1;
            let aPagar = cuot.Saldo;
            if (diasDescuento >= 0 && cuot.Descuento) {
              aPagar -= cuot.Descuento;
            }
            totalSaldo += cuot.Saldo;
            totalAPagar += aPagar;
            agrupacionCuentCorriente.push({
              Tipo: cuot.TipoDocumento,// Tipo
              TipoPedido: acuXTip.TipoPedido,// TipoPedido
              Factura: fact.Factura,// Factura
              NumeroFEL: fact.NumeroFEL,// Factura
              IdAcuerdoxCliente: acu.Acuerdo,// IdAcuerdoxCliente
              NumeroCuota: cuot.NumeroCuota,// NumeroCuota
              FechaFactura: moment(cuot.FechaFactura).format("DD/MM/YYYY"),// FechaFactura
              FechaVencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),// FechaVencimiento
              Dias: isNaN(diasVencimiento) ? "":diasVencimiento,// Dias
              Valor: cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),// Valor
              Saldo: cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),// Saldo
              FechaMaxDescuento: moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== "Invalid date" ? moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") : "",// FechaMaxDescuento
              DiasV: isNaN(diasDescuento) ? "":diasDescuento, // DiasV
              Descuento: cuot.Descuento.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),// Descuento
              APagar: aPagar.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),// APagar
              idmoneda: cuot.IdMoneda,// idmoneda
            });
          });
        });
      });
    });
    agrupacionCuentCorriente.sort((a, b) => {
      if (moment(a.FechaVencimiento, "DD/MM/YYYY").isAfter(moment(b.FechaVencimiento, "DD/MM/YYYY"), 'day')) {
        return 1;
      }
      if (moment(a.FechaVencimiento, "DD/MM/YYYY").isBefore(moment(b.FechaVencimiento, "DD/MM/YYYY"), 'day')) {
        return -1;
      }
      if (a.NumeroCuota < b.NumeroCuota) {

        return -1;
      }
      if (a.NumeroCuota > b.NumeroCuota) {

        return 1;
      }
      return 0;

    });

    agrupacionCuentCorriente.push({
      Tipo: <h6 className="font-weight-bolder text-dark">Totales</h6>,// Tipo
      TipoPedido: null,// TipoPedido
      Factura: null,// Factura
      IdAcuerdoxCliente: null,// IdAcuerdoxCliente
      NumeroCuota: null,// NumeroCuota
      FechaFactura: null,// FechaFactura
      FechaVencimiento: null,// FechaVencimiento
      Dias: null,// Dias
      Valor: null,// Valor
      Saldo: (<label className="font-weight-bolder text-dark">
        {totalSaldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),// Saldo
      FechaMaxDescuento: null,// FechaMaxDescuento
      DiasV: null,// DiasV
      Descuento: null,// Descuento
      APagar: (<label className="font-weight-bolder text-dark">
        {totalAPagar.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),// APagar
      idmoneda: null,// idmoneda
    });

    props.onStoreReciboCuotasCuentaCorriente(agrupacionCuentCorriente);
  }
  const FacturasVencidas = (TipoCredito)=>{
    const acuerdoFiltrado =  props.clienteSelected.AcuerdosXTipoPedido.filter(x=>x.TipoPedido!==TipoCredito);
    let facturas = [];
      acuerdoFiltrado.forEach(e=>{  
        e.Acuerdos.forEach(acu => {
          acu.Facturas.forEach(fact => {
            fact.Cuotas.forEach(cuot => {

              const fechaVencimiento = new Date(cuot.FechaVencimiento);
              const fechaActual      = new Date();
              const isVencida        = fechaActual>fechaVencimiento;
  
              if(isVencida)
              {
                facturas.push(ProcesarFactura(cuot,TipoCredito,e.TipoCredito));  
              }
            })
            
          })
        })
      });
      setDataModal(facturas);
      setOpenModal(true);
    
  }
  const ProcesarFactura = (factura,credito)=>{
    console.log(factura)
    let dias = moment(factura.FechaVencimiento).diff(moment(new Date()), 'days')
    let diasDescuento = 0;
    let fechaDescuento = moment(factura.FechaMaxDescuento);
    if (fechaDescuento.isValid()) {
      diasDescuento = moment(factura.FechaMaxDescuento).diff(moment(new Date()), 'days');
    }

      let facturatmp={
        NumeroFactura: factura.Factura,
        Dias: dias,
        DiasDescuento: diasDescuento,
        Tipo: factura.TipoDocumento,
        Fecha: moment(factura.FechaFactura).format("DD/MM/YYYY"),
        Vencimiento: moment(factura.FechaVencimiento).format("DD/MM/YYYY"),
        FechaDescuento: fechaDescuento.isValid() ? fechaDescuento.format("DD/MM/YYYY") : "",
        Valor: factura.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
        Saldo: factura.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')     
      }
      return facturatmp;
}
  const CargarDatos = () => {
    cargarClientes()
  }

  const cargarClientes = () => {
    fetch(urlApi + '/api/cliente', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(res => {
      if (res.status === 401) {
        localStorage.setItem('token', '')
        window.location.reload()
      }
      if (res.status === 200) {
        res.json().then(
          result => {
            setLoading(false);
            props.onStoreReciboClientes(result)
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          error => {

          }
        )
      }
    })
  }

  const cargarFacturasXCliente = () => {
    props.onStoreReciboFacturasXCliente(props.clienteSelected.Facturas)
    props.history.push(`/Recibos/TipoCredito`);
  }

  const cargarCuotasXCliente = (cuotas) => {
    props.onStoreReciboCuotasXCliente(cuotas);

    props.history.push(`/Recibos/${cuotas[0].TipoPedido}/Facturas`);
  }

  const CargarCuotasAPagar = (cuotas) => {
    props.onStoreReciboCuotasAPagar(cuotas);
    props.history.push(`/Recibos/Detalle`);
  }

  const NavHome = () => {
    props.history.push(`/Recibos`);
  }


  const BreadCrumb = () => {
    return (
      <RecibosBreadCrumb
        match={props.match}
        cliente={props.clienteSelected}
        cuotas={props.cuotasXCliente}
        cuotasAPagar={props.cuotasAPagar}
        cancelarRecibo={cancelarRecibo}
        clickBreadCrumb={clickBreadCrumb}>

      </RecibosBreadCrumb >
    )
  }

  const clickBreadCrumb = (nuevaRuta) => {
    props.history.push(nuevaRuta);
  }

  const cancelarRecibo = () => {
    
    NavHome();
    props.onStoreReciboClienteSelected(null);
    props.onStoreReciboCuotasXCliente(null);
    props.onStoreReciboCuotasAPagar(null);
    props.onStoreReciboFacturasXCliente(null);

  }

  let Cliente = (
    <div className="text-center">
      <h4>{props.clienteSelected ? props.clienteSelected.Codigo + ' ' + props.clienteSelected.Nombre : ''}</h4>
      <hr />
    </div>
  );
  const SelectedCliente = cliente => {
    //props.history.push('/Recibos/TipoCredito');
    props.onStoreReciboClienteSelected(cliente);
  }
  // if (clienteSelected && facturasXCliente && cuotasAPagar) {
  //   return (
  //     <>
  //       {BreadCrumb()}
  //       {Cliente}
  //       <div className="row">
  //         <div className="col-12">
  //           <DetalleRecibo
  //             Cliente={clienteSelected}
  //             Cuotas={cuotasXCliente}
  //             CuotasAPagar={cuotasAPagar}
  //             EliminarCuota={() => { }}
  //           />
  //         </div>
  //       </div>
  //     </>
  //   )
  // }
  // if (clienteSelected && facturasXCliente && cuotasXCliente && cuotasXCliente.length > 0) {
  //   if (cuotasXCliente[0].AgrupaPorCuota) {
  //     return (
  //       <>
  //         {BreadCrumb()}
  //         {Cliente}
  //         <div className="row">
  //           <div className="col-12">
  //             <CuotasAgrupadasTable Cuotas={cuotasXCliente} props.onStoreReciboCuotasAPagar={props.onStoreReciboCuotasAPagar} />
  //           </div>
  //         </div>
  //       </>
  //     );
  //   } else {
  //     return (
  //       <>
  //         {BreadCrumb()}
  //         {Cliente}
  //         <div className="row">
  //           <div className="col-12">
  //             <CuotasTable Cuotas={cuotasXCliente} props.onStoreReciboCuotasAPagar={props.onStoreReciboCuotasAPagar} />
  //           </div>
  //         </div>
  //       </>
  //     );
  //   }
  // }

  // if (clienteSelected && facturasXCliente) {
  //   return (
  //     <>
  //       {BreadCrumb()}
  //       {Cliente}
  //       <div className="row">
  //         <div className="col-12">
  //           <FacturaTable
  //             Cliente={clienteSelected}
  //             Credito={clienteSelected.Credito}
  //             AcuerdosXTipoPedido={clienteSelected.AcuerdosXTipoPedido}
  //             SetCuotas={props.onStoreReciboCuotasXCliente}
  //           />
  //         </div>
  //       </div>
  //     </>
  //   )
  // }
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
    <FacturasModal Data={DataModal} Open={openModal} onClose={setOpenModal}></FacturasModal>
    <Switch>
      <Route path={props.match.url} exact render={() => (
        <div className="row">
          <div className="col-12">
            <SelectCliente
              clientes={props.clientes}
              clienteSelected={props.clienteSelected}
              onSelect={SelectedCliente}
              setCliente={cargarFacturasXCliente}
              codigoClientePreseleccionado={
                props.location.state ? props.location.state.CodigoCliente 
                : null
                // (props.clienteSelected?props.clienteSelected.Codigo:null)
              }
            />

            {
              props.clienteSelected &&
              <CuentaCorrienteTable
                clienteSelected={props.clienteSelected}
                CuotasCuentaCorriente={props.cuotasCuentaCorriente}
              >
              </CuentaCorrienteTable>
            }

          </div>
        </div>
      )} />
      <Route path={props.match.url + '/TipoCredito'} exact render={() => (
        <>
          {BreadCrumb()}
          {Cliente}
          <div className="row">
            <div className="col-12">
              <FacturaTable
                Cliente={props.clienteSelected}
                Credito={props.clienteSelected.Credito}
                AcuerdosXTipoPedido={props.clienteSelected.AcuerdosXTipoPedido}
                SetCuotas={cargarCuotasXCliente}
                CreditoVencido={creditoVencido}
                CargarCuotasAPagar={CargarCuotasAPagar}
              />
            </div>
          </div>
        </>
      )} />

      
      <Route path={props.match.url + '/:TipoCredito/Facturas'} exact component={(routeProps) => (
        <>
          {
            
            props.cuotasXCliente[0].AgrupaPorCuota ?
              (
                <>
                  {BreadCrumb()}
                  {Cliente}
                  <div className="row">
                    <div className="col-12">
                   {(localStorage.getItem('isVencido')==='true')? <div className="text-danger font-weight-bold alert alert-danger" role={"alert"} style={{marginBottom:'1em',textAlign:'center'}}><FiAlertTriangle style={{size:'20px',color:'red'}}/> Hay facturas vencidas en otro tipo de credito <FaEye onClick={()=>{FacturasVencidas(routeProps.match.params.TipoCredito)}} size={"20px"} style={{display:"inline-block",marginLeft:'10px'}}/></div>:<span></span>}
                      <CuotasAgrupadasTable Cuotas={props.cuotasXCliente} SetCuotasAPagar={CargarCuotasAPagar} isVencidos={isCreditoVencido}/>
                    </div>
                  </div>
                </>
              )
              :
              <>
                {BreadCrumb()}
                {Cliente}
                <div className="row">
                  <div className="col-12">
                    {(localStorage.getItem('isVencido')==='true')? <div className="text-danger font-weight-bold alert alert-danger"  role={"alert"} style={{marginBottom:'1em',textAlign:'center'}}><FiAlertTriangle style={{size:'20px',color:'red'}}/>Hay facturas vencidas en otro tipo de credito <FaEye onClick={()=>{FacturasVencidas(routeProps.match.params.TipoCredito)}} size={"20px"}  style={{display:"inline-block",marginLeft:'10px'}}/></div>:<span></span>}
                    <CuotasTable Cuotas={props.cuotasXCliente} SetCuotasAPagar={CargarCuotasAPagar} isVencidos={isCreditoVencido}/>
                  </div>
                </div>
              </>
          }
        </>
      )} />
      <Route path={props.match.url + '/Detalle'} exact component={(routeProps) => (
        <>
          {BreadCrumb()}
          {Cliente}
          <div className="row">
            <div className="col-12">
              <DetalleRecibo
                history={props.history}
                Cliente={props.clienteSelected}
                Cuotas={props.cuotasXCliente}
                CuotasAPagar={props.cuotasAPagar}
                EliminarCuota={() => { }}
              />
            </div>
          </div>
        </>
      )} />
    </Switch>
    </>
  )
}

const mapStateToProps = state => {
console.log("state.cuotasCuentaCorriente", state.Recibo.cuotasCuentaCorriente)


  return {

    clientes: state.Recibo.clientes,
    clienteSelected: state.Recibo.clienteSelected,
    cuotasXCliente: state.Recibo.cuotasXCliente,
    cuotasAPagar: state.Recibo.cuotasAPagar,
    facturasXCliente: state.Recibo.facturasXCliente,
    cuotasCuentaCorriente: state.Recibo.cuotasCuentaCorriente,

    loading: state.Recibo.loading,

  };
};
const mapDispatchToProps = dispatch => {
  return {
    onStoreReciboClientes: (clientes) => dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: clientes }),
    onStoreReciboClienteSelected: (clienteSelected) => dispatch({ type: 'STORE_RECIBO_CLIENTESELECTED', clienteSelected: clienteSelected }),
    onStoreReciboCuotasXCliente: (cuotasXCliente) => dispatch({ type: 'STORE_RECIBO_CUOTASXCLIENTE', cuotasXCliente: cuotasXCliente }),
    onStoreReciboCuotasAPagar: (cuotasAPagar) => dispatch({ type: 'STORE_RECIBO_CUOTASAPAGAR', cuotasAPagar: cuotasAPagar }),
    onStoreReciboFacturasXCliente: (facturasXCliente) => dispatch({ type: 'STORE_RECIBO_FACTURASXCLIENTE', facturasXCliente: facturasXCliente }),
    onStoreReciboCuotasCuentaCorriente: (cuotasCuentaCorriente) => dispatch({ type: 'STORE_RECIBO_CUOTASCUENTACORRIENTE', cuotasCuentaCorriente: cuotasCuentaCorriente }),


    onStoreReciboLoading: (loading) => dispatch({ type: 'STORE_RECIBO_LOADING', loading: loading }),

    onStoreClientes: (clientes) => dispatch({ type: 'STORE_CLIENTES', clientes: clientes }),
    onStoreTipoPedido: (TipoPedido) => dispatch({ type: 'STORE_TIPO_PEDIDO', TipoPedido: TipoPedido }),
    onSetProducto: (producto) => dispatch({ type: 'SET_PRODUCTO', producto: producto }),
    onSetColeccion: (coleccion) => dispatch({ type: 'SET_COLECCION', coleccion: coleccion }),
    onSetCliente: (cliente) => dispatch({ type: 'SET_CLIENTE', cliente: cliente }),
    onSetTipoPedido: (tipoPedido, acuerdoVenta) => dispatch({ type: 'SET_PEDIDO', TipoPedido: tipoPedido, AcuerdoVenta: acuerdoVenta }),
    onCancelarPedido: () => dispatch({ type: 'CANCELAR_PEDIDO' }),
    onReinicarPedido: () => dispatch({ type: 'REINICIAR_PEDIDO' }),
    onToggleSelectProducto: (producto) => dispatch({ type: 'TOGGLE_SELECT_PRODUCTO', producto: producto }),
    onResetProductosAgreagados: () => dispatch({ type: 'RESET_PRODUCTOS_AGREGADOS' }),
    onStoreMaestroLinea: (maestroLineas) => dispatch({ type: 'STORE_MAESTROLINEA', maestroLineas: maestroLineas }),
    onSetLineaSeleccionada: (lineaSeleccionada) => dispatch({ type: 'SET_LINEA', LineaSeleccionada: lineaSeleccionada }),
    onSetTableValue: (tableValue) => dispatch({ type: 'SET_TABLEVALUE', TableValue: tableValue }),
    onSetPedidoEnCurso: (pedidoEnCurso) => dispatch({ type: 'SET_PEDIDOENCURSO', pedidoEnCurso: pedidoEnCurso }),
    onSetTotalPedido: (TotalPedido) => dispatch({ type: 'SET_TOTALPEDIDO', TotalPedido: TotalPedido }),
    onSetNumeroOrden: (NumeroOrden) => dispatch({ type: 'SET_NUMEROORDEN', NumeroOrden: NumeroOrden }),
    onStoreTiposColeccion: (TiposColeccion) => dispatch({ type: 'STORE_TIPOS_COLECCION', TiposColeccion: TiposColeccion }),
    onStoreDatosParaPedido: (colecciones, clientes, TiposPedido, maestroLineas) => dispatch(
      { type: 'STORE_DATOSPARAPEDIDO', colecciones: colecciones, clientes: clientes, TiposPedido: TiposPedido, maestroLineas: maestroLineas }),
    onDeleteCuentaCorriente: ()=> dispatch({type:'DELETE_RECIBO_CUOTASCUENTACORRIENTE'})
      

  };
  
};


export default connect(mapStateToProps, mapDispatchToProps)(Recibos);
