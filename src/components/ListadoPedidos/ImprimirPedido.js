import React from 'react';
import { DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";
import Logo from 'assets/img/logo/LogoSinLetrasB.png';
import ReactToPrint from 'react-to-print';
import styles from "components/ListadoPedidos/ImprimirPedido.module.css";
import moment from "moment";
import { useSelector } from 'react-redux';
import 'moment/locale/es';

const ImprimirPedido = (props) => {

    const Monedas = useSelector(e => e.AbreviacionMonedas);
    const clientesContado = useSelector(e => e.clientesContado);
    const empresas = useSelector(e => e.Empresas);
    let NombreCliente = props.Pedido.Cliente.Nombre;
    let DireccionCliente = props.Pedido.Cliente.Direccion;
    const clienteContado = clientesContado.find(x => x.id === props.Pedido.ClienteContadoId);
    const empresa = empresas.find(x => x.COMPANY_CODE === localStorage.getItem('EmpresaCliente').toUpperCase());
    const moneda = Monedas.find(e => e.IdMoneda === props.Pedido.Cliente.Moneda).Abreviacion;

    if (clienteContado !== null && clienteContado !== undefined) {
        if (props.Pedido.TotalXPedido < 10000) {
            NombreCliente = 'CONSUMIDOR FINAL';
        } else {
            NombreCliente = clienteContado.Nombre;
        }

        DireccionCliente = clienteContado.Direccion;
    }

    let TotalUnidad = 0;
    let GrupoTalla = "";
    const IsSame = (GrupoTallaId) => {
        let found = false;
        if (GrupoTalla === "") {
            GrupoTalla = GrupoTallaId;
        }
        else if (GrupoTalla === GrupoTallaId) {
            found = true;
        }
        return found;
    }
    const checkDist = (talla) => {
        let found = false;
        talla.Distribucion.map(() => {
            found = true;
            return false;
        })
        return found;
    }
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
                                        Código    : {props.Pedido.Cliente.Codigo}<br />
                                    </p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="info">
                                    <h2>Pedido {props.Pedido.PedidoId}</h2>
                                    <p>
                                        Fecha del pedido : {moment(props.Pedido.FechaActual).format('DD/MM/YYYY hh:mm a')}<br />
                                        Entrega Sugerida : {moment(props.Pedido.FechaEntrega).format('DD/MM/YYYY hh:mm a')}<br />
                                        Asesor: {props.Pedido.Usuario}<br />
                                        Modo Venta: {props.Pedido.ModoVenta}<br />
                                    </p>
                                </div>
                            </div >
                        </div>

                    </div>

                    {props.gruposXDetPed.map((grupoTalla, index1) => {
                        let cantidad = 3;
                        let IsDist = false;
                        let Same = false;
                        let CantDist = 0;
                        return (
                            <table className={'table table-bordered table-xl-responsive'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index1}>
                                <thead>
                                    <tr style={{ backgroundColor: '#d9d9d9' }}>
                                        <th>
                                        </th>
                                        {grupoTalla.ListaTalla.map((talla, index2) => {
                                            Same = IsSame(talla.GrupoTallaId);
                                            cantidad++;
                                            return (
                                                <>
                                                    {
                                                        talla.Distribucion.length !== 0 && Same === false &&
                                                        talla.Distribucion.map((dist, index3) => {
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
                                                    let count = 0;
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
                                                                count++
                                                                IsDist = det !== null ? checkDist(det.TallaObject) : IsDist;
                                                                return (
                                                                    <>
                                                                        {
                                                                            IsDist === true && det !== null &&
                                                                            det.TallaObject.Distribucion.map((dist, index) => {
                                                                                CantDist = parseInt(dist.NombreDistribucion.substr(11, 2));
                                                                                //CantDist += parseInt(dist.Cantidad)
                                                                                TotalXTalla = dist.Cantidad * det.Cantidad;
                                                                                TotalXProducto += TotalXTalla;
                                                                                TotalUnidad += TotalXTalla;
                                                                                let cant = 0;
                                                                                if (color.DetallesXPedido.length === 1) {
                                                                                    totalcant = dist.Cantidad * det.Cantidad;
                                                                                }
                                                                                else {
                                                                                    if (count === 1) {
                                                                                        arreglo.push({ NombreTalla: dist.NombreTalla, cant: dist.Cantidad * det.Cantidad });
                                                                                        return false;
                                                                                    }
                                                                                    else {
                                                                                        const tallitas = arreglo.filter(x => x.NombreTalla === dist.NombreTalla);
                                                                                        cant = dist.Cantidad * det.Cantidad;
                                                                                        totalcant = tallitas[0].cant + cant;
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
                                    {TotalUnidad !== 0 ? TotalUnidad : props.Pedido.TotalUnidades}
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

                            {(props.Pedido.Flete > 0 && props.Pedido.Flete !== null) && <div className="row TotalRow">
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
                                    {moneda}{numberWithCommas((props.Pedido.TotalXPedido))}
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