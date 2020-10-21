import React,{useState,useEffect} from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import logo from './iconfinder_Close_2001866.png';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import { MdPlaylistAdd } from "react-icons/md";
import axios from 'axios';

import { TablaRoles } from 'components/Seguridad/Mantenimiento/Roles/TablaRoles';
import { FormularioRol } from 'components/Seguridad/Mantenimiento/Roles/FormularioRol';
import { APIURL } from 'utils/Enviroment';

export const Roles = props => {
    const [roles,setRoles] = useState([]);
    const [mostrar,setMostar] = useState(false);
    const [rol,setRol] = useState(null);

    const cargarRoles = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/rol/roles`);
            setRoles(request.data);
        }catch(err){
            Swal.fire({
                title: 'Error',
                text: err.response.data.Message,
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
            Swal.fire({
                title: 'Error',
                text: err.response.data.Message,
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
            Swal.fire({
                title: 'Error',
                text: err.response.data.Message,
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
            Swal.fire({
                title: 'Error',
                text: err.response.data.Message,
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
            <div className="card-body text-center">
                <div className="card-title">
                    <h3>Roles</h3>
                </div>
                <button className="btn btn-outline-info" onClick={()=>{setMostar(true)}}>Crear nuevo rol <MdPlaylistAdd/></button>
            </div>
            <Dialog
                disableBackdropClick 
                scroll={'paper'}
                open={mostrar}
            >
                <img alt="closeicon" src={logo} style={{width:'30px',height:'30px',marginLeft:'500px'}} onClick={ocultarModal}/>
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Rol
                    </div>
                </DialogTitle>
                <DialogContent>
                
                   <FormularioRol rol={rol} crearRol={crearRol} modificarRol={modificarRol} ocultarModal={ocultarModal}/>
                    
                </DialogContent>
            </Dialog>
            
            <TablaRoles roles={roles} modificarEstado={modificarEstado} modificarRol={abrirModificarRol}/>
        </div>
    )
}