import React from 'react';
import { DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";
import Logo from 'assets/img/logo/LogoSinLetrasB.png';
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
const empresa = empresas.find(x=>x.COMPANY_CODE === localStorage.getItem('EmpresaCliente').toUpperCase());
const moneda = Monedas.find(e=>e.IdMoneda === props.Pedido.MonedaCliente).Abreviacion;
console.log(props);

if(clienteContado!==null && clienteContado!==undefined)
{
    if(props.Pedido.TotalXPedido<10000)
    {
        NombreCliente = 'CONSUMIDOR FINAL';
    }
}
    let NumeroPedido = props.Pedido.NumeroReferencia !== "" ? props.Pedido.NumeroReferencia : "En Proceso";
    let TotalUnidad = 0;
    let cantidad = 0;
    const componentRef = React.useRef();
    return (
        <>
            <DialogTitle id="scroll-dialog-title">Vista Previa Pedido</DialogTitle>
            <DialogContent dividers={true} ref={componentRef} style={{ width: '100%' }}>
                <div id={"invoice-POS"} style={{ boxShadow: 'unset' }}>

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
                            <div className={"col p-0 text-right m-auto font-weight-bold " + styles.Rtn}>
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
                                       <h4 style={{fontWeight:'bold'}}>
                                           {"Este documento ha sido generado fuera de linea."}
                                       </h4>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="info">
                                <h2>Pedido {NumeroPedido}</h2>
                                    <p>
                                        Fecha del pedido : {moment(props.Pedido.FechaActual).format('DD/MM/YYYY hh:mm a')}<br />
                                        Entrega Sugerida : {moment(props.Pedido.FechaEntrega).format('DD/MM/YYYY hh:mm a')}<br />
                                        Asesor: {localStorage.getItem('asesor')}<br />
                                        Modo Venta: {props.Pedido.ModoVenta}<br/>
                                    </p>
                                </div>
                            </div >
                        </div>

                    </div>

                    {props.Detalle.map((producto, index1) => {
                        return (
                        producto.Colores.map((Color, index2) => {
                            let CantProducto = 0;
                            let TotalProducto = 0;
                            let cellSize = 0;
                            return(    
                            <table className={'table table-bordered table-xl-responsive'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index1}>
                                <thead>
                                  <tr style={{ backgroundColor: '#d9d9d9' }}>
                                        <th>
                                        </th>
                                        {Color.Tallas.map((Talla, index3) => {
                                                TotalUnidad += Number(Talla.Cantidad);
                                                cantidad += Number(Talla.Cantidad);
                                                TotalProducto += Number(Talla.Cantidad * Talla.Precio);
                                                CantProducto += Number(Talla.Cantidad);
                                                cellSize = 100 / cantidad;
                                                return(
                                                    <th key= {index2}>
                                                    {
                                                        <div>{Talla.Talla}</div>
                                                    }
                                                    </th>
                                                )
                                            })}
                                        <th>Cant</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                <React.Fragment key={index1} >
                                    <tr >
                                        <td className="p-1" colSpan={cantidad + 3} >
                                            <div className="row">
                                                <div variant="contained">
                                                    <div className="row">
                                                        <div className="pl-2 pr-3 font-weight-bold">
                                                            {producto.Codigo}
                                                        </div>
                                                    <div>{producto.NombreProducto}</div>
                                                </div>
                                            </div>
                                        </div>
                                        </td>
                                    </tr>
                                    <tr key={index2}>
                                                <td className="p-1 text-center" style={{
                                                    alignItems: 'center',
                                                    verticalAlign: 'middle',
                                                    width: `${cellSize}%`,}}>
                                                    <div className="col-12 px-0">
                                                        <span>{"Precio"}</span>
                                                    </div>
                                                        {Color.NombreColor}
                                                </td>
                                                {Color.Tallas.map((det, index4) => {
                                                    return ( 
                                                        <td key={index4} className="p-1 text-center" style={{
                                                            alignItems: 'center',
                                                            verticalAlign: 'middle',
                                                            width: `${cellSize}%`,
                                                        }}>
                                                            <div className="col-12 px-0">
                                                                <span>{det? det.Precio : "--"}</span>
                                                            </div>
                                                                <label>{det? det.Cantidad : 0}</label>
                                                            </td>  
                                                           )
                                                })}
                                                <td className="p-1 text-center font-weight-bold" style={{
                                                    alignItems: 'center',
                                                    verticalAlign: 'middle',
                                                    width: `${cellSize}%`,
                                                }}>{CantProducto}</td>

                                                <td className="p-1 text-right font-weight-bold  pr-2" style={{
                                                    alignItems: 'center',
                                                    verticalAlign: 'middle',
                                                    width: `${cellSize}%`,
                                                }}>{numberWithCommas(TotalProducto)}</td>
                                                </tr>
                                    </React.Fragment>
                                </tbody>
                        </table>
                         )
                        })
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
                                {TotalUnidad}
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
                                    {moneda}{numberWithCommas((props.Pedido.subtotal + props.Pedido.Impuesto + props.Pedido.Flete))}
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