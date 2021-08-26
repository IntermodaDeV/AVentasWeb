import React, { useState } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import { Dropdown } from "semantic-ui-react";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { APIURL } from 'utils/Enviroment';

export const MotivosDevolucion = ({ agregarProducto }) => {
    const clienteSelected = useSelector(e => e.Devolucion.clienteSelected);
    const [codigo, setCodigo] = useState("");
    const [color, setColor] = useState("");

    const añadir = async () => {
        const data = await axios.get(`${APIURL}/api/producto/${clienteSelected.EmpresaId}/${codigo}/${color}`)
        agregarProducto(data.data)
        limpiarCampos();
    }

    const limpiarCampos = () => {
        setCodigo("");
        setColor("");
    }

    return (
        <Card style={{ margin: '15px' }}>
            <CardContent>
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
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                    <input type="text" className="mr-5 form-control" placeholder="Codigo Producto" value={codigo} onChange={(e) => { setCodigo(e.target.value) }} />
                    <input type="text" className="mr-5 form-control" placeholder="Codigo Color" value={color} onChange={(e) => { setColor(e.target.value) }} />
                    <input type="text" className="mr-5 form-control" placeholder="Talla" />
                    <input type="text" className="mr-5 form-control" placeholder="Codigo Barra" />
                    <button className="btn btn-success" onClick={añadir}>Añadir</button>
                </div>
            </CardContent>
        </Card>
    );
}