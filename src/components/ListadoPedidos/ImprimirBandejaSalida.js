import React from 'react';
import { DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";
import Logo from 'assets/img/logo/Logoinv.png';
import ReactToPrint from 'react-to-print';
import styles from "components/ListadoPedidos/ImprimirPedido.module.css";
import moment from "moment";
import {useSelector} from 'react-redux';
import 'moment/locale/es';

const ImprimirBandejaSalida = (props) => {
const Monedas = useSelector(e=>e.AbreviacionMonedas);
const clientesContado = useSelector(e=>e.clientesContado);
const empresas = useSelector(e=>e.Empresas);
let NombreCliente= props.Pedido.Nombre; //props.Pedido.Cliente.Nombre;
let DireccionCliente= props.Pedido.Direccion;
const clienteContado = clientesContado.find(x=>x.id===props.Pedido.ClienteContadoId);
const empresa = empresas.find(x=>x.COMPANY_CODE === localStorage.getItem('empresa').toUpperCase());
const moneda = Monedas.find(e=>e.IdMoneda === props.Pedido.MonedaCliente).Abreviacion;

if(clienteContado!==null && clienteContado!==undefined)
{
    if(props.Pedido.TotalXPedido<10000)
    {
        NombreCliente = 'CONSUMIDOR FINAL';
    }
    /*else{
        NombreCliente = clienteContado.Nombre;
    }*/

    //DireccionCliente = clienteContado.Direccion;
}

let TotalUnidad = 0;
    const componentRef = React.useRef();
    return (
        <>
            <DialogTitle id="scroll-dialog-title">Vista Previa Pedido</DialogTitle>
            <DialogContent dividers={true} ref={componentRef} style={{ width: '100%' }}>
                <div id={"invoice-POS"} style={{ boxShadow: 'unset' }}>

                    <div id="top">
                        <img alt={"Logo"} width={420} style={{ objectFit: 'contain' }} src={Logo} ></img>
                        <div className="row">
                            <div className={"col p-0 text-left font-weight-bold " + styles.Rtn}>
                                {empresa.FISCAL_DOCUMENT}: {empresa.NIFCIF} 
                            </div>
                            <div className={"col p-0 text-right font-weight-bold " + styles.Rtn}>
                                Copia
                            </div>
                        </div>
                    </div>

                    <div id="mid">
                        <div className="row">
                            <div className="col-6">
                                <div className="info">
                                <h2>{NombreCliente}</h2>
                                    <p>
                                        Dirección : {DireccionCliente}<br />
                                        Código    : {props.Pedido.CodigoCliente}<br />
                                    </p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="info">
                                <h2>Pedido {"No Disponible"}</h2>
                                    <p>
                                        Fecha del pedido : {moment(props.Pedido.FechaActual).format('DD/MM/YYYY hh:mm a')}<br />
                                        Entrega Sugerida : {moment(props.Pedido.FechaEntrega).format('DD/MM/YYYY hh:mm a')}<br />
                                        Asesor: {""/*props.Pedido.Usuario*/}<br />
                                        Modo Venta: {props.Pedido.ModoVenta}<br/>
                                    </p>
                                </div>
                            </div >
                        </div>

                    </div>

                    {props.Pedido.DetallePedido.map((grupoTalla, index1) => {
                        return (
                            <table className={'table table-bordered table-xl-responsive'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index1}>
                                <thead>
                                  <tr style={{ backgroundColor: '#d9d9d9' }}>
                                        <th>
                                        </th>
                                        <th>
                                        {
                                            <div>{grupoTalla.Talla}</div>
                                        }
                                        </th>
                                        <th>Cant</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-1">
                                            <div className="row">
                                            <div variant="contained">
                                                <div className="row">
                                                    <div className="pl-2 pr-3 font-weight-bold">
                                                        {grupoTalla.CodigoProducto}
                                                    </div>
                                                <div>{""/*producto.NombreProducto*/}</div>
                                            </div>
                                        </div>
                                     </div>                    
                                 </td>   
                            </tr>
                            <tr>
                                <td className="p-1 text-center" style={{
                                                alignItems: 'center',
                                                verticalAlign: 'middle',
                                                //width: `${cellSize}%`,
                                            }}>
                                                <div className="col-12 px-0">
                                                    <span>{grupoTalla? grupoTalla.PrecioUnitario : "--"}</span>
                                                </div>
                                                <label>{grupoTalla? grupoTalla.Cantidad : 0}</label>
                                    </td> 
                                    <td className="p-1 text-center font-weight-bold" style={{
                                            alignItems: 'center',
                                            verticalAlign: 'middle',
                                            ///width: `${cellSize}%`,
                                    }}>{grupoTalla.PrecioUnitario}</td>
                            </tr>
                            </tbody>
                        </table>
                        )
                    })}
                    <div className="row" style={{ maxWidth: '100%' }}>

                        <div className="col-6">
                            <div className="thanks">
                                {
                                    props.Pedido.Firma === null ?
                                        <div style={{ width: '100%', height: '160px', }}></div> :
                                        <img src={props.Pedido.Firma} alt={"Firma"} data-holder-rendered="true" />
                                }

                            </div>

                            <div className={'firma'}>
                                <span className="signature">
                                    Firma
                                    </span>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="row">
                                <div className="col-5 labelTotal text-left">
                                    Unidades:
                                    </div>
                                <div className="col-7 valueTotal">
                                {TotalUnidad !== 0? TotalUnidad : props.Pedido.TotalUnidades}
                                </div>
                            </div>

                            <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Subtotal:
                                    </div>

                                <div className="col-7 valueTotal">
                                    {numberWithCommas(props.Pedido.subtotal)}
                                </div>
                            </div>

                            {(props.Pedido.Flete>0 && props.Pedido.Flete !== null ) && <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Flete:
                                    </div>

                                <div className="col-7 valueTotal">
                                    {numberWithCommas((props.Pedido.Flete))}
                                </div>
                            </div>}

                            <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Impuesto:
                                    </div>

                                <div className="col-7 valueTotal">
                                    {numberWithCommas((props.Pedido.Impuesto))}
                                </div>
                            </div>

                            <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Total:
                                    </div>

                                <div className="col-7 valueTotal">
                                    {moneda}{""/*numberWithCommas((props.Pedido.TotalXPedido))*/}
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
                    Cerrar
                    </Button>
            </DialogActions>
        </>
    )
}

const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export default ImprimirBandejaSalida;