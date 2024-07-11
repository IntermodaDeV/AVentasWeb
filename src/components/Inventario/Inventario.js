import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { ExpandableInventario } from './ExpandableInventario';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { Loading } from 'components/Global/Loading';
import { mostrarModal } from 'utils/common';
import { useHistory } from 'react-router';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumenExpandable.module.css';
import { FiAlertTriangle } from 'react-icons/fi';

export const TomarInventario = (props) => {
    const history = useHistory();
    let tableValue = useSelector(e => e.Inventario.TableValue);
    let nuevosProductos = { ...tableValue };
    let anterior = useSelector(e => e.Anterior);
    let detalleInventario = useSelector(e => e.DetalleInventario);
    const dispatch = useDispatch();
    const clienteSelected = useSelector(e => e.ClienteInventario);
    const [codigo, setCodigo] = useState("");
    const [color, setColor] = useState("");
    const [codigoBarra, setCodigoBarra] = useState("");
    const [tallaTxt, setTalla] = useState("");
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    let totalUnid = 0;
    let productosSinCantidad = false;

    const existeVariante = (pCodigo, pColor, pTalla) => {
        const grupoTallas = Object.keys(tableValue);
        for (let grupoTalla of grupoTallas) {
            if (tableValue[grupoTalla]) {
                if (tableValue[grupoTalla].Productos[pCodigo]) {
                    if (tableValue[grupoTalla].Productos[pCodigo].Colores[pColor]) {
                        if (tableValue[grupoTalla].Productos[pCodigo].Colores[pColor].Tallas[pTalla]) {
                            return grupoTalla;
                        }
                    }
                }
            }
        }
        return null;
    }

    const aumentarCantidad = (grupoTalla, pCodigo, pColor, pTalla) => {
        let miTableValue = { ...tableValue };
        miTableValue[grupoTalla].Productos[pCodigo].Colores[pColor].Tallas[pTalla].Cantidad++;
        dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: miTableValue });
    }

    const añadir = async () => {
        try {
            if (codigo === "" || color === "" || tallaTxt === "") {
                mostrarModal("Advertencia", "Debe ingresar codigo, color y talla.", "warning");
                return;
            }

            const grupoTalla = existeVariante(codigo, color, tallaTxt);
            if (grupoTalla) {
                aumentarCantidad(grupoTalla, codigo, color, tallaTxt);
                return;
            }
            setOpen(true);
            setTitle("Obteniendo producto");
            const data = await axios.get(`${APIURL}/api/productoInventario/${clienteSelected.EmpresaId}/${codigo}/${color}`)
            agregarProducto(data.data, tallaTxt, color, 0, false);
            setOpen(false);
        } catch (err) {
            setOpen(false);
            mostrarModal("Error", "No se pudo obtener el producto.", "error");
        }
    }

    const limpiarCampos = () => {
        setCodigo("");
        setColor("");
        setTalla("");
        setCodigoBarra("");
    }

    const actualizarProducto = (productos, codigoProducto, grupoTalla, factura) => {
        let miTableValue = { ...tableValue };
        localStorage.setItem("TableValueOriginal", JSON.stringify(miTableValue));
        const noExistenProductosEnFactura = productos.length === 0;
        let tableValueOriginal = JSON.parse(localStorage.getItem("TableValueOriginal"));

        if (noExistenProductosEnFactura) {
            if (miTableValue[grupoTalla]["Productos"][codigoProducto].Factura) {
                delete miTableValue[grupoTalla]["Productos"][codigoProducto].Factura
            }
            dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: miTableValue });
            return;
        }

        miTableValue[grupoTalla]["Productos"][codigoProducto].Factura = factura;
        miTableValue[grupoTalla]["Productos"][codigoProducto].Id = productos[0].IdProducto;
        const colores = productos.map(c => c.CodigoColor);
        const coloresUnicos = [...new Set(colores)];

        for (let color of coloresUnicos) {
            const noExisteColorProducto = !miTableValue[grupoTalla]["Productos"][codigoProducto].Colores[color];

            if (noExisteColorProducto) {
                continue;
            }

            const productosColor = productos.filter(p => p.CodigoColor === color);
            for (let producto of productosColor) {
                const noExisteTallaProducto = !miTableValue[grupoTalla]["Productos"][codigoProducto].Colores[color].Tallas[producto.CodigoTalla.toUpperCase()];

                if (noExisteTallaProducto) {
                    continue;
                }

                let nuevaCantidad = 0;
                let cantidadPrevia = tableValueOriginal[grupoTalla]["Productos"][codigoProducto].Colores[producto.CodigoColor].Tallas[producto.CodigoTalla.toUpperCase()].Cantidad;

                if (cantidadPrevia > producto.Cantidad) {
                    nuevaCantidad = producto.Cantidad;
                } else {
                    nuevaCantidad = cantidadPrevia;
                }

                miTableValue[grupoTalla]["Productos"][codigoProducto].Colores[producto.CodigoColor].Tallas[producto.CodigoTalla.toUpperCase()].Cantidad = nuevaCantidad;
                miTableValue[grupoTalla]["Productos"][codigoProducto].Colores[producto.CodigoColor].Tallas[producto.CodigoTalla.toUpperCase()].Disponible = producto.Cantidad;
                miTableValue[grupoTalla]["Productos"][codigoProducto].Colores[producto.CodigoColor].Tallas[producto.CodigoTalla.toUpperCase()].Precio = producto.PrecioUnitario;
            }
        }

        localStorage.removeItem("TableValueOriginal");
        dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: miTableValue });
    }

    const agregarProducto = (producto, pTalla, pColor, pCantidad, invCompleto) => {
        let miTableValue = invCompleto ? nuevosProductos : { ...tableValue };
        if (miTableValue[producto.GrupoTalla] === undefined) {
            miTableValue[producto.GrupoTalla] = {};
        }

        if (Object.keys(miTableValue[producto.GrupoTalla]).length === 0) {
            miTableValue[producto.GrupoTalla] = {};
            miTableValue[producto.GrupoTalla].Productos = {};
            miTableValue[producto.GrupoTalla].ListaTallas = producto.ListaTalla;
        }

        producto.ProductoId = `${producto.ProductoId}-${pColor}`;
        if (miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId] === undefined) {
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId] = {};
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores = {};
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Id = producto.CodigoProducto;
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].ListaTallas = producto.ListaTalla
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].NombreProducto = producto.NombreProducto;

            for (const color of producto.ListaColores) {
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}

                for (const talla of producto.ListaTalla) {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = 0;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = invCompleto && talla.Talla === pTalla.toUpperCase() ? pCantidad : talla.Talla === pTalla.toUpperCase() ? 1 : 0;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Marcado = talla.Talla === pTalla.toUpperCase();
                }
            }

        } else {
            for (const color of producto.ListaColores) {
                if (miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor]) {
                    for (const talla of producto.ListaTalla) {
                        if (miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Marcado) {
                            continue;
                        }
                        let cantidadTalla = miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad;
                        if (cantidadTalla === 0) {
                            cantidadTalla = talla.Talla === pTalla.toUpperCase() ? 1 : 0;
                        }

                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = invCompleto && talla.Talla === pTalla.toUpperCase() ? pCantidad : cantidadTalla;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Marcado = talla.Talla === pTalla.toUpperCase();
                    };
                } else {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}

                    for (const talla of producto.ListaTalla) {
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = invCompleto && talla.Talla === pTalla.toUpperCase() ? pCantidad : talla.Talla === pTalla.toUpperCase() ? 1 : 0;;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Marcado = talla.Talla === pTalla.toUpperCase();
                    }
                }
            }
        }
        dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: miTableValue });

        if (!invCompleto) {
            limpiarCampos();
        }
    }

    const eliminarProducto = (grupoTalla, codigoProducto) => {
        let nuevoTableValue = { ...tableValue };
        const productosAgregados = JSON.parse(localStorage.getItem("productosAgregados")) || [];

        delete nuevoTableValue[grupoTalla]["Productos"][codigoProducto];

        let nuevosProductos = productosAgregados.filter(x => x.codigo !== codigoProducto);
        localStorage.setItem("productosAgregados", JSON.stringify(nuevosProductos));

        if (Object.keys(nuevoTableValue[grupoTalla]["Productos"]).length === 0) {
            delete nuevoTableValue[grupoTalla];
        }

        dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: nuevoTableValue });
    }

    const eliminarColor = (grupoTalla, codigoProducto, color) => {
        let nuevoTableValue = { ...tableValue };
        const productosAgregados = JSON.parse(localStorage.getItem("productosAgregados")) || [];

        delete nuevoTableValue[grupoTalla]["Productos"][codigoProducto]["Colores"][color];

        let nuevosProductos = productosAgregados.filter(x => x.codigo !== codigoProducto && x.color !== color);
        localStorage.setItem("productosAgregados", JSON.stringify(nuevosProductos));

        if (Object.keys(nuevoTableValue[grupoTalla]["Productos"][codigoProducto]["Colores"]).length === 0) {
            delete nuevoTableValue[grupoTalla]["Productos"][codigoProducto];

            nuevosProductos = nuevosProductos.filter(x => x.codigo !== codigoProducto);
            localStorage.setItem("productosAgregados", JSON.stringify(nuevosProductos));
        }

        if (Object.keys(nuevoTableValue[grupoTalla]["Productos"]).length === 0) {
            delete nuevoTableValue[grupoTalla];
        }

        dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: nuevoTableValue });
    }

    const ingresoCantidad = (text, codigoProducto, codigoColor, grupoTalla, codigoTalla) => {
        let nuevoTableValue = { ...tableValue };
        const valor = (text.target.validity.valid) ? text.target.value : nuevoTableValue[grupoTalla].Productos[codigoProducto].Colores[codigoColor].Tallas[codigoTalla].Cantidad;
        let valorPrevio = tableValue[grupoTalla].Productos[codigoProducto].Colores[codigoColor].Tallas[codigoTalla];
        valorPrevio.Cantidad = valor;
        dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: nuevoTableValue });
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

    const añadirScanner = async (pCodigo, pColor, pTalla, productosAgregados) => {
        const data = await axios.get(`${APIURL}/api/productoInventario/${clienteSelected.EmpresaId}/${pCodigo}/${pColor}`)
        productosAgregados.push({ codigoBarra, codigo: pCodigo, color: pColor, talla: pTalla, grupoTalla: data.data.GrupoTalla });
        localStorage.setItem("productosAgregados", JSON.stringify(productosAgregados));
        agregarProducto(data.data, pTalla, pColor, 0, false);
    }

    const obtenerAtributosBarra = async (e) => {
        if (e.key === "Enter") {
            const productosAgregados = JSON.parse(localStorage.getItem("productosAgregados")) || [];
            const productoExiste = productosAgregados.find(x => x.codigoBarra === codigoBarra);

            if (productoExiste) {
                aumentarCantidad(productoExiste.grupoTalla, `${productoExiste.codigo}-${productoExiste.color}`, productoExiste.color, productoExiste.talla);
                limpiarCampos();
            } else {
                try {
                    setTitle("Obteniendo atributos producto");
                    setOpen(true);
                    const data = await axios.get(`${APIURL}/api/productodevolucion/codigobarra/${codigoBarra}`)

                    añadirScanner(data.data.productoId, data.data.colorId, data.data.tallaId, productosAgregados);
                    setOpen(false);
                } catch (err) {
                    setOpen(false);
                    mostrarModal("Codigo barra", "No se encontro producto con el codigo de barra ingresado", "error");
                }
            }
        }
    }

    useEffect(() => {
        dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: {} });
        if (anterior) {
            cargarInventario();
        }
        else {
            obtenerUltimoCorrelativo();
        }
    }, []);

    const obtenerUltimoCorrelativo = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Inventario/correlativo/${localStorage.getItem('empresa')}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            localStorage.setItem("CorrelativoInventario", request.data)
        }
        catch (error) {
            console.log(error);
        }
    }

    const cargarInventario = async () => {
        try {
            setOpen(true);
            setTitle("Obteniendo producto");
            for (const inv of detalleInventario) {
                const grupoTalla = existeVariante(inv.CodigoProducto, inv.codigoColor, inv.codigoTalla);
                if (grupoTalla) {
                    aumentarCantidad(grupoTalla, inv.CodigoProducto, inv.codigoColor, inv.codigoTalla);
                    continue;
                }
                const { data } = await axios.get(`${APIURL}/api/productoInventario/${clienteSelected.EmpresaId}/${inv.CodigoProducto}/${inv.codigoColor}`);
                agregarProducto(data, inv.codigoTalla, inv.codigoColor, inv.cantidad, true);
            }
            setOpen(false);
        } catch (error) {
            console.log(error);
        }
    };

    const construirDetalleInventario = () => {
        let detalleInventario = [];
        for (let grupoTalla of Object.keys(tableValue)) {
            for (let producto of Object.keys(tableValue[grupoTalla].Productos)) {
                for (let color of Object.keys(tableValue[grupoTalla].Productos[producto].Colores)) {
                    for (let talla of Object.keys(tableValue[grupoTalla].Productos[producto].Colores[color].Tallas)) {
                        let cantidad = tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Cantidad;
                        if (cantidad > 0) {
                            let productoDevolver = {
                                IdProducto: tableValue[grupoTalla].Productos[producto].Id,
                                CodigoProducto: producto,
                                CodigoColor: color,
                                Cantidad: cantidad,
                                CodigoTalla: talla,
                            }
                            detalleInventario.push(productoDevolver);
                        }
                    }
                }
            }
        }
        return [detalleInventario];
    }

    const enviarInventario = async (completo) => {
        let inventario = {
            CodigoCliente: clienteSelected.Codigo,
            Correlativo: detalleInventario.length > 0 ? detalleInventario[0].numInventario : localStorage.getItem("CorrelativoInventario"),
            Empresa: localStorage.getItem('empresa'),
            Completo: completo,
            DetalleInventario: [],
        };;
        const [detalle] = construirDetalleInventario();

        if (detalle.length === 0) {
            mostrarModal("Aviso", "No se puede crear el inventario ya que no se ha ingresado ningun producto.", "warning");
            return;
        }
        inventario.DetalleInventario = detalle;
        try {
            setTitle("Guardando Inventario");
            setOpen(true);
            await axios.post(`${APIURL}/api/Inventario`, inventario, {
                headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token')
                }
            });
            mostrarModal("Inventario", "Se ha guardado el inventario con exito", "success");
            history.push({ pathname: "/inventario/ImprimirInventario", state: JSON.stringify(inventario) });
            setOpen(false);
        } catch (err) {
            mostrarModal("Error", "No se pudo guardar el inventario.", "error");
            setOpen(false);
        }
    }

    const btnFinalizar = () => {
        enviarInventario(true);
    }

    const btnGuardar = () => {
        enviarInventario(false);
    }

    return (
        <>
            <Loading open={open} title={title} />
            <Card style={{ margin: '15px', minHeight: '70vh' }}>
                <CardContent>
                    <hr />
                    <h5>Agregar producto</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <input type="text" className="mr-5 form-control" placeholder="Codigo Producto" value={codigo} onChange={(e) => { setCodigo(e.target.value) }} />
                        <input type="text" className="mr-5 form-control" placeholder="Codigo Color" value={color} onChange={(e) => { setColor(e.target.value) }} />
                        <input type="text" className="mr-5 form-control" placeholder="Talla" value={tallaTxt} onChange={(e) => { setTalla(e.target.value) }} />
                        <input type="text" className="mr-5 form-control" placeholder="Codigo Barra" value={codigoBarra} onChange={(e) => { setCodigoBarra(e.target.value) }} onKeyPress={obtenerAtributosBarra} />
                        <button className="btn btn-success" onClick={añadir}>Añadir</button>
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
                                        let productoConCantidad = false;
                                        let { totalCantidad } = obtenerTotales(producto);
                                        totalUnid += totalCantidad;
                                        Object.keys(producto.Colores).forEach((codigoColor) => {
                                            let color = producto.Colores[codigoColor];
                                            var totalXColor = 0;

                                            Object.keys(color.Tallas).forEach((codigoTalla) => {
                                                let valorTalla = color.Tallas[codigoTalla];
                                                let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                                                let totalXTalla = cantidadXTalla * valorTalla.Precio;
                                                totalXColor = parseInt(totalXColor, 10) + totalXTalla;
                                                productoConCantidad = productoConCantidad || (cantidadXTalla > 0);
                                            });
                                        });
                                        productosSinCantidad = productosSinCantidad || (!productoConCantidad);
                                        return (
                                            <ExpandableInventario
                                                key={codigoProducto}
                                                grupoTalla={grupoTalla}
                                                producto={producto}
                                                codigoProducto={codigoProducto}
                                                tallas={tallas}
                                                totalCantidad={totalCantidad}
                                                eliminarProducto={eliminarProducto}
                                                eliminarColor={eliminarColor}
                                                ingresoCantidad={ingresoCantidad}
                                                actualizarProducto={actualizarProducto}
                                            />
                                        )
                                    })
                                })}
                            </form>
                            <div className={`row text-center ${styles['barra']}`} >
                                <div className={`col ${styles['barraInner']}`}>
                                    Total de Unidades: {numberWithCommasNoDec(totalUnid)}
                                </div>
                                <div >
                                    <button onClick={btnFinalizar} className="btn btn-secondary m-2" style={{ float: 'right', margin: '2em' }}>Finalizar inventario</button>
                                    <button onClick={btnGuardar} className="btn btn-secondary m-2" style={{ float: 'right', margin: '2em' }}>Guardar</button>
                                </div>
                            </div>
                        </>
                    }
                </CardContent>
            </Card>
        </>
    );
}

const numberWithCommasNoDec = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

