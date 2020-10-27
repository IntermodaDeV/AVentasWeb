import React from 'react';
import { Table } from 'reactstrap';
import { FaEdit } from "react-icons/fa";
import { MdCheckCircle,MdCancel } from "react-icons/md";
import { MdPlaylistAdd } from "react-icons/md";

export const TablaRoles = props => {
    const {roles,modificarEstado,modificarRol} = props;

    return (
        <div>
            {roles.length===0
            ?  <div className="card-body text-center">
                    <h3 class="card-title">No hay roles</h3>
                    <div class="text-center"> 
                        <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nuevo rol <MdPlaylistAdd/></button>
                    </div>
                </div> 
            :  (
                <div className="col">
                        <div className="card-body text-center">
                            <h3 class="card-title">Roles</h3>
                            <div class="text-right"> 
                                <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nuevo rol <MdPlaylistAdd/></button>
                            </div>
                        </div>
                <div className="container-fluid">
                    <Table striped>
                        <thead>
                            <tr>
                                <th style={{textAlign:'center'}}>Rol</th>
                                <th style={{textAlign:'center'}}>Estado</th>
                                <th style={{textAlign:'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(rol=>(
                                <tr key={rol.Id}>
                                    <th style={{textAlign:'center'}}>{rol.Nombre}</th>
                                    <th style={{textAlign:'center',color:rol.Status?"green":"red"}}>{rol.Status?<p>Activo <MdCheckCircle/> </p>:<p>Inactivo <MdCancel/> </p>}</th>
                                    <th style={{textAlign:'center'}}>
                                        <button style={{marginLeft:'10px'}} 
                                                className="btn btn-warning" 
                                                onClick={()=>{modificarRol(rol)}}>
                                                    Editar <FaEdit/>
                                        </button>
                                        <button style={{marginLeft:'10px'}} 
                                                className="btn btn-info" 
                                                onClick={()=>{modificarEstado(rol.Id)}}>{rol.Status?<span>Inactivar <MdCancel/></span>:<span>Activar <MdCheckCircle/></span>}</button>
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            )
            }
        </div>
    )
}