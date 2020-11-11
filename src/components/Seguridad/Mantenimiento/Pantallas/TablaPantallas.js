import React from 'react';
import { Table } from 'reactstrap';
import { FaEdit } from "react-icons/fa";
import { MdCheckCircle,MdCancel } from "react-icons/md";
import { MdPlaylistAdd } from "react-icons/md";

export const TablaPantallas = props => {
    const {pantallas,modificarEstado,modificarPantalla} = props;

    return (
        <div>
            {pantallas.length===0
            ? 
            <div className="card-body text-center">
            <h3 class="card-title">No hay pantallas</h3>
                <div class="text-center"> 
                    <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nueva pantalla<MdPlaylistAdd/></button>
                </div>
            </div>
            :  (
                <div className="col">
                    <div className="card-body text-center">
                        <h3 className="card-title">Pantallas</h3>
                        <div class="text-right"> 
                            <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nueva pantalla<MdPlaylistAdd/></button>
                        </div>
                    </div>
                <div className="container-fluid">
                    <Table striped responsive>
                        <thead>
                            <tr>
                                <th style={{textAlign:'center'}}>Pantalla</th>
                                <th style={{textAlign:'center'}}>Ruta</th>
                                <th style={{textAlign:'center'}}>Estado</th>
                                <th style={{textAlign:'center'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pantallas.map(pantalla=>(
                                <tr key={pantalla.Id}>
                                    <th style={{textAlign:'center'}}>{pantalla.Nombre}</th>
                                    <th style={{textAlign:'center'}}>{pantalla.Ruta}</th>
                                    <th style={{textAlign:'center',color:pantalla.Status?"green":"red"}}>{pantalla.Status?<p>Activo <MdCheckCircle/> </p>:<p>Inactivo <MdCancel/> </p>}</th>
                                    <th style={{textAlign:'center'}}>
                                        <button style={{marginLeft:'10px'}} 
                                                className="btn btn-warning" 
                                                onClick={()=>{modificarPantalla(pantalla)}}>
                                                    Editar <FaEdit/>
                                        </button>
                                        <button style={{marginLeft:'10px'}} 
                                                className="btn btn-info" 
                                                onClick={()=>{modificarEstado(pantalla.Id)}}>{pantalla.Status?<span>Inactivar <MdCancel/></span>:<span>Activar <MdCheckCircle/></span>}</button>
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