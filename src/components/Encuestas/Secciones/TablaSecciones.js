import React from 'react'
import { FaEdit } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';
import { MdPlaylistAdd } from "react-icons/md";
import GroupAddIcon from '@material-ui/icons/GroupAdd';
const TablaSeccion = (props) => {
    return (
        <div>
            {
                <div className="col">
                    <div class="card-body text-center">
                        <div class="text-right">
                            {
                                props.Mostrar === true &&
                                <button className="btn btn-primary" onClick={() => { props.setMostrar(true) }}>Registrar Nuevo <MdPlaylistAdd /></button>
                            }
                        </div>
                    </div>
                    <div className="container-fluid">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Nombre</th>
                                    <th style={{ textAlign: 'center' }}>Titulo</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.Secciones.map(sec => (
                                    <tr key={sec.Id}>
                                        <td style={{ textAlign: 'center' }}>{sec.Nombre}</td>
                                        <td style={{ textAlign: 'center' }}>{sec.Titulo}</td>
                                        <th style={{ textAlign: 'center', color: sec.Status ? "green" : "red" }}>{sec.Status ? <p>Activo <MdCheckCircle /></p> : <p>Inactivo <MdCancel /></p>}</th>
                                        <td style={{ textAlign: 'center' }}>
                                            {
                                                props.Mostrar === true &&
                                                <>
                                                    <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.openEdit(sec) }} startIcon={<FaEdit />} >Editar</Button>
                                                    <Button style={{ marginLeft: '10px' }} class="btn btn-info" onClick={() => { props.ModificarEstado(sec.Id) }} startIcon={<MdCancel />}>{sec.Status ? "Inactivar" : "Activar"}</Button>
                                                </>
                                            }
                                            {
                                                props.Mostrar === false &&
                                                <>
                                                <Button style={{ marginLeft: '10px' }} class="btn btn-success" onClick={() => { props.cargarPreguntas(sec.Id, sec.Nombre) }} startIcon={<FaEdit />} >Ver Preguntas</Button>
                                                <Button style={{ marginLeft: '10px' }} class="btn btn-primary" onClick={() => { props.cargarUsuarios(sec.Id) }} startIcon={<GroupAddIcon />} >Usuarios</Button>
                                                </>
                                            }
                                            
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