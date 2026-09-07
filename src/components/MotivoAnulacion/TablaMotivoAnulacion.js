import React from 'react';
import { Table } from 'reactstrap';
import { FaEdit } from "react-icons/fa";
import { MdCheckCircle,MdCancel } from "react-icons/md";
import { MdPlaylistAdd } from "react-icons/md";
import { PermisoDesactivarMotivoAnulacion } from 'components/Seguridad/Permisos';

export const TablaMotivoAnulacion = props => {
    const {motivos,modificarEstado,modificarMotivo} = props;
    const puedeAdministrar = PermisoDesactivarMotivoAnulacion();

    return (
        <div>
            {motivos.length===0
            ?  <div className="card-body text-center">
                    <h3 class="card-title">No hay motivos de anulación</h3>
                    {puedeAdministrar && <div class="text-center">
                        <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nuevo motivo <MdPlaylistAdd/></button>
                    </div>}
                </div>
            :  (
                <div className="col">
                        <div className="card-body text-center">
                            <h3 class="card-title">Motivos de Anulación</h3>
                            {puedeAdministrar && <div class="text-right">
                                <button className="btn btn-primary" onClick={()=>{props.setMostar(true)}}>Crear nuevo motivo <MdPlaylistAdd/></button>
                            </div>}
                        </div>
                <div className="container-fluid">
                    <Table striped>
                        <thead>
                            <tr>
                                <th style={{textAlign:'center'}}>Código</th>
                                <th style={{textAlign:'center'}}>Descripción</th>
                                <th style={{textAlign:'center'}}>Estado</th>
                                {puedeAdministrar && <th style={{textAlign:'center'}}>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {motivos.map(motivo=>(
                                <tr key={motivo.Id}>
                                    <th style={{textAlign:'center'}}>{motivo.Codigo}</th>
                                    <th style={{textAlign:'center'}}>{motivo.Descripcion}</th>
                                    <th style={{textAlign:'center',color:motivo.Activo?"green":"red"}}>{motivo.Activo?<p>Activo <MdCheckCircle/> </p>:<p>Inactivo <MdCancel/> </p>}</th>
                                    {puedeAdministrar && <th style={{textAlign:'center'}}>
                                        <button style={{marginLeft:'10px'}}
                                                className="btn btn-warning"
                                                onClick={()=>{modificarMotivo(motivo)}}>
                                                    Editar <FaEdit/>
                                        </button>
                                        <button style={{marginLeft:'10px'}}
                                                className="btn btn-info"
                                                onClick={()=>{modificarEstado(motivo.Id)}}>{motivo.Activo?<span>Inactivar <MdCancel/></span>:<span>Activar <MdCheckCircle/></span>}</button>
                                    </th>}
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
