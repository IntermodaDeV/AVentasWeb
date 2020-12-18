import React,{useState,useEffect,useRef} from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import axios from 'axios';

import { TablaUsuario } from 'components/Seguridad/Mantenimiento/Usuario/TablaUsuario';
import { APIURL } from 'utils/Enviroment';

export const Usuario = props => {
    const [usuarios,setUsuarios] = useState([]);
    const [mostrar,setMostar] = useState(false);
    const [usuario,setUsuario] = useState(null);
    const [codigo,setCodigo] = useState('');
    const myRef = useRef();

    const cargarUsuarios = async () => {
        try{
            const request = await axios.get(`${APIURL}/api/usuario`);
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

    const crearUsuario = async ()=>{
        try{

            if(usuario===null || usuario===undefined || usuario.CODE===null || usuario.CODE===undefined){
                Swal.fire({
                    title: 'Error',
                    text: "No se puede registar un usuario vacio.",
                    type: 'error',
                    confirmButtonText: 'Ok',
                    target:myRef.current
                });
                return;
            }

            let newUsuario = {
                usuario:usuario.CODE,
                nombre:usuario.NAME,
                EmpresaId:usuario.COMPANY,
                creador:localStorage.getItem('codigo')
            }

            await axios.post(`${APIURL}/api/usuario`,newUsuario);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado el usuario exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
                target:myRef.current
            }).then(e=>{
                cargarUsuarios();
            });

        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha registrado el usuario.";

            if(err.response){
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
                target:myRef.current
            });
        }
    }

    const modificarEstado = async (id)=>{
        try{
            await axios.post(`${APIURL}/api/usuario/desactivar/${id}/${localStorage.getItem('codigo')}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarUsuarios();
            });
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado el usuario.";

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

    const modificarBloqueoCredito = async (id)=>{
        try{
            await axios.post(`${APIURL}/api/usuario/desactivar/sensible/${id}/${localStorage.getItem('codigo')}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarUsuarios();
            });
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado el usuario.";

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

    const modificarTodosAsesores = async (id)=>{
        try{
            await axios.post(`${APIURL}/api/usuario/desactivar/asesores/${id}/${localStorage.getItem('codigo')}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarUsuarios();
            });
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado el usuario.";

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

    const verificarUsuario = async () => {
        try{
           const data = await axios.get(`${APIURL}/api/usuario/verificar/${codigo}`);
           setUsuario(data.data);
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se pudo verificar el usuario.";

            if(err.response){
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
                target:myRef.current
            });
        }
    }

    const UpdateUsuarioOficina = async (id,Estado)=>{
        try{
            await axios.post(`${APIURL}/api/usuario/usuarioOficina/${id}/${Estado}/${localStorage.getItem('codigo')}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha cambiado el estado exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                cargarUsuarios();
            });
        }catch(err){
            let mensaje = "Ha ocurrido un error y no se ha modificado el usuario.";

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

    const ocultarModal = ()=>{
        setMostar(false);
        setUsuario(null);
    }

    useEffect(()=>{
        cargarUsuarios();
    },[])

    return (
        <div>
        
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
            <DialogTitle style={{textAlign:'center'}} id="form-dialog-title">REGISTRAR NUEVO USUARIO</DialogTitle>
                <DialogContent>
                    <div ref={myRef} style={{display:'flex',justifyContent:'space-around',width:'500px',alignItems:'center'}}>
                            <TextField label="codigo" onChange={(e)=>{setCodigo(e.target.value)}}/>
                            <button className="btn btn-success" onClick={verificarUsuario}>Validar</button>
                    </div>
                    <div style={{height:'200px',minHeight:'200px'}}>
                       {usuario && 
                       <div>
                           {(usuario.CODE===null || usuario.CODE===undefined)
                           ?<h3 style={{textAlign:'center',marginTop:'50px'}}>El usuario no existe o no esta habilitado en AX.</h3>
                           :<div style={{display:'flex',alignItems:'center',flexDirection:'column'}}>
                            <br/>
                            <h2>Datos Generales</h2>
                            <br/>
                            <div>
                                <p>Codigo: {usuario.CODE}</p>
                                <p>Nombre: {usuario.NAME}</p>
                                <p>Empresa Principal: {usuario.COMPANY}</p>
                            </div>
                            </div>}
                        </div>
                        }
                    </div>
                    <DialogActions>
                        <Button onClick={ocultarModal} color="primary"> Cancelar</Button>
                        <Button onClick={crearUsuario} color="sucess">Guardar</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            
            <TablaUsuario roles={usuarios} modificarEstado={modificarEstado} modificarBloqueoCredito={modificarBloqueoCredito} modificarTodosAsesores={modificarTodosAsesores} UpdateUsuarioOficina ={UpdateUsuarioOficina} setMostar= {setMostar}/>
        </div>
    )
}