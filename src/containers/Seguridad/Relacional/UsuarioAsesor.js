import React,{useState,useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Dropdown } from "semantic-ui-react";

import { APIURL } from 'utils/Enviroment';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';

export const UsuarioAsesor = (props) =>{
    const [usuario,setUsuario] = useState(null);
    const [usuarios,setUsuarios] = useState([]);
    const [AsesoresAsignados,setAsesoresAsignados] = useState([]);
    const [AsesoresNoAsignados,setAsesoresNoAsignados] = useState([]);

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

    const cargarAsesoresAsignados = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/AsesoresAsignados/${id}`);
            setAsesoresAsignados(request.data);
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

    const cargarAsesoresNoAsignados = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/AsesoresNoAsignados/${id}`);
            setAsesoresNoAsignados(request.data);
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

    const asignarAsesores = async (id) =>{
        debugger;
        try{
            await axios.post(`${APIURL}/api/AsignarAsesores/${id}/${usuario}/${localStorage.getItem('codigo')}`);
            cargarPantallas(usuario);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado los asesores.";

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
    const removerAsesores =async (id) =>{
        try{
            await axios.post(`${APIURL}/api/RemoverAsesor/${id}/${usuario}/${localStorage.getItem('codigo')}`);
            cargarPantallas(usuario);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado los asesores.";

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
        cargarAsesoresAsignados(id);
        cargarAsesoresNoAsignados(id);
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
                    ? <h3 style={{textAlign:'center',marginTop:'20px'}}>Seleccione un usuario para visualizar los asesores a los que tiene acceso</h3>
                    :(
                        <div className="row">
                            <div className="col">
                                <TablaRelacion funcion={asignarAsesores} accion="agregar" titulo="Asesores no asignados" cabeceras={["Asesores","Accion"]} valores={AsesoresNoAsignados}/>
                            </div>
                            <div className="col">
                                <TablaRelacion funcion={removerAsesores} accion="remover" titulo="Asesores asignados" cabeceras={["Asesores","Accion"]} valores={AsesoresAsignados}/>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}