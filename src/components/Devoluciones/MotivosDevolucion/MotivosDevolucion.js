import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { TablaRelacion } from 'components/Seguridad/Relacional/TablaRelacion';
import { ListadoMotivosDevolucion } from 'components/Devoluciones/MotivosDevolucion/ListadoMotivosDevolucion';

export const MotivosDevolucion = props => {
    const [mostrarUsuario, setMostrarUsuario] = useState(false);
    const [UsuariosConAcceso, setUsuariosConAcceso] = useState([]);
    const [UsuariosSinAcceso, setUsuariosSinAcceso] = useState([]);
    const [MotivosDevolucion, setMotivosDevolucion] = useState([]);
    const [MotDevolucionSelected, setMotDevolucionSelected] = useState(null);
    useEffect(() => {
        cargarMotivosDevolucion();
    }, []);

    const cargarUsuarios = (idMotDevId) => {

        cargarUsuariosConAcceso(idMotDevId);
        cargarUsuariosSinAcceso(idMotDevId);
        setMotDevolucionSelected(idMotDevId);
        setMostrarUsuario(true);
    }

    const ActualizarAprobacion = async (idMotivoDevolucion) => {
        try {
            await axios.get(`${APIURL}/api/ActualizarAprobacionDevolucion/${idMotivoDevolucion}`);
            cargarMotivosDevolucion();
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }


    const cargarMotivosDevolucion = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/motivosDevolucion`);
            setMotivosDevolucion(request.data);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const cargarUsuariosConAcceso = async (id) => {
        try {
            const request = await axios.get(`${APIURL}/api/motivosDevolucion/usuarios/${id}`);
            setUsuariosConAcceso(request.data);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const cargarUsuariosSinAcceso = async (id) => {
        try {
            const request = await axios.get(`${APIURL}/api/motivosDevolucion/sinAccesoUsuarios/${id}`);
            setUsuariosSinAcceso(request.data);
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const asignarUsuario = async (usuarioId) => {
        try {
            await axios.post(`${APIURL}/api/motivosDevolucion/AsignarAccesoUsuario/${MotDevolucionSelected}/${usuarioId}`,{}, { 
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
            }});
            cargarUsuarios(MotDevolucionSelected);
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha guardado el registro";

            if (err.response) {
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
        try {
            await axios.post(`${APIURL}/api/motivosDevolucion/RemoverUsuario/${MotDevolucionSelected}/${usuarioId}`,{}, { 
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }});
            cargarUsuarios(MotDevolucionSelected);
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha guardado el registro";

            if (err.response) {
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
        <div className="px-3">
            <Dialog open={mostrarUsuario} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">ACCESO DE USUARIOS</DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col">
                            <TablaRelacion funcion={asignarUsuario} accion="agregar" titulo="Usuarios" cabeceras={["Usuarios", "Accion"]} valores={UsuariosSinAcceso} />
                        </div>
                        <div className="col">
                            <TablaRelacion funcion={removerUsuario} accion="remover" titulo="Administradores de aprobaciones" cabeceras={["Usuarios", "Accion"]} valores={UsuariosConAcceso} />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setMostrarUsuario(false) }} color="primary">
                        SALIR
                    </Button>
                </DialogActions>
            </Dialog>


            <ListadoMotivosDevolucion MotivosDevolucion = {MotivosDevolucion} ActualizarAprobacion = {ActualizarAprobacion} cargarUsuarios={cargarUsuarios}/>
        </div>
    )
}