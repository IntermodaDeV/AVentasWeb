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

export const ProductosDevolucion = (props) => {
    let tableValue = useSelector(e => e.Devolucion.TableValue);
    const dispatch = useDispatch();
    const clienteSelected = useSelector(e => e.Devolucion.clienteSelected);
    const devolucionCompleta = useSelector(e => e.Devolucion.devolucionCompleta);
    const motivosDevolucion = useSelector(e => e.Devolucion.motivosDevolucion);

    const [codigo, setCodigo] = useState("");
    const [color, setColor] = useState("");
    const [codigoBarra, setCodigoBarra] = useState("");
    const [talla, setTalla] = useState("");
    const [factura, setFactura] = useState("");
    const [facturas, setFacturas] = useState([]);
    const [motivosDevolucionDetalle, setMotivosDevolucionDetalle] = useState([]);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");

    const añadir = async () => {
        const data = await axios.get(`${APIURL}/api/producto/${clienteSelected.EmpresaId}/${codigo}/${color}`)
        agregarProducto(data.data)
        limpiarCampos();
    }

    const obtenerProductosFactura = async () => {
        try {
            setTitle("Obteniendo productos de factura");
            setOpen(true);
            const data = await axios.get(`${APIURL}/api/productodevolucion/factura/${factura}`);
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

    const obtenerMotivosDevolucion = async () => {
        try {
            if (motivosDevolucion.length === 0) {
                setTitle("Obteniendo motivos devolucion");
                setOpen(true);
                const data = await axios.get(`${APIURL}/api/devolucion/motivos/${clienteSelected.EmpresaId}`);
                dispatch({ type: "SET_MOTIVOSDEVOLUCION", payload: data.data });
                setOpen(false);
            }
        } catch (err) {
            setOpen(false);
        }
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
        const detalle = motivosDevolucion.find(x => x.codigo === value);
        dispatch({ type: "SET_MOTIVODEVOLUCION", payload: value });
        setMotivosDevolucionDetalle(detalle.detalle);
    }

    const handleChangeMotivoDetalle = (value) => {
        dispatch({ type: "SET_MOTIVODEVOLUCIONDETALLE", payload: value });
    }

    const dataFacturas = () => {
        return facturas.map(x => ({ key: x.factura, value: x.factura, text: `${x.factura} - ${x.pedido}` }));
    }

    const dataMotivos = () => {
        return motivosDevolucion.map(x => ({ key: x.codigo, value: x.codigo, text: x.descripcion }));
    }

    const dataMotivosDetalle = () => {
        return motivosDevolucionDetalle.map(x => ({ key: x.codigo, value: x.codigo, text: x.descripcion }));
    }

    useEffect(() => {
        obtenerFacturasCliente();
        obtenerMotivosDevolucion();
        // eslint-disable-next-line
    }, []);

    const agregarProducto = (producto) => {
        let miTableValue = { ...tableValue };
        let precio = { Precio: 0 };

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
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].ListaTallas = producto.ListaTalla
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].NombreProducto = producto.NombreProducto;
            miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Precio = producto.Precio;

            producto.ListaColores.forEach(color => {
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}
                producto.ListaTalla.map(talla => {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Disponible = 0;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Cantidad = 0;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = 0
                    return false;
                });
            });

        } else {
            producto.ListaColores.forEach(color => {
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}
                producto.ListaTalla.map(talla => {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Disponible = 0;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Cantidad = 0;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = 0;
                    return false;
                });
            });
        }
        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: miTableValue });
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

                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla] = {}
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Disponible = productoValores ? productoValores.Cantidad : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Cantidad = productoValores ? productoValores.Cantidad : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = productoValores ? productoValores.PrecioUnitario : 0;
                    }
                }
            }
        }

        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: miTableValue });
    }

    const eliminarProducto = (grupoTalla, codigoProducto) => {
        let nuevoTableValue = { ...tableValue };
        delete nuevoTableValue[grupoTalla]["Productos"][codigoProducto];

        if (Object.keys(nuevoTableValue[grupoTalla]["Productos"]).length === 0) {
            delete nuevoTableValue[grupoTalla];
        }

        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: nuevoTableValue });
    }

    const eliminarColor = (grupoTalla, codigoProducto, color) => {
        let nuevoTableValue = { ...tableValue };
        delete nuevoTableValue[grupoTalla]["Productos"][codigoProducto]["Colores"][color];

        if (Object.keys(nuevoTableValue[grupoTalla]["Productos"][codigoProducto]["Colores"]).length === 0) {
            delete nuevoTableValue[grupoTalla]["Productos"][codigoProducto];
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

    const obtenerAtributosBarra = async (e) => {
        if (e.key === "Enter") {
            try {
                setTitle("Obteniendo atributos producto");
                setOpen(true);
                const data = await axios.get(`${APIURL}/api/productodevolucion/codigobarra/${codigoBarra}`)
                setCodigo(data.data.productoId);
                setTalla(data.data.tallaId);
                setColor(data.data.colorId);
                setOpen(false);
            } catch (err) {
                setOpen(false);
            }
        }
    }

    return (
        <>
            <Loading open={open} title={title} />
            <Card style={{ margin: '15px', minHeight: '100vh' }}>
                <CardContent>
                    <div>
                        <h3>Motivo devolución</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <Dropdown
                                placeholder="Seleccione un motivo devolución"
                                search
                                selection
                                options={dataMotivos()}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                                style={{ zIndex: 999 }}
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
                                style={{ zIndex: 999 }}
                                multiple={false}
                                onChange={(e, { value }) => { handleChangeMotivoDetalle(value) }}
                            />
                            <label style={{ fontSize: 15, fontWeight: 'bold' }}><input type="checkbox" checked={devolucionCompleta} onChange={handleDevolucionCompleta} /> Devolución Completa </label>
                        </div>
                    </div>
                    {devolucionCompleta
                        ?
                        <div style={{ marginTop: 40 }}>
                            <h3>Seleccione factura</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Dropdown
                                    placeholder="Seleccione facturas"
                                    search
                                    selection
                                    options={dataFacturas()}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 99, width: '90%' }}
                                    multiple={false}
                                    onChange={(e, { value }) => { setFactura(value) }}
                                />
                                <button className="btn btn-success" onClick={obtenerProductosFactura}>Registrar</button>
                            </div>
                        </div>
                        :
                        <div style={{ marginTop: 40 }}>
                            <h3>Agregar producto</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <input type="text" className="mr-5 form-control" placeholder="Codigo Producto" value={codigo} onChange={(e) => { setCodigo(e.target.value) }} />
                                <input type="text" className="mr-5 form-control" placeholder="Codigo Color" value={color} onChange={(e) => { setColor(e.target.value) }} />
                                <input type="text" className="mr-5 form-control" placeholder="Talla" value={talla} onChange={(e) => { setTalla(e.target.value) }} />
                                <input type="text" className="mr-5 form-control" placeholder="Codigo Barra" value={codigoBarra} onChange={(e) => { setCodigoBarra(e.target.value) }} onKeyPress={obtenerAtributosBarra} />
                                <button className="btn btn-success" onClick={añadir}>Añadir</button>
                            </div>
                        </div>
                    }
                    {(Object.keys(tableValue).length > 0) &&
                        <>
                            <h3 style={{ marginTop: '3em' }}>Productos a devolver</h3>
                            <form>
                                {Object.keys(tableValue).map((grupoTalla, index) => {
                                    let productos = Object.keys(tableValue[grupoTalla].Productos);
                                    return productos.map((codigoProducto, index1) => {
                                        let producto = tableValue[grupoTalla].Productos[codigoProducto];
                                        let tallas = tableValue[grupoTalla].Productos[codigoProducto].ListaTallas;
                                        let { totalCantidad } = obtenerTotales(producto);

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
                                            />
                                        )

                                    })
                                })}
                            </form>
                        </>
                    }
                </CardContent>
            </Card>
        </>
    );
}