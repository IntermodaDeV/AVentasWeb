import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useSelector } from 'react-redux';
import Logo from 'assets/img/logo/LogoSinLetrasB.png';
import { FiArrowRightCircle, FiPlusCircle } from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import styles from "components/ListadoPedidos/ImprimirPedido.module.css";

export const ImprimirInventario = props => {
    const { Cliente, tableValue, ValoresPedido, Finalizar } = props;
    const componentRef = useRef();
    const empresas = useSelector(e => e.Empresas);
    const empresa = empresas.find(x => x.COMPANY_CODE === Cliente.EmpresaId);
    const gruposTalla = Object.keys(tableValue);

    const useStyles = makeStyles((theme) => ({
        button: {
            marginLeft: theme.spacing(2),
        },
    }));

    let TotalUnidades = 0;
    const classes = useStyles();

    let CantDist = 0;
    const getTableGroup = (productos, tallas, grupoTalla, index) => {
        let grupoTabla = { total: 0, tabla: null };
        grupoTabla.tabla = (
            <table className={'table table-responsive-xs'} style={{ marginBottom: '0' }} key={index}>
                <thead>
                    <tr style={{ backgroundColor: '#d9d9d9' }}>
                        <th className={"CodigoHeader"}>

                        </th>
                        {tallas.map((talla, index2) => {
                            return (
                                <>
                                    <th className={'text-center'} style={{ minWidth: 42 }} key={index}>
                                        {talla.Talla}
                                    </th>
                                </>
                            )
                        })}
                        <th>Cant</th>
                    </tr>
                </thead>
                {productos.map((codigoProducto, index1) => {
                    var producto = props.tableValue[grupoTalla].Productos[codigoProducto];
                    let result = getTableProduct(producto, index1, codigoProducto, tallas);
                    grupoTabla.total += result.total;
                    if (result.total !== 0) {
                        return result.tabla;
                    }

                    return false;
                })}
            </table>
        );
        return grupoTabla;
    }

    const getTableProduct = (producto, index1, codigoProducto, tallas) => {
        let productosTabla = { total: 0, tabla: null };
        let tallasIndividual = tallas.map(x => x.Talla);
        let ArregloProductos = Object.keys(producto.Colores).map((key) => (producto.Colores[key]));
        ArregloProductos.sort((a, b) => a.NombreColor < b.NombreColor ? -1 : 1);
        productosTabla.tabla = (
            <tbody key={index1}>
                <tr className="ColorRow">
                    <td colSpan={CantDist !== 0 ? CantDist : tallas.length + 3} className="codigoProducto font-weight-bold">
                        {codigoProducto} <span className="font-weight-normal pl-4">{producto.NombreProducto}</span>
                    </td>
                </tr>

                {ArregloProductos.map((codigoColor, index2) => {
                    var color = codigoColor;
                    var totalXColor = 0;
                    let result = getTableColor(color, totalXColor, index2, tallasIndividual);
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

    const getTableColor = (color, totalXColor, index2, tallas) => {

        let colorTabla = { total: 0, tabla: null };
        colorTabla.tabla = (
            <tr key={index2}>
                <td style={{
                    textAlign: 'center',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    //fontWeight: 600,
                }}>
                    {color.NombreColor}
                </td>
                {

                    tallas.map((codigoTalla, index3) => {
                        var valorTalla = color.Tallas[codigoTalla];
                        if (!valorTalla) {
                            return (
                                <td key={index3} style={{ textAlign: "center" }} >
                                    <div className="row">
                                        <div className="col-12 px-0">
                                            <span>--</span>
                                        </div>
                                        <div className="col-12 px-0">
                                            <span>0</span>
                                        </div>
                                    </div>
                                </td>
                            )
                        }

                        totalXColor = parseInt(totalXColor, 10) + (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                        colorTabla.total = totalXColor;
                        TotalUnidades += parseInt(valorTalla.Cantidad, 10);
                        return (
                            <>
                                {
                                    <td key={index3} style={{ textAlign: "center" }} >
                                        <div className="row">
                                            <div className="col-12 px-0" style={{ textAlign: 'center', alignItems: 'center', verticalAlign: 'middle' }}>
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
                }}>{totalXColor}</td>
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
                            <Button className={classes.button} variant="contained" size="large" color="primary" endIcon={<FaPrint />}>
                                Imprimir
                            </Button>
                        }
                        content={() => componentRef.current}
                    />
                    <Button onClick={Finalizar} variant="contained" className={classes.button} size="large" color="primary" endIcon={<FiPlusCircle />}>
                        Realizar nuevo inventario
                    </Button>
                    <Button onClick={Finalizar} variant="contained" className={classes.button} size="large" color="primary" endIcon={<FiArrowRightCircle />}>
                        Finalizar
                    </Button>
                </div>
                <hr />
            </div>
            <div id={"invoice-POS"} ref={componentRef} dividers={true} style={{ boxShadow: 'unset' }}>
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
                                <h2>{Cliente.Nombre}</h2>
                                <p>
                                    Dirección : {Cliente.Direccion}<br />
                                    Código    : {Cliente.Codigo}<br />
                                </p>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="info">
                                <h2>Inventario: {ValoresPedido.Correlativo}</h2>
                                <p>
                                    Asesor: {localStorage.getItem('asesor')}<br />
                                </p>
                            </div>
                        </div >
                    </div>

                </div>
                {
                    gruposTalla.map((grupoTalla, index) => {
                        const productos = Object.keys(props.tableValue[grupoTalla].Productos);
                        const tallas = props.tableValue[grupoTalla].ListaTallas;
                        let result = getTableGroup(productos, tallas, grupoTalla, index);
                        return result.tabla;
                    })
                }

                <div className="row" style={{ maxWidth: '50%', }}>
                    <div className="col-6">
                        <div className="row">
                            <div className="col-5 labelTotal text-right">
                                Unidades:
                            </div>

                            <div className="col-7 valueTotal">
                                {TotalUnidades}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}