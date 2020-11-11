import React from 'react'
import { FaEdit } from "react-icons/fa";
import { MdCancel,MdCheckCircle } from "react-icons/md";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';
import { MdPlaylistAdd } from "react-icons/md";

const TablaFunciones =(props) =>{
    return (
        <div>
            {
             <div className="col">
            <div class="card-body text-center">
                            <h3 class="card-title">Funciones</h3>
                            <div class="text-right"> 
                                <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Registrar Nuevo <MdPlaylistAdd/></button>
                            </div>
            </div>
                <div className="container-fluid">
                    <Table striped>
                        <thead>
                            <tr>
                                <th style={{textAlign:'center'}}>Funcion</th>
                                <th style={{textAlign:'center'}}>Estado</th>
                                <th style={{textAlign:'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.Funciones.map(fun=>(
                                <tr key={fun.Id}>
                                    <td style={{textAlign:'center'}}>{fun.Nombre}</td>
                                    <th style={{textAlign:'center',color:fun.Status?"green":"red"}}>{fun.Status ? <p>Activo <MdCheckCircle/></p> : <p>Inactivo <MdCancel/></p>}</th>
                                    <td style={{textAlign:'center'}}>
                                        <Button style={{marginLeft:'10px'}} class="btn btn-warning" onClick={()=>{props.ModificarFuncion(fun)}} startIcon = {<FaEdit/>} >Editar</Button>
                                        <Button style={{marginLeft:'10px'}} class="btn btn-info" onClick={()=>{props.ModificarEstado(fun.Id)}}startIcon = {<MdCancel/>}>{fun.Status ? "Inactivar" : "Activar"}</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
             </div>
            }
        </div>
    )

}
export default TablaFunciones;