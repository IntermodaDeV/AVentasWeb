import React, { useState } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { Loading } from 'components/Global/Loading';


export const Recolocacion = (props) => {

    const [rma, setRma] = useState("");
    const [productos, setproductos] = useState([]);
    const [title, setTitle] = useState("");
    const [open, setOpen] = useState(false);
    const obtenerProductoRma = async () => {
        try {
            setTitle("Obteniendo productos de la devolución");
            setOpen(true);
            setRma("RM-0023971")
            const data = await axios.get(`${APIURL}/api/trasladopedido/obtenerproductos/${rma}`);
            setproductos(data.data);
            //agregarDevolucionCompleta(productosDevolver, data.data);
            setOpen(false);
        } catch {
            setproductos([]);
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