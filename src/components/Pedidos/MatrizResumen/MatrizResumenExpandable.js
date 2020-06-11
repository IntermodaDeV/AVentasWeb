import React, { useState } from 'react';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumenExpandable.module.css';
import ProductoTable from 'components/Pedidos/MatrizResumen/ProductoTable';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
    Card,
    CardContent,
    CardHeader,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Popover,
    Box,
    Typography
} from '@material-ui/core';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { InfoOutlined } from "@material-ui/icons";
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss';
import {useSelector} from 'react-redux';


const MatrizResumen = (props) => {
    const [mostrarVacios, setMostrarVacios] = useState(false);
    const [expanded, setExpanded] = React.useState(false);

    let referenceCantidad = [];
    let referenceTotal = [];
    let gruposTalla = Object.keys(props.tableValue);
    let unidadesTotales = 0;
    let totalGlobal = 0.00;
    let moneda = (props.Cliente !== null) ? ((props.Cliente.Moneda !== null && props.Cliente.Moneda !== '') ? props.Cliente.Moneda : 'Lps') : 'Lps';
    let productosSinCantindad = false;

    const lineaSeleccionada = useSelector(e=>e.LineaSeleccionada);
    let impuesto = 0.15;
    let impuestoTotal = 1.15;

    if(props.Cliente.Codigo.includes('IMCR'))
    {
        impuesto = 0.13;
        impuestoTotal = 1.13;
    }else if(props.Cliente.Codigo.includes('IMGT')){
        impuesto = 0.12;
        impuestoTotal = 1.12;
    }

    if(props.Cliente.Codigo.includes('IMHN') && lineaSeleccionada.IdLinea === "BIO")
    {
        impuesto = 0;
        impuestoTotal = 1;
    }

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

    const handleChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const Headers = (array) => {
        return (
            <thead>
                <tr>
                    {
                        array.map((dist, index) => {
                            return (
                                <th key={index} className={styles.ThTest}>{dist.NombreTalla}</th>
                            )
                        })
                    }
                </tr>

            </thead>
        )
    }

    const TableBody = (array) => {
        return (
            <tbody>
                <tr>
                    {
                        array.map((dist, index) => {
                            return (
                                <td key={index} style={{ textAlign: 'center' }}>{dist.Cantidad}</td>
                            )
                        })
                    }
                </tr>
            </tbody>
        )
    }

    const checkDist = (array) => {
        let found = false;
        array.map((talla) => {
            talla.Distribucion.map(() => {
                found = true;
                return false;
            })
            return false;
        })
        return found;
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

                            let productos = Object.keys(props.tableValue[grupoTalla].Productos);
                            if (props.tableValue[grupoTalla].Mostrar) {
                                return (
                                    productos.map((codigoProducto, index1) => {
                                        let producto = props.tableValue[grupoTalla].Productos[codigoProducto];
                                        let tallas = props.tableValue[grupoTalla].Productos[codigoProducto].ListaTallas;
                                        let IsDist = checkDist(tallas);
                                        let productoConCantindad = false;
                                        if (producto.Selected) {
                                            Object.keys(producto.Colores).forEach((codigoColor) => {
                                                let color = producto.Colores[codigoColor];
                                                let precio = producto.Precio.find(precioxProd => {
                                                    return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
                                                });
                                                if (precio === undefined) {
                                                    precio = { Precio: 0 };
                                                }
                                                Object.keys(color.Tallas).forEach((codigoTalla) => {
                                                    let valorTalla = color.Tallas[codigoTalla];
                                                    let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                                                    productoConCantindad = productoConCantindad || (cantidadXTalla > 0);
                                                    unidadesTotales = parseInt(unidadesTotales, 10) + cantidadXTalla;
                                                    totalGlobal = (precio.Precio * cantidadXTalla) + totalGlobal;
                                                });
                                            });
                                            productosSinCantindad = productosSinCantindad || (!productoConCantindad);
                                            let expandido = expanded === producto.NombreProducto + index1;

                                            let classes = "w-100 my-2 rounded ";
                                            if (mostrarVacios) {
                                                if (!productoConCantindad) {
                                                    classes += styles.BorderExpansionWarning;
                                                }
                                                else {
                                                    classes += styles.BorderExpansion;
                                                }
                                            }
                                            else {
                                                classes += styles.BorderExpansion;
                                            }

                                            var Totales = getTotales(producto, props.Cliente);

                                            return (
                                                <div className={classes} key={index1}>
                                                    <ExpansionPanel expanded={expandido} onChange={handleChange(producto.NombreProducto + index1)}>
                                                        <ExpansionPanelSummary
                                                            expandIcon={<ExpandMoreIcon />}
                                                            aria-controls="panel1a-content"
                                                            id="panel1a-header"
                                                        >
                                                            <div className="row w-100">
                                                                <div className="col-xl-3 pb-xl-0 pb-2 col-6 pl-0">
                                                                    <Typography className={styles.BorderHeader}>{producto.NombreProducto}</Typography>
                                                                </div>
                                                                <div className="col-xl-3 px-xl-3 pb-xl-0 pb-2 col-6 px-0">
                                                                    <Typography className={styles.BorderHeaderSecondary}>{codigoProducto}</Typography>
                                                                </div>
                                                                <div className="col-xl-3 px-xl-3 col-6 px-0">
                                                                    <Typography className={styles.BorderHeader}>
                                                                        Unidades:
                                                                        <span ref={(input) => { referenceCantidad[index + '' + index1] = input }}>
                                                                            {numberWithCommasNoDec(Totales.totalCantidad)}
                                                                        </span>
                                                                    </Typography>
                                                                </div>
                                                                <div className="col-xl-3 col-6 pr-0">
                                                                    <Typography className={styles.BorderHeader}>
                                                                        Total: {moneda}
                                                                        <span ref={(input) => { referenceTotal[index + '' + index1] = input }}>
                                                                            {numberWithCommas(Totales.totalPrecio)}
                                                                        </span>
                                                                    </Typography>
                                                                </div>
                                                            </div>

                                                        </ExpansionPanelSummary>
                                                        <ExpansionPanelDetails>
                                                            {
                                                                expandido &&
                                                                <div className={styles.HeaderTest}>
                                                                    <table className={'table table-bordered'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index}>
                                                                        <thead>
                                                                            <tr className={styles.TrTest}>
                                                                                <th className={styles.ThTest}>

                                                                                </th>
                                                                                {tallas.map((talla, index) => {
                                                                                    return (
                                                                                        <th className={styles.ThTest} key={index} style={{ paddingBottom: (IsDist && talla.Distribucion.length === 0) && '1.3%' }}>
                                                                                            <div className="text-center">
                                                                                                {
                                                                                                    talla.Distribucion.length !== 0 &&
                                                                                                    <PopupState variant="popper" popupId={talla.Talla + index}>
                                                                                                        {popupState => (
                                                                                                            <>
                                                                                                                <div variant="contained" className={"row"}>
                                                                                                                    {talla.Talla}
                                                                                                                    <InfoOutlined {...bindTrigger(popupState)} style={{ fontSize: '16px', cursor: 'pointer', margin: 'auto' }}> </InfoOutlined>
                                                                                                                </div>
                                                                                                                <Popover
                                                                                                                    {...bindPopover(popupState)}
                                                                                                                    style={{ zIndex: 900 }}
                                                                                                                    anchorOrigin={{
                                                                                                                        vertical: 'bottom',
                                                                                                                        horizontal: 'center',
                                                                                                                    }}
                                                                                                                    transformOrigin={{
                                                                                                                        vertical: 'top',
                                                                                                                        horizontal: 'center',
                                                                                                                    }}>

                                                                                                                    <Box p={2}>
                                                                                                                        <div className="row mb-2">
                                                                                                                            <Typography component="h5" variant="h5">
                                                                                                                                {talla.Distribucion[0].NombreDistribucion}
                                                                                                                            </Typography>
                                                                                                                        </div>
                                                                                                                        <div style={{ maxWidth: '300px', overflow: 'auto' }}>
                                                                                                                            <table className="table table-striped table-bordered m-0">
                                                                                                                                {Headers(talla.Distribucion)}
                                                                                                                                {TableBody(talla.Distribucion)}
                                                                                                                            </table>
                                                                                                                        </div>
                                                                                                                    </Box>
                                                                                                                </Popover>
                                                                                                            </>
                                                                                                        )}
                                                                                                    </PopupState>
                                                                                                }

                                                                                                {
                                                                                                    talla.Distribucion.length === 0 && <div>{talla.Talla}</div>
                                                                                                }

                                                                                            </div>
                                                                                        </th>
                                                                                    )
                                                                                })}
                                                                                <th className={styles.ThTest} style={{ paddingBottom: (IsDist) && '1.3%' }}>Cantidad</th>
                                                                                <th className={styles.ThTest} style={{ paddingBottom: (IsDist) && '1.3%' }}>Total</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <ProductoTable
                                                                                codigoProducto={codigoProducto}
                                                                                futuro={props.futuro}
                                                                                producto={producto}
                                                                                Cliente={props.Cliente}
                                                                                onfocus={props.onfocus}
                                                                                onValueChange={props.onValueChange}
                                                                                grupoTalla={grupoTalla}
                                                                                tallas={tallas}
                                                                                index={index}
                                                                                index1={index1}
                                                                                numberWithCommas={numberWithCommas}
                                                                                productoConCantindad={productoConCantindad}
                                                                                mostrarVacios={mostrarVacios}
                                                                                Eliminar={props.Eliminar}
                                                                                CrearDetallePedidoOnline={props.CrearDetallePedidoOnline}

                                                                            />

                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            }

                                                        </ExpansionPanelDetails>
                                                    </ExpansionPanel>
                                                </div>
                                            )
                                        }
                                        return false;
                                    })
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
                   ISV: {moneda} {numberWithCommas(totalGlobal * impuesto)}
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


const getTotales = (producto, Cliente) => {
    let Totales = { totalCantidad: 0, totalPrecio: 0 };

    Object.keys(producto.Colores).map((codigoColor, index2) => {
        let color = producto.Colores[codigoColor];
        let precio = producto.Precio.find(precioxProd => {
            return precioxProd.GrupoPrecio === Cliente.GrupoPrecio;
        });
        if (precio === undefined) {
            precio = { Precio: 0 };
        }
        var totalXColor = 0;
        var totalPrecioXColor = 0;



        Object.keys(color.Tallas).map((codigoTalla, index3) => {
            var valorTalla = color.Tallas[codigoTalla];
            totalXColor = parseInt(totalXColor, 10) + (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
            totalPrecioXColor = (precio ? precio.Precio * totalXColor : 0);
            return false;
        })
        Totales.totalCantidad += totalXColor;
        Totales.totalPrecio += totalPrecioXColor;
        return false;
    })

    return Totales;
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
