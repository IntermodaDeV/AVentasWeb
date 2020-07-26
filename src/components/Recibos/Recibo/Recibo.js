import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@material-ui/core';
import ReactToPrint from 'react-to-print';
import Logo from 'assets/img/logo/LogoSinLetrasInv.png';
import styles from "components/Recibos/Recibo/Recibo.module.css";
import moment from "moment";
import 'moment/locale/es';
import {useSelector} from 'react-redux';

const Recibo = (props) => {

    const clientesContado = useSelector(e=>e.clientesContado);

    const pedidoSelected = useSelector(k => k.pedidoSelected);
    const empresas = useSelector(e=>e.Empresas);
    const empresa = empresas.find(x=>x.COMPANY_CODE === localStorage.getItem('empresa').toUpperCase());
    let NombreCliente = props.Cliente.Nombre;
    let DireccionCliente = props.Cliente.Direccion;
    const clienteContado = pedidoSelected !== null && pedidoSelected !== undefined ? clientesContado.find(x=>x.id=== pedidoSelected.ClienteContado) : null;
    let Total = props.RecibosAplicados.Total;
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

   return (
        <div className="col">
            {
                props.Cliente &&
                <Dialog
                    open={props.Open}
                    onClose={() => console.log('Click')}
                    scroll={'paper'}
                    aria-labelledby="scroll-dialog-title"
                >
                    <DialogTitle id="scroll-dialog-title">Vista Previa Recibo</DialogTitle>
                    <DialogContent dividers={true} ref={componentRef} style={{ width: '100%' }}>
                        <div id={"invoice-POS"} style={{ boxShadow: 'unset' }}>
                            <div id="top">
                                <div className="row">
                                    <img className="pr-3" alt={"Logo"} width={150} style={{ objectFit: 'contain' }} src={Logo} ></img>

                                    <div className="col text-left m-auto">
                                        <h2 className={"m-0 " + styles.Title}>
                                            {'Intermoda, S.A. de C.V.'}
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
                                <div className="col-12 p-0 text-left">
                                    <h3 className={"font-weight-bold " + styles.LineHeight_1_5}>
                                        {NombreCliente}
                                    </h3>
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

                                            Fecha: {moment(props.RecibosAplicados.Pagos[0].Fecha).format("DD/MM/YYYY")}
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
                                                                Abono
                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {/* 6,182.40 */}
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
                                                                {factu.Dias}
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
                                            Total Recibo: {props.Cliente.Moneda} {numberWithCommas(props.RecibosAplicados.Total)}
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
                    </DialogContent >
                    <DialogActions>
                        <ReactToPrint
                            trigger={() =>
                                <Button color="primary">
                                    Imprimir
                            </Button>
                            }
                            content={() => componentRef.current}
                        />
                        <Button onClick={() => props.Finalizar()} color="primary">
                            Finalizar
                        </Button>
                    </DialogActions>
                </Dialog >
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