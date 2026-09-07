import React,{useState,useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';

import { APIURL } from 'utils/Enviroment';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';

export const AsignacionRolTipoCorreo = props => {
    const {tipo,volver} = props;
    const [rolesAsignados,setRolesAsignados] = useState([]);
    const [rolesNoAsignados,setRolesNoAsignados] = useState([]);

    const mostrarError = mensajeDefault => err => {
        let mensaje = mensajeDefault;

        if(err.response){
            mensaje = err.response.data.Message || err.response.data;
        }

        Swal.fire({
            title: 'Error',
            text: mensaje,
            type: 'error',
            confirmButtonText: 'Ok',
        });
    }

    const cargarRolesAsignados = async ()=>{
        try{
            const request = await axios.get(`${APIURL}/api/tipoconfiguracioncorreo/rolesasignados/${tipo.Id}`);
            setRolesAsignados(request.data);
        }catch(err){
            mostrarError("Ha ocurrido un error y no se han cargado los roles asignados.")(err);
        }
    }

    const cargarRolesNoAsignados = async ()=>{
        try{
            const request = await axios.get(`${APIURL}/api/tipoconfiguracioncorreo/rolesnoasignados/${tipo.Id}`);
            setRolesNoAsignados(request.data);
        }catch(err){
            mostrarError("Ha ocurrido un error y no se han cargado los roles disponibles.")(err);
        }
    }

    const cargarRoles = ()=>{
        cargarRolesAsignados();
        cargarRolesNoAsignados();
    }

    const asignarRol = async (idRol) =>{
        try{
            await axios.post(`${APIURL}/api/tipoconfiguracioncorreo/asignarrol/${tipo.Id}/${idRol}`);
            cargarRoles();
        }catch(err){
            mostrarError("Ha ocurrido un error y no se ha asignado el rol.")(err);
        }
    }

    const removerRol = async (idRol) =>{
        try{
            await axios.post(`${APIURL}/api/tipoconfiguracioncorreo/removerrol/${tipo.Id}/${idRol}`);
            cargarRoles();
        }catch(err){
            mostrarError("Ha ocurrido un error y no se ha removido el rol.")(err);
        }
    }

    useEffect(()=>{
        cargarRoles();
        // eslint-disable-next-line
    },[]);

    return (
        <div style={{padding:'10px'}}>
            <button className="btn btn-secondary" onClick={volver}>Volver</button>
            <h3 style={{textAlign:'center',marginTop:'20px'}}>Roles asignados al tipo "{tipo.Descripcion}"</h3>
            <div className="row">
                <div className="col">
                    <TablaRelacion funcion={asignarRol} accion="agregar" titulo="Roles no asignados" cabeceras={["Rol","Accion"]} valores={rolesNoAsignados}/>
                </div>
                <div className="col">
                    <TablaRelacion funcion={removerRol} accion="remover" titulo="Roles asignados" cabeceras={["Rol","Accion"]} valores={rolesAsignados}/>
                </div>
            </div>
        </div>
    )
}
