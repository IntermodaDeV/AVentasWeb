import React, { useState } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { useSelector } from 'react-redux';

import { Loading } from 'components/Global/Loading';

export const Recolocacion = (props) => {
    const [rma, setRma] = useState("");
    const clienteSeleccionado = useSelector(e => e.TrasladoPedido.clienteSeleccionado);

    const obtenerProductoRma = async () => {
        try {
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

        } catch {
            //setproductos([]);
        }
    }

    return (
        <>
            <Loading open={open} title={title} />
            <Card style={{ margin: '15px' }}>
                <CardContent>
                    <div style={{ marginTop: 20 }}>
                        <h3 style={{ marginLeft: 30 }}>Recolocación de devolución</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', marginTop: 40 }}>
                            <div style={{ display: 'flex', width: '90%' }}>
                                <input type="text" className="mr-5 form-control" placeholder="RMA Devolución" onChange={(e) => { setRma(e.target.value) }} />
                            </div>
                            <button className="btn btn-success" onClick={obtenerProductoRma}>Registrar</button>

                        </div>
                    </div>

                </CardContent>
            </Card>
        </>
    );
}