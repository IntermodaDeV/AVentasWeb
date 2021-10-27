import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import { Dropdown } from "semantic-ui-react";
import { useSelector, useDispatch } from 'react-redux';
import { ExpandableDevolucion } from './ExpandableDevolucion';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { Loading } from 'components/Global/Loading';
import { mostrarModal } from 'utils/common';
import { useHistory } from 'react-router';

export const ProductosDevolucion = (props) => {
    const history = useHistory();
    let tableValue = useSelector(e => e.Devolucion.TableValue);
    const dispatch = useDispatch();
    const clienteSelected = useSelector(e => e.Devolucion.clienteSelected);
    const devolucionCompleta = useSelector(e => e.Devolucion.devolucionCompleta);
    const motivosDevolucion = useSelector(e => e.Devolucion.motivosDevolucion);
    const motivoDevolucionDetalle = useSelector(e => e.Devolucion.motivoDevolucionDetalle);
    const motivoDevolucion = useSelector(e => e.Devolucion.motivoDevolucion);
    //const PaisesFactura = ["IMCR", "IMGT"];

    const [codigo, setCodigo] = useState("");
    const [color, setColor] = useState("");
    const [codigoBarra, setCodigoBarra] = useState("");
    const [tallaTxt, setTalla] = useState("");
    const [factura, setFactura] = useState({});
    const [facturas, setFacturas] = useState([]);
    const [motivosDevolucionMaestro, setMotivosDevolucionMaestro] = useState([]);
    const [motivosDevolucionDetalle, setMotivosDevolucionDetalle] = useState([]);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");

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
        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: miTableValue });
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
            const data = await axios.get(`${APIURL}/api/producto/${clienteSelected.EmpresaId}/${clienteSelected.GrupoPrecio}/${codigo}/${color}`)
            agregarProducto(data.data, tallaTxt);
            setOpen(false);
        } catch (err) {
            setOpen(false);
            mostrarModal("Error", "No se pudo obtener el producto.", "error");
        }
    }

    const obtenerProductosFactura = async () => {
        try {
            if (factura.factura) {
                setTitle("Obteniendo productos de factura");
                setOpen(true);
                const data = await axios.get(`${APIURL}/api/productodevolucion/factura/${factura.factura}`);

                if (data.data.length === 0) {
                    setOpen(false);
                    mostrarModal("Sin productos", `La factura ${factura.factura} no tiene pedidos asociados`, "warning");
                    dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: {} });
                    return;
                }

                let codigoProductos = [...new Set(data.data.map(x => x.IdProducto))];
                let productosDevolver = [];

                for (let codigo of codigoProductos) {
                    let productos = data.data.filter(x => x.IdProducto === codigo);
                    let colores = [...new Set(productos.map(x => x.CodigoColor))];
                    let tallas = [...new Set(productos.map(x => x.CodigoTalla))];

                    let nuevosProductos = await axios.get(`${APIURL}/api/productodevolucion/producto/${codigo}`, { params: { colores, tallas } });
                    productosDevolver.push(nuevosProductos.data)
                }

                agregarDevolucionCompleta(productosDevolver, data.data);
                setOpen(false);
            } else {
                mostrarModal('Factura', 'Seleccione una factura para poder realizar esta acción', "error");
            }
        } catch (err) {
            setOpen(false);
        }
    }

    const obtenerFacturasCliente = async () => {
        try {
            setTitle("Obteniendo facturas del cliente");
            setOpen(true);
            const data = await axios.get(`${APIURL}/api/factura/${clienteSelected.Codigo}`);
            setFacturas(data.data);
            setOpen(false);
        } catch (err) {
            setOpen(false);
        }
    }

    const obtenerCorrelativoDevolucion = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/correlativo/${localStorage.getItem('empresa')}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            localStorage.setItem("CorrelativoDevolucion", request.data);
        } catch (err) {

        }
    }

    const obtenerMotivosDevolucion = () => {
        const motivosDevolucionCliente = motivosDevolucion.filter(x => x.empresa === clienteSelected.EmpresaId);
        setMotivosDevolucionMaestro(motivosDevolucionCliente);
    }

    const limpiarCampos = () => {
        setCodigo("");
        setColor("");
        setTalla("");
        setCodigoBarra("");
    }

    const handleDevolucionCompleta = () => {
        dispatch({ type: "SET_DEVOLUCIONCOMPLETA" })
    }

    const handleChangeMotivo = (value) => {
        const detalle = motivosDevolucionMaestro.find(x => x.id === value);
        dispatch({ type: "SET_MOTIVODEVOLUCION", payload: value });
        dispatch({ type: "SET_MOTIVODEVOLUCIONDETALLE", payload: "" });
        setMotivosDevolucionDetalle(detalle.detalle);
    }

    const handleChangeMotivoDetalle = (value) => {
        dispatch({ type: "SET_MOTIVODEVOLUCIONDETALLE", payload: value });
    }

    const dataFacturas = () => {
        return facturas.map(x => ({ key: x.factura, value: x, text: `${x.factura} - ${x.pedido}` }));
    }

    const dataMotivos = () => {
        return motivosDevolucionMaestro.map(x => ({ key: x.codigo, value: x.id, text: x.descripcion }));
    }

    const dataMotivosDetalle = () => {
        return motivosDevolucionDetalle.map(x => ({ key: x.codigo, value: x.id, text: x.descripcion }));
    }

    useEffect(() => {
        obtenerFacturasCliente();
        obtenerMotivosDevolucion();
        obtenerCorrelativoDevolucion();
        // eslint-disable-next-line
    }, []);

    const limpiarPreciosCantidades = (producto) => {
        for (let color of Object.keys(producto.Colores)) {
            for (let talla of Object.keys(producto.Colores[color].Tallas)) {
                producto.Colores[color].Tallas[talla].Disponible = 0;
                producto.Colores[color].Tallas[talla].Cantidad = 0;
                producto.Colores[color].Tallas[talla].Precio = 0;
            }
        }
    }

    const precioOriginalSinFactura = (producto) => {
        for (let color of Object.keys(producto.Colores)) {
            for (let talla of Object.keys(producto.Colores[color].Tallas)) {
                producto.Colores[color].Tallas[talla].Disponible = 0;
                producto.Colores[color].Tallas[talla].Cantidad = 0;
                producto.Colores[color].Tallas[talla].Precio = producto.Colores[color].Tallas[talla].PrecioGeneral;
            }
        }
    }

    const actualizarProducto = (productos, codigoProducto, grupoTalla, factura) => {
        let miTableValue = { ...tableValue };

        if (factura === "SIN-FACTURA") {
            precioOriginalSinFactura(miTableValue[grupoTalla]["Productos"][codigoProducto]);
            dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: miTableValue });
            return;
        }

        localStorage.setItem("TableValueOriginal", JSON.stringify(miTableValue));

        const noExistenProductosEnFactura = productos.length === 0;

        limpiarPreciosCantidades(miTableValue[grupoTalla]["Productos"][codigoProducto]);

        let tableValueOriginal = JSON.parse(localStorage.getItem("TableValueOriginal"));

        if (noExistenProductosEnFactura) {
            delete miTableValue[grupoTalla]["Productos"][codigoProducto].Factura;
            dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: miTableValue });
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

        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: miTableValue });
    }

    const agregarProducto = (producto, pTalla) => {
        let miTableValue = { ...tableValue };
        let precioGeneral = 0;

        if (producto.Precio.length > 0) {
            precioGeneral = producto.Precio[0].Precio;
        }

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
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores = {};
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Id = producto.CodigoProducto;
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].ListaTallas = producto.ListaTalla
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].NombreProducto = producto.NombreProducto;
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Precio = producto.Precio;

            for (const color of producto.ListaColores) {
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}

                for (const talla of producto.ListaTalla) {
                    let precioEspecifico = precioGeneral;

                    if (producto.fisicaDisponible.length > 0) {
                        let variante = producto.fisicaDisponible.find(x => x.CodigoColor === color.CodigoColor && x.IdTalla === talla.Talla);
                        if (variante) {
                            precioEspecifico = variante.PreciosEspecificos.length > 0 ? variante.PreciosEspecificos[0].Precio : precioEspecifico;
                        }
                    }

                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = 0;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = talla.Talla === pTalla.toUpperCase() ? 1 : 0;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Precio = precioEspecifico;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].PrecioGeneral = precioEspecifico;
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

                        let precioEspecifico = precioGeneral;
                        let cantidadTalla = miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad;

                        if (producto.fisicaDisponible.length > 0) {
                            let variante = producto.fisicaDisponible.find(x => x.CodigoColor === color.CodigoColor && x.IdTalla === talla.Talla);
                            if (variante) {
                                precioEspecifico = variante.PreciosEspecificos.length > 0 ? variante.PreciosEspecificos[0].Precio : precioEspecifico;
                            }
                        }

                        if (cantidadTalla === 0) {
                            cantidadTalla = talla.Talla === pTalla.toUpperCase() ? 1 : 0;
                        }

                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = cantidadTalla;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Precio = precioEspecifico;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].PrecioGeneral = precioEspecifico;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Marcado = talla.Talla === pTalla.toUpperCase();
                    };
                } else {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}

                    for (const talla of producto.ListaTalla) {
                        let precioEspecifico = precioGeneral;
                        let cantidadTalla = miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad;

                        if (producto.fisicaDisponible.length > 0) {
                            let variante = producto.fisicaDisponible.find(x => x.CodigoColor === color.CodigoColor && x.IdTalla === talla.Talla);
                            if (variante) {
                                precioEspecifico = variante.PreciosEspecificos.length > 0 ? variante.PreciosEspecificos[0].Precio : precioEspecifico;
                            }
                        }

                        if (cantidadTalla === 0) {
                            cantidadTalla = talla.Talla === pTalla.toUpperCase() ? 1 : 0;
                        }

                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = cantidadTalla;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Precio = precioEspecifico;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].PrecioGeneral = precioEspecifico;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Marcado = talla.Talla === pTalla.toUpperCase();
                    }
                }
            }
        }
        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: miTableValue });
        limpiarCampos();
    }

    const agregarDevolucionCompleta = (productos, productosDevolver) => {
        let miTableValue = {};

        for (const producto of productos) {

            const productoDevolver = productosDevolver.filter(x => x.IdProducto === producto.CodigoProducto);

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

                for (const color of producto.ListaColores) {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}

                    for (const talla of producto.ListaTalla) {
                        const productoValores = productoDevolver.find(x => x.CodigoColor === color.CodigoColor && x.CodigoTalla.toUpperCase() === talla.Talla);

                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = productoValores ? productoValores.Cantidad : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = productoValores ? productoValores.Cantidad : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Precio = productoValores ? productoValores.PrecioUnitario : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].PrecioGeneral = productoValores ? productoValores.PrecioGeneral : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Marcado = true;
                    }
                }
            }
        }

        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: miTableValue });
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

        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: nuevoTableValue });
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

        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: nuevoTableValue });
    }

    const ingresoCantidad = (text, codigoProducto, codigoColor, grupoTalla, codigoTalla, precio) => {
        let nuevoTableValue = { ...tableValue };
        const valor = (text.target.validity.valid) ? text.target.value : nuevoTableValue[grupoTalla].Productos[codigoProducto].Colores[codigoColor].Tallas[codigoTalla].Cantidad;
        let valorPrevio = tableValue[grupoTalla].Productos[codigoProducto].Colores[codigoColor].Tallas[codigoTalla];
        valorPrevio.Cantidad = valor;
        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: nuevoTableValue });
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
        const data = await axios.get(`${APIURL}/api/producto/${clienteSelected.EmpresaId}/${clienteSelected.GrupoPrecio}/${pCodigo}/${pColor}`)
        productosAgregados.push({ codigoBarra, codigo: pCodigo, color: pColor, talla: pTalla, grupoTalla: data.data.GrupoTalla });
        localStorage.setItem("productosAgregados", JSON.stringify(productosAgregados));
        agregarProducto(data.data, pTalla);
    }

    const obtenerAtributosBarra = async (e) => {
        if (e.key === "Enter") {
            const productosAgregados = JSON.parse(localStorage.getItem("productosAgregados")) || [];
            const productoExiste = productosAgregados.find(x => x.codigoBarra === codigoBarra);

            if (productoExiste) {
                aumentarCantidad(productoExiste.grupoTalla, productoExiste.codigo, productoExiste.color, productoExiste.talla);
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

    const construirEncabezado = (productoFactura) => {
        if (productoFactura) {
            return {
                Correlativo: "",
                CodigoCliente: clienteSelected.Codigo,
                DetalleDevolucion: [],
                Moneda: clienteSelected.Moneda,
                MotivoDevolucion: motivoDevolucion,
                MotivoDevolucionDetalle: motivoDevolucionDetalle,
                FacturaOriginal: productoFactura.Factura,
                PedidoOriginal: productoFactura.NumeroPedido,
                Linea: productoFactura.Linea,
                Empresa: clienteSelected.EmpresaId,
                SubTotal: 0
            };
        }

        return {
            Correlativo: localStorage.getItem("CorrelativoDevolucion"),
            CodigoCliente: clienteSelected.Codigo,
            DetalleDevolucion: [],
            Moneda: clienteSelected.Moneda,
            MotivoDevolucion: motivoDevolucion,
            MotivoDevolucionDetalle: motivoDevolucionDetalle,
            FacturaOriginal: factura.factura,
            PedidoOriginal: factura.pedido,
            Linea: factura.linea,
            Empresa: clienteSelected.EmpresaId,
            SubTotal: 0
        };
    }

    const construirDetalleDevolucion = () => {
        let detalleDevolucion = [];
        let subTotal = 0;

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
                                Unidad: "Und",
                                PrecioUnitario: tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Precio,
                                CodigoTalla: talla,
                            }

                            detalleDevolucion.push(productoDevolver);
                            subTotal += cantidad * tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Precio;
                        }
                    }
                }
            }
        }

        return [subTotal, detalleDevolucion];
    }

    const construirDevolucionParcial = () => {
        let devoluciones = [];

        let devolucionSinFactura = {
            Correlativo: "",
            CodigoCliente: clienteSelected.Codigo,
            DetalleDevolucion: [],
            Moneda: clienteSelected.Moneda,
            MotivoDevolucion: motivoDevolucion,
            MotivoDevolucionDetalle: motivoDevolucionDetalle,
            FacturaOriginal: "",
            PedidoOriginal: "",
            Linea: "DEN",
            Empresa: clienteSelected.EmpresaId,
            SubTotal: 0
        }

        for (let grupoTalla of Object.keys(tableValue)) {
            for (let producto of Object.keys(tableValue[grupoTalla].Productos)) {

                const factura = tableValue[grupoTalla].Productos[producto].Factura;
                const esFacturaVacia = factura === undefined || Object.keys(factura).length === 0;
                if (esFacturaVacia) {
                    for (let color of Object.keys(tableValue[grupoTalla].Productos[producto].Colores)) {
                        for (let talla of Object.keys(tableValue[grupoTalla].Productos[producto].Colores[color].Tallas)) {
                            let cantidad = tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Cantidad;

                            if (cantidad > 0) {
                                let productoDevolver = {
                                    IdProducto: tableValue[grupoTalla].Productos[producto].Id,
                                    CodigoProducto: producto,
                                    CodigoColor: color,
                                    Cantidad: cantidad,
                                    Unidad: "Und",
                                    PrecioUnitario: tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Precio,
                                    CodigoTalla: talla,
                                }

                                devolucionSinFactura.DetalleDevolucion.push(productoDevolver);
                                devolucionSinFactura.SubTotal += cantidad * tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Precio;
                            }
                        }
                    }
                } else {
                    const existeEncabezado = devoluciones.some(x => x.FacturaOriginal === factura.Factura);
                    let indice = 0;

                    if (existeEncabezado) {
                        indice = devoluciones.findIndex(x => x.FacturaOriginal === factura.Factura);
                    } else {
                        let nuevoEncabezado = construirEncabezado(factura);
                        devoluciones.push(nuevoEncabezado);
                        indice = devoluciones.length - 1;
                    }

                    for (let color of Object.keys(tableValue[grupoTalla].Productos[producto].Colores)) {
                        for (let talla of Object.keys(tableValue[grupoTalla].Productos[producto].Colores[color].Tallas)) {
                            let cantidad = tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Cantidad;

                            if (cantidad > 0) {
                                let productoDevolver = {
                                    IdProducto: tableValue[grupoTalla].Productos[producto].Id,
                                    CodigoProducto: producto,
                                    CodigoColor: color,
                                    Cantidad: cantidad,
                                    Unidad: "Und",
                                    PrecioUnitario: tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Precio,
                                    CodigoTalla: talla,
                                }

                                devoluciones[indice].DetalleDevolucion.push(productoDevolver);
                                devoluciones[indice].SubTotal += cantidad * tableValue[grupoTalla].Productos[producto].Colores[color].Tallas[talla].Precio;
                            }
                        }
                    }
                }

            }
        }

        if (devolucionSinFactura.DetalleDevolucion.length > 0) {
            devoluciones.push(devolucionSinFactura);
        }

        return devoluciones;
    }

    const validacionDevolucionParcial = () => {
        let devoluciones = construirDevolucionParcial();
        let devolucionSinProducto = devoluciones.some(x => x.DetalleDevolucion.length === 0);

        //if (PaisesFactura.includes(clienteSelected.EmpresaId)) {
        //let devolucionSinFactura = devoluciones.some(x => x.FacturaOriginal === "");

        //if (devolucionSinFactura) {
        //mostrarModal("Aviso", "No se puede generar devolucion parcial ya que no hay factura seleccionada.", "warning");
        //return;
        //}
        //}

        if (devolucionSinProducto) {
            mostrarModal("Aviso", "No se puede generar devolucion parcial ya que no se ha ingresado ningun producto.", "warning");
            return;
        }

        enviarDevolucionParcial(devoluciones);
    }


    const finalizarDevolucion = () => {
        if (motivoDevolucionDetalle === "") {
            mostrarModal('Motivo Devolución', 'Seleccione motivo de devolución.', "error");
            return;
        }

        if (devolucionCompleta) {
            if (Object.keys(factura).length === 0) {
                mostrarModal("Factura", "Seleccione una factura a devolver.", "error");
                return;
            }

            let devolucion = construirEncabezado();
            const [subTotal, detalleDevolucion] = construirDetalleDevolucion();

            if (detalleDevolucion.length === 0) {
                mostrarModal("Aviso", "No se puede generar la devolucion ya que no se ha ingresado ningun producto.", "warning");
                return;
            }

            devolucion.SubTotal = parseFloat(subTotal);
            devolucion.DetalleDevolucion = detalleDevolucion;

            if (productosSinCantidad) {
                mostrarModal("Aviso", "Ha dejado productos con cantidades igual a 0 , los cuales no se tomaran en cuenta. Desea continuar?", "warning", true, "Continuar", "Corregir")
                    .then((result) => {
                        if (result.value) {
                            enviarDevolucion(devolucion)
                        }
                    })
            } else {
                enviarDevolucion(devolucion)
            }
        } else {

            if (productosSinCantidad) {
                mostrarModal("Aviso", "Ha dejado productos con cantidades igual a 0 , los cuales no se tomaran en cuenta. Desea continuar?", "warning", true, "Continuar", "Corregir")
                    .then((result) => {
                        if (result.value) {
                            validacionDevolucionParcial();
                        }
                    });
            } else {
                validacionDevolucionParcial();
            }
        }

    }

    const enviarDevolucion = async (devolucion) => {
        try {
            setTitle("Guardando devolución");
            setOpen(true);
            await axios.post(`${APIURL}/api/devolucion/completa`, devolucion, {
                headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token')
                }
            });
            mostrarModal("Devolución completa", "Se ha guardado la devolución con exito", "success");
            history.push({ pathname: "/devolucion/ImprimirDevolucion", state: JSON.stringify(devolucion) });
            setOpen(false);
        } catch (err) {
            mostrarModal("Error", "No se pudo guardar la devolucion.", "error");
            setOpen(false);
        }
    }

    const enviarDevolucionParcial = async (devoluciones) => {
        try {
            setTitle("Guardando devolución");
            setOpen(true);
            const nuevasDevoluciones = await axios.post(`${APIURL}/api/devolucion/parcial`, devoluciones, {
                headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token')
                }
            });
            mostrarModal("Devolución completa", "Se ha guardado la devolución con exito", "success");
            setOpen(false);
            history.push({ pathname: "/devolucion/ImprimirDevolucion/Parcial", state: JSON.stringify({ devolucionesGeneradas: nuevasDevoluciones.data, devoluciones }) });
        } catch (err) {
            setOpen(false);
        }
    }

    return (
        <>
            <Loading open={open} title={title} />
            <Card style={{ margin: '15px', minHeight: '50vh' }}>
                <CardContent>
                    <div>
                        <h5>Motivo devolución</h5>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Dropdown
                                placeholder="Seleccione un motivo devolución"
                                search
                                selection
                                options={dataMotivos()}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                                style={{ zIndex: 999, width: '40%' }}
                                multiple={false}
                                onChange={(e, { value }) => { handleChangeMotivo(value) }}
                            />
                            <Dropdown
                                placeholder="Seleccione detalle devolución"
                                search
                                selection
                                options={dataMotivosDetalle()}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                                style={{ zIndex: 999, width: '40%' }}
                                multiple={false}
                                onChange={(e, { value }) => { handleChangeMotivoDetalle(value) }}
                                value={motivoDevolucionDetalle}
                            />
                            <label style={{ fontSize: 15, fontWeight: 'bold' }}><input type="checkbox" checked={devolucionCompleta} onChange={handleDevolucionCompleta} /> Devolución Completa </label>
                        </div>
                    </div>
                    {devolucionCompleta
                        ?
                        <div style={{ marginTop: 40 }}>
                            <hr />
                            <h5>Seleccione factura</h5>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Dropdown
                                    placeholder="Seleccione factura"
                                    search
                                    selection
                                    options={dataFacturas()}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 99, width: '84%' }}
                                    multiple={false}
                                    onChange={(e, { value }) => { setFactura(value) }}
                                />
                                <button className="btn btn-success" onClick={obtenerProductosFactura}>Registrar</button>
                            </div>
                        </div>
                        :
                        <div style={{ marginTop: 40 }}>
                            <hr />
                            <h5>Agregar producto</h5>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <input type="text" className="mr-5 form-control" placeholder="Codigo Producto" value={codigo} onChange={(e) => { setCodigo(e.target.value) }} />
                                <input type="text" className="mr-5 form-control" placeholder="Codigo Color" value={color} onChange={(e) => { setColor(e.target.value) }} />
                                <input type="text" className="mr-5 form-control" placeholder="Talla" value={tallaTxt} onChange={(e) => { setTalla(e.target.value) }} />
                                <input type="text" className="mr-5 form-control" placeholder="Codigo Barra" value={codigoBarra} onChange={(e) => { setCodigoBarra(e.target.value) }} onKeyPress={obtenerAtributosBarra} />
                                <button className="btn btn-success" onClick={añadir}>Añadir</button>
                            </div>
                        </div>
                    }
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

                                        Object.keys(producto.Colores).forEach((codigoColor) => {
                                            let color = producto.Colores[codigoColor];
                                            Object.keys(color.Tallas).forEach((codigoTalla) => {
                                                let valorTalla = color.Tallas[codigoTalla];

                                                let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                                                productoConCantidad = productoConCantidad || (cantidadXTalla > 0);
                                            });
                                        });

                                        productosSinCantidad = productosSinCantidad || (!productoConCantidad);

                                        return (
                                            <ExpandableDevolucion
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
                            <button onClick={finalizarDevolucion} className="btn btn-secondary" style={{ float: 'right', margin: '2em' }}>Finalizar devolución</button>
                        </>
                    }
                </CardContent>
            </Card>
        </>
    );
}