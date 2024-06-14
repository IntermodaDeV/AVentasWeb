import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import axios from 'axios'
import { APIURL, APP_VERSION } from 'utils/Enviroment'
import CardContent from '@material-ui/core/CardContent';
import PieChart from 'components/Inventario/PieChart';
import moment from 'moment';
import 'moment/locale/es';

export const InventarioAnterior = props => {
    const [inventario, setInventario] = useState([]);

    useEffect(() => {
        obtenerInventarioCliente(props.cliente.Codigo);
    }, [props.cliente]);

    if (props.cliente === undefined) {
        return <h3>Seleccione un cliente</h3>
    }

    const obtenerInventarioCliente = async (cliente) => {
        try {
            const request = await axios.get(`${APIURL}/api/ultimoInventario/${cliente}`);
            setInventario(request.data);
        } catch (err) {

        }
    }
    return (
        <Card>
            {inventario.length > 0 && (
                <CardContent>
                    <div className="row">
                        <div className="col-md-6" style={{ textAlign: 'center' }}>
                            <div className="h2 mb-0 font-weight-bold">CREADO: {moment(inventario[0].fechaCrea).format("DD-MM-YYYY")}</div>
                        </div>
                        <div className="col-md-6" style={{ textAlign: 'center' }}>
                            <div className="h2 mb-0 font-weight-bold">MODIFICADO: {moment(inventario[0].fechaModificado).format("DD-MM-YYYY")}</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="row">
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#04364A', borderWidth: '3px', marginLeft: '20px', width: '250px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-800" style={{ backgroundColor: '#04364A', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                                        DENIM
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{inventario[0].Cantidad}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#64CCC5', borderWidth: '3px', marginLeft: '100px', width: '250px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#64CCC5', color: 'white', textAlign: 'center', padding: '10px 0', }}>
                                        ESTAMPADO
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{inventario[1].Cantidad}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                            </div>
                            <br></br>
                            <div className="row">
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#176B87', borderWidth: '3px', marginLeft: '20px', width: '250px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#176B87', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                                        ROPA
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{inventario[2].Cantidad}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#176B', borderWidth: '3px', marginLeft: '100px', width: '250px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#176B', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                                        TEJIDO DE PUNTO
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{inventario[3].Cantidad}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="row">
                                <PieChart data={inventario} Users={localStorage.getItem('codigo')} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}

        </Card>
    )
}