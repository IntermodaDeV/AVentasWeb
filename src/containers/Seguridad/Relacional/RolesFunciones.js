import React,{useState,useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Dropdown } from "semantic-ui-react";

import { APIURL } from 'utils/Enviroment';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';

export const RolesFunciones = props => {
    const [rol,setRol] = useState(null);
    const [roles,setRoles] = useState([]);
    const [funcionesAsignadas,setFuncionesAsignadas] = useState([]);
    const [funcionesNoAsignadas,setFuncionesNoAsignadas] = useState([]);

    const cargarRoles = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/rol/rolesactivos`);
            setRoles(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado los roles";

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

    const cargarFuncionesAsignadas = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/rol/funciones/${id}`);
            setFuncionesAsignadas(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las funciones";

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

    const cargarFuncionesNoAsignadas = async (id)=>{
        try{
            const request = await axios.get(`${APIURL}/api/rol/funcionesnoasignadas/${id}`);
            setFuncionesNoAsignadas(request.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las funciones";

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

    const asignarFuncion =async (id) =>{
        try{
            await axios.post(`${APIURL}/api/rol/asignarfuncion/${rol}/${id}/${localStorage.getItem('codigo')}`);
            cargarFunciones(rol);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las funciones";

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

    const removerFuncion =async (id) =>{
        try{
            await axios.post(`${APIURL}/api/rol/removerfuncion/${rol}/${id}/${localStorage.getItem('codigo')}`);
            cargarFunciones(rol);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se han cargado las funciones";

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

    const cargarFunciones = id =>{
        cargarFuncionesAsignadas(id);
        cargarFuncionesNoAsignadas(id);
    }

    useEffect(()=>{
        cargarRoles();
    },[]);


    return (
        <div style={{padding:'10px'}}>
            <Dropdown
                placeholder="Seleccione un rol"
                fluid
                search
                selection
                style={{zIndex:999}}
                onChange={(e, { value }) =>{
                    setRol(value);
                    cargarFunciones(value);
                }}
                options={roles.map(rol => {
                    return {key:rol.Id, value:rol.Id,text:rol.Nombre}
                })}
                noResultsMessage={"No hay resultados"}
                closeOnChange={true}
            />
            <div style={{marginTop:'20px'}} className="container-fluid">
                {rol===null
                    ? <h3 style={{textAlign:'center',marginTop:'20px'}}>Seleccione un rol para visualizar sus funciones</h3>
                    :(
                        <div className="row">
                            <div className="col">
                                <TablaRelacion funcion={asignarFuncion} accion="agregar" titulo="Funciones no asignadas" cabeceras={["Funcion","Accion"]} valores={funcionesNoAsignadas}/>
                            </div>
                            <div className="col">
                                <TablaRelacion funcion={removerFuncion} accion="remover" titulo="Funciones asignadas" cabeceras={["Funcion","Accion"]} valores={funcionesAsignadas}/>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )

}