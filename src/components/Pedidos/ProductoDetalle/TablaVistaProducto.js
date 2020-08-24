import React, { useState } from 'react';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumen.module.css';
import CeldaTallas from "components/Pedidos/Global/CeldaTallas";
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { Popover, Box, Typography } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { FaEye } from "react-icons/fa";
const TablaVistaProducto = (props) => {
    const [SelectedImage, setSelectedImage] = useState(0);
    const [imagenes, setImagenes] = useState([]);
    const [IsOpen, setIsOpen] = useState(false);

    const onFocus = () => {

    }

    const onBlur = () => {

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

    const checkDist = () => {
        let found = false;
        props.producto.ListaTalla.map((talla, index) => {
            talla.Distribucion.map(dist => {
                found = true;
                return false;
            })
            return false;
        })
        return found;
    }

    let IsDist = checkDist();

    const openImagenes = (color) => {
        const imagenesColor = props.producto.ListaColores.filter(e => e.NombreColor === color);

        if (imagenesColor[0].ListaImagenes.length === 0) return false;

        setImagenes(imagenesColor[0].ListaImagenes);
        setIsOpen(true);
    }

    return (
        <div>
            <table className={'table table-bordered m-auto'} style={{ borderColor: '#aaa', overflow: "auto" }} >
                <thead>
                    <tr className={styles.TrTest}>

                        <th className={styles.ThTest} >Color</th>
                        {props.producto.ListaTalla.map((talla, index) => {
                            return (
                                <th className={styles.ThTest} key={index} style={{ paddingBottom: (IsDist && talla.Distribucion.length === 0) && '1.3%' }}>
                                    <div className="text-center">
                                        {
                                            talla.Distribucion.length !== 0 &&
                                            <PopupState variant="popover" popupId={talla.Talla + index}>
                                                {popupState => (
                                                    <>
                                                        <div variant="contained" className={"row"}>
                                                            {talla.Talla}
                                                            <InfoOutlined {...bindTrigger(popupState)} style={{ fontSize: '16px', cursor: 'pointer', margin: 'auto' }}> </InfoOutlined>
                                                        </div>
                                                        <Popover
                                                            {...bindPopover(popupState)}
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
                        <th className={styles.ThTest} style={{ paddingBottom: (IsDist) && '1.3%' }}>Cant</th>
                        <th className={styles.ThTest} style={{ paddingBottom: (IsDist) && '1.3%' }}>Total</th>
                    </tr>
                </thead>
                <tbody >
                    {props.producto.ListaColores.map((color, index1) => {
                        const hasImages = color.ListaImagenes.length > 0;                      
                        let totalXColor = 0;
                        let cantidadTotalXColor = 0;

                        return (
                            <tr key={index1}>
                                <td style={{
                                    textAlign: 'center',
                                    alignItems: 'center',
                                    verticalAlign: 'middle',
                                    fontWeight: 600,
                                }}>
                                    {/* <div style={{
                                    width: '25px',
                                    height: '25px',
                                    borderRadius: '25px',
                                    margin: 'auto',
                                    backgroundColor: 'rgb(106, 40, 118)'
                                }}></div> */}
                                    {hasImages ? <FaEye onClick={() => { openImagenes(color.NombreColor) }} size={"20px"} style={{ display: 'block', margin: "auto" }} /> : ""}
                                    {color.NombreColor}
                                </td>
                                {
                                    Object.keys(props.TableValue[props.producto.GrupoTalla].Productos[props.producto.ProductoId].Colores[color.CodigoColor].Tallas).map((talla, index2) => {
                                        var valorTalla = props.TableValue[props.producto.GrupoTalla].Productos[props.producto.ProductoId].Colores[color.CodigoColor].Tallas[talla];
                                        var backOrder = (valorTalla.Cantidad > valorTalla.Disponible) ? (valorTalla.Cantidad - valorTalla.Disponible) : 0;
                                        let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                                        cantidadTotalXColor+=cantidadXTalla;
                                        let totalXTalla = cantidadXTalla*valorTalla.Precio;
                                        totalXColor =  parseInt(totalXColor, 10) +totalXTalla;
                                        return (

                                            <CeldaTallas
                                                key={index2}
                                                disponible={valorTalla.Disponible}
                                                backorder={backOrder}
                                                hasBackOrder={props.hasBackOrder}
                                                futuro={props.futuro}
                                                handleArrowKeys={handleArrowKeys}
                                                precio={valorTalla.Precio}
                                                codigoProducto={props.codigoProducto}
                                                codigoColor={color.CodigoColor}
                                                codigoTalla={talla}
                                                grupoTalla={props.producto.GrupoTalla}
                                                cantidad={valorTalla.Cantidad}
                                                onFocus={onFocus}
                                                onBlur={onBlur}
                                                onChange={props.onchangeText}
                                                CrearDetallePedidoOnline={props.CrearDetallePedidoOnline}
                                            />
                                        )
                                    })
                                }
                                <td style={{
                                    textAlign: 'center',
                                    alignItems: 'center',
                                    verticalAlign: 'middle',
                                    fontWeight: 600,
                                }}>{cantidadTotalXColor}</td>

                                <td style={{
                                    textAlign: 'right',
                                    alignItems: 'center',
                                    verticalAlign: 'middle',
                                    fontWeight: 600,
                                }}>{numberWithCommas( totalXColor )}</td>
                            </tr>

                        )
                    })}
                </tbody>
            </table >
            {IsOpen && (
                <Lightbox
                    mainSrc={imagenes[SelectedImage].FotografiaProducto}
                    nextSrc={imagenes[(SelectedImage + 1) % imagenes.length].FotografiaProducto}
                    prevSrc={imagenes[(SelectedImage + imagenes.length - 1) % imagenes.length].FotografiaProducto}
                    onCloseRequest={() => setIsOpen(false)}
                    onMovePrevRequest={() =>
                        setSelectedImage((SelectedImage + imagenes.length - 1) % imagenes.length)
                    }
                    onMoveNextRequest={() =>
                        setSelectedImage((SelectedImage + 1) % imagenes.length)
                    }
                />
            )}
        </div>
    );
}
const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// const numberWithCommasNoDec = (x) => {
//     var parts = x.toString().split(".");
//     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     return parts.join(".");
// }

export default TablaVistaProducto;