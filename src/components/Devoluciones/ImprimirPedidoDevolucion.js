import React, { useRef } from 'react';
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import moment from "moment";
import ReactToPrint from 'react-to-print';
import { FiArrowRightCircle } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import { useSelector } from 'react-redux';
import Logo from 'assets/img/logo/LogoSinLetrasB.png';
import styles from "components/ListadoPedidos/ImprimirPedido.module.css";
import 'moment/locale/es';

export const ImprimirPedidoDevolucion = (props) => {
    const Monedas = useSelector(e => e.AbreviacionMonedas);
    const Empresas = useSelector(e => e.Empresas);
    const componentRef = useRef();

    const empresa = Empresas.find(x => x.COMPANY_CODE === props.Pedido.Cliente.EmpresaId.toUpperCase());
    const moneda = Monedas.find(e => e.IdMoneda === props.Pedido.Cliente.Moneda).Abreviacion;
    const NombreCliente = props.Pedido.Cliente.Nombre;
    const DireccionCliente = props.Pedido.Cliente.Direccion;

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

    return (
        <>
            <DialogTitle id="scroll-dialog-title">
                {(props.esDevolucion) ?
                    <div style={{ float: 'right' }}>
                        <ReactToPrint
                            trigger={() =>
                                <Button variant="contained" size="large" color="primary" endIcon={<FaPrint />}>
                                    Imprimir
                                </Button>
                            }
                            content={() => componentRef.current}
                        />

                        <Button onClick={props.hidePrint} variant="contained" size="large" color="primary" style={{ marginLeft: '10px' }} endIcon={<FiArrowRightCircle />}>
                            Finalizar
                        </Button>
                    </div>
                    : "Vista Previa Pedido"
                }
            </DialogTitle>
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
                                {(!props.esDevolucion) && "Copia"}
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
                                        Código    : {props.Pedido.Cliente.Codigo}<br />
                                    </p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="info">
                                    <h2>Devolución {props.Pedido.NumDevolucion}</h2>
                                    <p>
                                        Fecha Devolucion : {moment(props.Pedido.FechaCreacion).format('DD/MM/YYYY hh:mm a')}<br />
                                        Asesor: {props.Pedido.Usuario}<br />
                                        Motivo Devolución: {props.Pedido.MotivoDevolucionDetalle.CodigoMotivoDevolucion + " - " + props.Pedido.MotivoDevolucionDetalle.Descripcion }<br />
                                    </p>
                                </div>
                            </div >
                        </div>

                    </div>

                    {props.gruposXDetPed.map((grupoTalla, index1) => {
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
                            <h3 style={{ textAlign: 'center', fontWeight: 'bolder' }}>*No incluye impuesto</h3>
                        </div>

                        <div className="col-6">
                            <div className="row">
                                <div className="col-5 labelTotal text-left">
                                    Unidades:
                                </div>
                                <div className="col-7 valueTotal">
                                    {TotalUnidad !== 0 ? TotalUnidad : props.Pedido.TotalUnidades}
                                </div>
                            </div>

                            <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Total:
                                </div>

                                <div className="col-7 valueTotal">
                                    {moneda}  {numberWithCommas(props.Pedido.SubTotal)}
                                </div>
                            </div>

                            {/*<div className="row TotalRow">
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
                                    {moneda}{numberWithCommas((props.Pedido.TotalXPedido))}
                                </div>
                </div>*/}
                        </div>
                    </div>

                </div>
            </DialogContent >
            <DialogActions>
                {(!props.esDevolucion) && <>
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
                    </Button></>}
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