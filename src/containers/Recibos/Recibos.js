import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import SelectCliente from 'components/Recibos/SelectCliente/SelectCliente'
import FacturaTable from 'components/Recibos/Facturas/FacturaTable'
// import SubFacturaTable from 'components/Recibos/Facturas/SubFacturaTable'
import CuotasTable from 'components/Recibos/Facturas/CuotasTable'
import CuotasAgrupadasTable from 'components/Recibos/Facturas/CuotasAgrupadasTable'
import DetalleRecibo from 'components/Recibos/Recibo/DetalleRecibo'
import Recibo from 'components/Recibos/Recibo/Recibo'
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
import styles from "components/Recibos/Facturas/CuotasTable.module.css";
import {useDispatch} from 'react-redux';
import {IsAllow} from 'components/Seguridad/Permisos';
import honduras from 'utils/img/honduras.png';
import costarica from 'utils/img/costarica.png';
import guatemala from 'utils/img/guatemala.png';
import salvador from 'utils/img/salvador.jpg';
import { get } from 'utils/http';
import axios from 'axios';
import { verificarConexion } from 'utils/http';
import Swal from 'sweetalert2/dist/sweetalert2.js';

moment.locale('es');
const Recibos = (props) => {
  const [loading, setLoading] = useState(true);
  const [isCreditoVencido,setCreditoVencido] = useState(false);
  const [DataModal, setDataModal] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [clientes,setClientes] = useState([]);
  const [clientesFiltrados,setClientesFiltrados] = useState([]);
  const [paisSeleccionado,setPaisSeleccionado] = useState(null);
  const dispatch = useDispatch();
  const creditoVencido = (vencido)=>{
    setCreditoVencido(vencido);
    localStorage.setItem('isVencido',vencido);
  }
  const urlApi = APIURL;
  // const [tipoPedido, setTipoPedido] = useState(null);
  // const [clientePreSelected, setClientePreSelected] = useState(null);

  useEffect(() => {
      if(!IsAllow(props.match.url))
        {
          props.history.push('/home');
        }
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
    setClientes(props.clientes);
    setClientesFiltrados(props.clientes);
    // eslint-disable-next-line
  }, [props.clientes]);
  useEffect(() => {
    if (props.clienteSelected) {
      calcularCuotasCuentaCorriente();
    }
    // eslint-disable-next-line
  }, [props.clienteSelected])

  const ModuloConfiguraciones = () => {
    cargarBancos();
    cargarTipoPago();
    cargarMonedasGlobal();
    cargarAbreviacionMonedas();
  }

  const cargarAbreviacionMonedas =  () => {
    fetch(`${urlApi}/api/moneda`)
    .then(res=>res.json())
    .then(data=>{props.onStoreAbreviacionMonedas(data);})
    .catch(error=>console.log(error))
}
  
  const cargarBancos = () => {
    fetch(`${urlApi}/api/banco`)
    .then(res=>res.json())
    .then(data=>{props.onSetStoreBancos(data);})
    .catch(error=>console.log(error))
  }

  const cargarTipoPago = async () => {
    fetch(`${urlApi}/api/tipopago`)
    .then(res=>res.json())
    .then(data=>{props.onSetStoreTipoPago(data);})
    .catch(error=>console.log(error))
  }

  const cargarMonedasGlobal = async () => {
    fetch(`${urlApi}/api/moneda/monedas`)
        .then(res => res.json())
        .then(data => { props.onStoreMonedas(data); })
        .catch(error => console.log(error))
}
  const calcularCuotasCuentaCorriente = () => {
    let agrupacionCuentCorriente = [];
    let agrupacionCuentaCorriente = [];
    let totalSaldo = 0;
    let totalAPagar = 0;
    props.clienteSelected.AcuerdosXTipoPedido.forEach(acuXTip => {
      acuXTip.Acuerdos.forEach(acu => {
        acu.Facturas.forEach(fact => {
          fact.Cuotas.filter(c=> c.Saldo > 0).forEach(cuot => {
            let diasVencimiento = (moment().diff(cuot.FechaVencimiento, 'days') * -1) + 1;
            let diasDescuento = (moment().diff(cuot.FechaMaxDescuento, 'days') * -1) + 1;
            let aPagar = cuot.Saldo;
            if (diasDescuento >= 0 && cuot.Descuento && cuot.IdAcuerdoxCliente === null) {
              aPagar -= cuot.Descuento;
            }
            totalSaldo += cuot.Saldo;
            totalAPagar += aPagar;
            let colorFuente = fact.facturaEnTransito ? "font-weight-bold " + styles.InfoText : diasVencimiento < 0 ? "text-danger font-weight-bold" : diasVencimiento < 15 ? "font-weight-bold " + styles.WarnRecibo : "";
            if(localStorage.getItem('empresa')==='IMGT')
            {
                agrupacionCuentCorriente.push({
                Tipo: <span className={colorFuente}>{cuot.TipoDocumento}</span>, // Tipo
                TipoPedido: <span className={colorFuente}>{acuXTip.TipoPedido}</span>,// TipoPedido
                Factura: <span className={colorFuente}>{fact.Factura}</span>,// Factura
                NumeroFEL: <span className={colorFuente}>{fact.NumeroFEL}</span>,
                IdAcuerdoxCliente: <span className={colorFuente}>{cuot.IdAcuerdoxCliente}</span>,// IdAcuerdoxCliente
                NumeroCuota: <span className={colorFuente}>{cuot.NumeroCuota}</span>,// NumeroCuota
                FechaFactura: <span className={colorFuente}>{moment(cuot.FechaFactura).format("DD/MM/YYYY")}</span>,// FechaFactura
                FechaVencimiento: <span className={colorFuente}>{moment(cuot.FechaVencimiento).format("DD/MM/YYYY") === '01/01/1900' ? '' : moment(cuot.FechaVencimiento).format("DD/MM/YYYY")}</span>,// FechaVencimiento
                Dias: <span className={colorFuente}>{isNaN(diasVencimiento) ? "":diasVencimiento}</span>,// Dias
                Valor: <span className={colorFuente}>{cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Valor
                Saldo: <span className={colorFuente}>{cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Saldo
                FechaMaxDescuento: <span className={colorFuente}>{moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== "Invalid date" && moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== '01/01/1900'? moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") : ""}</span>,// FechaMaxDescuento
                DiasV: <span className={colorFuente}>{isNaN(diasDescuento) ? "":diasDescuento}</span>, // DiasV
                Descuento: <span className={colorFuente}>{cuot.Descuento.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Descuento
                APagar: <span className={colorFuente}>{aPagar.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// APagar
                idmoneda: <span className={colorFuente}>{cuot.IdMoneda}</span>,// idmoneda
                excepcionDescuento: <span style={{color:fact.ExcepcionDescuento?"green":"red"}}>{fact.ExcepcionDescuento ? "Si":"No"}</span>
              });

              agrupacionCuentaCorriente.push({
                Tipo: cuot.TipoDocumento, // Tipo
                TipoPedido: acuXTip.TipoPedido,// TipoPedido
                Factura: fact.Factura,// Factura
                NumeroFEL: fact.NumeroFEL,
                IdAcuerdoxCliente: cuot.IdAcuerdoxCliente,// IdAcuerdoxCliente
                NumeroCuota: cuot.NumeroCuota,// NumeroCuota
                FechaFactura: moment(cuot.FechaFactura).format("DD/MM/YYYY"),// FechaFactura
                FechaVencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),// FechaVencimiento
                Dias: isNaN(diasVencimiento) ? "":diasVencimiento,// Dias
                Valor: cuot.ValorCuota,// Valor
                TotalFactura: fact.TotalFactura,// TotalFactura
                Saldo:cuot.Saldo,// Saldo
                FechaMaxDescuento: moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== "Invalid date" && moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== '01/01/1900' ? moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") : "",// FechaMaxDescuento
                DiasV: isNaN(diasDescuento) ? "":diasDescuento, // DiasV
                Descuento: cuot.Descuento,// Descuento
                APagar: aPagar,// APagar
                idmoneda: cuot.IdMoneda,// idmoneda
              });
            }
            else
            { 
              agrupacionCuentCorriente.push({
                Tipo: <span className={colorFuente}>{cuot.TipoDocumento}</span>, // Tipo
                TipoPedido: <span className={colorFuente}>{acuXTip.TipoPedido}</span>,// TipoPedido
                Factura: <span className={colorFuente}>{fact.Factura}</span>,// Factura
                IdAcuerdoxCliente: <span className={colorFuente}>{cuot.IdAcuerdoxCliente}</span>,// IdAcuerdoxCliente
                NumeroCuota: <span className={colorFuente}>{cuot.NumeroCuota}</span>,// NumeroCuota
                FechaFactura: <span className={colorFuente}>{moment(cuot.FechaFactura).format("DD/MM/YYYY")}</span>,// FechaFactura
                FechaVencimiento: <span className={colorFuente}>{moment(cuot.FechaVencimiento).format("DD/MM/YYYY")}</span>,// FechaVencimiento
                Dias: <span className={colorFuente}>{isNaN(diasVencimiento) ? "":diasVencimiento}</span>,// Dias
                Valor: <span className={colorFuente}>{cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Valor
                Saldo: <span className={colorFuente}>{cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Saldo
                FechaMaxDescuento: <span className={colorFuente}>{moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== "Invalid date" && moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== '01/01/1900'? moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") : ""}</span>,// FechaMaxDescuento
                DiasV: <span className={colorFuente}>{isNaN(diasDescuento) || moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") === '01/01/1900'? "":diasDescuento}</span>, // DiasV
                Descuento: <span className={colorFuente}>{cuot.Descuento.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Descuento
                APagar: <span className={colorFuente}>{aPagar.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// APagar
                idmoneda: <span className={colorFuente}>{cuot.IdMoneda}</span>,// idmoneda
                excepcionDescuento: <span style={{color:fact.ExcepcionDescuento?"green":"red"}}>{fact.ExcepcionDescuento ? "Si":"No"}</span>
              });

              agrupacionCuentaCorriente.push({
                Tipo: cuot.TipoDocumento, // Tipo
                TipoPedido: acuXTip.TipoPedido,// TipoPedido
                Factura: fact.Factura,// Factura
                IdAcuerdoxCliente: cuot.IdAcuerdoxCliente,// IdAcuerdoxCliente
                NumeroCuota: cuot.NumeroCuota,// NumeroCuota
                FechaFactura: moment(cuot.FechaFactura).format("DD/MM/YYYY"),// FechaFactura
                FechaVencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),// FechaVencimiento
                Dias: isNaN(diasVencimiento) ? "":diasVencimiento,// Dias
                Valor: cuot.ValorCuota,// Valor
                TotalFactura: fact.TotalFactura,// TotalFactura
                Saldo:cuot.Saldo,// Saldo
                FechaMaxDescuento: moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== "Invalid date" ? moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") : "",// FechaMaxDescuento
                DiasV: isNaN(diasDescuento) ? "":diasDescuento, // DiasV
                Descuento: cuot.Descuento,// Descuento
                APagar: aPagar,// APagar
                idmoneda: cuot.IdMoneda,// idmoneda
              });
            }
          });
        });
      });
    });
    agrupacionCuentCorriente.sort((a, b) => {
      if (moment(a.FechaVencimiento.props.children, "DD/MM/YYYY").isAfter(moment(b.FechaVencimiento.props.children, "DD/MM/YYYY"), 'day')) {
          return 1;
      }
      if (moment(a.FechaVencimiento.props.children, "DD/MM/YYYY").isBefore(moment(b.FechaVencimiento.props.children, "DD/MM/YYYY"), 'day')) {
          return -1;
      }
      if (moment(a.FechaVencimiento.props.children, "DD/MM/YYYY").isSame(moment(b.FechaVencimiento.props.children, "DD/MM/YYYY"), 'day')) {
          return 0;
      }

      return 0;
  });

  agrupacionCuentCorriente.sort((a, b) => {
      if (a.Factura.props.children < b.Factura.props.children) {

          return -1;
      }
      if (a.Factura.props.children > b.Factura.props.children) {

          return 1;
      }

      return 0;
  });

  agrupacionCuentCorriente.sort((a, b) => {
      if (a.NumeroCuota.props.children < b.NumeroCuota.props.children) {

          return -1;
      }
      if (a.NumeroCuota.props.children > b.NumeroCuota.props.children) {

          return 1;
      }

      return 0;
  });

    agrupacionCuentaCorriente.sort((a, b) => {
      return moment(a.FechaVencimiento).diff(b.FechaVencimiento);
    });

    agrupacionCuentaCorriente.sort((a, b) => {
      return a.Factura<b.Factura?-1:1;
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
    props.onStoreCuotasImprimir(agrupacionCuentaCorriente);
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
    let dias = moment(factura.FechaVencimiento).diff(moment(new Date()), 'days')
    let diasDescuento = 0;
    let fechaDescuento = moment(factura.FechaMaxDescuento);
    if (fechaDescuento.isValid()) {
      diasDescuento = moment(factura.FechaMaxDescuento).diff(moment(new Date()), 'days') + 1;
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

  const cargarClientes = async () => {
    if (props.UsuarioOficina) {
      fetch(urlApi + '/api/cliente/cuenta', {
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
              props.onStoreReciboClientes(result);
              setClientes(result);
              setClientesFiltrados(result);
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            error => {

            }
          )
        }
      })

      setClientes(props.clientes);
      setClientesFiltrados(props.clientes);
    } else {
      const { data, error } = await get(`${urlApi}/api/cliente/cuenta`, "Recibo", "clientes");
      if (error) {
        console.log(error);
      } else {
        setLoading(false);
        props.onStoreReciboClientes(data);
        setClientes(data);
        setClientesFiltrados(data);
      }
    }
  }

  const cargarCliente = async () => {
    if (localStorage.getItem("Conexion") === "Online") {
      let isOnline = await verificarConexion();
      if (isOnline) {
        try {
          let request = await axios.get(`${urlApi}/api/cliente/cuenta/${props.clienteSelected.Codigo}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
          let clientesStorage = props.clientes;
          let clientesStorageCartera = props.cartera;
          let indexCartera = clientesStorageCartera.map(e => e.Codigo).indexOf(props.clienteSelected.Codigo);
          let index = clientesStorage.map(e => e.Codigo).indexOf(props.clienteSelected.Codigo);
          clientesStorage[index] = request.data;
          clientesStorageCartera[indexCartera].AcuerdosXTipoPedido = request.data.AcuerdosXTipoPedido;
          props.onStoreClientesCartera(clientesStorageCartera);
          props.onStoreReciboClientes(clientesStorage);
        } catch (err) {
          console.log(err);
        }
      }
    }
  }

  const cargarMonedas = () =>{
    let empresa = localStorage.getItem('EmpresaCliente');
    const monedas = props.monedasGlobal.filter(x=>x.Empresa===empresa);
    props.onSaveMonedas(monedas);
    /*fetch(`${urlApi}/api/moneda/${empresa}`)
    .then(res=>res.json())
    .then(data=>{props.onSaveMonedas(data)})
    .catch(error=>console.log(error))*/
  }
  const cargarFacturasXCliente = () => {
    if (props.clienteSelected.FacturacionEntrega === "Todo") {
      Swal.fire({
        title: 'Bloqueado',
        text: 'Actualmente no se tiene relación comercial con el cliente. Su cuenta ha sido bloqueada para todo tipo de transacción.',
        type: 'error',
        confirmButtonText: 'OK',
    });
    } else {
      props.onStoreReciboFacturasXCliente(props.clienteSelected.Facturas);
      cargarMonedas();
      props.history.push(`/Recibos/TipoCredito`);
    }
  }

  const cargarCuotasXCliente = (cuotas) => {
    props.onStoreReciboCuotasXCliente(cuotas);

    props.history.push(`/Recibos/${cuotas[0].TipoPedido}/Facturas`);
  }

  const CargarCuotasAPagar = (cuotas) => {
    props.onStoreReciboCuotasAPagar(cuotas);
    props.history.push(`/Recibos/Detalle`);
  }
  const CargarImpresion = (recibosAplicados) => {
    props.history.push({pathname:`/Recibos/ImprimirRecibo`,state:recibosAplicados});
  }

  const Finalizar = () => {
    //setModalRecibo(false);
    cargarCliente();
    dispatch({type:'delete_pedidoselected'})
    props.history.push(`/recibos`);
}
  const NavHome = () => {
    props.history.push(`/Recibos`);
  }

  const seleccionarPais = (pais)=>{
    if(paisSeleccionado===pais){
      setPaisSeleccionado(null);
      setClientesFiltrados(clientes);
    }else{
      const filtrados = clientes.filter(x=>x.EmpresaId===pais);
      setPaisSeleccionado(pais);
      setClientesFiltrados(filtrados);
    }
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

  const obtenerCorrelativo = async () => {
    var correlativo = "";
    if (localStorage.getItem("Conexion") === "Online") {
      let isOnline = await verificarConexion();
      if (isOnline) {
        try {
          const request = await axios.get(`${urlApi}/api/recibos/correlativo/${localStorage.getItem('empresa')}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
          });
          return { correlativo: request.data };
        }
        catch (err) {
          return { correlativo };
        }
      }
    }
    return { correlativo }
  }

  let Cliente = (
    <div className="text-center">
      <h4>{props.clienteSelected ? props.clienteSelected.Codigo + ' ' + props.clienteSelected.Nombre : ''}</h4>
      <hr />
    </div>
  );
  const SelectedCliente = cliente => {

    for (let AcuerdosXTipoPedido of cliente.AcuerdosXTipoPedido) {

      for (let Acuerdos of AcuerdosXTipoPedido.Acuerdos) {
        let acuerdosFacturas = Acuerdos.Facturas.filter(f => f.Descuento === 0);

        for (let Facturas of Acuerdos.Facturas) {
          Facturas.FechaVencimiento = moment(Facturas.FechaVencimiento).add(Facturas.DiasGracia, 'days');

          if (Facturas.SinDescuento) {
            Facturas.Descuento = 0;
          }

          for (let Cuotas of Facturas.Cuotas) {
            Cuotas.FechaVencimiento = moment(Cuotas.FechaVencimiento).add(Cuotas.DiasGracia, 'days');

            if (Cuotas.SinDescuento) {
              Cuotas.Descuento = "0.00";
            }
          }
        }

        let descuentoAplicadoCuotaAcuerdo = {};
        for (let Facturas of acuerdosFacturas) {
          let Descuento = cliente.MaestroDescuento.length > 0 ? cliente.MaestroDescuento[0].DescuentoDetalle.filter(d => d.Linea === Facturas.IdLinea) : [];
          let noAplicaDescuento = Descuento.length === 0;
          let porcentajeDescuento = 0;
          let diasDescuento = 0;

          if (Descuento.length !== 0) {
            const descuentoArreglo = Descuento.find(x => x.CodigoDescuento === Facturas.CodigoDescuento);
            if (descuentoArreglo !== undefined) {
              porcentajeDescuento = descuentoArreglo.Porcentaje;
              diasDescuento = descuentoArreglo.DiasDescuento;
            }
          }

          let totalDocumentosAplicados = 0;

          if (Facturas.DocumentosAplicadosAFacturas.length > 0) {
            totalDocumentosAplicados = Facturas.DocumentosAplicadosAFacturas.reduce((prev, curr) => prev + curr.Valor, 0);
          };

          Facturas.Descuento = noAplicaDescuento ? 0 : Facturas.TotalFactura * (porcentajeDescuento / 100);

          if (Facturas.SinDescuento) {
            Facturas.Descuento = 0;
          }

          for (let Cuotas of Facturas.Cuotas) {

            let valordescuento = 0;
            if (AcuerdosXTipoPedido.AgrupaPorCuota === true) {        
              if (Acuerdos.DescuentoEnAcuerdos !== null) {
                let Flete = 0;

                let DocumentoCuota = cliente.DocumentosAplicadosxCuotas.find(x => x.IdAcuerdoxCliente === Acuerdos.Acuerdo && x.NumeroCuota === Cuotas.NumeroCuota);
                if (DocumentoCuota !== undefined) {
                  totalDocumentosAplicados = DocumentoCuota.Valor;
                  Flete = DocumentoCuota.Flete;
                }

                if (Acuerdos.DescuentoEnAcuerdos != null) {
                  let consumidoCuota = Cuotas.SaldoCuota - Cuotas.DisponibleCuota;
                  let totalfactura = consumidoCuota - totalDocumentosAplicados - Flete;
                  valordescuento = totalfactura * (Acuerdos.DescuentoEnAcuerdos.Porcentaje / 100);
                }

                if (descuentoAplicadoCuotaAcuerdo[`${Cuotas.IdAcuerdoxCliente}-${Cuotas.NumeroCuota}`] === undefined) {
                  Cuotas.Descuento = valordescuento.toFixed(2);
                  descuentoAplicadoCuotaAcuerdo[`${Cuotas.IdAcuerdoxCliente}-${Cuotas.NumeroCuota}`] = true;
                } else {
                  Cuotas.Descuento = "0.00";
                }

                Cuotas.DescuentoBack = valordescuento.toFixed(2);
              }
            }
            else {
              let fechaMaxDescuent = noAplicaDescuento ? moment(Facturas.FechaFactura).format() : moment(Facturas.FechaFactura).add((diasDescuento + cliente.DiasTransporte), 'days').format();

              Facturas.FechaMaxDescuento = fechaMaxDescuent;
              Cuotas.FechaMaxDescuento = fechaMaxDescuent;

              let totalfactura = Cuotas.ValorCuota - totalDocumentosAplicados - Cuotas.Flete;
              let fechaActual = new Date().setHours(0, 0, 0, 0);;
              let diasTranscurridos = Math.abs(moment(Facturas.FechaFactura).diff(moment(fechaActual), 'days'));

              if (diasTranscurridos > 60 && cliente.EmpresaId === "IMGT") {
                const porcentajeDeduccion = 1.12;
                totalfactura = totalfactura / porcentajeDeduccion;
              }

              valordescuento = noAplicaDescuento ? 0 : totalfactura * (porcentajeDescuento / 100);
              Cuotas.Descuento = valordescuento.toFixed(2);
              Facturas.Descuento = valordescuento;

              if (Cuotas.SinDescuento) {
                Cuotas.Descuento = "0.00";
                Facturas.Descuento = 0;
              }
            }
          };

        };
      };
    };

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
          {props.Paises.length>1 &&
                <div className="container-fluid" style={{display:'flex',marginBottom:'10px'}}>
                    <h4>Seleccione un pais</h4>
                    <div>
                        {
                        // eslint-disable-next-line
                        props.Paises.map(pais=>{
                            if(pais.EmpresaId==="IMHN"){
                                let stylePaises={width:'30px',height:'30px',marginLeft:'25px'};
                                if(paisSeleccionado==="IMHN"){
                                    stylePaises = {width:'30px',height:'30px',marginLeft:'25px',outline:'5px solid green'}
                                }

                                return <img alt="honduras" src={honduras} style={stylePaises} onClick={()=>{seleccionarPais(pais.EmpresaId)}}/>
                            }else if(pais.EmpresaId==="IMCR"){
                                let stylePaises={width:'30px',height:'30px',marginLeft:'25px'};
                                if(paisSeleccionado==="IMCR"){
                                    stylePaises = {width:'30px',height:'30px',marginLeft:'25px',outline:'5px solid green'};
                                }
                                return <img alt="costarica" src={costarica} style={stylePaises} onClick={()=>{seleccionarPais(pais.EmpresaId)}}/>
                            }else if(pais.EmpresaId==="IMGT"){
                                let stylePaises={width:'30px',height:'30px',marginLeft:'25px'}
                                if(paisSeleccionado==="IMGT"){
                                    stylePaises = {width:'30px',height:'30px',marginLeft:'25px',outline:'5px solid green'};
                                }
                                return <img alt="guatemala" src={guatemala} style={stylePaises} onClick={()=>{seleccionarPais(pais.EmpresaId)}}/>
                            }
                            else if(pais.EmpresaId==="IMSL"){
                              let stylePaises={width:'30px',height:'30px',marginLeft:'25px'}
                              if(paisSeleccionado==="IMSL"){
                                  stylePaises = {width:'30px',height:'30px',marginLeft:'25px',outline:'5px solid green'};
                              }
                              return <img alt="salvador" src={salvador} style={stylePaises} onClick={()=>{seleccionarPais(pais.EmpresaId)}}/>
                          }
                        })}
                    </div>
                </div>
            }
            <SelectCliente
              ModuloConfiguraciones = {ModuloConfiguraciones}
              clientes={clientesFiltrados}
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
                visible={false}
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
                obtenerCorrelativo = {obtenerCorrelativo}
                history={props.history}
                Cliente={props.clienteSelected}
                Clientes = {clientes}
                Cuotas={props.cuotasXCliente}
                CuotasAPagar={props.cuotasAPagar}
                CargarImpresion ={CargarImpresion}
                EliminarCuota={() => { }}
              />
            </div>
          </div>
        </>
      )} />

    <Route path={props.match.url + '/ImprimirRecibo'} exact component={(routeProps) => (
        <>
          <div className="row">
            <div className="col-12">
            <Recibo
                    Finalizar = {Finalizar}
                    Cliente={props.clienteSelected}
                    Open={true}
                    RecibosAplicados={routeProps.location.state}/>
            </div>
          </div>
        </>
      )} />
    </Switch>
    </>
  )
}

const mapStateToProps = state => {

  return {
    cartera:state.Cartera,
    clientes: state.Recibo.clientes,
    clienteSelected: state.Recibo.clienteSelected,
    cuotasXCliente: state.Recibo.cuotasXCliente,
    cuotasAPagar: state.Recibo.cuotasAPagar,
    facturasXCliente: state.Recibo.facturasXCliente,
    cuotasCuentaCorriente: state.Recibo.cuotasCuentaCorriente,
    monedasGlobal:state.MonedasGlobal,
    loading: state.Recibo.loading,
    Paises:state.Permisos[0].EmpresasUsuarios,
    UsuarioOficina:state.Permisos[0].UsuarioOficina
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
    onStoreCuotasImprimir: (cuotasCuentaCorriente) => dispatch({ type: 'SET_CUENTAIMPRIMIR', payload: cuotasCuentaCorriente }),
    onSaveMonedas:(monedas)=> dispatch({type:'SET_MONEDAS',payload:monedas}),
    onStoreReciboLoading: (loading) => dispatch({ type: 'STORE_RECIBO_LOADING', loading: loading }),
    onStoreClientesCartera:(clientes)=>dispatch({type:'SET_CARTERA',payload:clientes}),
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
    onSetStoreBancos: (data) => dispatch({ type: "SET_BANCOSGLOBAL", payload: data }),
    onSetStoreTipoPago: (data) => dispatch({ type: "SET_TIPOPAGOGLOBAL", payload: data }),
    onStoreDatosParaPedido: (colecciones, clientes, TiposPedido, maestroLineas) => dispatch(
      { type: 'STORE_DATOSPARAPEDIDO', colecciones: colecciones, clientes: clientes, TiposPedido: TiposPedido, maestroLineas: maestroLineas }),
    onDeleteCuentaCorriente: ()=> dispatch({type:'DELETE_RECIBO_CUOTASCUENTACORRIENTE'}),
    onStoreMonedas:(data)=> dispatch({ type: 'SET_MONEDASGLOBAL', payload: data }),
    onStoreAbreviacionMonedas:(data)=> dispatch({ type: 'SET_ABREVACIONMONEDAS', payload: data })
  };
  
};


export default connect(mapStateToProps, mapDispatchToProps)(Recibos);
