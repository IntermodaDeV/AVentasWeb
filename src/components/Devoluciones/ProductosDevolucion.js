import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
} from '@material-ui/core';
import { MotivosDevolucion } from 'components/Devoluciones/MotivosDevolucion';
import { useSelector, useDispatch } from 'react-redux';
import { ExpandableDevolucion } from './ExpandableDevolucion';

export const ProductosDevolucion = (props) => {
    let tableValue = useSelector(e => e.Devolucion.TableValue);
    const dispatch = useDispatch();

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
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].ListaImagenes = color.ListaImagenes;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}
                producto.ListaTalla.map(talla => {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Disponible = 5;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Cantidad = "";
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Distribucion = talla.Distribucion;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = 5
                    return false;
                });
            });

        } else {
            producto.ListaColores.forEach(color => {
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].ListaImagenes = color.ListaImagenes;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}
                producto.ListaTalla.map(talla => {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Disponible = 5;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Cantidad = "";
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Distribucion = talla.Distribucion;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[' ' + talla.Talla].Precio = 5
                    return false;
                });
            });
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

    return (
        <>
            <MotivosDevolucion agregarProducto={agregarProducto} />

            {(Object.keys(tableValue).length > 0) &&
                <Card style={{ margin: '15px' }}>
                    <CardHeader
                        title={
                            <Typography gutterBottom variant="h5" component="h2">
                                Productos a Devolver
                            </Typography>}
                        style={{ borderBottom: '1px solid #ddd', padding: '10px 16px' }}
                    />
                    <CardContent>
                        <form>
                            {Object.keys(tableValue).map((grupoTalla, index) => {
                                let productos = Object.keys(tableValue[grupoTalla].Productos);
                                return productos.map((codigoProducto, index1) => {
                                    let producto = tableValue[grupoTalla].Productos[codigoProducto];
                                    let tallas = tableValue[grupoTalla].Productos[codigoProducto].ListaTallas;

                                    return (
                                        <ExpandableDevolucion
                                            key={codigoProducto}
                                            grupoTalla={grupoTalla}
                                            producto={producto}
                                            codigoProducto={codigoProducto}
                                            tallas={tallas}
                                            eliminarProducto={eliminarProducto}
                                            eliminarColor={eliminarColor}
                                            ingresoCantidad={ingresoCantidad}
                                        />
                                    )

                                })
                            })}
                        </form>
                    </CardContent>
                </Card>
            }
        </>
    );
}