import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import TablaSecciones from 'components/Encuestas/Secciones/TablaSecciones';
import { APIURL } from 'utils/Enviroment';
import { useSelector } from 'react-redux';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';

export const SeccionesEncuesta = props => {
    const [mostrarUsuario, setMostrarUsuario] = useState(false);
    const [UsuariosConAcceso,setUsuariosConAcceso] = useState([]);
    const [UsuariosSinAcceso,setUsuariosSinAcceso] = useState([]);
    const [seccionSelected, setSeccionSelected] = useState(null);
    const Secciones = useSelector(e => e.SeccionEncuesta);
    const cargarUsuarios = (seccionId) => {
        cargarUsuariosConAcceso(seccionId);
        cargarUsuariosSinAcceso(seccionId);
        setSeccionSelected(seccionId);
        setMostrarUsuario(true);
    }
    const cargarUsuariosConAcceso = async (seccionId) => {
        try {
            const request = await axios.get(`${APIURL}/api/secciones/usuarios/${seccionId}/${props.Secciones[0].EncuestaId}`);
            setUsuariosConAcceso(request.data);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const cargarUsuariosSinAcceso = async (seccionId) => {
        try {
            const request = await axios.get(`${APIURL}/api/secciones/usuariosSinAcceso/${seccionId}/${props.Secciones[0].EncuestaId}`);
            setUsuariosSinAcceso(request.data);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const asignarUsuario = async (usuarioId) => {
        try{
            await axios.post(`${APIURL}/api/secciones/AsignarAccesoUsuario/${seccionSelected}/${usuarioId}/${localStorage.getItem('codigo')}/${props.Secciones[0].EncuestaId}`);
            cargarUsuarios(seccionSelected);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha guardado el registro";

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



    const removerUsuario = async (usuarioId) => {
        try{
            await axios.post(`${APIURL}/api/secciones/RemoverUsuario/${usuarioId}/${seccionSelected}/${localStorage.getItem('codigo')}/${props.Secciones[0].EncuestaId}`)
            cargarUsuarios(seccionSelected);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha guardado el registro";

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

    
    useEffect(() => {
         // eslint-disable-next-line
    }, [])

    return (
        <div>
            <Dialog open={mostrarUsuario} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">ACCESO DE USUARIOS</DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col">
                            <TablaRelacion funcion={asignarUsuario} accion="agregar" titulo="Usuarios Sin Acceso" cabeceras={["Usuarios", "Accion"]} valores={UsuariosSinAcceso} />
                        </div>
                        <div className="col">
                            <TablaRelacion funcion={removerUsuario} accion="remover" titulo="Usuarios con acceso" cabeceras={["Usuarios", "Accion"]} valores={UsuariosConAcceso} />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setMostrarUsuario(false) }} color="primary">
                        SALIR
                    </Button>
                </DialogActions>
            </Dialog>


            <TablaSecciones Secciones={Secciones[0].Secciones} Mostrar ={false} cargarPreguntas={props.cargarPreguntas} cargarUsuarios ={cargarUsuarios}/>
        </div>
    )
}