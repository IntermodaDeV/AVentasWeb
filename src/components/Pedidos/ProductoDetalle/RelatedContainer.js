import React from 'react';
import Carousel from "components/Pedidos/ProductoDetalle/RelatedSlider";
import SearchButton from 'components/Pedidos/ProductoLista/SearchButton'
import ModalFiltros from '../ProductoLista/ModalFiltros';
import FiltroChips from '../ProductoLista/FiltroChips';
import { Add } from '@material-ui/icons';
import { Fab } from '@material-ui/core';
import styles from 'components/Pedidos/ProductoDetalle/RelatedContainer.module.scss'

const filtro = (arrayAtributosXProducto, filtroAtributos) => {
    var tipos = Object.keys(filtroAtributos);
    if (tipos.length === 0) {
        return true;
    }
    var atributoSeleccionados = Object.values(filtroAtributos).find(arraydDescripcion => (arraydDescripcion.length > 0));
    if (!atributoSeleccionados) {
        return true;
    }

    return tipos.find(type => {

        return filtroAtributos[type].find((filtroAtributo) => {
            return arrayAtributosXProducto.find(atributoProducto => (filtroAtributo === atributoProducto.Descripcion));
        });
    });
}

const Productos = (props) => {
    const [TextboxValue, setTextboxValue] = React.useState("");
    let isFuture = false;
    if (props.coleccion.ColeccionTipo === "F" || props.coleccion.ColeccionTipo === 'f') {
        isFuture = true;
    };

    let productosList = [];

    const onChangeSearch = (text) => {
        setTextboxValue(text);
    }

    const onSearchClear = (text) => {
        setTextboxValue("");
    }

    const SoldOut = (producto) => {
        let encontrado = false;
        let cantidad = 0;
        producto.fisicaDisponible.map(disponible => {
            cantidad += disponible.Cantidad;
            return false;
        })

        if (cantidad === 0) {
            encontrado = true
        }

        return encontrado;
    }

    const searched = (product, texto) => {
        if (texto === '') {
            return true;
        }
        let foundName = false;
        let foundAttribute = false;

        foundName = product.NombreProducto.toLowerCase().includes(texto.toLowerCase());

        product.AtributosXProducto.map(atributo => {
            let encontrado = atributo.Descripcion.toLowerCase().includes(texto.toLowerCase());

            if (encontrado) {
                foundAttribute = true
            }

            return false;
        });

        let found = foundName || foundAttribute;

        return found;
    }

    props.coleccion.Edades.map((edad) => {
        if (props.filtroEdad === null || props.filtroEdad === edad.IdEdad) {
            edad.ProductosXEdad.map((producto) => {

                if (isFuture || !props.NoStock) {
                    let encontrado = searched(producto, TextboxValue);

                    if (encontrado) {
                        if (props.Linea.IdLinea === producto.Linea.IdLinea && filtro(producto.AtributosXProducto, props.filtroAtributos)) {
                            let productoConEdad = { ...producto, IdEdad: edad.IdEdad, Edad: edad.Edad };
                            productosList.push(productoConEdad);
                            return true;
                        }
                    }
                }
                else {

                    let Sold = SoldOut(producto);

                    if (!Sold) {

                        let encontrado = searched(producto, TextboxValue);

                        if (encontrado) {
                            if (props.Linea.IdLinea === producto.Linea.IdLinea && filtro(producto.AtributosXProducto, props.filtroAtributos)) {
                                let productoConEdad = { ...producto, IdEdad: edad.IdEdad, Edad: edad.Edad };
                                productosList.push(productoConEdad);
                                return true;
                            }
                        }
                    }
                }

                return false;
            })
        }
        return null;
    });


    if (props.coleccion) {
        return (
            <div>
                <div className="row">
                    <h3 className="font-weight-light flex-grow-1">Productos</h3>
                    <div>
                        <SearchButton onSearch={onChangeSearch} clear={onSearchClear} backgroundColor="unset" />
                    </div>
                </div>

                <div className="row px-3 pb-1">
                    <div className="d-flex">
                        <div className="m-auto">
                            Filtros
                        </div>
                        <Fab className={"mx-2 " + styles.FabButton} color="light" id="ButtonFiltro">
                            <Add className={styles.AddIcon} color="primary" />
                        </Fab>
                    </div>
                    <div className="col">
                        <FiltroChips
                            filtroActivo={props.filtroActivo}
                            filtroAtributos={props.filtroAtributos}
                            filtroEdad={props.filtroEdad}
                            setFiltroEdad={props.setFiltroEdad}
                            handleDeleteAllFiltros={props.handleDeleteAllFiltros}
                            handleDeleteFiltros={props.handleDeleteFiltros}
                        />
                    </div>
                </div>

                <ModalFiltros
                    IdNode={"ButtonFiltro"}
                    styles={props.styles}
                    OnClickSearch={props.OnClickSearch}
                    buscadorFiltros={props.buscadorFiltros}
                    SearchFiltros={props.SearchFiltros}
                    Filtros={props.Filtros}
                    toggleExpandirFiltroAtributos={props.toggleExpandirFiltroAtributos}
                    verificarExpandirFiltroAtributos={props.verificarExpandirFiltroAtributos}
                    VerificarFiltro={props.VerificarFiltro}
                    MarcarFiltro={props.MarcarFiltro}
                />

                <Carousel
                    producto={props.producto}
                    ListaProductos={productosList}
                    Click={props.Click}
                ></Carousel>
            </div >
        );
    }

}

export default Productos;