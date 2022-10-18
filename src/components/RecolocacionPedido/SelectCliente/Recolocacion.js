import React,{useState} from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';


export const Recolocacion = (props) => {

    const [rma, setRma] = useState("");
    const [productos, setproductos ]  = useState([]);
    const obtenerProductoRma = async () =>{
        try{
            const data = await axios.get(`${APIURL}/api/trasladopedido/obtenerproductos/${rma}`);
            console.log(data.data)
            setproductos(data.data);
        }catch{
            setproductos([]);
        }

    }
    return (
        <Card style={{ margin: '15px' }}>
            <CardContent>
                <div style={{ marginTop: 20 }}>
                    <h3>Recolocación de devolución</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', marginTop: 40 }}>
                        <div style={{ display: 'flex', width: '90%'}}>
                            <input type="text" className="mr-5 form-control" placeholder="RMA Devolución" onChange={ (e) => { setRma(e.target.value) }} />
                        </div>
                        <button className="btn btn-success" onClick={obtenerProductoRma}>Registrar</button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}