import React, { useState, useEffect } from 'react';
import styles from 'components/Pedidos/ProductoLista/VistaRapidaProducto.module.css';
import ReactImageMagnify from 'react-image-magnify';
import {
    Button,
    Col,
    Row,
} from 'reactstrap';
import {
    Carousel
} from 'element-react';
import Dialog from '@material-ui/core/Dialog';
import Fade from '@material-ui/core/Fade';
import ReactTooltip from 'react-tooltip'

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Fade ref={ref} {...props} />;
});

const VistaRapidaProducto = (props) => {
    const toggleSelect = () => {
        if (precioProducto !== undefined) {
            if (props.futuro === false || props.producto.fisicaDisponible.reduce((acc, curr) => { return acc + curr.Cantidad }, 0) > 0) {
                props.toggleSelectProducto({...props.producto});
                setselected(!selected);
            } else {
                props.alertaPrecio("Stock");
            }
        } else {
            props.alertaPrecio();
        }
    }
    const [precioProducto, setPrecio] = useState(undefined);
    const [selected, setselected] = useState(false);
    useEffect(() => {
        let selected = false;
        try {
            selected = props.TableValue[props.producto.Linea.IdLinea][props.producto.CodigoColeccion][props.producto.GrupoTalla].Productos[props.producto.ProductoId].Selected;
        } catch{ }
        setselected(selected);
        if (props.producto.Precio) {
            let precio = props.producto.Precio.find(precioxProd => {
                return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
            });
            let precioFisicoDisponible = props.producto.fisicaDisponible.find(fsDis=> fsDis.PreciosEspecificos.find(ps=>ps.Precio>0))

            if(precioFisicoDisponible){
                precio={Precio: precioFisicoDisponible.PreciosEspecificos.find(ps=>ps.Precio>0).Precio};
              }
            if (precio) {
                setPrecio(precio);
            }
        }
        // eslint-disable-next-line
    }, [props.producto]);
    if (props.imagenProducto === '' && props.visible) {
        if(props.producto.ListaImagenes && props.producto.ListaImagenes.length > 0)
        {
            props.changeImageProducto(props.producto.ListaImagenes[0].FotografiaProducto);
        }
        else
        {
            props.changeImageProducto(null);
        }
    }
    if (!props.visible) {
        return null;
    }
    return (

        <Dialog
            TransitionComponent={Transition}
            maxWidth="xl"
            open={props.visible}
            onClose={props.CerrarDialog}
            classes={"Header"}
            fullWidth={true}
            scroll={"body"}
        >
            <Row style={{ marginTop: '10px', marginBottom: '10px', marginLeft: 0, }} >
                <Col sm={4}>
                    <Carousel autoplay={false} indicatorPosition="none" height="420px">
                        {
                            props.producto.ListaImagenes.length === 0 ?
                                <Carousel.Item key={0} >
                                    <img alt={"Foto no disponible"} className={styles['main-img-NoDisponible']} src={"http://www.quesoselllanojaral.com/img/nodisponible.png"} />
                                </Carousel.Item> :
                                props.producto.ListaImagenes.map((item, index) => {
                                    return (
                                        <Carousel.Item key={index} >
                                            <ReactImageMagnify {...{
                                                imageClassName: styles['main-img'],
                                                smallImage: {
                                                    alt: 'Foto producto',
                                                    isFluidWidth: true,
                                                    src: item.FotografiaProducto,
                                                },
                                                largeImage: {
                                                    src: item.FotografiaProducto,
                                                    width: 1200,
                                                    height: 1800
                                                },
                                                enlargedImagePortalId: 'portal',
                                                enlargedImageContainerDimensions: {
                                                    width: '200%',
                                                    height: '100%'
                                                }
                                            }} />
                                            {/* <img className={styles['main-img']} src={item} /> */}
                                        </Carousel.Item>
                                    )
                                })
                        }
                    </Carousel>
                </Col>
                <Col sm={8}>
                    <div id='portal' className={styles['fotoVistaRapida']}>
                    </div>
                    <div id='contenidoVistaRapida' className={styles['contenidoVistaRapida']}>
                        <h3><b>{props.producto.NombreProducto}</b></h3>
                        <h6>{'Codigo: '} <b>{props.producto.ProductoId}</b></h6>
                        <hr className={styles.hrDetalle}></hr>

                        <Row>
                            <Col>
                                <h6><b>Detalle del Producto</b></h6>
                                <table style={{ width: '100%' }}>

                                    <tbody>

                                        {props.producto.AtributosXProducto.map((element, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td style={{ paddingRight: 15 }}><b>{element.Tipo}</b></td>
                                                    <td style={{ marginRight: 5 }}>{element.Descripcion}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </Col>
                            <Col>

                                <h6><b>Colores Disponibles</b></h6>
                                <Col>

                                    <Row>

                                        {props.producto.ListaColores.map((element, index) => {
                                            var colorId = "color" + index;

                                            let color = "#fff"
                                            if (element.Color !== '0' && element.Color !== null) {
                                                color = decimalColorToHTMLcolor(element.Color);
                                            }
                                            return (

                                                <div key={index}>
                                                    <div data-tip data-for={colorId} style={{ height: '24px', width: '24px', marginRight: 5, marginBottom: 2, backgroundColor: color, borderRadius: '50px', border: '1px solid #aaa' }}>


                                                    </div>

                                                    <ReactTooltip id={colorId} place="top" type="dark" effect="float">
                                                        <span>{element.NombreColor}</span>
                                                    </ReactTooltip>
                                                </div>


                                            )
                                        })}

                                    </Row>
                                </Col>
                                <br></br>
                                <h6><b>Tallas Disponibles</b></h6>
                                <Col>

                                    <Row>

                                        {props.producto.ListaTalla.map((element, index) => {
                                            return (

                                                <div key={index} className={"px-2 " + styles.Tallas}>
                                                    <p style={{ textAlign: "center" }}>{element.Talla}</p>

                                                </div>

                                            )
                                        })}
                                    </Row>
                                </Col>
                            </Col>
                        </Row>
                        <hr />
                        <Button color="success" onClick={toggleSelect} >{selected ? "Quitar" : "Agregar"}</Button>
                        <br />
                        <br />
                    </div>


                </Col>
            </Row>
        </Dialog>

    );
}

const decimalColorToHTMLcolor = (number) => {
    //converts to a integer
    var intnumber = number - 0;

    // isolate the colors - really not necessary
    var red, green, blue;

    // needed since toString does not zero fill on left
    var template = "#000000";

    // in the MS Windows world RGB colors
    // are 0xBBGGRR because of the way Intel chips store bytes
    red = (intnumber & 0x0000ff) << 16;
    green = intnumber & 0x00ff00;
    blue = (intnumber & 0xff0000) >>> 16;

    // mask out each color and reverse the order
    intnumber = red | green | blue;

    // toString converts a number to a hexstring
    var HTMLcolor = intnumber.toString(16);

    //template adds # for standard HTML #RRGGBB
    HTMLcolor = template.substring(0, 7 - HTMLcolor.length) + HTMLcolor;

    return HTMLcolor;
}
export default VistaRapidaProducto;