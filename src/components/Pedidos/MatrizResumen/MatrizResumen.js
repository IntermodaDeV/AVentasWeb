import React, { useState } from 'react';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumen.module.css';
import ProductoTable from 'components/Pedidos/MatrizResumen/ProductoTable';
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss';
import {useSelector} from 'react-redux';

const MatrizResumen = (props) => {
    const [mostrarVacios, setMostrarVacios] = useState(false);
    const onContinuar = () => {
        if (productosSinCantindad) {
            Swal.fire({
                title: 'Aviso',
                text: "Ha dejado productos con cantidades igual a 0 , los cuales no se tomaran en cuenta. Desea continuar?",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Corregir',
            }).then((result) => {
                if (result.value) {
                    props.mostrarResumen();
                } else {
                    setMostrarVacios(true);
                }
            })
        } else {
            props.mostrarResumen();
        }
    }


    //const lineaSeleccionada = useSelector(e=>e.LineaSeleccionada);
    const clienteImpuestos = useSelector(e=>e.ClienteImpuestos);
    const productoImpuestos = useSelector(e=>e.ProductoImpuestos);
    const coleccion         = useSelector(e=>e.coleccion.Edades[0].ProductosXEdad);
    let gruposTalla = Object.keys(props.tableValue);
    let unidadesTotales = 0;
    let totalGlobal = 0.00;
    let moneda = (props.Cliente !== null) ? ((props.Cliente.Moneda !== null && props.Cliente.Moneda !== '') ? props.Cliente.Moneda : 'Lps') : 'Lps';
    let productosSinCantindad = false;
    let impuestoCliente = clienteImpuestos.find(x=>x.GRUPO === props.Cliente.GrupoImpuesto).IMPUESTO;
    let producto = Object.keys(props.tableValue[gruposTalla].Productos)[0];
    let productoGrupo = coleccion.find(x=>x.ProductoId===producto).GrupoImpuesto;
    let productoImpuesto = productoImpuestos.find(x=>x.GRUPO===productoGrupo).IMPUESTO;
    let isExcento = impuestoCliente===0;
    let impuesto = productoImpuesto; 
    let impuestoTotal = impuesto+1;
    
    if(isExcento)
    {
        impuesto=0;
        impuestoTotal=1;
    }

    return (
        <>
            <Card style={{ margin: '15px' }}>
                <CardHeader
                    title={
                        <Typography gutterBottom variant="h5" component="h2">
                            {"Matriz"}
                        </Typography>}
                    style={{ borderBottom: '1px solid #ddd', padding: '10px 16px' }}
                />
                <CardContent>
                    <form>
                        {gruposTalla.map((grupoTalla, index) => {

                            var productos = Object.keys(props.tableValue[grupoTalla].Productos);
                            var tallas = props.tableValue[grupoTalla].ListaTallas;

                            if (props.tableValue[grupoTalla].Mostrar) {
                                return (
                                    <div className={styles.HeaderTest} key={index}>
                                        <table className={'table table-bordered'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index}>
                                            <thead>
                                                <tr className={styles.TrTest}>
                                                    <th className={styles.ThTest}>

                                                    </th>
                                                    {tallas.map((talla, index) => {
                                                        return (
                                                            <th className={styles.ThTest} key={index}>
                                                                {talla.Talla}
                                                            </th>
                                                        )
                                                    })}
                                                    <th className={styles.ThTest} >Cantidad</th>
                                                    <th className={styles.ThTest} >Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productos.map((codigoProducto, index1) => {
                                                    let producto = props.tableValue[grupoTalla].Productos[codigoProducto];
                                                    let productoConCantindad = false;
                                                    let precio = producto.Precio.find(precioxProd => {
                                                        return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
                                                    });
                                                    if (precio === undefined) {
                                                        precio = { Precio: 0 };
                                                    }
                                                    if (producto.Selected) {
                                                        Object.keys(producto.Colores).forEach((codigoColor) => {
                                                            let color = producto.Colores[codigoColor];
                                                            Object.keys(color.Tallas).forEach((codigoTalla) => {
                                                                let valorTalla = color.Tallas[codigoTalla];
                                                                let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                                                                productoConCantindad = productoConCantindad || (cantidadXTalla > 0);
                                                                unidadesTotales = parseInt(unidadesTotales, 10) + cantidadXTalla;
                                                                totalGlobal = (precio.Precio * cantidadXTalla) + totalGlobal;
                                                            });
                                                        });
                                                        productosSinCantindad = productosSinCantindad || (!productoConCantindad);
                                                        return (
                                                            <ProductoTable
                                                                key={index1}
                                                                codigoProducto={codigoProducto}
                                                                futuro={props.futuro}
                                                                producto={producto}
                                                                Cliente={props.Cliente}
                                                                onfocus={props.onfocus}
                                                                onValueChange={props.onValueChange}
                                                                grupoTalla={grupoTalla}
                                                                tallas={tallas}
                                                                index1={index1}
                                                                numberWithCommas={numberWithCommas}
                                                                productoConCantindad={productoConCantindad}
                                                                mostrarVacios={mostrarVacios}
                                                                Eliminar={props.Eliminar}
                                                                Precio={precio.Precio}
                                                                CrearDetallePedidoOnline={props.CrearDetallePedidoOnline}
                                                            />
                                                        )
                                                    }
                                                    return false;
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            }
                            return false;
                        })}

                    </form>
                </CardContent>


            </Card>
            <div className={`row text-center ${styles['barra']}`} >
                <div className={`col ${styles['barraInner']}`}>
                    Unidades: {numberWithCommasNoDec(unidadesTotales)}
                </div>
                <div className={`col ${styles['barraInner']}`}>
                    Subtotal: {moneda} {numberWithCommas(totalGlobal)}
                </div>
                <div className={`col ${styles['barraInner']}`}>
                    ISV: {moneda} {numberWithCommas(totalGlobal *impuesto)}
                </div>
                <div className={`col ${styles['barraInner']}`}>
                Total: {moneda} {numberWithCommas(totalGlobal * impuestoTotal)}
                </div>
                <div className={`col ${styles['barraInner']}`}>
                    <button className="btn btn-secondary m-2" onClick={onContinuar}>Continuar</button>
                </div>
            </div>
        </>
    )
}


const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const numberWithCommasNoDec = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
const areEqual = (prevProps, nextProps) => {
    return false;
    // let iguales = prevProps.filtroAtributos === nextProps.filtroAtributos;
    // iguales = iguales && prevProps.coleccion === nextProps.coleccion;
}
export default React.memo(MatrizResumen, areEqual);
