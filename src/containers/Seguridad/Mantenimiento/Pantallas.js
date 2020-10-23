import React,{useState,useEffect} from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import { MdPlaylistAdd } from "react-icons/md";
import axios from 'axios';

import { TablaPantallas } from 'components/Seguridad/Mantenimiento/Pantallas/TablaPantallas';
import { FormularioCrud } from 'components/Seguridad/Mantenimiento/Pantallas/FormularioCrud';
import { APIURL } from 'utils/Enviroment';

export const Pantallas = props => {
    const [pantallas,setPantallas] = useState([]);
    const [mostrar,setMostar] = useState(false);
    const [pantalla,setPantalla] = useState(null);

    const cargarPantallas = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/pantalla/pantallas`);
            setPantallas(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las pantallas";

            if(err.response){
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const crearPantalla = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/pantalla/crear`,data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado la pantalla exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarPantallas();
            });

        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha registrado la pantalla.";

            if(err.response){
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const modificarPantalla = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/pantalla/modificar`,data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado la pantalla exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarPantallas();
            });

        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado la pantalla.";

            if(err.response){
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const modificarEstado = async (id)=>{
        try{
            await axios.post(`${APIURL}/api/pantalla/estado/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarPantallas();
            });
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado la pantalla.";

            if(err.response){
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }

    const abrirModificarPantalla = (rol)=>{
        setPantalla(rol);
        setMostar(true);
    }

    const ocultarModal = ()=>{
        setMostar(false);
        setPantalla(null);
    }

    useEffect(()=>{
        cargarPantallas();
    },[])

    return (
        <div>
            <div className="card-body text-center">
                <div className="card-title">
                    <h3>Pantallas</h3>
                </div>
                <button className="btn btn-info" onClick={()=>{setMostar(true)}}>Crear nueva pantalla<MdPlaylistAdd/></button>
            </div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
            <DialogTitle style={{textAlign:'center'}} id="form-dialog-title">REGISTRAR NUEVA PANTALLA</DialogTitle>
                <DialogContent>
                    <FormularioCrud Valores={pantalla} Crear={crearPantalla} Modificar={modificarPantalla} OcultarModal={ocultarModal}/>
                </DialogContent>
            </Dialog>
            
            <TablaPantallas pantallas={pantallas} modificarEstado={modificarEstado} modificarPantalla={abrirModificarPantalla}/>
        </div>
    )
}