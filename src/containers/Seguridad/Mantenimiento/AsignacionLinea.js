import React,{useState,useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Dropdown } from "semantic-ui-react";

import { APIURL } from 'utils/Enviroment';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';

export const AsignacionLinea = (props) => {
    const [usuario,setUsuario] = useState(null);
    const [usuarios,setUsuarios] = useState([]);
    const [LineasAsignadas,setLineasAsignadas] = useState([]);
    const [LineasNoAsignadas,setLineasNoAsignadas] = useState([]);
    useEffect(()=>{
        cargarUsuarios();
    },[]);
    const cargarUsuarios = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/usuario/usuariosactivos`);
            setUsuarios(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado los usuarios.";

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

    const cargarLineasAsignadas = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/linea/getLineasAsignadas/${id}`);
            console.log(request.data)
            setLineasAsignadas(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las empresas";

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

    const cargarLineasNoAsignadas = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/linea/getLineasNoAsignadas/${id}`);
            console.log(request.data)
            setLineasNoAsignadas(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las empresas";

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

    const cargarPantallas = id =>{
        cargarLineasAsignadas(id);
        cargarLineasNoAsignadas(id);
    }

    const asignarLinea =async (id) =>{
        try{
            await axios.post(`${APIURL}/api/linea/AsignarLinea/${id}/${usuario}/${localStorage.getItem('codigo')}`);
            cargarPantallas(usuario);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las pantallas.";

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

    const removerLinea =async (id) =>{
        try{
            await axios.post(`${APIURL}/api/linea/RemoverLinea/${id}/${usuario}/${localStorage.getItem('codigo')}`);
            cargarPantallas(usuario);
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

    return (
        <div style={{padding:'10px'}}>
            <Dropdown
                placeholder="Seleccione un usuario"
                fluid
                search
                selection
                style={{zIndex:999}}
                onChange={(e, { value }) =>{
                    setUsuario(value);
                    cargarPantallas(value);
                }}
                options={usuarios.map(usuario => {
                    return {key:usuario.Id, value:usuario.Id,text:usuario.Usuario}
                })}
                noResultsMessage={"No hay resultados"}
                closeOnChange={true}
            />
            <div style={{marginTop:'20px'}} className="container-fluid">
                {usuario === null
                    ? <h3 style={{textAlign:'center',marginTop:'20px'}}>Seleccione un usuario para visualizar las lineas a las que tiene acceso</h3>
                    :(
                        <div className="row">
                            <div className="col">
                                <TablaRelacion funcion={asignarLinea} accion="agregar" titulo="Lineas no asignadas" cabeceras={["Lineas","Accion"]} valores={LineasNoAsignadas}/>
                            </div>
                            <div className="col">
                                <TablaRelacion funcion={removerLinea} accion="remover" titulo="Lineas asignados" cabeceras={["Lineas","Accion"]} valores={LineasAsignadas}/>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}