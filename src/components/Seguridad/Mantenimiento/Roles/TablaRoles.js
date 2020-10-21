import React from 'react';
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';

export const TablaRoles = props => {
    const {roles,modificarEstado} = props;

    return (
        <div>
            <h3 style={{textAlign:'center'}}>Mantenimiento de roles</h3>
            {roles.length===0
            ?  <h3>No hay roles</h3>
            :  (
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
                                <tr>
                                    <th style={{textAlign:'center'}}>{rol.Nombre}</th>
                                    <th style={{textAlign:'center'}}>{rol.Status?"Activo":"Inactivo"}</th>
                                    <th style={{textAlign:'center'}}>
                                        <Button onClick={()=>{modificarEstado(rol.Id)}}>{rol.Status?"Desactivar":"Activar"}</Button>
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )
            }
        </div>
    )
}