import React from 'react'
import { FaEdit } from "react-icons/fa";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';
import { MdPlaylistAdd } from "react-icons/md";

const TablaSeccion = (props) => {
    return (
        <div>
            {
                <div className="col">
                    <div class="card-body text-center">
                        <h3 class="card-title">Grupo de Opciones Detalle</h3>
                        <div class="text-right">
                            <button className="btn btn-primary" onClick={() => { props.setMostrar(true) }}>Registrar Nuevo <MdPlaylistAdd /></button>
                        </div>
                    </div>
                    <div className="container-fluid">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Grupo Opciones</th>
                                    <th style={{ textAlign: 'center' }}>Nombre</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.GrupoOpcionesDetalle.map(opc => (
                                    <tr key={opc.Id}>
                                        <td style={{ textAlign: 'center' }}>{opc.NombreGrupoOpciones}</td>
                                        <td style={{ textAlign: 'center' }}>{opc.Nombre}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.openEdit(opc) }} startIcon={<FaEdit />} >Editar</Button>
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
export default TablaSeccion;