import React,{useState,useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Dropdown } from "semantic-ui-react";

import { APIURL } from 'utils/Enviroment';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';

export const UsuarioRoles = props => {
    const [usuario,setUsuario] = useState(null);
    const [usuarios,setUsuarios] = useState([]);
    const [rolesAsignados,setRolesAsignados] = useState([]);
    const [rolesNoAsignados,setRolesNoAsignados] = useState([]);

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

    const cargarRolesAsignados = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/usuario/roles/${id}`);
            setRolesAsignados(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado los roles.";

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

    const cargarRolesNoAsignados = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/usuario/rolesnoasignados/${id}`);
            setRolesNoAsignados(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado los roles.";

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

    const asignarRol =async (id) =>{
        try{
            await axios.post(`${APIURL}/api/usuario/asignarrol/${usuario}/${id}/${localStorage.getItem('codigo')}`);
            cargarRoles(usuario);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las roles.";

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

    const removerRol =async (id) =>{
        try{
            await axios.post(`${APIURL}/api/usuario/removerrol/${usuario}/${id}/${localStorage.getItem('codigo')}`);
            cargarRoles(usuario);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado los roles.";

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

    const cargarRoles = id =>{
        cargarRolesAsignados(id);
        cargarRolesNoAsignados(id);
    }

    useEffect(()=>{
        cargarUsuarios();
    },[]);

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
                    cargarRoles(value);
                }}
                options={usuarios.map(usuario => {
                    return {key:usuario.Id, value:usuario.Id,text:usuario.Usuario}
                })}
                noResultsMessage={"No hay resultados"}
                closeOnChange={true}
            />
            <div style={{marginTop:'20px'}} className="container-fluid">
                {usuario===null
                    ? <h3 style={{textAlign:'center',marginTop:'20px'}}>Seleccione un usuario para visualizar sus roles</h3>
                    :(
                        <div className="row">
                            <div className="col">
                                <TablaRelacion funcion={asignarRol} accion="agregar" titulo="Roles no asignados" cabeceras={["Rol","Accion"]} valores={rolesNoAsignados}/>
                            </div>
                            <div className="col">
                                <TablaRelacion funcion={removerRol} accion="remover" titulo="Roles asignados" cabeceras={["Rol","Accion"]} valores={rolesAsignados}/>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}