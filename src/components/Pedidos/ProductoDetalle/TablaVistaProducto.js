import React, { useEffect, useState } from 'react';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumen.module.css';
import CeldaTallas from "components/Pedidos/Global/CeldaTallas";
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { Popover, Box, Typography } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { FaEye } from "react-icons/fa";
import { FiTrash2 } from 'react-icons/fi';
import { Chip } from '@material-ui/core';
import { ColorSinStockModal } from './ColorSinStockModal';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { useSelector } from 'react-redux';
import { async } from 'rxjs/internal/scheduler/async';
import { Dropdown } from "semantic-ui-react";
import Swal from 'sweetalert2/dist/sweetalert2.js';
const TablaVistaProducto = (props) => {
    const [SelectedImage, setSelectedImage] = useState(0);
    const [imagenes, setImagenes] = useState([]);
    const [IsOpen, setIsOpen] = useState(false);
    const [colorSeleccionado, setColorSeleccionado] = useState("");
    const [colorFiltrado, setColorFiltrado] = useState([]);
    const [showFiltro, setShowFiltro] = useState(false);
    const [showFiltroAlfabetico, setShowFiltroAlfabetico] = useState(false);
    const [listaColoresCopia, setListaColoresCopia] = useState([]);
    const [openColores, setOpenColores] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isInOut, setIsInOut] = useState(false);
    const [isDeshabilitado, setisDeshabilitado] = useState(false);
    const [prioridadProducto, setPrioridadProducto] = useState(0);
    const permisos = useSelector(e => e.Permisos[0]);
    const Coleccion = useSelector(e => e.coleccion);

    useEffect(() => {
        setIsChecked(props.producto.StockVisible);
        setIsInOut(props.producto.InOut);
        setisDeshabilitado(props.producto.Deshabilitado);
        setPrioridadProducto(props.producto.Prioridad);
        calcularStockPorColor();
        ordenarColores();
        // eslint-disable-next-line
    }, []);

    const ordenarColores = () => {

        let listaColores = props.producto.ListaColores;
        let productosList = []

        if (showFiltroAlfabetico) {
            listaColores.sort((a, b) => (a.NombreColor.localeCompare(b.NombreColor)));
            listaColores.sort((a, b) => ((a.Prioridad > b.Prioridad) ? -1 : 1));
            productosList = [...listaColores]
        } else {
            listaColores.sort((a, b) => ((a.StockColor > b.StockColor) ? 1 : -1));
            listaColores.sort((a, b) => ((a.Prioridad > b.Prioridad) ? -1 : 1));
            productosList = [...listaColores];
        }
        setListaColoresCopia(productosList)
    }


    const calcularStockPorColor = () => {
        props.producto.ListaColores.forEach(function (color) {
            let stockColor = props.producto.fisicaDisponible.filter((e) => e.CodigoColor == color.CodigoColor).map((s) => s.Cantidad).reduce((a, b) => a + b, 0);
            color.StockColor = stockColor;
        });
    }

    const handleClickShowFiltroAlfabetico = () => {        
        setShowFiltroAlfabetico(!showFiltroAlfabetico);

        ordenarColores()
    }

    const onFocus = () => {

    }

    const onBlur = () => {

    }

    const onMostrar = async () => {
        try {
            let request = await axios.post(`${APIURL}/api/ColeccionesXLinea/productoStock/${props.producto.CodigoProducto}`);
            props.producto.StockVisible = request.request.response === "true" ? true : false;

            Coleccion.Edades.forEach(edad => {
                let producto = edad.ProductosXEdad.find(p => p.CodigoProducto === props.producto.CodigoProducto);
                if (producto) {
                    producto.StockVisible = props.producto.StockVisible;
                }
            })
            setIsChecked(props.producto.StockVisible);
        } catch (err) {
            console.log("Ha ocurrido un error: " + err)
        }
    }

    const inOut = async () => {
        try {
            let request = await axios.post(`${APIURL}/api/Product/actualizarInOutProducto/${props.producto.ProductoId}/${Coleccion.CodigoColeccion}`);
            if (request.status == 200) {
                Coleccion.Edades.forEach(edad => {
                    let producto = edad.ProductosXEdad.find(p => p.CodigoProducto === props.producto.CodigoProducto);
                    if (producto) {
                        producto.InOut = !props.producto.InOut;
                    }
                })
                setIsInOut(!isInOut);
            }
        } catch (err) {
            console.log("Ha ocurrido un error: " + err)
        }
    }

    const deshabilitar = async () => {
        try {
            let request = await axios.post(`${APIURL}/api/Product/activarDeshabilitarPrducto/${props.producto.ProductoId}/${Coleccion.CodigoColeccion}`);

            if (request.status == 200) {
                Coleccion.Edades.forEach(edad => {
                    let producto = edad.ProductosXEdad.find(p => p.CodigoProducto === props.producto.CodigoProducto);
                    if (producto) {
                        producto.Deshabilitado = !props.producto.Deshabilitado;
                    }
                })
                setisDeshabilitado(!isDeshabilitado);
            }

        } catch (err) {
            console.log("Ha ocurrido un error: " + err)
        }

    }

    const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
    });

    const actualizarPrioridad = async (prioridad) => {
        try {
            let request = await axios.post(`${APIURL}/api/Product/actualizarPrioridadProducto/${props.producto.ProductoId}/${Coleccion.CodigoColeccion}/${prioridad}`);

            if (request.status == 200) {
                Coleccion.Edades.forEach(edad => {
                    let producto = edad.ProductosXEdad.find(p => p.CodigoProducto === props.producto.CodigoProducto);
                    if (producto) {
                        producto.Prioridad = prioridad;
                    }
                })
                setPrioridadProducto(prioridad);
                Toast.fire({
                    type: 'success',
                    title: 'Se Actualizo la prioridad del producto a ' + prioridad + ' con exito',
                    customClass: {
                        container: styles.ToastOnTopModal,
                    }
                });
            }

        } catch (err) {
            console.log("Ha ocurrido un error: " + err)
        }

    }

    const actualizarPrioridadColor = async (prioridad, IdColorxProducto) => {
        try {
            console.log(prioridad)
            console.log(IdColorxProducto)
            let request = await axios.post(`${APIURL}/api/Product/actualizarPrioridadColorProducto/${IdColorxProducto}/${prioridad}`);

            if (request.status == 200) {
                console.log(listaColoresCopia)

                let color = listaColoresCopia.find(p => p.IdColorxProducto == IdColorxProducto);
                color.Prioridad = prioridad;

                let colorOriginal = props.producto.ListaColores.find(p => p.IdColorxProducto == IdColorxProducto);
                colorOriginal.Prioridad = prioridad;

                setListaColoresCopia(listaColoresCopia);

                ordenarColores()

                Toast.fire({
                    type: 'success',
                    title: 'Se Actualizo la prioridad del color a ' + prioridad + ' con exito',
                    customClass: {
                        container: styles.ToastOnTopModal,
                    }
                });
            }

        } catch (err) {
            console.log("Ha ocurrido un error: " + err)
        }

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

    const handleClickColorFiltrado = (color) => {
        if (colorFiltrado.includes(color)) {
            let colorFiltradoCopia = colorFiltrado;
            let index = colorFiltradoCopia.indexOf(color);
            colorFiltradoCopia.splice(index, 1);
            setColorFiltrado(colorFiltradoCopia);

            if (colorFiltradoCopia.length === 0) {
                setListaColoresCopia(props.producto.ListaColores);
            } else {
                setListaColoresCopia(props.producto.ListaColores.filter(x => colorFiltradoCopia.includes(x.NombreColor)));
            }

        } else {
            const nuevosColoresFiltrados = [...colorFiltrado, color];
            setColorFiltrado(nuevosColoresFiltrados);
            setListaColoresCopia(props.producto.ListaColores.filter(x => nuevosColoresFiltrados.includes(x.NombreColor)));
        }
    }

    const handleClickShowFiltro = () => {
        setShowFiltro(!showFiltro)
    }

    const handleClickDeleteFiltro = () => {
        setColorFiltrado([]);
        setListaColoresCopia(props.producto.ListaColores);
    }

    const handleClickColores = () => {
        setOpenColores(!openColores);
    }
    return (
        <div>
            {props.producto.ListaColoresSinStock.length > 0 && <p style={{ marginRight: 10 }} className="btn btn-secondary" onClick={handleClickColores}>Otros Colores</p>}
            {props.producto.ListaColores.length > 1 && <p className="btn btn-primary" style={{ marginRight: 10 }} onClick={handleClickShowFiltro}>{showFiltro ? "Ocultar Filtro -" : "Filtrar colores +"}</p>}
            {colorFiltrado.length > 0 && <Chip
                style={{ marginBottom: 10, marginLeft: 10 }}
                variant="outlined" color="secondary" size="small"
                label={"Todos"}
                onDelete={handleClickDeleteFiltro}
                icon={<FiTrash2 />}
            />}
            {showFiltro && <ListaColores colores={props.producto.ListaColores} handleColorFiltrado={handleClickColorFiltrado} colorFiltrado={colorFiltrado} />}
            <ColorSinStockModal open={openColores} colores={props.producto.ListaColoresSinStock} close={handleClickColores} />

            {
                permisos.AdministradorProductos && (
                    <>
                        <FormControlLabel
                            label="Mostrar Stock"
                            style={{ marginLeft: '5px' }}
                            hidden={props.futuro}
                            control={<Checkbox checked={isChecked} onChange={onMostrar} />}
                        />
                        <FormControlLabel
                            label="InOut"
                            style={{ marginLeft: '5px' }}
                            control={<Checkbox checked={isInOut} onChange={inOut} />}
                        />
                        <FormControlLabel
                            label="Deshabilitar"
                            style={{ marginLeft: '5px' }}
                            control={<Checkbox checked={isDeshabilitado} onChange={deshabilitar} />}
                        />

                        <Dropdown
                            placeholder="Seleccione Prioridad"
                            selection
                            style={{ zIndex: 999 }}
                            onChange={(e, { value }) => {
                                actualizarPrioridad(value)
                            }}
                            options={[
                                { key: 1, value: 1, text: "1" },
                                { key: 2, value: 2, text: "2" },
                                { key: 3, value: 3, text: "3" },
                                { key: 4, value: 4, text: "4" },
                                { key: 5, value: 5, text: "5" },
                            ]}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            value={prioridadProducto}
                        />


                    </>
                )

            }
            {
            
            permisos.AdministradorProductos && props.producto.ListaColores.length > 1 && <p className="btn btn-primary" style={{ marginRight: 10 }} onClick={handleClickShowFiltroAlfabetico}>{showFiltroAlfabetico ? "Ordenar alfanumerica" : "Ordenar por stock"}</p>}
            
              
            <table className={'table table-bordered m-auto'} style={{ borderColor: '#aaa', overflow: "auto" }} >
                <thead>
                    <tr className={styles.TrTest}>
                        {
                            permisos.AdministradorProductos && <th className={styles.ThTest} >Prioridad</th>
                        }
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
                    {

                        listaColoresCopia.map((color, index1) => {
                            const hasImages = color.ListaImagenes.length > 0;
                            let totalXColor = 0;
                            let cantidadTotalXColor = 0;
                            let i = color.length;

                            return (
                                <tr key={index1}>

                                    {
                                        permisos.AdministradorProductos &&
                                        <td style={{
                                            textAlign: 'center',
                                            alignItems: 'center',
                                            verticalAlign: 'middle',
                                            fontWeight: 50,

                                        }}

                                        >
                                            <div styles={{ position: 'absolute' }} >
                                                <Dropdown
                                                    placeholder="Seleccione Prioridad"
                                                    selection
                                                    onChange={(e, { value }) => {
                                                        actualizarPrioridadColor(value, color.IdColorxProducto)
                                                    }}
                                                    options={[
                                                        { key: 1, value: 1, text: "1" },
                                                        { key: 2, value: 2, text: "2" },
                                                        { key: 3, value: 3, text: "3" },
                                                        { key: 4, value: 4, text: "4" },
                                                        { key: 5, value: 5, text: "5" },
                                                    ]}
                                                    noResultsMessage={"No hay resultados"}
                                                    closeOnChange={true}
                                                    value={color.Prioridad}
                                                />
                                                <p>{color.StockColor}</p>
                                            </div>
                                        </td>
                                    }


                                    <td style={{
                                        textAlign: 'center',
                                        alignItems: 'center',
                                        verticalAlign: 'middle',
                                        fontWeight: 600,
                                        background: colorSeleccionado === color.NombreColor ? "green" : "white",
                                        color: colorSeleccionado === color.NombreColor ? "white" : "black"
                                    }}
                                        onClick={() => {
                                            if (hasImages) {
                                                props.setListaImagenes(color.NombreColor);
                                            }
                                            setColorSeleccionado(color.NombreColor);
                                        }}
                                    >
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
                                            cantidadTotalXColor += cantidadXTalla;
                                            let totalXTalla = cantidadXTalla * valorTalla.Precio;
                                            totalXColor = parseInt(totalXColor, 10) + totalXTalla;
                                            return (

                                                <CeldaTallas
                                                    key={`${color.NombreColor}-${talla}-${props.codigoProducto}`}
                                                    agregarProducto={props.agregarProducto}
                                                    disponible={valorTalla.Disponible}
                                                    backorder={backOrder}
                                                    hasBackOrder={props.hasBackOrder}
                                                    NoEsFuturo={props.futuro}
                                                    handleArrowKeys={handleArrowKeys}
                                                    precio={valorTalla.Precio}
                                                    codigoProducto={props.codigoProducto}
                                                    codigoColor={color.CodigoColor}
                                                    codigoTalla={talla}
                                                    grupoTalla={props.producto.GrupoTalla}
                                                    cantidad={valorTalla.Cantidad}
                                                    onFocus={onFocus}
                                                    onBlur={onBlur}
                                                    color={color.NombreColor}
                                                    setListaImagenesPrincipal={hasImages ? props.setListaImagenes : null}
                                                    onChange={props.onchangeText}
                                                    CrearDetallePedidoOnline={props.CrearDetallePedidoOnline}
                                                    cantidadMinima={props.producto.CantidadMinima}
                                                    stockVisibleFuturo={props.producto.StockVisible}
                                                    setColor={setColorSeleccionado}
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
                                    }}>{numberWithCommas(totalXColor)}</td>
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

const ListaColores = props => {
    const { colores, handleColorFiltrado, colorFiltrado } = props;

    return (
        <ul style={{ position: 'absolute', zIndex: 999 }} className="list-group">
            {colores.map(x => (
                <ListItem key={x.NombreColor} color={x.NombreColor} activo={(colorFiltrado.includes(x.NombreColor)) ? "active" : ""} handleColorFiltrado={handleColorFiltrado} />
            ))}
        </ul>
    )
}

const ListItem = props => {

    const handleClick = () => {
        props.handleColorFiltrado(props.color)
    }

    return <li onClick={handleClick} className={`list-group-item ${props.activo}`}>{props.color}</li>
}

// const numberWithCommasNoDec = (x) => {
//     var parts = x.toString().split(".");
//     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     return parts.join(".");
// }

export default TablaVistaProducto;