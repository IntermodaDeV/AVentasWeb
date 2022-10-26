import React, { useState } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { mostrarModal } from 'utils/common';
import { Loading } from 'components/Global/Loading';
import { Dropdown } from "semantic-ui-react";
import { useSelector } from 'react-redux';


export const Recolocacion = (props) => {
    const tiposPedido = useSelector(e => e.TiposPedido);
    const [rma, setRma] = useState("");
    const clienteSeleccionado = useSelector(e => e.TrasladoPedido.clienteSeleccionado);
    const [tipoCredito, settipoCredito] = useState("");
    const [productos, setproductos] = useState([]);
    const [title, setTitle] = useState("");
    const [open, setOpen] = useState(false);

    const obtenerProductoRma = async () => {
        try {
            if (rma != "") {
                setTitle("Obteniendo productos de la devolución");
                setOpen(true);
                setRma("RM-0023971")
                const grupoPrecio = clienteSeleccionado.GrupoPrecio;
                const data = await axios.get(`${APIURL}/api/trasladopedido/obtenerproductos/${rma}/${clienteSeleccionado.EmpresaId}`);
                let codigoProductos = [...new Set(data.data.productos.map(x => x.codigoProducto))];
                let productosResult = [];
                const total = 0;
                for (let codigo of codigoProductos) {
                    let products = data.data.productos.filter(x => x.codigoProducto === codigo);
                    let colores = [...new Set(products.map(x => x.color))];
                    let tallas = [...new Set(products.map(x => x.talla))];
                    let nuevosProductos = await axios.get(`${APIURL}/api/trasladopedido/getProducto/${codigo}/${grupoPrecio}/${data.data.coleccionId}`, { params: { colores, tallas } });
                    productosResult.push(nuevosProductos.data)
                }
    
                console.log(productosResult)
                setOpen(false);
            }
            else {
                mostrarModal('Recolocación', 'Debe llenar el campo del RMA para poder realizar esta acción.', "error");
            }
        } catch {
            setproductos([]);
        }
    }

    const dataTipoCredito = () => {
        return tiposPedido.filter(x=> x.Aplica_Todos).map(tipoPedido => ({ key: tipoPedido.TipoPedido, value: tipoPedido.TipoPedido, text: tipoPedido.TipoPedido }));
    }

    return (
        <>
            <Loading open={open} title={title} />
            <Card className="my-2" style={{ overflow: 'unset', margin: '15px' }}>
                <CardContent>
                    <div>
                        <h3 style={{ marginLeft: 30 }}>Recolocación de devolución</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', marginTop: 40 }}>
                            <div style={{ display: 'flex', width: '80%', marginLeft: 30 }}>
                                <input type="text" className="mr-5 form-control" placeholder="RMA Devolución" onChange={(e) => { setRma(e.target.value) }} />
                            </div>
                            <hr />
                            <div style={{ display: 'flex', width: '40%', marginRight: 30 }}>
                                <Dropdown
                                    placeholder="Seleccione Cliente"
                                    fluid
                                    search
                                    selection
                                    onChange={(e, { value }) => { settipoCredito(value) }}
                                    options={dataTipoCredito()}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 999 }}
                                    multiple={false}
                                />
                            </div>

                            <button className="btn btn-success" onClick={obtenerProductoRma}>Registrar</button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}