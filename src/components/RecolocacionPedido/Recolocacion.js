import React, { useState } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { mostrarModal } from 'utils/common';
import { Loading } from 'components/Global/Loading';
import { Dropdown } from "semantic-ui-react";
import { useSelector, useDispatch } from 'react-redux';
import { ExpandableRecolocacion } from './ExpandableRecolocacion';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumenExpandable.module.css';

export const Recolocacion = (props) => {
    const tiposPedido = useSelector(e => e.TiposPedido);
    const [rma, setRma] = useState("");
    const [tipoCredito, settipoCredito] = useState("");
    const [productos, setproductos] = useState([]);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");

    const dispatch = useDispatch();
    let unidadesTotales = 0;
    let totalCant = 0;
    let totalGlobal = 0.00;
    let impuesto = 0;
    let productosSinCantidad = false;
    const clienteImpuestos = useSelector(e => e.ClienteImpuestos);
    let tableValue = useSelector(e => e.TrasladoPedido.TableValue);
    const productoImpuestos = useSelector(e => e.ProductoImpuestos);
    const clienteSeleccionado = useSelector(e => e.TrasladoPedido.clienteSeleccionado);
    const clienteImpuesto = clienteImpuestos.find(x => x.GRUPO === clienteSeleccionado.GrupoImpuesto);
    let moneda = (clienteSeleccionado !== null) ? ((clienteSeleccionado.Moneda !== null && clienteSeleccionado.Moneda !== '') ? clienteSeleccionado.Moneda : 'L.') : 'L.';

    const numberWithCommasNoDec = (x) => {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    const numberWithCommas = (x) => {
        x = x.toFixed(2);
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    const obtenerProductoRma = async () => {
        try {
            if (rma != "") {
                setTitle("Obteniendo productos de la devolución");
                setOpen(true);
                setRma("RM-0023971")
                const grupoPrecio = clienteSeleccionado.GrupoPrecio;
                const data = await axios.get(`${APIURL}/api/trasladopedido/obtenerproductos/${rma}/${clienteSeleccionado.EmpresaId}`);
                let codigoProductos = [...new Set(data.data.productos.map(x => x.codigoProducto))];
                let productosResult = [];
                const total = 0;
                for (let codigo of codigoProductos) {
                    let products = data.data.productos.filter(x => x.codigoProducto === codigo);
                    let colores = [...new Set(products.map(x => x.color))];
                    let tallas = [...new Set(products.map(x => x.talla))];
                    let nuevosProductos = await axios.get(`${APIURL}/api/trasladopedido/getProducto/${codigo}/${grupoPrecio}/${data.data.coleccionId}`, { params: { colores, tallas } });
                    productosResult.push(nuevosProductos.data)
                }

                agregarDevolucionCompleta(productosResult, data.data);
                debugger
                setOpen(false);
            }
            else {
                mostrarModal('Recolocación', 'Debe llenar el campo del RMA para poder realizar esta acción.', "error");
            }
        } catch {
            setproductos([]);
        }
    }

    const dataTipoCredito = () => {
        return tiposPedido.filter(x => x.Aplica_Todos).map(tipoPedido => ({ key: tipoPedido.TipoPedido, value: tipoPedido.TipoPedido, text: tipoPedido.TipoPedido }));
    }

    const agregarDevolucionCompleta = (productos, productosAPI) => {
        let miTableValue = {};

        const productosDevolver = productosAPI.productos;
        for (const producto of productos) {

            const productoDevolver = productosDevolver.filter(x => x.codigoProducto === producto.ProductoId);

            if (miTableValue[producto.GrupoTalla] === undefined) {
                miTableValue[producto.GrupoTalla] = {};
            }

            if (Object.keys(miTableValue[producto.GrupoTalla]).length === 0) {
                miTableValue[producto.GrupoTalla] = {};
                miTableValue[producto.GrupoTalla].Productos = {};
                miTableValue[producto.GrupoTalla].ListaTallas = producto.ListaTalla;
            }

            if (miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId] === undefined) {
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId] = {};
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Id = producto.CodigoProducto;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores = {};
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].ListaTallas = producto.ListaTalla
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].NombreProducto = producto.NombreProducto;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].GrupoImpuesto = producto.GrupoImpuesto;
                debugger;
                for (const color of producto.ListaColores) {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}

                    for (const talla of producto.ListaTalla) {
                        let precio = 15;
                        const productoValores = productoDevolver.find(x => x.color === color.CodigoColor && x.talla.toUpperCase() === talla.Talla);

                        if (producto.fisicaDisponible.length !== 0) {
                            if (productoValores) {
                                const fisicoDisponible = producto.fisicaDisponible.find(x => x.IdTalla.toUpperCase() === productoValores.talla.toUpperCase() && productoValores.color.toUpperCase() === x.CodigoColor.toUpperCase());
                                if (fisicoDisponible) {

                                }
                            }

                        }

                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = productoValores ? productoValores.cantidad : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = productoValores ? productoValores.cantidad : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Precio = precio;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].PrecioGeneral = precio;
                        //miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Marcado = true;
                    }
                }
            }
        }

        dispatch({ type: "SET_TABLEVALUERECOLOCACION", payload: miTableValue });
    }

    const obtenerTotales = producto => {
        let totales = { totalCantidad: 0 };

        Object.keys(producto.Colores).forEach((codigoColor) => {
            let color = producto.Colores[codigoColor];
            var totalXColor = 0;

            Object.keys(color.Tallas).forEach((codigoTalla) => {
                var valorTalla = color.Tallas[codigoTalla];
                totalXColor = parseInt(totalXColor, 10) + (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
            })
            totales.totalCantidad += totalXColor;
        })

        return totales;
    }

    return (
        <>
            <Loading open={open} title={title} />
            <Card className="my-2" style={{ overflow: 'unset', margin: '15px' }}>
                <CardContent>
                    <div>
                        <h3 style={{ marginLeft: 30 }}>Recolocación de devolución</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', marginTop: 40 }}>
                            <div style={{ display: 'flex', width: '80%', marginLeft: 30 }}>
                                <input type="text" className="mr-5 form-control" placeholder="RMA Devolución" onChange={(e) => { setRma(e.target.value) }} />
                            </div>
                            <hr />
                            <div style={{ display: 'flex', width: '40%', marginRight: 30 }}>
                                <Dropdown
                                    placeholder="Seleccione Cliente"
                                    fluid
                                    search
                                    selection
                                    onChange={(e, { value }) => { settipoCredito(value) }}
                                    options={dataTipoCredito()}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 999 }}
                                    multiple={false}
                                />
                            </div>

                            <button className="btn btn-success" onClick={obtenerProductoRma}>Registrar</button>
                        </div>
                    </div>
                    {(Object.keys(tableValue).length > 0) &&
                        <>
                            <hr />
                            <form>
                                {Object.keys(tableValue).map((grupoTalla, index) => {
                                    let productos = Object.keys(tableValue[grupoTalla].Productos);
                                    return productos.map((codigoProducto, index1) => {
                                        let producto = tableValue[grupoTalla].Productos[codigoProducto];
                                        let tallas = tableValue[grupoTalla].Productos[codigoProducto].ListaTallas;
                                        const productoImpuesto = productoImpuestos.find(x => x.GRUPO === producto.GrupoImpuesto).IMPUESTO;
                                        let productoConCantidad = false;
                                        let { totalCantidad } = obtenerTotales(producto);
                                        totalCant += totalCantidad;

                                        Object.keys(producto.Colores).forEach((codigoColor) => {
                                            let color = producto.Colores[codigoColor];
                                            Object.keys(color.Tallas).forEach((codigoTalla) => {
                                                let valorTalla = color.Tallas[codigoTalla];
                                                let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                                                productoConCantidad = productoConCantidad || (cantidadXTalla > 0);
                                                unidadesTotales = parseInt(unidadesTotales, 10) + cantidadXTalla;
                                                totalGlobal = (1 * cantidadXTalla) + totalGlobal;

                                                if (clienteImpuesto.IMPUESTO !== 0) {
                                                    impuesto = ((1 * cantidadXTalla) * productoImpuesto) + impuesto;
                                                    localStorage.setItem('Impuesto', impuesto);
                                                }
                                            });
                                        });

                                        productosSinCantidad = productosSinCantidad || (!productoConCantidad);

                                        return (
                                            <ExpandableRecolocacion
                                                key={codigoProducto}
                                                grupoTalla={grupoTalla}
                                                producto={producto}
                                                codigoProducto={codigoProducto}
                                                tallas={tallas}
                                                totalCantidad={totalCantidad}
                                            />
                                        )

                                    })
                                })}
                            </form>
                            <div className={`row text-center ${styles['barra']}`} >
                                <div className={`col ${styles['barraInner']}`}>
                                    Unidades: {numberWithCommasNoDec(totalCant)}
                                </div>
                                <div className={`col ${styles['barraInner']}`}>
                                    Subtotal: {moneda} {numberWithCommas(totalGlobal)}
                                </div>
                                <div className={`col ${styles['barraInner']}`}>
                                    ISV: {moneda} {numberWithCommas(impuesto)}
                                </div>
                                <div className={`col ${styles['barraInner']}`}>
                                    Total: {moneda} {numberWithCommas(totalGlobal + impuesto)}
                                </div>
                                <div >
                                    <button /*onClick={finalizarDevolucion}*/ className="btn btn-secondary m-2" style={{ float: 'right', margin: '2em' }}>Finalizar recolocación</button>
                                </div>
                            </div>
                        </>
                    }
                </CardContent>
            </Card>
        </>
    );
}