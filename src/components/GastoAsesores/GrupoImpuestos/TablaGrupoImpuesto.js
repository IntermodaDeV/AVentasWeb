import React from 'react'
import { FaEdit } from "react-icons/fa";
import Button from '@material-ui/core/Button';
import { Table } from 'reactstrap';

const TablaGrupoImpuesto = (props) => {
    return (
        <div>
            {
                <div className="col">
                    <div class="card-body text-center">
                        <h3 class="card-title">Grupo impuestos</h3>
                    </div>
                    <div className="container-fluid">
                        <Table>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'center' }}>Empresa</th>
                                    <th style={{ textAlign: 'center' }}>Grupo Impuestos Gravado</th>
                                    <th style={{ textAlign: 'center' }}>Grupo Impuestos Articulo Gravado</th>
                                    <th style={{ textAlign: 'center' }}>Grupo Impuestos Exento</th>
                                    <th style={{ textAlign: 'center' }}>Grupo Impuestos Articulo Exento</th>
                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    props.GrupoImpuesto.map(tip => (
                                        <tr key={tip.empresaID}>
                                            <td style={{ textAlign: 'center' }}>{tip.empresaID}</td>
                                            <td style={{ textAlign: 'center' }}>{tip.grupoImpuestoGravado}</td>
                                            <td style={{ textAlign: 'center' }}>{tip.grupoImpuestoArticuloGravado}</td>
                                            <td style={{ textAlign: 'center' }}>{tip.grupoImpuestoExento}</td>
                                            <td style={{ textAlign: 'center' }}>{tip.grupoImpuestoArticuloExento}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Button style={{ marginLeft: '10px' }} class="btn btn-warning" onClick={() => { props.openEdit(tip) }} startIcon={<FaEdit />} >Editar</Button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </Table>
                    </div>
                </div>
            }

        </div>
    )
}
export default TablaGrupoImpuesto;