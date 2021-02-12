import React from 'react';
import {Button } from '@material-ui/core';
import ReactToPrint from 'react-to-print';
import Logo from 'assets/img/logo/LogoSinLetrasB.png';
import styles from "components/Recibos/Recibo/Recibo.module.css";
import moment from "moment";
import 'moment/locale/es';
import {useSelector} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {FiArrowRightCircle} from "react-icons/fi";
import { FaPrint } from "react-icons/fa";

const Recibo = (props) => {
    const clientesContado = useSelector(e=>e.clientesContado);
    const Monedas = useSelector(e=>e.AbreviacionMonedas);
    const pedidoSelected = useSelector(k => k.pedidoSelected);
    const empresas = useSelector(e=>e.Empresas);
    const empresa = empresas.find(x=>x.COMPANY_CODE === localStorage.getItem('empresa').toUpperCase());
    let NombreCliente = props.Cliente.Nombre;
    let DireccionCliente = props.Cliente.Direccion;
    const clienteContado = pedidoSelected !== null && pedidoSelected !== undefined ? clientesContado.find(x=>x.id=== pedidoSelected.ClienteContado) : null;
    let Total = props.RecibosAplicados.Total;
    const moneda = Monedas.find(e=>e.IdMoneda===props.Cliente.Moneda).Abreviacion;
    if(clienteContado!==null && clienteContado!==undefined)
    {
        if(Total < 10000)
        {
            NombreCliente = 'CONSUMIDOR FINAL';
        }else{
            NombreCliente = clienteContado.Nombre;
        }

        DireccionCliente = clienteContado.Direccion;
    }
    //const FechaEntrega = new Date();
    const componentRef = React.useRef();
    const useStyles = makeStyles((theme) => ({
        button: {
          marginLeft: theme.spacing(2),
          marginRight: theme.spacing(2),
        },
      }));
    const classes = useStyles();
   return (
        <div className="col">
            {
                props.Cliente &&
                <div>
                        <div className="text-right">
                            <div className="col">
                                    <ReactToPrint
                                        trigger={() =>
                                        <Button variant="contained" size="large" color="primary" endIcon = {<FaPrint/>}>
                                            Imprimir
                                        </Button>
                                        }
                                        content={() => componentRef.current}
                                    />

                                <Button onClick={() => props.Finalizar()} className = {classes.button} variant="contained" size="large" color="primary" endIcon ={<FiArrowRightCircle/>}>
                                        Finalizar
                                </Button>
                            </div>
                            <hr />
                        </div>
                
                   <div id={"invoice-POS"} ref={componentRef} style={{ boxShadow: 'unset' }}>
                       <div id="top">
                           <div className="row">
                               <img className="pr-3" alt={"Logo"} width={180} style={{ objectFit: 'contain' }} src={Logo} ></img>

                               <div className="col text-left m-auto">
                                   <h2 className={"m-0 " + styles.Title}>
                                       {empresa.NAME}
                                   </h2>
                                   <h3 className={"font-weight-normal " + styles.LineHeight_Normal}>
                                       {empresa.FISCAL_DOCUMENT}: {empresa.NIFCIF}
                                   </h3>
                               </div>
                           </div>
                           <div className="row">
                                    <div className="col p-0 text-left">
                                        <h3 className={"font-weight-normal  m-auto " + styles.LineHeight_Normal}>
                                            {props.Cliente.Codigo}
                                        </h3>
                                    </div>
                                    <div className="col p-0 text-center">
                                        <h2 className={"font-weight-bold " + styles.Title + styles.LineHeight_1_5}>
                                            {'No. ' + props.RecibosAplicados.CodigoUltimoRecibo}
                                        </h2>
                                    </div>
                                </div>
                           <div className="row">
                               <div className="col p-0 text-left">
                                   <h3 className={"font-weight-bold " + styles.LineHeight_1_5}>
                                       {NombreCliente}
                                   </h3>
                               </div>
                               {
                                   props.RecibosAplicados.ReciboCache === "true" &&
                                   <div className={"col text-center m-auto font-weight-bold" + styles.Size}>
                                       <h4 className={"font-weight-bold" + styles.Size}>
                                           {"Este documento ha sido generado fuera de linea."}
                                       </h4>
                                   </div>
                               }
                           </div>
                                <div className="col-12 p-0 text-left">
                                    <p>
                                        {DireccionCliente}
                                    </p>
                                </div>
                            </div>

                            <div id="mid">
                                <div className="row py-2">
                                    <div className="col-12 py-2 p-0">
                                        <p>

                                            Fecha: {moment().format('DD/MM/YYYY hh:mm a')}
                                        </p>
                                    </div>
                                    <div className="col-12 p-0">
                                        <table className="table table-striped table-xl-responsive">

                                            <thead>
                                                <tr>
                                                    <th>
                                                        Tipo Pago
                                                    </th>
                                                    <th>
                                                        Esp. Pago
                                                    </th>
                                                    <th>
                                                        Fecha
                                                    </th>
                                                    <th>
                                                        Referencia
                                                    </th>
                                                    <th>
                                                        Banco
                                                    </th>
                                                    <th>
                                                        Monto
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {props.RecibosAplicados.Pagos.map((pag, index) => (

                                                    <tr key={index} className={styles.TableRow}>
                                                        <td>
                                                            {pag.TipoPago}
                                                        </td>
                                                        <td>
                                                            {pag.EspecificacionPago}
                                                        </td>
                                                        <td>
                                                            {moment(pag.Fecha).format("DD/MM/YYYY")}
                                                        </td>
                                                        <td>
                                                            {pag.Referencia}
                                                        </td>
                                                        <td>
                                                            {pag.Banco}
                                                        </td>
                                                        <td className={styles.TableCellAmmount}>
                                                            {numberWithCommas(pag.Monto)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-12 p-0">
                                        <table className="table table-striped table-xl-responsive">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Documento
                                                    </th>
                                                    <th>
                                                        Fecha
                                                    </th>
                                                    <th>

                                                    </th>
                                                    <th>

                                                    </th>
                                                    <th>
                                                        Parcial
                                                    </th>
                                                    <th>
                                                        Aplicado
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {props.RecibosAplicados.Facturas.map((factu, index) => (
                                                    <React.Fragment key={index}>
                                                        <tr className={styles.TableRow + " " + styles.TableRowNoBorder}>
                                                            <td>
                                                                {factu.TipoDocumento}
                                                            </td>
                                                            <td>
                                                                {moment(factu.Fecha).format("DD/MM/YYYY")}
                                                            </td>
                                                            <td>
                                                             {factu.EsAbono === true && "Abono"}
                                                             {factu.EsAbono === false && "Cancelado"}
                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {numberWithCommas(Number(factu.Parcial))}
                                                            </td>
                                                            <td className={styles.TableCellAmmount}>

                                                            </td>
                                                        </tr>
                                                        <tr className={styles.TableRow + " " + styles.TableRowNoBorder}>
                                                            <td>
                                                                {factu.IdFactura}
                                                                { factu.NumeroFEL !== "" && factu.NumeroFEL !== null  && 
                                                                " - FEL:" + factu.NumeroFEL                                                    
                                                                } 
                                                            </td>
                                                            <td>
                                                                {"Dias: " + factu.Dias}
                                                            </td>
                                                            <td>
                                                                {/* D */}
                                                                Desc
                                                                {/* {factu.Parcial2 !=='0' ? 'D':'' } */}
                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {/* -618.24 */}
                                                                {numberWithCommas(Number(factu.Parcial2))}
                                                                {/* {factu.Parcial2} */}
                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {numberWithCommas(factu.Aplicado)}
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-12 p-0">
                                        <h3 className={"font-weight-bold text-right " + styles.LineHeight_Normal}>
                                            Total Recibo: {moneda} {numberWithCommas(props.RecibosAplicados.Total)}
                                        </h3>
                                    </div>

                                    <div className="col-6 p-0 m-auto">
                                        <div className={styles.FirmaContainer}>
                                            <h4 className={"font-weight-bold text-center " + styles.LineHeight_Normal}>
                                                {localStorage.getItem('asesor')}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 }
        </div >
     
    )
}

const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export default Recibo;