import React,{useState,useEffect} from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import axios from 'axios';

import { TablaTipoConfiguracionCorreo } from 'components/ConfiguracionCorreo/TipoConfiguracionCorreo/TablaTipoConfiguracionCorreo';
import { FormularioTipoConfiguracionCorreo } from 'components/ConfiguracionCorreo/TipoConfiguracionCorreo/FormularioTipoConfiguracionCorreo';
import { AsignacionRolTipoCorreo } from './AsignacionRolTipoCorreo';
import { APIURL } from 'utils/Enviroment';
import { IsAllow } from 'components/Seguridad/Permisos';

export const TipoConfiguracionCorreo = props => {
    const [tipos,setTipos] = useState([]);
    const [mostrar,setMostar] = useState(false);
    const [tipo,setTipo] = useState(null);
    const [rolesOriginales,setRolesOriginales] = useState([]);
    const [rolesDisponibles,setRolesDisponibles] = useState([]);
    const [tipoRoles,setTipoRoles] = useState(null);

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

    const cargarTipos = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/tipoconfiguracioncorreo`);
            setTipos(request.data);
        }catch(err){
            mostrarError("Ha ocurrido un error y no se han cargado los tipos de configuración de correo.")(err);
        }
    }

    const cargarRolesDisponibles = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/rol/rolesactivos`);
            setRolesDisponibles(request.data);
        }catch(err){
            mostrarError("Ha ocurrido un error y no se han cargado los roles.")(err);
        }
    }

    const sincronizarRoles = async (idTipo, rolesSeleccionados, rolesPrevios) => {
        const aAgregar = rolesSeleccionados.filter(id => !rolesPrevios.includes(id));
        const aRemover = rolesPrevios.filter(id => !rolesSeleccionados.includes(id));

        await Promise.all([
            ...aAgregar.map(idRol => axios.post(`${APIURL}/api/tipoconfiguracioncorreo/asignarrol/${idTipo}/${idRol}`)),
            ...aRemover.map(idRol => axios.post(`${APIURL}/api/tipoconfiguracioncorreo/removerrol/${idTipo}/${idRol}`)),
        ]);
    }

    const crearTipo = async (data)=>{
        try{
            const request = await axios.post(`${APIURL}/api/tipoconfiguracioncorreo/crear`,data);
            await sincronizarRoles(request.data.Id, data.Roles, []);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado el tipo de configuración de correo exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(()=>{
                cargarTipos();
            });
        }catch(err){
            mostrarError("Ha ocurrido un error y no se ha registrado el tipo.")(err);
        }
    }

    const modificarTipoConfiguracion = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/tipoconfiguracioncorreo/modificar`,data);
            await sincronizarRoles(data.Id, data.Roles, rolesOriginales);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el tipo de configuración de correo exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(()=>{
                cargarTipos();
            });
        }catch(err){
            mostrarError("Ha ocurrido un error y no se ha modificado el tipo.")(err);
        }
    }

    const modificarEstado = async (id)=>{
        try{
            await axios.post(`${APIURL}/api/tipoconfiguracioncorreo/estado/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(()=>{
                cargarTipos();
            });
        }catch(err){
            mostrarError("Ha ocurrido un error y no se ha modificado el estado.")(err);
        }
    }

    const abrirModificarTipo = async (tipoSeleccionado)=>{
        try{
            const request = await axios.get(`${APIURL}/api/tipoconfiguracioncorreo/rolesasignados/${tipoSeleccionado.Id}`);
            const idsAsignados = request.data.map(rol => rol.Id);
            setRolesOriginales(idsAsignados);
            setTipo({...tipoSeleccionado, RolesAsignados: idsAsignados});
            setMostar(true);
        }catch(err){
            mostrarError("Ha ocurrido un error y no se han cargado los roles del tipo.")(err);
        }
    }

    const ocultarModal = ()=>{
        setMostar(false);
        setTipo(null);
        setRolesOriginales([]);
    }

    useEffect(()=>{
        if(!IsAllow("/configuracion-tipo-correo"))
        {
            props.history.push('/home');
        }

        cargarTipos();
        cargarRolesDisponibles();
        // eslint-disable-next-line
    },[]);

    if(tipoRoles)
    {
        return <AsignacionRolTipoCorreo tipo={tipoRoles} volver={()=>{setTipoRoles(null)}}/>
    }

    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
            <DialogTitle style={{textAlign:'center'}} id="form-dialog-title">TIPO DE CONFIGURACIÓN DE CORREO</DialogTitle>
                <DialogContent>
                    <FormularioTipoConfiguracionCorreo Valores={tipo} Crear={crearTipo} Modificar={modificarTipoConfiguracion} OcultarModal={ocultarModal} rolesDisponibles={rolesDisponibles}/>
                </DialogContent>
            </Dialog>

            <TablaTipoConfiguracionCorreo tipos={tipos} modificarEstado={modificarEstado} modificarTipo={abrirModificarTipo} irARoles={setTipoRoles} setMostar={setMostar}/>
        </div>
    )
}
