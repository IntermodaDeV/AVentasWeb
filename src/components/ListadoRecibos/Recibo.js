import React from 'react';
import { DialogActions, DialogContent, DialogTitle, Button } from '@material-ui/core';
import ReactToPrint from 'react-to-print';
import Logo from 'assets/img/logo/LogoSinLetrasInv.png';
import styles from "components/ListadoRecibos/Recibo.module.css";
import moment from "moment";
import 'moment/locale/es';
import {useSelector} from 'react-redux';

const Recibo = (props) => {
    const clientesContado = useSelector(e=>e.clientesContado);
    const empresas = useSelector(e=>e.Empresas);
    let NombreCliente = props.recibo.Cliente.Nombre;
    let DireccionCliente=props.recibo.Cliente.Direccion; 
    const clienteContado = props.recibo.Pedido !==null && props.recibo.Pedido !==undefined ? clientesContado.find(x=>x.id=== props.recibo.Pedido.ClienteContadoId) : null;
    let valor = props.recibo.Valor;
    const empresa = empresas.find(x=>x.COMPANY_CODE === localStorage.getItem('empresa').toUpperCase());
    if(clienteContado!==null && clienteContado!==undefined)
    {
            if(valor < 10000)
            {
                NombreCliente = 'CONSUMIDOR FINAL';
            }
            else
            {
                NombreCliente = clienteContado.Nombre;
            }
        DireccionCliente = clienteContado.Direccion;
    }

    const componentRef = React.useRef();

    return (
        <>
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
                                    {props.recibo.Cliente.CodigoCliente}
                                </h3>
                            </div>
                            <div className="col p-0 text-center">
                                <h2 className={"font-weight-bold " + styles.Title + styles.LineHeight_1_5}>
                                    {'No. ' + props.recibo.NumeroRecibo}
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

                                    Fecha: {moment(props.recibo.Fecha).format("DD/MM/YYYY")}
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
                                        <tr className={styles.TableRow}>
                                            <td>
                                                {props.recibo.TipoPago.Descripcion}
                                            </td>
                                            <td>
                                                {moment(props.recibo.FechaPago).format("DD/MM/YYYY")}
                                            </td>
                                            <td>
                                                {props.recibo.Referencia}
                                            </td>
                                            <td>
                                                {props.recibo.DescripcionBanco}
                                            </td>
                                            <td className={styles.TableCellAmmount}>
                                                {numberWithCommas(props.recibo.Valor)}
                                            </td>
                                        </tr>
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
                                        {
                                            props.recibo.DetalleRecibo.map((factu, index) => {
                                                return (
                                                    <React.Fragment key={index}>
                                                        <tr className={styles.TableRow + " " + styles.TableRowNoBorder}>
                                                            <td>
                                                                {factu.Tipo}
                                                            </td>
                                                            <td>
                                                                {moment(props.recibo.FechaPago).format("DD/MM/YYYY")}
                                                            </td>
                                                            <td>
                                                                Abono
                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {/* 6,182.40 */}
                                                                {numberWithCommas(Number(factu.ValorSinDescuento))}
                                                            </td>
                                                            <td className={styles.TableCellAmmount}>

                                                            </td>
                                                        </tr>
                                                        <tr className={styles.TableRow + " " + styles.TableRowNoBorder}>
                                                            <td>
                                                                {factu.Factura}
                                                                {factu.NumeroFel !== "" && factu.NumeroFel !== null  && 
                                                                " - FEL: " + factu.NumeroFel                                                    
                                                                } 
                                                            </td>
                                                            <td>
                                                                {factu.DiasVencimiento}
                                                            </td>
                                                            <td>
                                                                Desc
                                                        {/* {factu.Parcial2 !=='0' ? 'D':'' } */}
                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {numberWithCommas(Number(factu.Descuento))}
                                                                {/* {factu.Parcial2} */}
                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {numberWithCommas(factu.Valor)}
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-12 p-0">
                                <h3 className={"font-weight-bold text-right " + styles.LineHeight_Normal}>
                                    Total Recibo:
                                    {props.recibo.Cliente.Moneda}
                                    {numberWithCommas(props.recibo.Valor)}
                                </h3>
                            </div>

                            <div className="col-6 p-0 m-auto">
                                <div className={styles.FirmaContainer}>
                                    <h4 className={"font-weight-bold text-center " + styles.LineHeight_Normal}>
                                        {props.recibo.CodigoAsesor}
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
                <Button onClick={() => props.hidePrint()} color="primary">
                    Finalizar
                        </Button>
            </DialogActions>
        </>
    )
}

const numberWithCommas = (x) => {
    try {
        x = x.toFixed(2);
    }
    catch (error) {
        x = parseFloat(x).toFixed(2);
    }
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export default Recibo;