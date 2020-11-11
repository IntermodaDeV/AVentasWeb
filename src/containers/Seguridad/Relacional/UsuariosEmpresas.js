import React,{useState,useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Dropdown } from "semantic-ui-react";

import { APIURL } from 'utils/Enviroment';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';


export const UsuariosEmpresas = (props) => {
    const [usuario,setUsuario] = useState(null);
    const [usuarios,setUsuarios] = useState([]);
    const [EmpresasAsignadas,setEmpresasAsignadas] = useState([]);
    const [EmpresasNoAsignadas,setEmpresasNoAsignadas] = useState([]);
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

    const cargarEmpresasAsignadas = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/empresa/EmpresasAsignadas/${id}`);
            setEmpresasAsignadas(request.data);
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

    const cargarEmpresasNoAsignadas = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/empresa/EmpresasNoAsignadas/${id}`);
            setEmpresasNoAsignadas(request.data);
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
        cargarEmpresasAsignadas(id);
        cargarEmpresasNoAsignadas(id);
    }

    const asignarEmpresa =async (id) =>{
        try{
            await axios.post(`${APIURL}/Api/Empresa/AsignarEmpresa/${id}/${usuario}/${localStorage.getItem('codigo')}`);
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

    const removerEmpresa =async (id) =>{
        try{
            await axios.post(`${APIURL}/Api/Empresa/RemoverEmpresa/${id}/${usuario}/${localStorage.getItem('codigo')}`);
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
                    ? <h3 style={{textAlign:'center',marginTop:'20px'}}>Seleccione un usuario para visualizar las empresas a las que tiene acceso</h3>
                    :(
                        <div className="row">
                            <div className="col">
                                <TablaRelacion funcion={asignarEmpresa} accion="agregar" titulo="Empresas no asignadas" cabeceras={["Empresas","Accion"]} valores={EmpresasNoAsignadas}/>
                            </div>
                            <div className="col">
                                <TablaRelacion funcion={removerEmpresa} accion="remover" titulo="Empresas asignados" cabeceras={["Empresas","Accion"]} valores={EmpresasAsignadas}/>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}