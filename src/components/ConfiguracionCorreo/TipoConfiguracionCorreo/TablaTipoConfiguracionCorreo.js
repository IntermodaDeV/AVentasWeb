import React from 'react';
import { Table } from 'reactstrap';
import { FaEdit } from "react-icons/fa";
import { MdCheckCircle,MdCancel } from "react-icons/md";
import { MdPlaylistAdd } from "react-icons/md";

export const TablaTipoConfiguracionCorreo = props => {
    const {tipos,modificarEstado,modificarTipo,irARoles} = props;

    return (
        <div>
            {tipos.length===0
            ?  <div className="card-body text-center">
                    <h3 class="card-title">No hay tipos de configuración de correo</h3>
                    <div class="text-center">
                        <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nuevo tipo <MdPlaylistAdd/></button>
                    </div>
                </div>
            :  (
                <div className="col">
                        <div className="card-body text-center">
                            <h3 class="card-title">Tipos de Configuración de Correo</h3>
                            <div class="text-right">
                                <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nuevo tipo <MdPlaylistAdd/></button>
                            </div>
                        </div>
                <div className="container-fluid">
                    <Table striped>
                        <thead>
                            <tr>
                                <th style={{textAlign:'center'}}>Código</th>
                                <th style={{textAlign:'center'}}>Descripción</th>
                                <th style={{textAlign:'center'}}>Estado</th>
                                <th style={{textAlign:'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipos.map(tipo=>(
                                <tr key={tipo.Id}>
                                    <th style={{textAlign:'center'}}>{tipo.Codigo}</th>
                                    <th style={{textAlign:'center'}}>{tipo.Descripcion}</th>
                                    <th style={{textAlign:'center',color:tipo.Activo?"green":"red"}}>{tipo.Activo?<p>Activo <MdCheckCircle/> </p>:<p>Inactivo <MdCancel/> </p>}</th>
                                    <th style={{textAlign:'center'}}>
                                        <button style={{marginLeft:'10px'}}
                                                className="btn btn-warning"
                                                onClick={()=>{modificarTipo(tipo)}}>
                                                    Editar <FaEdit/>
                                        </button>
                                        <button style={{marginLeft:'10px'}}
                                                className="btn btn-info"
                                                onClick={()=>{modificarEstado(tipo.Id)}}>{tipo.Activo?<span>Inactivar <MdCancel/></span>:<span>Activar <MdCheckCircle/></span>}</button>
                                        <button style={{marginLeft:'10px'}}
                                                className="btn btn-secondary"
                                                onClick={()=>{irARoles(tipo)}}>Roles</button>
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
