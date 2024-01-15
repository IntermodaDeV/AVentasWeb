import React, { useEffect, useState } from 'react';
import Logo from 'assets/img/logo/LogoSinLetrasB.png';
import styles from "components/ListadoRecibos/Recibo.module.css";
import moment from "moment";
import axios from 'axios';
import 'moment/locale/es';
import { useSelector } from 'react-redux';
import { APIURL } from 'utils/Enviroment';

export const ReciboReporte = (props) => {
    const [nombreAsesor,setNombreAsesor] = useState('');
    const [firmaAsesor,setFirmaAsesor] = useState('');
    const Monedas = useSelector(e => e.AbreviacionMonedas);
    const clientesContado = useSelector(e => e.clientesContado);
    const empresas = useSelector(e => e.Empresas);
    const empresaCliente = props.recibo.Cliente.Codigo.split("-")[0];
    let NombreCliente = props.recibo.Cliente.Nombre;
    let DireccionCliente = props.recibo.Cliente.Direccion;
    const clienteContado = props.recibo.Pedido !== null && props.recibo.Pedido !== undefined ? clientesContado.find(x => x.id === props.recibo.Pedido.ClienteContadoId) : null;
    let valor = props.recibo.Valor;
    const empresa = empresas.find(x => x.COMPANY_CODE === empresaCliente.toUpperCase());
    const moneda = Monedas.find(e => e.IdMoneda === props.recibo.Cliente.Moneda).Abreviacion;
    if (clienteContado !== null && clienteContado !== undefined) {
        if (valor < 10000) {
            NombreCliente = 'CONSUMIDOR FINAL';
        }
        else {
            NombreCliente = clienteContado.Nombre;
        }
        DireccionCliente = clienteContado.Direccion;
    }

    const obtenerFirmaRecibo = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/Recibo/obtenerfirma/${props.recibo.NumeroRecibo}`);
            setNombreAsesor(request.data.nombreAsesor);
           setFirmaAsesor(request.data.firma);
        }catch(err){

        }
    }

    useEffect(()=>{
        obtenerFirmaRecibo();
    },[])

    return (
        <>
            <div id={"invoice-POS"} style={{ boxShadow: 'unset' }}>
                <div id="top">
                    <div className="row">
                        <img className="pr-3" alt={"Logo"} width={180} style={{ objectFit: 'contain' }} src={Logo} ></img>
                        <div className="col text-left m-auto">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h2 className={"m-0 " + styles.Title}>
                                    {empresa.NAME}
                                </h2>

                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3 className={"font-weight-normal " + styles.LineHeight_Normal}>
                                    {empresa.FISCAL_DOCUMENT}: {empresa.NIFCIF}
                                </h3>

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col p-0 text-left">
                            <h3 className={"font-weight-normal  m-auto " + styles.LineHeight_Normal}>
                                {props.recibo.Cliente.Codigo}
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

                                Fecha: {moment(props.recibo.Fecha).format('DD/MM/YYYY hh:mm a')}
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
                                    <tr className={styles.TableRow}>
                                        <td>
                                            {props.recibo.TipoPago.Descripcion}
                                        </td>
                                        <td>
                                            {props.recibo.TipoPago.TiposdePagoDetalle[0].Descripcion}
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
                                                            {moment(factu.FechaFactura).format("DD/MM/YYYY")}
                                                        </td>
                                                        <td>
                                                            {factu.EsAbono === true && "Abono"}
                                                            {factu.EsAbono === false && "Cancelado"}
                                                        </td>
                                                        <td>

                                                        </td>
                                                        <td className={styles.TableCellAmmount}>
                                                            {/* 6,182.40 */}
                                                            {numberWithCommas(Number(factu.ValorFactura))}
                                                        </td>
                                                        <td className={styles.TableCellAmmount}>
                                                            {factu.cuota ? "Cuota: " + factu.cuota : ""}
                                                        </td>
                                                    </tr>
                                                    <tr className={styles.TableRow + " " + styles.TableRowNoBorder}>
                                                        <td>
                                                            {factu.Factura}
                                                            {factu.NumeroFel !== "" && factu.NumeroFel !== null &&
                                                                " - FEL: " + factu.NumeroFel
                                                            }
                                                        </td>
                                                        <td>
                                                            {"Dias: " + factu.DiasVencimiento}
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
                                {moneda}
                                {numberWithCommas(props.recibo.Valor)}
                            </h3>
                        </div>

                        <div className="col-6 p-0 m-auto" style={{ display: "flex", flexDirection: "column" }}>
                            {firmaAsesor !== "" && <img alt="Firma asesor" src={firmaAsesor} style={{ height: 150, alignSelf: "center" }} />}
                            <div className={styles.FirmaContainer} style={{ marginTop: firmaAsesor !== "" ? 16 : 160 }}>
                                <h4 className={"font-weight-bold text-center " + styles.LineHeight_Normal}>
                                    {nombreAsesor}
                                </h4>
                            </div>
                        </div>
                    </div>

                </div>

                {props.recibo.depositos.map(e => <img src={`${APIURL}/uploads/${e.deposito}`} key={e.id} />)}
            </div>
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
