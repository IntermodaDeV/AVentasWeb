import React from 'react'
import { FaEdit } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';
import { MdPlaylistAdd } from "react-icons/md";

const TablaTiposIngreso = (props) => {
    return (
        <div>
            {
                <div className="col">
                    <div class="card-body text-center">
                        <h3 class="card-title">Tipos de Ingreso</h3>
                        <div class="text-right">
                            <button className="btn btn-primary" onClick={() => { props.setMostrar() }}>Registrar Nuevo <MdPlaylistAdd /></button>
                        </div>
                    </div>
                    <div className="container-fluid">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Nombre</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.TiposIngreso.map(tip => (
                                    <tr key={tip.Id}>
                                        <td style={{ textAlign: 'center' }}>{tip.Nombre}</td>
                                        <th style={{ textAlign: 'center', color: tip.Status ? "green" : "red" }}>{tip.Status ? <p>Activo <MdCheckCircle /> </p> : <p>Inactivo <MdCancel /> </p>}</th>
                                        <td style={{ textAlign: 'center' }}>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.openEdit(tip) }} startIcon={<FaEdit />} >Editar</Button>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-info" onClick={() => { props.ModificarEstado(tip.Id) }} startIcon={<MdCancel />}>{tip.Status ? "Inactivar" : "Activar"}</Button>
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
export default TablaTiposIngreso;