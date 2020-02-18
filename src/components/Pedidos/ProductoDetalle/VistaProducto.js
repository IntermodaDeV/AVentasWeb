import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core'
import notFound from 'assets/nodisponible.png';
//import ReactTooltip from 'react-tooltip'
import TablaVistaProducto from 'components/Pedidos/ProductoDetalle/TablaVistaProducto';
import Slider from "components/Pedidos/ProductoDetalle/Slider";
import RelatedContainer from "components/Pedidos/ProductoDetalle/RelatedContainer";
import Expandable from "components/Pedidos/ProductoDetalle/Expandable";
import styles from 'components/Pedidos/ProductoDetalle/VistaProducto.module.css';

const VistaProducto = (props) => {
    const [precioProducto, setPrecio] = useState(undefined);
    const [selected, setselected] = useState(false);
    const [hasBackOrder, setHasBackOrder] = useState("N");

    const urlApi = "https://aventas.devcit.com:3044";

    useEffect(() => {
        // Update the document title using the browser API
        cargarBackOrder();
        Mounted();
        let selected = false;
        try {
            selected = props.TableValue[props.producto.GrupoTalla].Productos[props.producto.ProductoId].Selected;
        } catch{ }
        setselected(selected);
        let precio = props.producto.Precio.find(precioxProd => {
            return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
        });
        if (precio) {
            setPrecio(precio);
        }

        return () => {
            Unmounted();
        }
        // eslint-disable-next-line
    }, []);

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
            if (props.producto.fisicaDisponible.reduce((acc, curr) => { return acc + curr.Cantidad }, 0) > 0) {
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

    let isEmptyImages = (props.producto.ListaImagenes.length === 0);

    return (
        <div className="row">
            <div className="col-md-5">
                {
                    isEmptyImages ?
                        <div className="text-center">
                            <img alt={"ImagenProducto"} src={notFound}></img>
                        </div>
                        :
                        <Slider ListaImagenes={props.producto.ListaImagenes} />
                }
            </div>
            <div className="col-md-7 mt-md-0 mt-3">
                <h2 className={styles.Title}>
                    {props.producto.NombreProducto}
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
                        </div>
                    </div>
                    <div className="col-12 p-0 mt-3">
                        <div className={"w-100 mw-100 overflow-auto " + styles.ContainerTablaTallas}>
                            <form>
                                <TablaVistaProducto
                                    hasBackOrder={hasBackOrder}
                                    TableValue={props.TableValue}
                                    futuro={props.futuro}
                                    codigoProducto={props.producto.ProductoId}
                                    onfocus={props.onfocus}
                                    producto={props.producto}
                                    Cliente={props.Cliente}
                                    onchangeText={props.onchangeText}
                                    CrearDetallePedidoOnline={props.CrearDetallePedidoOnline}
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
