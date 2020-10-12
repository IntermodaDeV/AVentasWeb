import React from 'react';
import {Button } from '@material-ui/core';
import ReactToPrint from 'react-to-print';
import Logo from 'assets/img/logo/Logoinv.png';
import moment from "moment";
import 'moment/locale/es';
import {useSelector} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {FiArrowRightCircle,FiPlusCircle } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";

const ImprimirPedidoOriginal = (props) => {
    const clientesContado = useSelector(e=>e.clientesContado);
    const Monedas = useSelector(e=>e.AbreviacionMonedas);
    const pedidoSelected = useSelector(k => k.pedidoSelected);
    const empresas = useSelector(e=>e.Empresas);
    const TipoCredito = useSelector(e => e.TipoPedido);
    const modoVenta = TipoCredito.TipoPedido === 'Contado' ? 'Contado' : 'Credito';
    const empresa = empresas.find(x=>x.COMPANY_CODE === localStorage.getItem('empresa').toUpperCase());
    const clienteContado = pedidoSelected !== null && pedidoSelected !== undefined ? clientesContado.find(x=>x.id=== pedidoSelected.ClienteContado) : null;
    const moneda = Monedas.find(e=>e.IdMoneda===props.Cliente.Moneda).Abreviacion;
    const impuesto = Number(localStorage.getItem('Impuesto'));
    var nuevafecha = new Date();
    var fecha = moment(nuevafecha).toDate();
    var gruposTalla = Object.keys(props.tableValue);
    const componentRef = React.useRef();
    const useStyles = makeStyles((theme) => ({
        button: {
          marginLeft: theme.spacing(2),
        },
      }));
    const classes = useStyles();

    let GrupoTalla = "";
    let TotalUnidad = 0;
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
    let CantDist = 0;
    const getTableGroup = (productos, tallas, grupoTalla, index) => {
        let grupoTabla = { total: 0, tabla: null };
        let Same = false;
        grupoTabla.tabla = (
            <table className={'table table-responsive-xs'} style={{ marginBottom: '0' }} key={index}>
                <thead>
                    <tr style={{ backgroundColor: '#d9d9d9' }}>
                        <th className={"CodigoHeader"}>

                        </th>
                        {tallas.map((talla, index) => {
                            Same = IsSame(talla.GrupoTallaId);
                            return (
                                <>
                                    {
                                        talla.Distribucion.length !== 0 && Same === false &&
                                        talla.Distribucion.map((dist, index3) => {
                                            CantDist += parseInt(dist.Cantidad)
                                            return (
                                                <th key={index}>
                                                    {
                                                        <div key={index3}>{dist.NombreTalla}</div>
                                                    }
                                                </th>
                                            )
                                        })
                                    }
                                    {
                                        talla.Distribucion.length === 0 &&
                                        <th className={'text-center'} style={{ minWidth: 42 }} key={index}>
                                            {talla.Talla}
                                        </th>
                                    }
                                </>
                            )
                        })}
                        <th>Cant</th>
                        <th>Total</th>
                    </tr>
                </thead>
                {productos.map((codigoProducto, index1) => {
                    var producto = props.tableValue[grupoTalla].Productos[codigoProducto];
                    var precio = producto.Precio.find(precioxProd => {
                        return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
                    });

                    if (precio === undefined) {
                        precio = {
                            Precio: 0
                        }
                    }
                    if (producto.Selected) {
                        let result = getTableProduct(producto, index1, codigoProducto, tallas, precio);
                        grupoTabla.total += result.total;
                        if (result.total !== 0) {
                            return result.tabla;
                        }
                    }
                    return false;
                })}
            </table>
        );
        return grupoTabla;
    }

    const getTableProduct = (producto, index1, codigoProducto, tallas, precio) => {
        let productosTabla = { total: 0, tabla: null };

        let ArregloProductos = Object.keys(producto.Colores).map((key) => (producto.Colores[key]));
        ArregloProductos.sort((a, b) => a.NombreColor < b.NombreColor ? -1 : 1);
        productosTabla.tabla = (
            <tbody key={index1}>
                <tr className="ColorRow">
                    {/* <td className="codigoProducto font-weight-bold">{codigoProducto}</td>
                    <td colSpan={tallas.length + 2}>
                        {producto.NombreProducto}
                    </td> */}
                    <td colSpan={tallas.length + 3} className="codigoProducto font-weight-bold">
                        {codigoProducto} <span className="font-weight-normal pl-4">{producto.NombreProducto}</span>
                    </td>
                </tr>

                {ArregloProductos.map((codigoColor, index2) => {
                    var color = codigoColor;
                    var totalXColor = 0;

                    let result = getTableColor(color, totalXColor, index2, precio);
                    productosTabla.total += result.total;
                    if (result.total !== 0) {
                        return result.tabla;
                    }
                    return null;
                })}
            </tbody>
        );
        return productosTabla;
    }
   
    const getTableColor = (color, totalXColor, index2, precio) => {
        let colorTabla = { total: 0, tabla: null };
        let Count = 0;
        let arreglo = [];
        let totalcantidad = 0;
        let PrecioDistribucion = 0;
        let TotalXProdDist = 0;
        colorTabla.tabla = (
            <tr key={index2}>
                <td style={{
                    textAlign: 'center',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    //fontWeight: 600,
                }}>
                    <div className="col-12 px-0">
                        <span>{"Precio"}</span>
                    </div>
                    {color.NombreColor}
                </td>
                {

                    Object.keys(color.Tallas).map((codigoTalla, index3) => {
                        Count++;
                        var valorTalla = color.Tallas[codigoTalla];
                        var tallas = Object.keys(color.Tallas).length;
                        let TotalXTalla = 0;
                        //var backOrder = (valorTalla.Cantidad > valorTalla.Disponible) ? (valorTalla.Cantidad - valorTalla.Disponible) : 0;
                        totalXColor = parseInt(totalXColor, 10) + (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                        colorTabla.total = totalXColor;
                        return (
                            <>
                                {
                                    valorTalla.Distribucion.length !== 0 &&
                                    valorTalla.Distribucion.map((dist, index4) => {
                                        TotalXTalla = dist.Cantidad * valorTalla.Cantidad;
                                        TotalXProdDist += TotalXTalla;
                                        TotalUnidad += TotalXTalla;
                                        let cant = 0;
                                        if (tallas === 1) {
                                            totalcantidad = dist.Cantidad * valorTalla.Cantidad;
                                            PrecioDistribucion = valorTalla.Precio / CantDist
                                        }
                                        else {
                                            if (Count === 1) {
                                                arreglo.push({ NombreTalla: dist.NombreTalla, cant: dist.Cantidad * valorTalla.Cantidad });
                                                PrecioDistribucion = PrecioDistribucion === 0 ? valorTalla.Precio / CantDist : valorTalla.Precio / CantDist;

                                                return false;
                                            }
                                            else {
                                                const listaTallas = arreglo.filter(x => x.NombreTalla === dist.NombreTalla);
                                                cant = dist.Cantidad * valorTalla.Cantidad
                                                totalcantidad = listaTallas[0].cant + cant;
                                            }
                                        }

                                        return (
                                            <td key={index4} style={{ textAlign: "center" }}>
                                                <div className="row">
                                                    <div className="col-12 px-0">
                                                        <span>{PrecioDistribucion}</span>
                                                    </div>
                                                    <div className="col-12 px-0">
                                                        <span>{totalcantidad}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        )
                                    })
                                }
                                {
                                    valorTalla.Distribucion.length === 0 &&
                                    <td key={index3} style={{ textAlign: "center" }} >
                                        <div className="row">
                                            <div className="col-12 px-0">
                                                <span>{valorTalla.Precio}</span>
                                            </div>
                                            <div className="col-12 px-0">
                                                <span>{valorTalla.Cantidad !== "" ? valorTalla.Cantidad : 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                }

                            </>
                        )
                    })
                }
                <td style={{
                    textAlign: 'center',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 600,
                }}>{TotalXProdDist !== 0 ? TotalXProdDist : totalXColor}</td>

                <td style={{
                    textAlign: 'right',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 600,
                }}>{numberWithCommas(precio.Precio * parseInt(TotalXProdDist !== 0 ? TotalXProdDist : totalXColor, 10))}</td>
            </tr>
        )
        return colorTabla;
    }
   return (
    <div className="col">
             <div className="text-right">
                <div className="col">
                    <ReactToPrint
                        trigger={() =>
                            <Button  className = {classes.button} variant="contained" size="large" color="primary" endIcon = {<FaPrint/>}>
                                Imprimir
                            </Button>
                        }
                        content={() => componentRef.current}
                    />
                    <Button onClick={() => props.reiniciarPedido()} variant="contained" className = {classes.button}  size="large" color="primary" endIcon ={<FiPlusCircle/>}>
                        Realizar Pedido Nuevo
                    </Button>
                    <Button onClick={() => props.cancelarPedido()} variant="contained" className = {classes.button}  size="large" color="primary" endIcon ={<FiArrowRightCircle/>}>
                        Finalizar
                    </Button>
                    </div>
                <hr />
            </div>
        <div id={"invoice-POS"}  ref={componentRef}  dividers={true}  style={{ boxShadow: 'unset' }}>

            <div id="top">
                <img alt={"Logo"} width={420} style={{ objectFit: 'contain' }} src={Logo} ></img>
                <div className="info">
                    <p>{empresa.FISCAL_DOCUMENT}: {empresa.NIFCIF}</p>
                </div>
            </div>

            <div id="mid">
                <div className="row">
                    <div className="col-6">
                        <div className="info">
                            <h2>{
                                (clienteContado !== null && clienteContado !== undefined) ? ((props.ValoresPedido.totalGlobal * 1.15) < 10000) ? 'Consumidor Final' : clienteContado.Nombre : props.Cliente.Nombre
                            }</h2>
                            <p>
                                Dirección : {(clienteContado !== null && clienteContado !== undefined) ? clienteContado.Direccion : props.Cliente.Direccion}<br />
                                Código    : {props.Cliente.Codigo}<br />
                            </p>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="info">
                            <h2>Pedido {props.NumeroOrden}</h2>
                            <p>
                                Fecha del pedido : {moment(fecha).format('DD/MM/YYYY hh:mm a')}<br />
                                Entrega Sugerida : {moment(props.ValoresPedido.FechaEntrega).format('DD/MM/YYYY hh:mm a')}<br />
                                Asesor: {localStorage.getItem('asesor')}<br />
                                Modo Venta: {modoVenta}<br />
                            </p>
                        </div>
                    </div >
                </div>

            </div>
            {
                gruposTalla.map((grupoTalla, index) => {

                    var productos = Object.keys(props.tableValue[grupoTalla].Productos);
                    var tallas = props.tableValue[grupoTalla].ListaTallas;
                    if (props.tableValue[grupoTalla].Mostrar) {
                        let result = getTableGroup(productos, tallas, grupoTalla, index);

                        if (result.total) {
                            return result.tabla;
                        }
                    }
                    return false;
                })
            }
          
            <div className="row" style={{ maxWidth: '100%' }}>

                <div className="col-6">
                    <div className="thanks">
                        {
                            props.ValoresPedido.firma === null ?
                                <div style={{ width: '100%', height: '160px', }}></div> :
                                <img src={props.ValoresPedido.firma} alt={"Firma"} data-holder-rendered="true" />
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
                            {TotalUnidad !== 0 ? TotalUnidad : props.ValoresPedido.unidadesTotales}
                        </div>
                    </div>

                    <div className="row TotalRow">
                        <div className="col-5 labelTotal text-left">
                            Subtotal:
                        </div>

                        <div className="col-7 valueTotal">
                        {moneda} {numberWithCommas(props.ValoresPedido.totalGlobal)}
                        </div>
                    </div>

                    {(props.ValoresPedido.flete > 0) && <div className="row TotalRow">
                        <div className="col-5 labelTotal text-left">
                            Flete:
                        </div>

                        <div className="col-7 valueTotal">
                            {numberWithCommas(props.ValoresPedido.flete)}
                        </div>
                    </div>}

                    <div className="row TotalRow">
                        <div className="col-5 labelTotal text-left">
                            Impuesto:
                        </div>

                        <div className="col-7 valueTotal">
                        {moneda} {numberWithCommas((impuesto))}
                        </div>
                    </div>

                    <div className="row TotalRow">
                        <div className="col-5 labelTotal text-left">
                            Total:
                        </div>

                        <div className="col-7 valueTotal">
                        {moneda} {numberWithCommas((props.ValoresPedido.totalGlobal + impuesto) + props.ValoresPedido.flete)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
     </div>
    )
}

const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export default ImprimirPedidoOriginal;