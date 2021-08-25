import React, { useState, useEffect } from 'react';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumen.module.css';
import CeldaTallas from "components/Pedidos/Global/CeldaTallas";
import { FiTrash2 } from "react-icons/fi";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import { useSelector } from 'react-redux';

const ProductoTableDevolucion = (props) => {
    const [dirty, setDirty] = useState(false);
    const [hasBackOrder, setHasBackOrder] = useState("N");
    const Configuraciones = useSelector(e => e.Configuraciones);

    let ArregloProductos = Object.keys(props.producto.Colores).map((key) => ([key, props.producto.Colores[key]]));
    ArregloProductos.sort((a, b) => a[1].NombreColor < b[1].NombreColor ? -1 : 1);

    useEffect(() => {
        setDirty(props.mostrarVacios);
        cargarBackOrder();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.mostrarVacios]);

    const EliminarProducto = (grupo, cod, nombre) => {
        Swal.fire({
            title: '¿Eliminar producto?',
            text: `Desea eliminar el producto ${nombre}?\nCódigo: ${cod}`,
            type: 'warning',
            showCancelButton: true,
            cancelButtonColor: '#3085d6',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Eliminar!',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                props.Eliminar(grupo, cod);
                Swal.fire(
                    {
                        type: 'success',
                        title: 'El producto ha sido eliminado',
                        showConfirmButton: false,
                        timer: 1500
                    }
                )
            }
        })
    }

    const cargarBackOrder = () => {
        setHasBackOrder(Configuraciones.BO)
    }

    const onFocus = () => {
        setDirty(false);
    }

    const onBlur = () => {
        setDirty(true);
    }

    const handleArrowKeys = (event) => {
        if (event.keyCode === 39) {
            const form = event.target.form;
            const index = Array.prototype.indexOf.call(form, event.target);
            if (form.elements[index + 1]) {
                form.elements[index + 1].focus();
            }
            event.preventDefault();
        }
        else if (event.keyCode === 37) {
            const form = event.target.form;
            const index = Array.prototype.indexOf.call(form, event.target);
            if (form.elements[index - 1]) {
                form.elements[index - 1].focus();
            }
            event.preventDefault();
        }
    }

    let productoTable = (
        <>
            <tr className={styles["tbody"]}>
                <td className="p-1" colSpan={props.tallas.length + 3} style={(!props.productoConCantindad && dirty) ? { backgroundColor: 'rgba(255, 170, 0, 0.45)' } : null}>
                    <div className="row">

                        <div variant="contained">
                            <div className="row">
                                <div className="pl-1 pr-3">
                                    {props.codigoProducto}
                                </div>
                                <div>{props.producto.NombreProducto}</div>
                                <div className="pl-2">
                                    <FiTrash2 className={styles.FiTrash2} onClick={() => EliminarProducto(props.grupoTalla, props.codigoProducto, props.producto.NombreProducto)} />
                                </div>
                            </div>
                        </div>
                    </div>

                </td>
            </tr>

            {ArregloProductos.map((codigoColor, index2) => {
                let color = codigoColor[1];
                var totalXColor = 0;
                let cantidadTotalXColor = 0;

                return (
                    <tr key={index2}>
                        <td className="p-1" style={{
                            textAlign: 'center',
                            alignItems: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 600,
                        }}>
                            {color.NombreColor}
                            <div className="pl-2">
                                <FiTrash2 className={styles.FiTrash2} onClick={() => EliminarProducto(props.grupoTalla, props.codigoProducto, props.producto.NombreProducto)} />
                            </div>
                        </td>
                        {
                            Object.keys(color.Tallas).map((codigoTalla, index3) => {
                                var valorTalla = color.Tallas[codigoTalla];
                                var backOrder = (valorTalla.Cantidad > valorTalla.Disponible) ? (valorTalla.Cantidad - valorTalla.Disponible) : 0;


                                let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                                let totalXTalla = cantidadXTalla * valorTalla.Precio;
                                cantidadTotalXColor += cantidadXTalla;
                                totalXColor = parseInt(totalXColor, 10) + totalXTalla;


                                return (
                                    <CeldaTallas
                                        key={index3}
                                        disponible={valorTalla.Disponible}
                                        backorder={backOrder}
                                        hasBackOrder={hasBackOrder}
                                        NoEsFuturo={props.futuro}
                                        handleArrowKeys={handleArrowKeys}
                                        precio={valorTalla.Precio}
                                        codigoProducto={props.codigoProducto}
                                        codigoColor={codigoColor[0]}
                                        codigoTalla={codigoTalla}
                                        grupoTalla={props.grupoTalla}
                                        cantidad={valorTalla.Cantidad}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                        onChange={props.onValueChange}
                                        color={null}
                                        setListaImagenesPrincipal={null}
                                        CrearDetallePedidoOnline={props.CrearDetallePedidoOnline}
                                        cantidadMinima={props.producto.CantidadMinima}
                                        stockVisibleFuturo={props.producto.StockVisible}
                                    />
                                )
                            })
                        }
                        <td className="p-1" style={{
                            textAlign: 'center',
                            alignItems: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 600,
                        }}>{cantidadTotalXColor}</td>

                        <td className="p-1" style={{
                            textAlign: 'right',
                            alignItems: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 600,
                        }}>{props.numberWithCommas(totalXColor)}</td>
                    </tr>
                )
            })}
        </>
    )

    return productoTable;
}
const areEqual = (prevProps, nextProps) => {
    return false;
}

export default React.memo(ProductoTableDevolucion, areEqual);
