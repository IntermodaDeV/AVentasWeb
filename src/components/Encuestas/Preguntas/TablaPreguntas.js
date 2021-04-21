import React from 'react'
import { FaEdit } from "react-icons/fa";
import { MdCancel, MdCheckCircle, MdAddBox, MdPlaylistAdd } from "react-icons/md";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';

const TablaPreguntas = (props) => {
    return (
        <div>
            {
                <div className="col">
                    <div class="card-body text-center">
                        <div class="text-left">
                            {
                                props.MostrarPregunta &&
                                <Button onClick={() => { props.setMostrarPregunta(false) }} startIcon={<KeyboardBackspaceIcon/>} color="primary">Regresar</Button>
                            }
                        </div>
                        <div class="text-right">
                            <button className="btn btn-primary" onClick={() => { props.setMostrar(true) }}>Registrar Nuevo <MdPlaylistAdd /></button>
                        </div>
                    </div>
                    <div className="container-fluid">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Pregunta</th>
                                    <th style={{ textAlign: 'center' }}>Descripcion</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                    <th style={{ textAlign: 'left' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.Preguntas.map(preg => (
                                    <tr key={preg.Id}>
                                        <td style={{ textAlign: 'center' }}>{preg.Nombre}</td>
                                        <td style={{ textAlign: 'center' }}>{preg.Descripcion}</td>
                                        <th style={{ textAlign: 'center', color: preg.Status ? "green" : "red" }}>{preg.Status ? <p>Activo <MdCheckCircle /></p> : <p>Inactivo <MdCancel /></p>}</th>
                                        <td style={{ textAlign: 'center' }}>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.openEdit(preg) }} startIcon={<FaEdit />} >Editar</Button>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-info" onClick={() => { props.ModificarEstado(preg.Id) }} startIcon={<MdCancel />}>{preg.Status ? "Inactivar" : "Activar"}</Button>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            { preg.PreguntaOpciones.length > 0 &&
                                            <>
                                                <Button style={{ marginLeft: '10px' }} class="btn btn-success" onClick={() => { props.openModalAnidado(preg) }} startIcon={<MdAddBox />}>Agregar Pregunta</Button>
                                                <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.openEditarPreguntaAnidada(preg) }} startIcon={<FaEdit />}>Editar Pregunta Anidada</Button>
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
export default TablaPreguntas;