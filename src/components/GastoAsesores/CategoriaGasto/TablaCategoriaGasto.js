import React from 'react'
import { FaEdit } from "react-icons/fa";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';
import { MdPlaylistAdd } from "react-icons/md";

const TablacategoriasGasto = (props) => {
    return (
        <div>
            {
                <div className="col">
                    <div class="card-body text-center">
                        <h3 class="card-title">Categorias de Gastos</h3>
                        <div class="text-right">
                            <button className="btn btn-primary" onClick={() => { props.setMostrar() }}>Registrar Nuevo <MdPlaylistAdd /></button>
                        </div>
                    </div>
                    <div className="container-fluid">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Empresa</th>
                                    <th style={{ textAlign: 'center' }}>Tipo</th>
                                    <th style={{ textAlign: 'center' }}>Categoria</th>
                                    <th style={{ textAlign: 'center' }}>Grupo Impuestos</th>
                                    <th style={{ textAlign: 'center' }}>Proveedor Predefinido</th>
                                    <th style={{ textAlign: 'center' }}>CuentaContrapartida</th>
                                    <th style={{ textAlign: 'center' }}>Factura Obligatoria</th>                                    
                                    <th style={{ textAlign: 'center' }}>Descripcion Obligatoria</th>
                                    <th style={{ textAlign: 'center' }}>Imagen Obligatoria</th>
                                    <th style={{ textAlign: 'center' }}>Estado</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>

                                </tr>
                            </thead>
                            <tbody>
                                {props.CategoriasGastos.map(tip => (
                                    
                                    <tr key={tip.idCategoriaTipoGastoViaje}>
                                        <td style={{ textAlign: 'center' }}>{tip.Empresa}</td>
                                        <td style={{ textAlign: 'center' }}>{tip.TipoNombre}</td>
                                        <td style={{ textAlign: 'center' }}>{tip.CategoriaNombre}</td>
                                        <td style={{ textAlign: 'center' }}>{tip.GrupoImpuesto}</td>
                                        <td style={{ textAlign: 'center' }}>{tip.ProveedorPredefinido}</td>
                                        <td style={{ textAlign: 'center' }}>{tip.CuentaContrapartida}</td>
                                        <th style={{ textAlign: 'center', color: tip.FacturaObligatoria ? "green" : "red" }}>{tip.FacturaObligatoria ? <p>SI <MdCheckCircle /> </p> : <p>NO <MdCancel /> </p>}</th>
                                        <th style={{ textAlign: 'center', color: tip.Descripcion ? "green" : "red" }}>{tip.Descripcion ? <p>SI <MdCheckCircle /> </p> : <p>NO <MdCancel /> </p>}</th>
                                        <th style={{ textAlign: 'center', color: tip.imagen ? "green" : "red" }}>{tip.imagen ? <p>SI <MdCheckCircle /> </p> : <p>NO <MdCancel /> </p>}</th>
                                        <th style={{ textAlign: 'center', color: tip.activo ? "green" : "red" }}>{tip.activo ? <p>Activo <MdCheckCircle /> </p> : <p>Inactivo <MdCancel /> </p>}</th>
                                        <td style={{ textAlign: 'center' }}>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.openEdit(tip) }} startIcon={<FaEdit />} >Editar</Button>
                                            <Button style={{ marginLeft: '10px' }} class="btn btn-info" onClick={() => { props.ModificarEstado(tip.idCategoriaTipoGastoViaje) }} startIcon={<MdCancel />} >{tip.Activo ? "Inactivar" : "Activar"}</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            }
        </div >
    )
}
export default TablacategoriasGasto;