import React from 'react';
import { Table } from 'reactstrap';
import { MdCheckCircle,MdCancel } from "react-icons/md";
import { MdPlaylistAdd } from "react-icons/md";

export const TablaUsuario = props => {
    const {roles,modificarEstado,modificarBloqueoCredito,modificarTodosAsesores,UpdateUsuarioOficina,modificarAdministradorProducto, modificarManejaBodegaEspecifico} = props;

    return (
        <div>
            {roles.length===0
            ?  <div className="card-body text-center">
                    <h3 class="card-title">No hay usuarios</h3>
                    <div class="text-center"> 
                        <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nuevo usuario <MdPlaylistAdd/></button>
                    </div>
                </div> 
            :  (
                <div className="col">
                        <div className="card-body text-center">
                            <h3 class="card-title">Usuarios</h3>
                            <div class="text-right"> 
                                <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nuevo usuario <MdPlaylistAdd/></button>
                            </div>
                        </div>
                <div className="container-fluid">
                    <Table striped>
                        <thead>
                            <tr>
                                <th style={{textAlign:'center'}}>Usuario</th>
                                <th style={{textAlign:'center'}}>Estado</th>
                                <th style={{textAlign:'center'}}>Bloqueo información sensible</th>
                                <th style={{textAlign:'center'}}>Maneja todos los asesores</th>
                                <th style={{textAlign:'center'}}>Usuario Oficina</th>
                                <th style={{textAlign:'center'}}>Administrador Productos</th>
                                <th style={{textAlign:'center'}}>Maneja Bodega Especifico</th>
                                <th style={{textAlign:'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(rol=>(
                                <tr key={rol.Id}>
                                    <th style={{textAlign:'center'}}>{rol.Nombre}</th>
                                    <th style={{textAlign:'center',color:rol.Status?"green":"red"}}>{rol.Status?<p>Activo <MdCheckCircle/> </p>:<p>Inactivo <MdCancel/> </p>}</th>
                                    <th style={{textAlign:'center'}}><input type="checkbox" checked={rol.BloqueoCredito} onChange={(e)=>modificarBloqueoCredito(rol.Id)} style={{ height: 20, width: 20}}/></th>
                                    <th style={{textAlign:'center'}}><input type="checkbox" checked={rol.BloqueoAsesores} onChange={(e)=>modificarTodosAsesores(rol.Id)} style={{ height: 20, width: 20}}/></th>
                                    <th style={{textAlign:'center'}}><input type="checkbox" checked={rol.UsuarioOficina} onChange={(e)=>UpdateUsuarioOficina(rol.Id, e.target.checked)} style={{ height: 20, width: 20}}/></th>
                                    <th style={{textAlign:'center'}}><input type="checkbox" checked={rol.AdministradorProductos} onChange={(e)=>modificarAdministradorProducto(rol.Id)} style={{ height: 20, width: 20}}/></th>
                                    <th style={{textAlign:'center'}}><input type="checkbox" checked={rol.ManejaBodegaEspecifico} onChange={(e)=>modificarManejaBodegaEspecifico(rol.Id)} style={{ height: 20, width: 20}}/></th>
                                    <th style={{textAlign:'center'}}>
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