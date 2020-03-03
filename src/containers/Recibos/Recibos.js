import React, { useEffect, useState } from 'react'
import SelectCliente from 'components/Recibos/SelectCliente/SelectCliente'
import FacturaTable from 'components/Recibos/Facturas/FacturaTable'
// import SubFacturaTable from 'components/Recibos/Facturas/SubFacturaTable'
import CuotasTable from 'components/Recibos/Facturas/CuotasTable'
import CuotasAgrupadasTable from 'components/Recibos/Facturas/CuotasAgrupadasTable'
import DetalleRecibo from 'components/Recibos/Recibo/DetalleRecibo'
import { ClipLoader } from 'react-spinners';
import RecibosBreadCrumb from 'components/Recibos/RecibosBreadCrumb/RecibosBreadCrumb';
// import TableCliente from 'components/Recibos/SelectCliente/TableClienteSelected'
import { APIURL } from 'utils/Enviroment';
import { Route, Switch } from 'react-router-dom';
import CuentaCorrienteTable from '../CuentaCorriente/CuentaCorienteTable'
import moment from 'moment';
import 'moment/locale/es';
moment.locale('es');
// import styles from 'containers/Recibos/Recibos.module.css';
const Recibos = (props) => {
  const [clientes, setClientes] = useState([]);
  const [clienteSelected, setClienteSelected] = useState(null);
  const [cuotasXCliente, setCuotasXCliente] = useState(null);
  const [cuotasAPagar, setCuotasAPagar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [facturasXCliente, setFacturasXCliente] = useState(null);
  const [cuotasCuentaCorriente, setCuotasCuentaCorriente] = useState([]);
  const urlApi = APIURL;
  // const [tipoPedido, setTipoPedido] = useState(null);
  // const [clientePreSelected, setClientePreSelected] = useState(null);

  useEffect(() => {
    // if(props.location.state&&props.location.state.Cliente) {
    //   ? props.location.state.CodigoCliente : null
    // }
    CargarDatos()
    // eslint-disable-next-line
  }, [])
  useEffect(() => {
    if (props.location.state && props.location.state.CodigoCliente && clientes && clientes.length > 0) {
      let cliente = clientes.find(cl => {
        return cl.Codigo === props.location.state.CodigoCliente;
      });
      setClienteSelected(cliente);
      setFacturasXCliente(cliente.Facturas);
    }
    // eslint-disable-next-line
  }, [clientes]);
  useEffect(() => {
    if (clienteSelected) {
      calcularCuotasCuentaCorriente();
    }
    // eslint-disable-next-line
  }, [clienteSelected])

  const calcularCuotasCuentaCorriente = () => {
    let agrupacionCuentCorriente = [];
    let totalSaldo = 0;
    let totalAPagar = 0;
    clienteSelected.AcuerdosXTipoPedido.forEach(acuXTip => {
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
              IdAcuerdoxCliente: acu.Acuerdo,// IdAcuerdoxCliente
              NumeroCuota: cuot.NumeroCuota,// NumeroCuota
              FechaFactura: moment(cuot.FechaFactura).format("DD/MM/YYYY"),// FechaFactura
              FechaVencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),// FechaVencimiento
              Dias: diasVencimiento,// Dias
              Valor: cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),// Valor
              Saldo: cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),// Saldo
              FechaMaxDescuento: moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY"),// FechaMaxDescuento
              DiasV: diasDescuento,// DiasV
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

    setCuotasCuentaCorriente(agrupacionCuentCorriente);
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
            setClientes(result)
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          error => {
            this.setState({
              error
            })
          }
        )
      }
    })
  }
  const cargarFacturasXCliente = () => {
    setFacturasXCliente(clienteSelected.Facturas)
    props.history.push(`/Recibos/TipoCredito`);
  }

  const cargarCuotasXCliente = (cuotas) => {
    setCuotasXCliente(cuotas);
    props.history.push(`/Recibos/${cuotas[0].TipoPedido}/Facturas`);
  }

  const CargarCuotasAPagar = (cuotas) => {
    setCuotasAPagar(cuotas);
    props.history.push(`/Recibos/Detalle`);
  }

  const NavHome = () => {
    props.history.push(`/Recibos`);
  }

  if (facturasXCliente) {
    console.log('CM');
  }

  const BreadCrumb = () => {
    return (
      <RecibosBreadCrumb
        match={props.match}
        cliente={clienteSelected}
        cuotas={cuotasXCliente}
        cuotasAPagar={cuotasAPagar}
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
    setClienteSelected(null);

    setCuotasXCliente(null);
    setCuotasAPagar(null);
    setFacturasXCliente(null);

  }

  let Cliente = (
    <div className="text-center">
      <h4>{clienteSelected ? clienteSelected.Codigo + ' ' + clienteSelected.Nombre : ''}</h4>
      <hr />
    </div>
  );
  const SelectedCliente = cliente => {
    //props.history.push('/Recibos/TipoCredito');
    setClienteSelected(cliente);
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
  //             <CuotasAgrupadasTable Cuotas={cuotasXCliente} SetCuotasAPagar={setCuotasAPagar} />
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
  //             <CuotasTable Cuotas={cuotasXCliente} SetCuotasAPagar={setCuotasAPagar} />
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
  //             SetCuotas={setCuotasXCliente}
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
    <Switch>
      <Route path={props.match.url} exact component={(routeProps) => (
        <div className="row">
          <div className="col-12">
            <SelectCliente
              clientes={clientes}
              clienteSelected={clienteSelected}
              onSelect={SelectedCliente}
              setCliente={cargarFacturasXCliente}
              codigoClientePreseleccionado={
                props.location.state ? props.location.state.CodigoCliente : null
              }
            />

            {
              clienteSelected &&
              <CuentaCorrienteTable
              clienteSelected={clienteSelected}
              CuotasCuentaCorriente={cuotasCuentaCorriente}
            >
            </CuentaCorrienteTable>
            }

          </div>
        </div>
      )} />
      <Route path={props.match.url + '/TipoCredito'} exact component={(routeProps) => (
        <>
          {BreadCrumb()}
          {Cliente}
          <div className="row">
            <div className="col-12">
              <FacturaTable
                Cliente={clienteSelected}
                Credito={clienteSelected.Credito}
                AcuerdosXTipoPedido={clienteSelected.AcuerdosXTipoPedido}
                SetCuotas={cargarCuotasXCliente}
              />
            </div>
          </div>
        </>
      )} />
      <Route path={props.match.url + '/:TipoCredito/Facturas'} exact component={(routeProps) => (
        <>
          {
            cuotasXCliente[0].AgrupaPorCuota ?
              (
                <>
                  {BreadCrumb()}
                  {Cliente}
                  <div className="row">
                    <div className="col-12">
                      <CuotasAgrupadasTable Cuotas={cuotasXCliente} SetCuotasAPagar={CargarCuotasAPagar} />
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
                    <CuotasTable Cuotas={cuotasXCliente} SetCuotasAPagar={CargarCuotasAPagar} />
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
                Cliente={clienteSelected}
                Cuotas={cuotasXCliente}
                CuotasAPagar={cuotasAPagar}
                EliminarCuota={() => { }}
              />
            </div>
          </div>
        </>
      )} />
    </Switch>
  )
}


export default Recibos
