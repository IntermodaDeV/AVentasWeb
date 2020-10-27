import React,{useEffect,useState} from 'react';
import { APIURL } from 'utils/Enviroment';
import TablaFunciones from 'components/Seguridad/Mantenimiento/Funciones/TablaFunciones';
import { FormularioCrud } from 'components/Seguridad/Mantenimiento/FormularioCrud';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import axios from 'axios';

const Funciones =(props) =>{
    const [Funciones,setFunciones] = useState([]);
    const [mostrar,setMostar] = useState(false);
    const [Funcion,setFuncion] = useState(null);

    useEffect(() => {
        ObtenerFunciones();
    }, []);

    const ObtenerFunciones = ()=>{
        fetch(`${APIURL}/api/Funciones`)
        .then(res => {
            if (res.status === 401) {
                localStorage.setItem('token', '');
                window.location.reload();
            }
            if (res.status === 200) {
            res.json()
            .then(data=> 
                    {setFunciones(data)},
                    (error) => {
                        this.setState({
                            error
                        });
                    }
                )
            }
        })
    }

    const modificarEstado = (Id)=>{
        Swal.fire({
            title: 'Confirmar',
            text: "¿Está seguro de realizar está acción?",
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#06bf53',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.value) {
                fetch(`${APIURL}/api/Funciones/ActualizarEstado/${Id}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                })
                .then(res=>{
                    if(res.status===200){
                        Swal.fire({
                            title: 'Confirmado',
                            text: "Se ha cambiado el estado exitosamente.",
                            type: 'success',
                            confirmButtonText: 'Ok',
                        }).then(e => {
                            ObtenerFunciones()
                        })
                    }
                    if(res.status===400){
                        res.json()
                        .then(resultado=>{
                            Swal.fire({
                                title: 'Error',
                                text: resultado.Message,
                                type: 'error',
                                confirmButtonText: 'Ok',
                              })
                        });
                    }
                });
            }
        })
    }

    const CrearFuncion = async (data)=>{
        console.log("data",data)
        try{
            await axios.post(`${APIURL}/api/Funciones/Crear`, data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha creado la funcion exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                ObtenerFunciones();
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
    const ModificarFuncion = async (data)=>{
        try{
            await axios.post(`${APIURL}/api/funcion/modificar`,data);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha modificado la funcion exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e=>{
                ObtenerFunciones();
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

    const OcultarModal = ()=>{
        setMostar(false);
        setFuncion(null);
    }

    const AbrirModificarFuncion = (Funcion)=>{
        setFuncion(Funcion);
        setMostar(true);
    }

    return (
        <div>
            <Dialog open={mostrar} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">REGISTRAR NUEVA FUNCION</DialogTitle>
                <DialogContent>
                <FormularioCrud Valores={Funcion} Crear={CrearFuncion} Modificar={ModificarFuncion} OcultarModal={OcultarModal}/>
                </DialogContent>
              
            </Dialog>

            <TablaFunciones
             Funciones={Funciones}
             ModificarEstado = {modificarEstado}
             ModificarFuncion = {AbrirModificarFuncion}
             setMostar = {setMostar}
            />
        </div>
    )
}

export default Funciones;