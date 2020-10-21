import React,{useState,useEffect} from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { TablaRoles } from 'components/Seguridad/Mantenimiento/Roles/TablaRoles';
import { APIURL } from 'utils/Enviroment';

export const Roles = props => {
    const [roles,setRoles] = useState([]);

    const cargarRoles = () => {
        fetch(`${APIURL}/api/rol/roles`)
        .then(res=>{
            if(res.status===200){
                res.json()
                .then(resultado=>{
                    setRoles(resultado);
                }); 
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

    const modificarEstado = (id)=>{
        fetch(`${APIURL}/api/rol/estado/${id}`)
        .then(res=>{
            if(res.status===200){
                Swal.fire({
                    title: 'Confirmado',
                    text: "Se ha cambiado el estado exitosamente.",
                    type: 'success',
                    confirmButtonText: 'Ok',
                });
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

    useEffect(()=>{
        cargarRoles();
    },[])

    return (
        <div>
            <TablaRoles roles={roles} modificarEstado={modificarEstado}/>
        </div>
    )
}