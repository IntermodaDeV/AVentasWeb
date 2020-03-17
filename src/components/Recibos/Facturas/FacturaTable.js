import React, {useState
} from 'react'
import MUIDataTable from 'mui-datatables'
import moment from 'moment'
import 'moment/locale/es'
import {
  Button,
  // TablePagination, TableCell
} from '@material-ui/core';
import { FaEye } from "react-icons/fa";
import FacturasModal from "components/Recibos/FacturasModal/FacturasModal";
import FacturasModalPrecompra from "components/Recibos/FacturasModal/FacturasModalPrecompra";
import CuotaModal from "components/Recibos/FacturasModal/CuotaModal";

moment.locale('es')

const columns = [
  {
    name: 'Tipo',
    label: 'Tipo Credito',
    options: {
      filter: true,
      sort: true
    }
  },
  {
    name: 'CantFactVencidas',
    label: 'Facturas Vencidas',
    options: {
      filter: true,
      sort: false
    }
  },
  /*{
    name: 'Disponible',
    label: 'Disponible',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'SaldoTotal',
    label: 'Saldo Total',
    options: {
      filter: true,
      sort: true
    }
  },*/
  {
    name: 'Vencido',
    label: 'Vencido',
    options: {
      filter: true,
      sort: false
    }
  },
 
  {
    name: 'Dias',
    label: 'Días Vencido',
    options: {
      filter: true,
      sort: true
    }
  },
  {
    name: 'C15Dias',
    label: 'Por Vencer(15 Dias)',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'FactXVencer',
    label: 'Facturas A Vencer',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'FechaVencimiento',
    label: 'Fecha Proxima a Vencer',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'Accion',
    label: 'Accion',
  }
]

const getOptions = (props) => {
  const options = {
    selectableRows: 'none',
    print: false,
    download: false,
    filter: false,
    viewColumns: false,
    search: false,
    // customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => CustomFooter(count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels, props),
    customFooter: () => { },
    filterType: 'checkbox',
  }
  return options;
}


/* 
const CustomFooter = (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels, props) => {

  const Totales = {
    Disponible: 0,
    SaldoTotal: 0,
    C15Dias: 0,
  };

  props.Credito.forEach(fact => {
    Totales.Disponible += fact.Disponible;
    Totales.SaldoTotal += fact.SaldoTotal;
    Totales.C15Dias += fact.C15Dias;

  })


  const handleRowChange = event => {
    changeRowsPerPage(event.target.value);
  };

  const handlePageChange = (_, page) => {
    changePage(page);
  };

  return (
    <tfoot>
      <tr>
        <TableCell style={{ width: 'calc((1/5)*100%)' }}>
          <h6 className="font-weight-bolder text-dark">Totales</h6>
        </TableCell>
        <TableCell style={{ width: 'calc((1/5)*100%)', paddingLeft: '0.2%' }} className="font-weight-bolder text-dark">
          {Totales.Disponible.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
        </TableCell>
        <TableCell style={{ width: 'calc((1/5)*100%)', paddingLeft: '0.2%' }} className="font-weight-bolder text-dark">
          {Totales.SaldoTotal.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
        </TableCell>
        <TableCell style={{ width: 'calc((1/5)*100%)', paddingLeft: '0.2%' }} className="font-weight-bolder text-dark">
          {Totales.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
        </TableCell>
        <TableCell style={{ width: 'calc((1/5)*100%)' }}></TableCell>
      </tr>
      {false && <tr>
        <TableCell style={{ justifyContent: 'flex-end', padding: '0px 24px 0px 24px' }} colSpan={1000}>
          <TablePagination
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            labelRowsPerPage={textLabels.rowsPerPage}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${textLabels.displayRows} ${count}`}
            backIconButtonProps={{
              'aria-label': textLabels.previous,
            }}
            nextIconButtonProps={{
              'aria-label': textLabels.next,
            }}
            rowsPerPageOptions={[10, 20, 100]}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowChange}
          />
        </TableCell>
      </tr>}
    </tfoot>
  );
} */

const FacturaTable = props => {
  const [DataModal, setDataModal] = useState([]);
  const [DataModalPrecompra, setDataModalPrecompra] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openModalPrecompra, setOpenModalPrecompra] = useState(false);
  const [cuotasa,setCuotasa] = useState([]);
  const [openModalCuota,setOpenModalCuota] = useState(false);

  const setCuotas = (tipoPedido) => {
    const cuotas = props.AcuerdosXTipoPedido.filter(acu => acu.TipoPedido === tipoPedido);
    props.SetCuotas(cuotas)
  };

  let data = [];
  const Totales = {
    Disponible: 0,
    SaldoTotal: 0,
    C15Dias: 0,
    Vencido: 0
  };

  const handleOpenModalCuota = (cuotas)=>{
    setCuotasa(cuotas);
    setOpenModalCuota(true);
  }

  const ProcesarFactura = (factura,credito,acuerdo)=>{
      let dias = moment(factura.FechaVencimiento).diff(moment(new Date()), 'days')
      let diasDescuento = 0;
      let fechaDescuento = moment(factura.FechaMaxDescuento);
      if (fechaDescuento.isValid()) {
        diasDescuento = moment(factura.FechaMaxDescuento).diff(moment(new Date()), 'days');
      }

      if(credito ==='Precompra'){
         
        let cuotasTmp = [];

        if(factura.Cuotas){
          factura.Cuotas.forEach(cuota=>{
              cuotasTmp.push(ProcesarCuota(cuota,acuerdo));
          });
        }  

        let facturatmp={
          NumeroFactura: factura.Factura,
          Dias: dias,
          DiasDescuento: diasDescuento,
          Tipo: factura.Tipo,
          Fecha: moment(factura.FechaFactura).format("DD/MM/YYYY"),
          Vencimiento: moment(factura.FechaVencimiento).format("DD/MM/YYYY"),
          FechaDescuento: fechaDescuento.isValid() ? fechaDescuento.format("DD/MM/YYYY") : "",
          Valor: factura.TotalFactura.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
          Saldo: factura.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
          Cuotas:(<FaEye size={"20px"} style={{display:"inline-block",marginLeft:'10px'}} onClick={()=>handleOpenModalCuota(cuotasTmp)}/>)
        }
        return facturatmp;
      }

      let facturatmp={
        NumeroFactura: factura.Factura,
        Dias: dias,
        DiasDescuento: diasDescuento,
        Tipo: factura.Tipo,
        Fecha: moment(factura.FechaFactura).format("DD/MM/YYYY"),
        Vencimiento: moment(factura.FechaVencimiento).format("DD/MM/YYYY"),
        FechaDescuento: fechaDescuento.isValid() ? fechaDescuento.format("DD/MM/YYYY") : "",
        Valor: factura.TotalFactura.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
        Saldo: factura.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')     
      }
      return facturatmp;
  }

  const ProcesarCuota = (cuota,acuerdo)=>{
    let dias = moment(cuota.FechaVencimiento).diff(moment(new Date()), 'days')
    let diasDescuento = 0;
    let fechaDescuento = moment(cuota.FechaMaxDescuento);
    if (fechaDescuento.isValid()) {
      diasDescuento = moment(cuota.FechaMaxDescuento).diff(moment(new Date()), 'days');
    }

    let cuotatmp={
      Factura: cuota.Factura,
      Acuerdo: acuerdo,
      Dias: dias,
      DiasDescuento: diasDescuento,
      Cuota: cuota.NumeroCuota,
      Fecha: moment(cuota.FechaFactura).format("DD/MM/YYYY"),
      Vencimiento: moment(cuota.FechaVencimiento).format("DD/MM/YYYY"),
      FechaDescuento: fechaDescuento.isValid() ? fechaDescuento.format("DD/MM/YYYY") : "",
      Valor: cuota.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
      Saldo: cuota.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')     
    }
    return cuotatmp;
}

  const OpenModalVencido = (acuerdo)=>{
    const acuerdoFiltrado = props.AcuerdosXTipoPedido.filter(x=>x.TipoPedido===acuerdo);
    const facturasEnAcuerdo = acuerdoFiltrado[0].Acuerdos;

    let facturas = [];

    if(acuerdo==='Precompra')
    {
        facturasEnAcuerdo.forEach(e=>{          
          e.Facturas.forEach(factura=>{
    
            const fechaVencimiento = new Date(factura.FechaVencimiento);
            const fechaActual      = new Date();
            const isVencida        = fechaActual>fechaVencimiento;
    
            if(isVencida){
              facturas.push(ProcesarFactura(factura,acuerdo,e.Acuerdo));  
            }    
          });
        });

      setDataModalPrecompra(facturas);
      setOpenModalPrecompra(true);
    }else{
      facturasEnAcuerdo.forEach(e=>{
        e.Facturas.forEach(factura=>{
  
          const fechaVencimiento = new Date(factura.FechaVencimiento);
          const fechaActual      = new Date();
          const isVencida        = fechaActual>fechaVencimiento;
  
          if(isVencida){
            facturas.push(ProcesarFactura(factura,acuerdo,e.Acuerdo));
        }
  
        });
      });
  
      setDataModal(facturas);
      setOpenModal(true);
    }
  }

  const OpenModalAVencer = (acuerdo)=>{

    const acuerdoFiltrado   = props.AcuerdosXTipoPedido.filter(x=>x.TipoPedido===acuerdo);
    const facturasEnAcuerdo = acuerdoFiltrado[0].Acuerdos;

    let facturas = [];

    if(acuerdo==='Precompra'){
      facturasEnAcuerdo.forEach(e=>{
        e.Facturas.forEach(factura=>{

          let diasParaVencer   = moment(factura.FechaVencimiento).diff(moment(new Date()), 'days');
          let isFacturaAVencer = diasParaVencer >=0 && diasParaVencer <=15;

          if(isFacturaAVencer){
            facturas.push(ProcesarFactura(factura,acuerdo,e.Acuerdo));
          } 
        });
      });

      setDataModalPrecompra(facturas);
      setOpenModalPrecompra(true);
    }else{
        facturasEnAcuerdo.forEach(e=>{
          e.Facturas.forEach(factura=>{

            let diasParaVencer   = moment(factura.FechaVencimiento).diff(moment(new Date()), 'days');
            let isFacturaAVencer = diasParaVencer >=0 && diasParaVencer <=15;

            if(isFacturaAVencer){
              facturas.push(ProcesarFactura(factura,acuerdo,e.Acuerdo));
            } 
          });
        });

        setDataModal(facturas);
        setOpenModal(true);
    }
  }

  const FechaVencido = (credito,isFecha)=>{
    const creditoFiltrado = props.AcuerdosXTipoPedido.filter(x=>x.TipoPedido===credito);
    const facturasEnAcuerdo = creditoFiltrado[0].Acuerdos;

    let facturasVencidas = [];

    if(isFecha){
      facturasEnAcuerdo.forEach(e=>{          
        e.Facturas.forEach(factura=>{
            let Fecha = factura.FechaVencimiento
            facturasVencidas.push(Fecha);  
        });
      });
      return facturasVencidas[0];
    }

    facturasEnAcuerdo.forEach(e=>{          
      e.Facturas.forEach(factura=>{

        const fechaVencimiento = new Date(factura.FechaVencimiento);
        const fechaActual      = new Date();
        const isVencida        = fechaActual>fechaVencimiento;

        if(isVencida){
          let dias = moment(factura.FechaVencimiento).diff(moment(new Date()), 'days')
          facturasVencidas.push(dias);  
        }    
      });
    });
    return (facturasVencidas.length===0)? 0: facturasVencidas[0];
  }

  const FactVencidas = (credito,vencidas)=>{
    const creditoFiltrado = props.AcuerdosXTipoPedido.filter(x=>x.TipoPedido===credito);
    const facturasEnAcuerdo = creditoFiltrado[0].Acuerdos;

    let facturasVencidas = [];

    if(vencidas){
      facturasEnAcuerdo.forEach(e=>{          
        e.Facturas.forEach(factura=>{
          const fechaVencimiento = new Date(factura.FechaVencimiento);
          const fechaActual      = new Date();
          const isVencida        = fechaActual > fechaVencimiento;
          if(isVencida){
            
            facturasVencidas.push(factura);  
          }    
        });
      });
      return facturasVencidas.length;
    }
    facturasEnAcuerdo.forEach(e=>{
      e.Facturas.forEach(factura=>{

        let diasParaVencer   = moment(factura.FechaVencimiento).diff(moment(new Date()), 'days');
        let isFacturaAVencer = diasParaVencer >=0 && diasParaVencer <=15;

        if(isFacturaAVencer){
          facturasVencidas.push(factura);
        } 
      });
    });
    return facturasVencidas.length;
  }

  const RestriccionPago = (dataTmp)=>{
    dataTmp.sort((a,b)=>(new Date(a.FechaV)-new Date(b.FechaV)));
    
    const creditosVencidos = dataTmp.filter(e=>Math.abs(e.DiasVencidos)>0);
    const creditosActivos  = dataTmp.filter(e=>Math.abs(e.DiasVencidos)===0);

    let tempData = [];

    if(creditosVencidos.length>0){
      creditosVencidos.forEach((e,i)=>{
           
            const newAction = React.cloneElement(e.Accion,{disabled:false});
            e.Accion = newAction;
          
      });
      props.CreditoVencido(true);

      if(creditosVencidos.length===1 || creditosVencidos.length===0){
        props.CreditoVencido(false);
      }

      tempData = [...creditosVencidos,...creditosActivos];
      return [...new Set(tempData)];
    }

    if(creditosActivos.length===data.length){
      creditosActivos.forEach(e=>{
        const newAction = React.cloneElement(e.Accion,{disabled:false});
        e.Accion = newAction;
      });

      tempData = creditosActivos;
      return [...new Set(tempData)];
    }

    return tempData;
  }

  props.AcuerdosXTipoPedido.forEach(acuXTipPed => {
    let saldo = 0;
    let saldoVencido = 0;
    let saldo15DiasAvencer = 0;
    let disponible = 0;
    acuXTipPed.Acuerdos.forEach(acu => {
      if(acuXTipPed.AgrupaPorCuota){
        disponible += Number(acu.Disponible); 
      }else{
        disponible = (props.Cliente.CreditoDisponible?props.Cliente.CreditoDisponible:0);
      }
      acu.Facturas.forEach(fact => {
        fact.Cuotas.forEach(cuot => {
          if (cuot.Saldo > 0) {
            saldo += cuot.Saldo;
            if (moment(cuot.FechaVencimiento).isSameOrBefore(moment(new Date()), 'days')) {
              saldoVencido += cuot.Saldo;
            }
            if (moment(cuot.FechaVencimiento).isAfter(moment(new Date()), 'days') && moment(cuot.FechaVencimiento).isSameOrBefore(moment().add(15, 'day'), 'days')) {
              saldo15DiasAvencer += cuot.Saldo;
            }
          }
        });
      });
    });
    
    Totales.Disponible += Number(disponible);
    Totales.SaldoTotal += saldo;
    Totales.Vencido += saldoVencido;
    Totales.C15Dias += saldo15DiasAvencer;
    const dias = saldoVencido>0? "text-danger font-weight-bold":"inline-block"

   
      data.push({
        FechaV:FechaVencido(acuXTipPed.TipoPedido,true),
        DiasVencidos:FechaVencido(acuXTipPed.TipoPedido,false),
        Tipo: acuXTipPed.TipoPedido,
        CantFactVencidas:(<div>{FactVencidas(acuXTipPed.TipoPedido,true)}{(saldoVencido>0)?<FaEye onClick={()=>{OpenModalVencido(acuXTipPed.TipoPedido)}} size={"20px"} style={{display:"inline-block",marginLeft:'10px'}}/>:<span style={{display:"inline-block"}}></span>}</div>),
        Vencido: (<div><p style={{display:"inline-block"}}>{saldoVencido.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</p></div>),
        Dias: <span className={dias}>{FechaVencido(acuXTipPed.TipoPedido,false)}</span>, 
        C15Dias: (<div><p style={{display:"inline-block"}}>{saldo15DiasAvencer.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</p></div>),
        FactXVencer :(<div>{FactVencidas(acuXTipPed.TipoPedido,false)}{(saldo15DiasAvencer>0)?<FaEye onClick={()=>{OpenModalAVencer(acuXTipPed.TipoPedido)}} size={"20px"} style={{display:"inline-block",marginLeft:'10px'}}/>:<span style={{display:"inline-block"}}></span>}</div>),
        FechaVencimiento:<span className="inline-block"> {moment(FechaVencido(acuXTipPed.TipoPedido,true)).format("DD/MM/YYYY")}</span>, 
        Disponible: Number(disponible).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
        SaldoTotal: saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
        Accion: (<Button
          onClick={() => { setCuotas(acuXTipPed.TipoPedido); }}
          variant="contained"
          disabled={true}
          color="primary">
          Pagar
      </Button>)
      })
    data.sort((a,b)=>(new Date(a.FechaV)-new Date(b.FechaV)));
 
  });
  data= RestriccionPago(data);

  data.push(
    {
      Tipo: (
        <h6 className="font-weight-bolder text-dark">Totales</h6>
      ),
      Disponible: (<label className="font-weight-bolder text-dark">
        {Totales.Disponible.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),
      SaldoTotal: (<label className="font-weight-bolder text-dark">
        {Totales.SaldoTotal.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),
      Vencido: (<label className="font-weight-bolder text-dark">
        {Totales.Vencido.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}     
      </label>),
      C15Dias: (<label className="font-weight-bolder text-dark">
        {Totales.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),
      Accion: (<label ></label>)
    }
  );

  return (
  <>
    <MUIDataTable title={'Resumen Cartera'} data={data} columns={columns} options={getOptions(props)} />
    <FacturasModal Data={DataModal} Open={openModal} onClose={setOpenModal}></FacturasModal>
    <FacturasModalPrecompra Data={DataModalPrecompra} Open={openModalPrecompra} onClose={setOpenModalPrecompra}></FacturasModalPrecompra>
    <CuotaModal  Data={cuotasa} Open={openModalCuota} onClose={setOpenModalCuota}/>
  </>)
}
export default FacturaTable