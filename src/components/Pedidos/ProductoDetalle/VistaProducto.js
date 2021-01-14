import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core'
import notFound from 'assets/nodisponible.png';
import { FaEye } from "react-icons/fa";
import Lightbox from 'react-image-lightbox';
import { FiAlertTriangle } from 'react-icons/fi';
import TablaVistaProducto from 'components/Pedidos/ProductoDetalle/TablaVistaProducto';
import Slider from "components/Pedidos/ProductoDetalle/Slider";
import RelatedContainer from "components/Pedidos/ProductoDetalle/RelatedContainer";
import Expandable from "components/Pedidos/ProductoDetalle/Expandable";
import styles from 'components/Pedidos/ProductoDetalle/VistaProducto.module.css';
import { useSelector,useDispatch } from 'react-redux';

const VistaProducto = (props) => {
    const [precioProducto, setPrecio] = useState(undefined);
    const [selected, setselected] = useState(false);
    const [hasBackOrder, setHasBackOrder] = useState("N");
    const [listaImagenes,setListaImagenes] = useState(props.producto.ListaImagenes);
    const [SelectedImage, setSelectedImage] = useState(0);
    const [imagenes] = useState(props.producto.ListaImagenes);
    const [IsOpen, setIsOpen] = useState(false);
    const Configuraciones = useSelector(e=>e.Configuraciones);
    const productoSeleccionado = useSelector(e=>e.producto);
    const listaProductosAgregados = useSelector(e=>e.listaProductosAgregados);
    const dispatch = useDispatch();

    useEffect(() => {
        // Update the document title using the browser API
        cargarBackOrder();
        Mounted();

        let precio = props.producto.Precio.find(precioxProd => {
            return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
        });
        if(!precio && props.producto.fisicaDisponible.length>0){
            let precioFisicoDisponible = props.producto.fisicaDisponible.find(fsDis=> fsDis.PreciosEspecificos.find(ps=>ps.Precio>0 && ps.GrupoPrecio === props.Cliente.GrupoPrecio))
            if(precioFisicoDisponible){
              precio={Precio: precioFisicoDisponible.PreciosEspecificos.find(ps=>ps.Precio>0 && ps.GrupoPrecio === props.Cliente.GrupoPrecio).Precio};
            }
          }
        if (precio) {
            setPrecio(precio);
        }

        return () => {
            Unmounted();
        }
        // eslint-disable-next-line
    }, []);
    useEffect(() => {
        let selected = false;
        try {
            selected = props.TableValue[props.producto.GrupoTalla].Productos[props.producto.ProductoId].Selected;
        } catch{ }
        setselected(selected);
        // eslint-disable-next-line
    }, [props.producto]);

    const cargarBackOrder = () => {
        setHasBackOrder(Configuraciones.BO)
    }

    const Mounted = () => {
        let element = document.querySelectorAll('.cr-content.container-fluid');
        element[0].style.backgroundColor = 'white';
    }

    const Unmounted = () => {
        let element = document.querySelectorAll('.cr-content.container-fluid');
        element[0].style.backgroundColor = '';
    }
    const toggleSelect = () => {
        if (precioProducto !== undefined) {            
            if (props.futuro === false || props.producto.fisicaDisponible.reduce((acc, curr) => { return acc + curr.Cantidad }, 0) > 0) {
                props.toggleSelectProducto({ ...props.producto });
                setselected(!selected);
            } else {
                props.alertaPrecio("Stock");
            }
        } else {
            props.alertaPrecio();
        }
    }

    var precio = props.producto.Precio.find(precioxProd => {
        return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
    });
    if (precio === undefined) {
        precio = {
            Precio: 0
        }
    }

    const setListaImagenesPrincipal = (color) => {
        const imagenesColor = props.producto.ListaColores.filter(e => e.NombreColor === color);
        setListaImagenes(imagenesColor[0].ListaImagenes);
    }

    const agregarProducto = () => {
        let found = false;

        for (let producto of listaProductosAgregados) {
            if (producto.ProductoId === productoSeleccionado.ProductoId) {
                if (producto.Selected) {
                    found = true;
                }
                break;
            }
        }

        if (!found) {
            let newProduct = { ...productoSeleccionado, Selected: true };
            dispatch({ type: 'SET_PRODUCTOAGREGADO', payload: newProduct });
            toggleSelect();
        }
    }

    let isEmptyImages = (listaImagenes.length === 0);

    return (
        <div className="row">
            <div className="col-md-5">
                {
                    isEmptyImages ?
                        <div className="text-center">
                            <img alt={"ImagenProducto"} src={notFound}></img>
                        </div>
                        :
                        <Slider ListaImagenes={listaImagenes} />
                }
            </div>
            <div className="col-md-7 mt-md-0 mt-3">
                <h2 className={styles.Title}>
                    {props.producto.NombreProducto} {(props.producto.ListaImagenes.length>0) && <FaEye onClick={()=>setIsOpen(true)} size={"30px"} />}
                </h2>
                <h5 className={styles.Subtitle}>
                    {'Código: '}{props.producto.ProductoId}
                </h5>
                <div>
                    <Expandable producto={props.producto}></Expandable>
                </div>
                <div className="row mb-3">
                    {/* <div className="col-12 mt-2" style={{ borderTop: "1px solid #aaa" }}>
                        <div className="py-2">

                            <h6><b>Colores Disponibles</b></h6>

                            <div className="row">
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

                            </div>
                        </div>

                        <div className="py-2">

                            <h6><b>Tallas Disponibles</b></h6>

                            <div className="row">
                                {props.producto.ListaTalla.map((element, index) => {
                                    return (

                                        <div key={index} className={"px-2 " + styles.Tallas}>
                                            <p style={{ textAlign: "center" }}>{element.Talla}</p>

                                        </div>

                                    )
                                })}
                            </div>
                        </div>
                    </div>
                */}
                    <div className="col-12 mt-2">
                        <div className="my-2">
                            <Button color="primary" variant="outlined" onClickCapture={toggleSelect}>{selected ? "Quitar" : "Agregar"}</Button>
                            {props.producto.CantidadMinima>0 && <div style={{color:"red",display:"inline",marginLeft:15,fontSize:20}}><FiAlertTriangle style={{color:'red'}}/> Este producto se vende en múltiplos de {props.producto.CantidadMinima}</div>}
                        </div>
                    </div>
                    <div className="col-12 p-0 mt-3">
                        <div className={"w-100 mw-100 overflow-auto " + styles.ContainerTablaTallas}>
                            <form>
                                <TablaVistaProducto
                                    agregarProducto={agregarProducto}
                                    hasBackOrder={hasBackOrder}
                                    TableValue={props.TableValue}
                                    futuro={props.futuro}
                                    codigoProducto={props.producto.ProductoId}
                                    onfocus={props.onfocus}
                                    producto={props.producto}
                                    Cliente={props.Cliente}
                                    onchangeText={props.onchangeText}
                                    CrearDetallePedidoOnline={props.CrearDetallePedidoOnline}
                                    setListaImagenes={setListaImagenesPrincipal}
                                />
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <RelatedContainer
                        producto={props.producto}
                        // filtroEdad={props.filtroEdad}
                        Click={props.Click}
                        coleccion={props.coleccion}
                        Linea={props.Linea}
                        // filtroAtributos={props.filtroAtributos}
                        NoStock={props.NoStock}

                        //ModalFiltrosProps
                        styles={props.styles}
                        OnClickSearch={props.OnClickSearch}
                        buscadorFiltros={props.buscadorFiltros}
                        SearchFiltros={props.SearchFiltros}
                        Filtros={props.Filtros}
                        toggleExpandirFiltroAtributos={props.toggleExpandirFiltroAtributos}
                        verificarExpandirFiltroAtributos={props.verificarExpandirFiltroAtributos}
                        VerificarFiltro={props.VerificarFiltro}
                        MarcarFiltro={props.MarcarFiltro}

                        //FiltroChipsProps
                        filtroActivo={props.filtroActivo}
                        filtroAtributos={props.filtroAtributos}
                        filtroEdad={props.filtroEdad}
                        setFiltroEdad={props.setFiltroEdad}
                        handleDeleteAllFiltros={props.handleDeleteAllFiltros}
                        handleDeleteFiltros={props.handleDeleteFiltros}
                    />
                </div>
            </div>
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

// const decimalColorToHTMLcolor = (number) => {
//     //converts to a integer
//     var intnumber = number - 0;

//     // isolate the colors - really not necessary
//     var red, green, blue;

//     // needed since toString does not zero fill on left
//     var template = "#000000";

//     // in the MS Windows world RGB colors
//     // are 0xBBGGRR because of the way Intel chips store bytes
//     red = (intnumber & 0x0000ff) << 16;
//     green = intnumber & 0x00ff00;
//     blue = (intnumber & 0xff0000) >>> 16;

//     // mask out each color and reverse the order
//     intnumber = red | green | blue;

//     // toString converts a number to a hexstring
//     var HTMLcolor = intnumber.toString(16);

//     //template adds # for standard HTML #RRGGBB
//     HTMLcolor = template.substring(0, 7 - HTMLcolor.length) + HTMLcolor;

//     return HTMLcolor;
// }

const areEqual = (prevProps, nextProps) => {
    return false;
    // let iguales = prevProps.producto === nextProps.producto;
    // iguales = iguales && prevProps.imagenProducto === nextProps.imagenProducto;
    // iguales = iguales && prevProps.Cliente === nextProps.Cliente;
    // return iguales;
}
export default React.memo(VistaProducto, areEqual);
