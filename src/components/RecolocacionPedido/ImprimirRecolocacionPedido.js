import React from 'react';
import { DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";
import Logo from 'assets/img/logo/LogoSinLetrasB.png';
import ReactToPrint from 'react-to-print';
import styles from "components/ListadoPedidos/ImprimirPedido.module.css";
import moment from "moment";
import { useSelector } from 'react-redux';
import 'moment/locale/es';

export const ImprimirRecolocacionPedido = (props) => {
    const TrasladoPedido = useSelector(e => e.TrasladoPedido.pedidoRecolocacion);
    const Monedas = useSelector(e => e.AbreviacionMonedas);
    const empresas = useSelector(e => e.Empresas);
    const clienteSeleccionado = useSelector(e => e.TrasladoPedido.clienteSeleccionado);
    let NombreCliente = clienteSeleccionado.Nombre;
    const empresa = empresas.find(x => x.COMPANY_CODE === clienteSeleccionado.EmpresaId.toUpperCase());
    const moneda = Monedas.find(e => e.IdMoneda === clienteSeleccionado.Moneda).Abreviacion;

    let TotalUnidad = 0;
    const checkDist = (talla) => {
        let found = false;
        talla.Distribucion.map(() => {
            found = true;
            return false;
        })
        return found;
    }

    let tallasDist = [];
    const Tallas = (talla) => {
        talla.Distribucion.forEach(dist => {
            if (tallasDist.length > 0) {
                let ExisteTalla = tallasDist.filter(x => x.NombreTalla === dist.NombreTalla);

                if (ExisteTalla.length === 0) {
                    tallasDist.push({ NombreTalla: dist.NombreTalla, Orden: dist.Orden })
                }
            }
            else {
                tallasDist.push({ NombreTalla: dist.NombreTalla, Orden: dist.Orden })
            }
        })
        tallasDist.sort((a, b) => {
            return Number(a.Orden) < Number(b.Orden) ? -1 : 1;
        });
        return tallasDist;
    }

    const componentRef = React.useRef();
    return (
        <>
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
                    </div>
                </div>

                <div id="mid">
                    <div className="row">
                        <div className="col-6">
                            <div className="info">
                                <h2>{NombreCliente}</h2>
                                <p>
                                    Dirección : {clienteSeleccionado.Direccion}<br />
                                    Código    : {clienteSeleccionado.Codigo}<br />
                                </p>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="info">
                                <h2>Pedido {TrasladoPedido.PedidoId}</h2>
                                <p>
                                    Fecha del pedido : {moment(TrasladoPedido.FechaActual).format('DD/MM/YYYY hh:mm a')}<br />
                                    Entrega Sugerida : {moment(TrasladoPedido.FechaEntrega).format('DD/MM/YYYY hh:mm a')}<br />
                                    Asesor: {TrasladoPedido.Usuario}<br />
                                    Modo Venta: {TrasladoPedido.ModoVenta}<br />
                                    Coleccion: {TrasladoPedido.CodigoColeccion + "-" + TrasladoPedido.NombreColeccion}<br />
                                </p>
                            </div>
                        </div >
                    </div>

                </div>

                {TrasladoPedido.gruposXDetPed.map((grupoTalla, index1) => {
                    let cantidad = 3;
                    let IsDist = false;
                    let CantDist = 0;
                    let Distribuciones = [];
                    return (
                        <table className={'table table-bordered table-xl-responsive'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index1}>
                            <thead>
                                <tr style={{ backgroundColor: '#d9d9d9' }}>
                                    <th>
                                    </th>
                                    {grupoTalla.ListaTalla.map((talla, index2) => {
                                        Distribuciones = Tallas(talla);
                                        cantidad++;
                                        return (
                                            <>
                                                {
                                                    talla.Distribucion.length !== 0 && grupoTalla.ListaTalla.length === index2 + 1 &&
                                                    Distribuciones.map((dist, index3) => {
                                                        IsDist = true;
                                                        cantidad++;
                                                        return (
                                                            <th key={index2}>
                                                                {
                                                                    <div key={index3}>{dist.NombreTalla}</div>
                                                                }
                                                            </th>
                                                        )
                                                    })
                                                }
                                                {
                                                    talla.Distribucion.length === 0 &&
                                                    <th key={index2}>
                                                        {
                                                            <div>{talla.Talla}</div>
                                                        }
                                                    </th>
                                                }
                                            </>
                                        )
                                    })}
                                    <th>Cant</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grupoTalla.prodsXDetPed.map((producto, index2) => {
                                    let ColoresProductos = Object.keys(producto.coloresXProdXDetPed).map((key) => (producto.coloresXProdXDetPed[key]));
                                    ColoresProductos.sort((a, b) => a.NombreColor < b.NombreColor ? -1 : 1);
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
                                            {ColoresProductos.map((color, index3) => {
                                                let detalles = Array(grupoTalla.ListaTalla.length).fill(null);
                                                color.DetallesXPedido.forEach(detalleXPedido => {
                                                    detalles[grupoTalla.ListaTalla.findIndex(tall => tall.Talla === detalleXPedido.Talla)] = detalleXPedido;
                                                });
                                                let cellSize = 100 / cantidad;
                                                let TotalXTalla = 0;
                                                let TotalXProducto = 0;
                                                let arreglo = [];
                                                let totalcant = 0;
                                                return (
                                                    <tr key={index3}>
                                                        <td className="p-1 text-center" style={{
                                                            alignItems: 'center',
                                                            verticalAlign: 'middle',
                                                            width: `${cellSize}%`,
                                                        }}>
                                                            <div className="col-12 px-0">
                                                                <span>{"Precio"}</span>
                                                            </div>
                                                            {color.NombreColor}
                                                        </td>
                                                        {detalles.map((det, index4) => {
                                                            IsDist = det !== null ? checkDist(det.TallaObject) : IsDist;
                                                            return (
                                                                <>
                                                                    {
                                                                        IsDist === true && det !== null &&
                                                                        det.TallaObject.Distribucion.map((dist, index) => {
                                                                            CantDist = det.TallaObject.Distribucion.reduce((acc, curr) => { return acc + Number(curr.Cantidad) }, 0);;

                                                                            TotalXTalla = dist.Cantidad * det.Cantidad;
                                                                            TotalXProducto += TotalXTalla;
                                                                            TotalUnidad += TotalXTalla;
                                                                            let cant = 0;
                                                                            if (color.DetallesXPedido.length === 1) {
                                                                                totalcant = dist.Cantidad * det.Cantidad;
                                                                            }
                                                                            else {
                                                                                if (arreglo.length > 0) {
                                                                                    const listaTallas = arreglo.filter(x => x.NombreTalla === dist.NombreTalla);
                                                                                    if (detalles.length === (index4 + 1)) {
                                                                                        if (listaTallas.length > 0) {
                                                                                            cant = dist.Cantidad * det.Cantidad
                                                                                            totalcant = listaTallas[0].cant + cant;
                                                                                        }
                                                                                        else {
                                                                                            totalcant = dist.Cantidad * det.Cantidad;
                                                                                        }
                                                                                    }
                                                                                    else if (listaTallas.length > 0) {
                                                                                        cant = dist.Cantidad * det.Cantidad
                                                                                        totalcant = listaTallas[0].cant + cant;
                                                                                        return false;
                                                                                    }
                                                                                    else {
                                                                                        arreglo.push({ NombreTalla: dist.NombreTalla, cant: dist.Cantidad * det.Cantidad });
                                                                                        return false;
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    arreglo.push({ NombreTalla: dist.NombreTalla, cant: dist.Cantidad * det.Cantidad });
                                                                                    return false;
                                                                                }
                                                                            }
                                                                            return (
                                                                                <td key={index4} className="p-1 text-center" style={{
                                                                                    alignItems: 'center',
                                                                                    verticalAlign: 'middle',
                                                                                    width: `${cellSize}%`,
                                                                                }}>
                                                                                    <div className="col-12 px-0">
                                                                                        <span>{det ? det.PrecioUnitario / CantDist : "--"}</span>
                                                                                    </div>
                                                                                    <label>{totalcant}</label>
                                                                                </td>
                                                                            )
                                                                        })
                                                                    }
                                                                    {
                                                                        IsDist === false &&
                                                                        <td key={index4} className="p-1 text-center" style={{
                                                                            alignItems: 'center',
                                                                            verticalAlign: 'middle',
                                                                            width: `${cellSize}%`,
                                                                        }}>
                                                                            <div className="col-12 px-0">
                                                                                <span>{det ? det.PrecioUnitario : "--"}</span>
                                                                            </div>
                                                                            <label>{det ? det.Cantidad : 0}</label>
                                                                        </td>
                                                                    }
                                                                </>
                                                            )
                                                        })}
                                                        <td className="p-1 text-center font-weight-bold" style={{
                                                            alignItems: 'center',
                                                            verticalAlign: 'middle',
                                                            width: `${cellSize}%`,
                                                        }}>{TotalXProducto !== 0 ? TotalXProducto : color.CantidadXColor}</td>

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
                                TrasladoPedido.Firma === null ?
                                    <div style={{ width: '100%', height: '160px', }}></div> :
                                    <img src={TrasladoPedido.Firma} alt={"Firma"} data-holder-rendered="true" />
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
                                {TotalUnidad !== 0 ? TotalUnidad : TrasladoPedido.TotalUnidades}
                            </div>
                        </div>

                        <div className="row TotalRow">
                            <div className="col-5 labelTotal text-left">
                                Subtotal:
                            </div>

                            <div className="col-7 valueTotal">
                                {numberWithCommas(TrasladoPedido.SubTotalXPedido)}
                            </div>
                        </div>

                        <div className="row TotalRow">
                            <div className="col-5 labelTotal text-left">
                                Impuesto:
                            </div>

                            <div className="col-7 valueTotal">
                                {numberWithCommas((TrasladoPedido.Impuesto))}
                            </div>
                        </div>

                        <div className="row TotalRow">
                            <div className="col-5 labelTotal text-left">
                                Total:
                            </div>

                            <div className="col-7 valueTotal">
                                {moneda}{numberWithCommas((TrasladoPedido.TotalXPedido))}
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

        </>
    )
}

const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export default ImprimirRecolocacionPedido;