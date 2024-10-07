import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { Loading } from 'components/Global/Loading';
import { Card, CardContent, Button } from '@material-ui/core';
import { APIURL, APP_VERSION } from 'utils/Enviroment'
import { mostrarAlerta, numberWithCommasNoDec } from 'utils/common';
import 'moment/locale/es';

export const ResumenExcel = props => {
    const info = props.informacion;
    const [loading, setLoading] = useState(false);

    const obtenerInventarioCliente = async (cliente) => {
        try {
            const request = await axios.get(`${APIURL}/api/pendientePro8cesar/${cliente}`);
            //setInventario(request.data);
        } catch (err) {
            let mensaje = "";
            let error = "";

            if (err.response) {
                mensaje = err.response.data.Message ? err.response.data.Message : "No se pudo obtener los registros.";
                error = err.response.data.ErrorCode ? err.response.data.ErrorCode : "FCP";
            }
            mostrarAlerta("Error: " + error, mensaje, "error");
        }
    }
    return (
        <Card>
            <Loading open={loading} title="Cargando" />
            <CardContent>
                <div className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="col-md-7" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="h2 mb-0 font-weight-bold">Número Inventario: {info.NumInventario}</div>
                        {info.NoProcesados > 0 && <Button
                            style={{ marginLeft: '10px' }}
                            onClick={() => setLoading(true)}
                            variant="contained"
                            color="secondary">
                            Sincronizar Inventario
                        </Button>}
                    </div>
                </div>
                <br></br>
                <div className="row">
                    <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#04364A', borderWidth: '3px', marginLeft: '20px', width: '200px', height: 'px' }}>
                        <div className="card-header font-weight-bold text-gray-800" style={{ backgroundColor: '#04364A', color: 'white', textAlign: 'center', padding: '5px' }}>
                            Procesados
                        </div>
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "600px" }}>{numberWithCommasNoDec(info.Procesados)}</div>
                            <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                        </div>
                    </div>
                    <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#64CCC5', borderWidth: '3px', marginLeft: '25px', width: '200px', height: '100px' }}>
                        <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#64CCC5', color: 'white', textAlign: 'center', padding: '5px 0', }}>
                            No procesados
                        </div>
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "600px" }}>{numberWithCommasNoDec(info.NoProcesados)}</div>
                            <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                        </div>
                    </div>
                    <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#184930', borderWidth: '3px', marginLeft: '25px', width: '200px', height: '100px' }}>
                        <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#184930', color: 'white', textAlign: 'center', padding: '5px 0' }}>
                            Encontrados
                        </div>
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "600px" }}>{numberWithCommasNoDec(info.Encontrados)}</div>
                            <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                        </div>
                    </div>
                    <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#176B87', borderWidth: '3px', marginLeft: '20px', width: '200px', height: '100px' }}>
                        <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#176B87', color: 'white', textAlign: 'center', padding: '5px 0' }}>
                            No encontrados
                        </div>
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "600px" }}>{numberWithCommasNoDec(info.NoEncontrados)}</div>
                            <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                        </div>
                    </div>
                    <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#176B', borderWidth: '3px', marginLeft: '25px', width: '200px', height: '100px' }}>
                        <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#176B', color: 'white', textAlign: 'center', padding: '5px 0' }}>
                            Total productos
                        </div>
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "600px" }}>{numberWithCommasNoDec(info.TotalCodigos)}</div>
                            <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                        </div>
                    </div>
                    <div className="card shadow h-100 py-2 mb-4" style={{ borderColor: '#48BF40', borderWidth: '3px', marginLeft: '25px', width: '200px', height: '100px' }}>
                        <div className="card-header font-weight-bold text-gray-600" style={{ backgroundColor: '#48BF40', color: 'white', textAlign: 'center', padding: '5px 0' }}>
                            Total codigos
                        </div>
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div className="h1 mb-0 font-weight-bold" style={{ textSizeAdjust: "600px" }}>{numberWithCommasNoDec(info.CodigosBarrasAgrupados)}</div>
                            <div className="h5 mb-0 font-weight-bold text-gray-900">UNIDADES</div>
                        </div>
                    </div>
                </div>
            </CardContent>

        </Card>
    )
}