import React,{useState,useEffect} from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import axios from 'axios';

import { TablaMotivoAnulacion } from 'components/MotivoAnulacion/TablaMotivoAnulacion';
import { FormularioMotivoAnulacion } from 'components/MotivoAnulacion/FormularioMotivoAnulacion';
import { APIURL } from 'utils/Enviroment';
import { PermisoListadoMotivoAnulacion } from 'components/Seguridad/Permisos';

export const MotivoAnulacion = props => {
    const [motivos,setMotivos] = useState([]);
    const [mostrar,setMostar] = useState(false);
    const [motivo,setMotivo] = useState(null);

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

    const cargarMotivos = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/motivoanulacion`);
            setMotivos(request.data);
        }catch(err){
            mostrarError("Ha ocurrido un error y no se han cargado los motivos de anulación.")(err);
        }
    }

    const crearMotivo = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/motivoanulacion/crear`,data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado el motivo de anulación exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(()=>{
                cargarMotivos();
            });
        }catch(err){
            mostrarError("Ha ocurrido un error y no se ha registrado el motivo.")(err);
        }
    }

    const modificarMotivoAnulacion = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/motivoanulacion/modificar`,data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado el motivo de anulación exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(()=>{
                cargarMotivos();
            });
        }catch(err){
            mostrarError("Ha ocurrido un error y no se ha modificado el motivo.")(err);
        }
    }

    const modificarEstado = async (id)=>{
        try{
            await axios.post(`${APIURL}/api/motivoanulacion/estado/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(()=>{
                cargarMotivos();
            });
        }catch(err){
            mostrarError("Ha ocurrido un error y no se ha modificado el estado.")(err);
        }
    }

    const abrirModificarMotivo = (motivo)=>{
        setMotivo(motivo);
        setMostar(true);
    }

    const ocultarModal = ()=>{
        setMostar(false);
        setMotivo(null);
    }

    useEffect(()=>{
        if(!PermisoListadoMotivoAnulacion())
        {
            props.history.push('/home');
            return;
        }

        cargarMotivos();
        // eslint-disable-next-line
    },[]);

    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
            <DialogTitle style={{textAlign:'center'}} id="form-dialog-title">MOTIVO DE ANULACIÓN</DialogTitle>
                <DialogContent>
                    <FormularioMotivoAnulacion Valores={motivo} Crear={crearMotivo} Modificar={modificarMotivoAnulacion} OcultarModal={ocultarModal}/>
                </DialogContent>
            </Dialog>

            <TablaMotivoAnulacion motivos={motivos} modificarEstado={modificarEstado} modificarMotivo={abrirModificarMotivo} setMostar={setMostar}/>
        </div>
    )
}
