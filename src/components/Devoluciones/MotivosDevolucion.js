import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import { Dropdown } from "semantic-ui-react";
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { APIURL } from 'utils/Enviroment';

export const MotivosDevolucion = ({ agregarProducto, agregarDevolucionCompleta }) => {
    const clienteSelected = useSelector(e => e.Devolucion.clienteSelected);
    const devolucionCompleta = useSelector(e => e.Devolucion.devolucionCompleta);
    const dispatch = useDispatch();

    const [codigo, setCodigo] = useState("");
    const [color, setColor] = useState("");
    const [factura, setFactura] = useState("");
    const [facturas, setFacturas] = useState([]);

    const añadir = async () => {
        const data = await axios.get(`${APIURL}/api/producto/${clienteSelected.EmpresaId}/${codigo}/${color}`)
        agregarProducto(data.data)
        limpiarCampos();
    }

    const obtenerProductosFactura = async () => {
        const data = await axios.get(`${APIURL}/api/productodevolucion/factura/${factura}`);
        let codigoProductos = [...new Set(data.data.map(x => x.IdProducto))];
        let productosDevolver = [];

        for (let codigo of codigoProductos) {
            let productos = data.data.filter(x => x.IdProducto === codigo);
            let colores = [...new Set(productos.map(x => x.CodigoColor))];
            let tallas = [...new Set(productos.map(x => x.CodigoTalla))];

            let nuevosProductos = await axios.get(`${APIURL}/api/productodevolucion/producto/${codigo}`, { params: { colores, tallas } });
            productosDevolver.push(nuevosProductos.data)
        }

        agregarDevolucionCompleta(productosDevolver, data.data);
    }

    const obtenerFacturasCliente = async () => {
        try {
            const data = await axios.get(`${APIURL}/api/factura/${clienteSelected.Codigo}`);
            setFacturas(data.data);
        } catch (err) {

        }
    }

    const limpiarCampos = () => {
        setCodigo("");
        setColor("");
    }

    const handleDevolucionCompleta = () => {
        dispatch({ type: "SET_DEVOLUCIONCOMPLETA" });
        dispatch({ type: "SET_TABLEVALUEDEVOLUCION", payload: {} });
    }

    const dataFacturas = () => {
        return facturas.map(x => ({ key: x.factura, value: x.factura, text: `${x.factura} - ${x.pedido}` }));
    }

    useEffect(() => {
        obtenerFacturasCliente();
    });

    return (
        <Card style={{ margin: '15px' }}>
            <CardContent>
                <div>
                    <h3>Motivo devolución</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <Dropdown
                            placeholder="Seleccione Cliente"
                            search
                            selection
                            options={[{ key: 1, value: 1, text: "uno" }]}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            style={{ zIndex: 999 }}
                            multiple={false}

                        />
                        <Dropdown
                            placeholder="Seleccione Cliente"
                            search
                            selection
                            options={[{ key: 1, value: 1, text: "uno" }]}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            style={{ zIndex: 999 }}
                            multiple={false}

                        />
                        <label style={{ fontSize: 15, fontWeight: 'bold' }}><input type="checkbox" checked={devolucionCompleta} onChange={handleDevolucionCompleta} /> Devolución Completa </label>
                    </div>
                </div>
                {devolucionCompleta
                    ?
                    <div style={{ marginTop: 40 }}>
                        <h3>Seleccione factura</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Dropdown
                                placeholder="Seleccione factura"
                                search
                                selection
                                options={dataFacturas()}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                                style={{ zIndex: 999, width: '100%' }}
                                multiple={false}
                                onChange={(e, { value }) => { setFactura(value) }}
                            />
                            <button className="btn btn-success" onClick={obtenerProductosFactura}>Registrar</button>
                        </div>
                    </div>
                    :
                    <div style={{ marginTop: 40 }}>
                        <h3>Agregar producto</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <input type="text" className="mr-5 form-control" placeholder="Codigo Producto" value={codigo} onChange={(e) => { setCodigo(e.target.value) }} />
                            <input type="text" className="mr-5 form-control" placeholder="Codigo Color" value={color} onChange={(e) => { setColor(e.target.value) }} />
                            <input type="text" className="mr-5 form-control" placeholder="Talla" />
                            <input type="text" className="mr-5 form-control" placeholder="Codigo Barra" />
                            <button className="btn btn-success" onClick={añadir}>Añadir</button>
                        </div>
                    </div>
                }
            </CardContent>
        </Card>
    );
}