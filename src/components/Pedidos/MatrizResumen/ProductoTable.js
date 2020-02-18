import React, { useState, useEffect } from 'react';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumen.module.css';
import PopupState, {
    bindTrigger,
    bindPopover
} from 'material-ui-popup-state';
import ToggleIcon from 'material-ui-toggle-icon'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { Popover, Typography, Card, CardContent, CardMedia } from "@material-ui/core";
import CeldaTallas from "components/Pedidos/Global/CeldaTallas";
import { FiTrash2 } from "react-icons/fi";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import 'sweetalert2/src/sweetalert2.scss';


const ProductoTable = (props) => {
    const [dirty, setDirty] = useState(false);
    const [SelectedImage, setSelectedImage] = useState(0);
    const [hasBackOrder, setHasBackOrder] = useState("N");
    const [IsOpen, setIsOpen] = useState(false);

    const urlApi = "https://aventas.devcit.com:3044";


    useEffect(() => {
        setDirty(props.mostrarVacios);
        cargarBackOrder();

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
        fetch(urlApi + "/api/Configuraciones", {
            // headers: {
            //     'Authorization':
            //         'Bearer ' + localStorage.getItem('token'),
            // }
        })
            .then(res => {
                if (res.status === 200) {

                    res.json()
                        .then(
                            (result) => {
                                setHasBackOrder(result.BO)
                            },
                        )
                }

            })
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
                            </div>
                        </div>
                        <PopupState variant="popover" popupId={props.producto.NombreProducto + props.index1}>
                            {popupState => {
                                return (
                                    <>
                                        <div className="px-2">
                                            <ToggleIcon
                                                {...bindTrigger(popupState)}
                                                on={!popupState.isOpen}
                                                onIcon={<Visibility color="action" />}
                                                offIcon={<VisibilityOff color="action" />}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
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

                                            <Card style={{ display: 'flex', }}>
                                                {
                                                    props.producto.ListaImagenes ?
                                                        <div style={{ cursor: 'pointer' }} className="d-flex" onClick={() => setIsOpen(true)}>
                                                            <CardMedia
                                                                style={{ backgroundSize: 'contain', width: '100px' }}
                                                                image={props.producto.ListaImagenes ? props.producto.ListaImagenes[0].FotografiaProducto : "http://www.quesoselllanojaral.com/img/nodisponible.png"}
                                                                title={props.producto.NombreProducto}
                                                            />
                                                            {IsOpen && (
                                                                <Lightbox
                                                                    mainSrc={props.producto.ListaImagenes[SelectedImage].FotografiaProducto}
                                                                    nextSrc={props.producto.ListaImagenes[(SelectedImage + 1) % props.producto.ListaImagenes.length].FotografiaProducto}
                                                                    prevSrc={props.producto.ListaImagenes[(SelectedImage + props.producto.ListaImagenes.length - 1) % props.producto.ListaImagenes.length].FotografiaProducto}
                                                                    onCloseRequest={() => setIsOpen(false)}
                                                                    onMovePrevRequest={() =>
                                                                        setSelectedImage((SelectedImage + props.producto.ListaImagenes.length - 1) % props.producto.ListaImagenes.length)
                                                                    }
                                                                    onMoveNextRequest={() =>
                                                                        setSelectedImage((SelectedImage + 1) % props.producto.ListaImagenes.length)
                                                                    }
                                                                />
                                                            )}
                                                        </div >
                                                        :
                                                        <CardMedia
                                                            style={{ backgroundSize: 'contain', width: '100px' }}
                                                            image={props.producto.ListaImagenes ? props.producto.ListaImagenes[0].FotografiaProducto : "http://www.quesoselllanojaral.com/img/nodisponible.png"}
                                                            title={props.producto.NombreProducto}
                                                        />
                                                }
                                                <CardContent>
                                                    <Typography component="h5" variant="h5">
                                                        {props.producto.NombreProducto}
                                                    </Typography>
                                                    <Typography variant="subtitle1" color="textSecondary">
                                                        {props.codigoProducto}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Popover>
                                    </>
                                )
                            }
                            }
                        </PopupState>
                        <div className="pl-2">
                            <FiTrash2 className={styles.FiTrash2} onClick={() => EliminarProducto(props.grupoTalla, props.codigoProducto, props.producto.NombreProducto)} />
                        </div>
                    </div>

                </td>
            </tr>
            {Object.keys(props.producto.Colores).map((codigoColor, index2) => {
                let color = props.producto.Colores[codigoColor];

                var totalXColor = 0;
                var totalPrecioXColor = 0;

                return (
                    <tr key={index2}>
                        <td className="p-1" style={{
                            textAlign: 'center',
                            alignItems: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 600,
                        }}>
                            <PopupState variant="popover" popupId={props.producto.NombreProducto + props.index1}>
                                {popupState => {
                                    console.log('props.producto :', props.producto);
                                    if (color.ListaImagenes.length !== 0) {
                                        return (
                                            <>
                                                <div className="px-2">
                                                    <ToggleIcon
                                                        {...bindTrigger(popupState)}
                                                        on={!popupState.isOpen}
                                                        onIcon={<Visibility color="action" />}
                                                        offIcon={<VisibilityOff color="action" />}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    />
                                                </div>

                                                {
                                                    popupState.isOpen &&
                                                    <Lightbox
                                                        mainSrc={color.ListaImagenes[SelectedImage].FotografiaProducto}
                                                        nextSrc={color.ListaImagenes[(SelectedImage + 1) % color.ListaImagenes.length].FotografiaProducto}
                                                        prevSrc={color.ListaImagenes[(SelectedImage + color.ListaImagenes.length - 1) % color.ListaImagenes.length].FotografiaProducto}
                                                        onCloseRequest={popupState.close}
                                                        onMovePrevRequest={() =>
                                                            setSelectedImage((SelectedImage + color.ListaImagenes.length - 1) % color.ListaImagenes.length)
                                                        }
                                                        onMoveNextRequest={() =>
                                                            setSelectedImage((SelectedImage + 1) % color.ListaImagenes.length)
                                                        }
                                                    />

                                                }
                                            </>
                                        )
                                    }
                                    return null
                                }
                                }
                            </PopupState>
                            {/* <div style={{
                                width: '25px',
                                height: '25px',
                                borderRadius: '25px',
                                margin: 'auto',
                                backgroundColor: 'rgb(106, 40, 118)'
                            }}></div> */}
                            {color.NombreColor}
                        </td>
                        {
                            Object.keys(color.Tallas).map((codigoTalla, index3) => {
                                var valorTalla = color.Tallas[codigoTalla];
                                var backOrder = (valorTalla.Cantidad > valorTalla.Disponible) ? (valorTalla.Cantidad - valorTalla.Disponible) : 0;

                                totalXColor = parseInt(totalXColor, 10) + (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));

                                totalPrecioXColor = (valorTalla.Precio * totalXColor);


                                return (
                                    <CeldaTallas
                                        key={index3}
                                        disponible={valorTalla.Disponible}
                                        backorder={backOrder}
                                        hasBackOrder={hasBackOrder}
                                        futuro={props.futuro}
                                        handleArrowKeys={handleArrowKeys}
                                        precio={valorTalla.Precio}
                                        codigoProducto={props.codigoProducto}
                                        codigoColor={codigoColor}
                                        codigoTalla={codigoTalla}
                                        grupoTalla={props.grupoTalla}
                                        cantidad={valorTalla.Cantidad}
                                        onFocus={onFocus}
                                        onBlur={onBlur}
                                        onChange={props.onValueChange}
                                        CrearDetallePedidoOnline={props.CrearDetallePedidoOnline}
                                    />
                                )
                            })
                        }
                        <td className="p-1" style={{
                            textAlign: 'center',
                            alignItems: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 600,
                        }}>{totalXColor}</td>

                        <td className="p-1" style={{
                            textAlign: 'right',
                            alignItems: 'center',
                            verticalAlign: 'middle',
                            fontWeight: 600,
                        }}>{props.numberWithCommas(totalPrecioXColor)}</td>
                    </tr>
                )
            })}
        </>
    )

    return productoTable;
}
const areEqual = (prevProps, nextProps) => {
    return false;
    // let iguales = prevProps.filtroAtributos === nextProps.filtroAtributos;
    // iguales = iguales && prevProps.coleccion === nextProps.coleccion;
}
export default React.memo(ProductoTable, areEqual);
