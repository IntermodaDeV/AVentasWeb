import React,{useState,useEffect} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Dropdown } from "semantic-ui-react";
import { APIURL } from 'utils/Enviroment';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';

export const PantallasFunciones = (props)  => {
    const [Funciones,setFunciones] = useState([]);
    const [Funcion,setFuncion] = useState(null);
    const [PantallasAsignadas,setPantallasAsignadas] = useState([]);
    const [PantallasNoAsignadas,setPantallasNoAsignadas] = useState([]); 

    useEffect(()=>{
        CargarFunciones();
    },[]);

        const CargarFunciones = async () => {
        try
        {
            const request = await axios.get(`${APIURL}/api/Funciones`);
            setFunciones(request.data);
        }
        catch(err)
        {
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
        const cargarPantallasAsignadas = async (id)=>{
            try{
                const request = await axios.get(`${APIURL}/api/PantallasAsignadas/${id}`);
                setPantallasAsignadas(request.data);
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

        const cargarPantallasNoAsignadas = async (id)=>{
            try{
                const request = await axios.get(`${APIURL}/api/PantallasNoAsignadas/${id}`);
                setPantallasNoAsignadas(request.data);
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

        const cargarPantallas = id =>{
            cargarPantallasAsignadas(id);
            cargarPantallasNoAsignadas(id);
        }

        const asignarPantalla =async (id) =>{
            try{
                await axios.post(`${APIURL}/Api/Pantalla/AsignarPantalla/${Funcion}/${id}/${localStorage.getItem('codigo')}`);
                cargarPantallas(Funcion);
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

        const removerFuncion =async (id) =>{
            try{
                await axios.post(`${APIURL}/api/Pantalla/RemoverPantalla/${Funcion}/${id}/${localStorage.getItem('codigo')}`);
                cargarPantallas(Funcion);
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
                    placeholder="Seleccione una función"
                    fluid
                    search
                    selection
                    style={{zIndex:999}}
                    onChange={(e, { value }) =>{
                        setFuncion(value);
                        cargarPantallas(value);
                    }}
                    options={Funciones.map(fun => {
                        return {key:fun.Id, value:fun.Id,text:fun.Nombre}
                    })}
                    noResultsMessage={"No hay resultados"}
                    closeOnChange={true}
                />
                <div style={{marginTop:'20px'}} className="container-fluid">
                    {Funcion===null
                        ? <h3 style={{textAlign:'center',marginTop:'20px'}}>Seleccione una funciones para visualizar las pantallas a las que tiene acceso</h3>
                        :(
                            <div className="row">
                                <div className="col">
                                    <TablaRelacion funcion={asignarPantalla} accion="agregar" titulo="Pantallas no asignadas" cabeceras={["Pantalla","Accion"]} valores={PantallasNoAsignadas}/>
                                </div>
                                <div className="col">
                                    <TablaRelacion funcion={removerFuncion} accion="remover" titulo="Pantallas asignadas" cabeceras={["Pantalla","Accion"]} valores={PantallasAsignadas}/>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    


}