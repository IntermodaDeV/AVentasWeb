import React,{useState,useEffect} from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import axios from 'axios';

import { TablaRoles } from 'components/Seguridad/Mantenimiento/Roles/TablaRoles';
import { FormularioCrud } from 'components/Seguridad/Mantenimiento/FormularioCrud';
import { APIURL } from 'utils/Enviroment';

export const Roles = props => {
    const [roles,setRoles] = useState([]);
    const [mostrar,setMostar] = useState(false);
    const [rol,setRol] = useState(null);

    const cargarRoles = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/rol`);
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

    const crearRol = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/rol/crear`,data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado el rol exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarRoles();
            });

        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha registrado el rol.";

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

    const modificarRol = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/rol/modificar`,data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el rol exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarRoles();
            });

        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado el rol.";

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
            await axios.post(`${APIURL}/api/rol/estado/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarRoles();
            });
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado el rol.";

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

    const abrirModificarRol = (rol)=>{
        setRol(rol);
        setMostar(true);
    }

    const ocultarModal = ()=>{
        setMostar(false);
        setRol(null);
    }

    useEffect(()=>{
        cargarRoles();
    },[])

    return (
        <div>
        
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
            <DialogTitle style={{textAlign:'center'}} id="form-dialog-title">REGISTRAR NUEVO ROL</DialogTitle>
                <DialogContent>
                    <FormularioCrud Valores={rol} Crear={crearRol} Modificar={modificarRol} OcultarModal={ocultarModal}/>
                </DialogContent>
            </Dialog>
            
            <TablaRoles roles={roles} modificarEstado={modificarEstado} modificarRol={abrirModificarRol} setMostar= {setMostar}/>
        </div>
    )
}