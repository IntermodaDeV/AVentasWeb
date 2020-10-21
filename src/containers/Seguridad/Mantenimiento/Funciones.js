import React,{useEffect,useState} from 'react';
import {Table} from 'reactstrap';
import { SyncLoader } from 'react-spinners';
import {
    Button,
    Card,
    CardContent,
} from '@material-ui/core';


const Funciones =(props) =>{
    const [Funciones,setFunciones] = useState([]);

    useEffect(() => {
        ObtenerFunciones();
    }, []);

    const ObtenerFunciones = ()=>{
        fetch(`${APIURL}/api/Funciones`)
        .then(res => {
            if (res.status === 401) {
                localStorage.setItem('token', '');
                window.location.reload();
            }
            if (res.status === 200) {
            res.json()
            .then(data=> 
                    {setFunciones(data)},
                    (error) => {
                        this.setState({
                            error
                        });
                    }
                )
            }
        })
    }

 

}

export default Funciones;