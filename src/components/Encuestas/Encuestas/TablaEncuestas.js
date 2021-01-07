import React from 'react'
import { FaEdit } from "react-icons/fa";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';
import { MdPlaylistAdd } from "react-icons/md";

const TablaEncuestas = (props) => {
    return (
        <div>
            {
                <div className="col">
                    <div class="card-body text-center">
                        <h3 class="card-title">Encuestas</h3>
                        <div class="text-right">
                            <button className="btn btn-primary" onClick={() => { props.setMostrar() }}>Registrar Nuevo <MdPlaylistAdd /></button>
                        </div>
                    </div>
                    <div className="container-fluid">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Nombre</th>
                                    <th style={{ textAlign: 'center' }}>Descripción</th>
                                    <th style={{ textAlign: 'center' }}>Empresa</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.Encuestas.map(enc => (
                                    <tr key={enc.Id}>
                                        <td style={{ textAlign: 'center' }}>{enc.Nombre}</td>
                                        <td style={{ textAlign: 'center' }}>{enc.Descripcion}</td>
                                        <td style={{ textAlign: 'center' }}>{enc.Empresa}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.openEdit(enc) }} startIcon={<FaEdit />} >Editar</Button>
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
export default TablaEncuestas;