import React, { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import axios from 'axios'
import { APIURL, APP_VERSION } from 'utils/Enviroment'
import { useSelector } from 'react-redux';
import CardContent from '@material-ui/core/CardContent';
import PieChart from 'components/Inventario/PieChart';
import { mostrarAlerta, numberWithCommasNoDec } from 'utils/common';
import moment from 'moment';
import 'moment/locale/es';

export const InventarioAnterior = props => {
    const [inventario, setInventario] = useState([]);
    const anterior = useSelector(e => e.Anterior);

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
            let mensaje = "No se pudo obtener los registros.";
            let error = "FCPI01";

            if (err.response.data) {
                mensaje = err.response.data.Message;
                error = err.response.data.ErrorCode;
            }

            mostrarAlerta("Error " + error, mensaje, "error");
        }
    }
    return (
        <Card>
            {inventario.length > 0 && (
                <CardContent>
                    <div className="row">
                        <div className="col-md-7" style={{ textAlign: 'center' }}>
                            <div className="h2 mb-0 font-weight-bold">CREADO: {moment(inventario[0].fechaCrea).format("DD-MM-YYYY")}</div>
                        </div>
                        <div className="col-md-5" style={{ textAlign: 'center' }}>
                            <div className="h2 mb-0 font-weight-bold">{anterior ? "MODIFICADO:" : "FINALIZADO:"} {moment(inventario[0].fechaModificado).format("DD-MM-YYYY")}</div>
                        </div>
                    </div>
                    <br></br>
                    <div className="row">
                        <div className="col-md-7">
                            <div className="row">
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#04364A', borderWidth: '3px', marginLeft: '20px', width: '210px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-800" style={{ backgroundColor: '#04364A', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                                        {inventario[0].IdLinea}
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{numberWithCommasNoDec(inventario[0].Cantidad)}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#64CCC5', borderWidth: '3px', marginLeft: '25px', width: '210px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#64CCC5', color: 'white', textAlign: 'center', padding: '10px 0', }}>
                                        {inventario[1].IdLinea}
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{numberWithCommasNoDec(inventario[1].Cantidad)}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#184930', borderWidth: '3px', marginLeft: '25px', width: '210px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#184930', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                                        {inventario[2].IdLinea}
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{numberWithCommasNoDec(inventario[2].Cantidad)}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                            </div>
                            <br></br>
                            <div className="row">
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#176B87', borderWidth: '3px', marginLeft: '20px', width: '210px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#176B87', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                                        {inventario[3].IdLinea}
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{numberWithCommasNoDec(inventario[3].Cantidad)}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#176B', borderWidth: '3px', marginLeft: '25px', width: '210px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#176B', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                                        {inventario[4].IdLinea}
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{numberWithCommasNoDec(inventario[4].Cantidad)}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                                <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#48BF40', borderWidth: '3px', marginLeft: '25px', width: '210px', height: '200px' }}>
                                    <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#48BF40', color: 'white', textAlign: 'center', padding: '10px 0' }}>
                                        NO ENCONTRADOS
                                    </div>
                                    <div className="card-body" style={{ textAlign: 'center' }}>
                                        <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "800px" }}>{inventario.length > 5 ? numberWithCommasNoDec(inventario[5].Cantidad) : 0}</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-5">
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