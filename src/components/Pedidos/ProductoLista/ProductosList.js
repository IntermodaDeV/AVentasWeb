import React from 'react';
import Producto from 'components/Pedidos/ProductoLista/Producto';
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import styles from 'components/Pedidos/ProductoLista/Producto.module.css'

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

const Productos = (props) => {
    const searched = (nombre, codigo,texto) => {
        if (texto === '') {
            return true;
        }
        let found = false;

        found = nombre.toLowerCase().includes(texto.toLowerCase()) || codigo.toLowerCase().includes(texto.toLowerCase());
        return found;
    }
    let isFuture = false;
    if (props.coleccion.ColeccionTipo === "F" || props.coleccion.ColeccionTipo === 'f') {
        isFuture = true;
    };

    let cantidad = 0;
    let cardSize = 360;
    let productosList = [];

    const Row = React.memo(({ index, data, style }) => {

        const { ListProducts, itemsPerRow, styles } = data;

        const items = [];
        const fromIndex = index * itemsPerRow;
        const toIndex = Math.min(fromIndex + itemsPerRow, ListProducts.length);

        let Restante = 0;
        if (toIndex === ListProducts.length) {
            Restante = toIndex - fromIndex;

            if (Restante === itemsPerRow) {
                Restante = 0;
            }
            else {
                Restante = itemsPerRow - Restante;
            }
        }

        let AltClass = (itemsPerRow > ListProducts.length || itemsPerRow === ListProducts.length);

        for (let i = fromIndex; i < toIndex; i++) {
            items.push(
                <Producto
                    producto={ListProducts[i]}
                    key={i}
                    SoldOut={SoldOut(ListProducts[i])}
                    toggleSelectProducto={props.toggleSelectProducto}
                    listaProductosAgregados={props.listaProductosAgregados}
                    Click={props.Click.bind(this, ListProducts[i])}
                    ClickVistaRapida={props.ClickVistaRapida.bind(this, ListProducts[i])}
                    TableValue={props.TableValue}
                    GrupoPrecioCliente={props.GrupoPrecioCliente}
                    alertaPrecio={props.alertaPrecio}
                    LimiteVenta={props.LimiteVenta}
                    TotalPedido={props.TotalPedido}
                    alertaLimiteCredito={props.alertaLimiteCredito}
                    isFuture={isFuture}
                ></Producto>
            );
        }

        if (Restante !== 0 && !AltClass) {
            for (let i = 0; i < Restante; i++) {
                items.push(
                    <div key={i} className="col" style={{ maxWidth: '360px', visibility: "hidden" }}>

                    </div>
                );
            }
        }

        return (
            <div className={AltClass ? "my-3 " + styles.AltRowProducto : "my-3 " + styles.RowProducto} style={style}>
                {items}
            </div>
        )
    }, areEqual);


    props.coleccion.Edades.map((edad) => {
        if (props.filtroEdad === null || props.filtroEdad === edad.IdEdad) {
            edad.ProductosXEdad.map((producto) => {
                if (isFuture || !props.NoStock) {
                    let encontrado = searched(producto.NombreProducto, producto.ProductoId ,props.buscador);

                    if (encontrado) {
                        if (props.Linea.IdLinea === producto.Linea.IdLinea && filtro(producto.AtributosXProducto, props.filtroAtributos)) {
                            cantidad++;
                            let productoConEdad = { ...producto, IdEdad: edad.IdEdad, Edad: edad.Edad };
                            productosList.push(productoConEdad);
                            return true;
                        }
                    }
                }
                else {
                    let Sold = SoldOut(producto);

                    if (!Sold) {
                        let encontrado = searched(producto.NombreProducto, producto.ProductoId,props.buscador);

                        if (encontrado) {
                            if (props.Linea.IdLinea === producto.Linea.IdLinea && filtro(producto.AtributosXProducto, props.filtroAtributos)) {
                                cantidad++;
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

    if (props.coleccion.ColeccionTipo !== "F" || props.coleccion.ColeccionTipo !== 'f') {
        productosList.forEach((e, i) => {
            const stock = e.fisicaDisponible.reduce((a, b) => (a + b.Cantidad), 0);
            e.stockDisponible = stock;
        });
        if (props.Ordenamiento) {
            if (props.Ordenamiento === "Nombre") {
                productosList.sort((a, b) => (a.NombreProducto.localeCompare(b.NombreProducto)));
            } else if (props.Ordenamiento === "Codigo") {
                productosList.sort((a, b) => (a.ProductoId.localeCompare(b.ProductoId)));
            } else {
                productosList.sort((a, b) => ((a.stockDisponible > b.stockDisponible) ? -1 : 1));
            }
        } else {
            productosList.sort((a, b) => ((a.stockDisponible > b.stockDisponible) ? -1 : 1));
        }
    }

    if (props.coleccion.ColeccionTipo === "F" || props.coleccion.ColeccionTipo === 'f') {
        if (props.Ordenamiento) {
            if (props.Ordenamiento === "Nombre") {
                productosList.sort((a, b) => (a.NombreProducto.localeCompare(b.NombreProducto)));
            } else if (props.Ordenamiento === "Codigo") {
                productosList.sort((a, b) => (a.ProductoId.localeCompare(b.ProductoId)));
            }
        } else {
            productosList.sort((a, b) => a.ProductoId.localeCompare(b.ProductoId));
        }
    }

    let productos = (
        <div style={{ height: "80vh" }}>
            <AutoSizer>
                {({ height, width }) => {
                    const itemsPerRow = ~~(width / cardSize) || 1;
                    const rowCount = Math.ceil(cantidad / itemsPerRow);
                    let itemData = { ListProducts: productosList, itemsPerRow: itemsPerRow, styles: styles };

                    return (
                        <div>
                            <FixedSizeList
                                height={height}
                                itemCount={rowCount}
                                itemData={itemData}
                                itemSize={360}
                                width={width}
                            >
                                {Row}
                            </FixedSizeList>
                        </div>
                    );
                }}
            </AutoSizer>
        </div>
    );

    let mensajeCantidad = "No hay Productos";
    if (props.CantidadProductos.current) {
        if (cantidad !== 0) {
            if (cantidad > 1) {
                mensajeCantidad = cantidad + " Productos";
            }
            else {
                mensajeCantidad = cantidad + " Producto"
            }
        }
        props.CantidadProductos.current.innerText = mensajeCantidad;
    }

    if (props.coleccion)
        return productos;
}

const areEqual = (prevProps, nextProps) => {
    let iguales = prevProps.filtroAtributos === nextProps.filtroAtributos;
    iguales = iguales && prevProps.coleccion === nextProps.coleccion;
    iguales = iguales && prevProps.coleccion === nextProps.coleccion;
    iguales = iguales && prevProps.buscador === nextProps.buscador;
    iguales = iguales && prevProps.filtroEdad === nextProps.filtroEdad;
    return iguales;
}
export default (Productos);