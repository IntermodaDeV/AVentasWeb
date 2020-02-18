import React from 'react';
import { DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";
import Logo from 'assets/img/logo/Logoinv.png';
import ReactToPrint from 'react-to-print';
import styles from "components/ListadoPedidos/ImprimirPedido.module.css";
import moment from "moment";
import 'moment/locale/es';

const ImprimirPedido = (props) => {

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
                                RTN: 05019995124588 
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
                                    <h2>{props.Pedido.Cliente.Nombre}</h2>
                                    <p>
                                        Dirección : {props.Pedido.Cliente.Direccion}<br />
                                        Código    : {props.Pedido.Cliente.Codigo}<br />
                                    </p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="info">
                                    <h2>Pedido {props.NumeroOrden}</h2>
                                    <p>
                                        Fecha del pedido : {moment(props.Pedido.FechaActual).format('DD/MM/YYYY hh:mm a')}<br />
                                        Entrega Sugerida : {moment(props.Pedido.FechaEntrega).format('DD/MM/YYYY hh:mm a')}<br />
                                        Asesor: {'hbenitez'}<br />
                                    </p>
                                </div>
                            </div >
                        </div>

                    </div>

                    {props.Pedido.gruposXDetPed.map((grupoTalla, index1) => {
                        let cantidad = 3;
                        return (
                            <table className={'table table-bordered table-xl-responsive'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index1}>
                                <thead>
                                    <tr style={{ backgroundColor: '#d9d9d9' }}>
                                        <th>

                                        </th>
                                        {grupoTalla.ListaTalla.map((talla, index2) => {
                                            cantidad++;
                                            return (
                                                <th key={index2}>
                                                    {talla.Talla}
                                                </th>
                                            )
                                        })}
                                        <th>Cant</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupoTalla.prodsXDetPed.map((producto, index2) => {
                                        return (
                                            <React.Fragment key={index2} >
                                                <tr >
                                                    <td className="p-1" colSpan={grupoTalla.ListaTalla.length + 3} >
                                                        <div className="row">
                                                            <div variant="contained">
                                                                <div className="row">
                                                                    <div className="pl-2 pr-3 font-weight-bold">
                                                                        {producto.CodigoProducto}
                                                                    </div>
                                                                    <div>{producto.NombreProducto}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {producto.coloresXProdXDetPed.map((color, index3) => {
                                                    let detalles = Array(grupoTalla.ListaTalla.length).fill(null);
                                                    color.DetallesXPedido.forEach(detalleXPedido => {
                                                        detalles[grupoTalla.ListaTalla.findIndex(tall => tall.Talla === detalleXPedido.Talla)] = detalleXPedido;
                                                    });

                                                    let cellSize = 100 / cantidad;
                                                    return (
                                                        <tr key={index3}>
                                                            <td className="p-1 text-center" style={{
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle',
                                                                width: `${cellSize}%`,
                                                            }}>
                                                                {color.NombreColor}
                                                            </td>
                                                            {detalles.map((det, index4) => {
                                                                return (
                                                                    <td key={index4} className="p-1 text-center" style={{
                                                                        alignItems: 'center',
                                                                        verticalAlign: 'middle',
                                                                        width: `${cellSize}%`,
                                                                    }}>
                                                                        <label>{det ? det.Cantidad : 0}</label>
                                                                    </td>
                                                                )
                                                            })}
                                                            <td className="p-1 text-center font-weight-bold" style={{
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle',
                                                                width: `${cellSize}%`,
                                                            }}>{color.CantidadXColor}</td>

                                                            <td className="p-1 text-right font-weight-bold  pr-2" style={{
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle',
                                                                width: `${cellSize}%`,
                                                            }}>{numberWithCommas(color.TotalXColor)}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </React.Fragment>
                                        )
                                    })}
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
                                    {props.Pedido.TotalUnidades}
                                </div>
                            </div>

                            <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Subtotal:
                                    </div>

                                <div className="col-7 valueTotal">
                                    {numberWithCommas(props.Pedido.SubTotalXPedido)}
                                </div>
                            </div>

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
                                    Total {props.Pedido.Cliente.Moneda}:
                                    </div>

                                <div className="col-7 valueTotal">
                                    {numberWithCommas((props.Pedido.TotalXPedido))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <div className="notices">
                            <div>NOTA:</div>
                            <div className="notice">Se notificará cuando ya se entreguen los productos en la fecha sugerida indicada.</div>
                        </div>

                        <div id="legalcopy">
                            <p className="legal"><br /><strong>Gracias!</strong>
                            </p>
                        </div> */}

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

export default ImprimirPedido;