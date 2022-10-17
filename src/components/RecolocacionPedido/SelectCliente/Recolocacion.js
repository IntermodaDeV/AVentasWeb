import React from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';

export const Recolocacion = (props) => {
    return (
        <Card style={{ margin: '15px' }}>
            <CardContent>
                <div style={{ marginTop: 20 }}>
                    <h3>Recolocación de devolución</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', marginTop: 40 }}>
                        <div style={{ display: 'flex', width: '90%'}}>
                            <input type="text" className="mr-5 form-control" placeholder="RMA Devolución" /*onChange={ (e) => { setCodigo(e.target.value) }}*/ />
                        </div>
                        <button className="btn btn-success" /*onClick={obtenerProductosFactura}*/>Registrar</button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}