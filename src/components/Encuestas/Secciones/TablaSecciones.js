import React from 'react'
import { FaEdit } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';
import { MdPlaylistAdd } from "react-icons/md";

const TablaSeccion = (props) => {
    return (
        <div>
            {
                <div className="col">
                    <div class="card-body text-center">
                        <h3 class="card-title">Encuestas</h3>
                        <div class="text-right">
                            <button className="btn btn-primary" onClick={() => { props.setMostrar(true) }}>Registrar Nuevo <MdPlaylistAdd /></button>
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
                                {props.Encuestas.map(enc => (
                                    <tr key={enc.Id}>
                                        <td style={{ textAlign: 'center' }}>{enc.Nombre}</td>
                                        <th style={{ textAlign: 'center', color: enc.Status ? "green" : "red" }}>{enc.Status ? <p>Activo <MdCheckCircle /></p> : <p>Inactivo <MdCancel /></p>}</th>
                                        <td style={{ textAlign: 'center' }}>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.ModificarFuncion(enc) }} startIcon={<FaEdit />} >Editar</Button>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-info" onClick={() => { props.ModificarEstado(enc.Id) }} startIcon={<MdCancel />}>{enc.Status ? "Inactivar" : "Activar"}</Button>
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