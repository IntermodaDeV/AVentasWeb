import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';

export const PedidoMarker = props => {
    const { datos } = props;
    const [open, setOpen] = useState(false);

    return (
        <Marker onClick={() => { setOpen(true) }} clickable position={{ lat: datos.lat, lng: datos.lng }} icon={{ url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_green.png" }} >
            {open && <InfoWindow onCloseClick={() => { setOpen(false) }}>
                <div>
                    <h4 style={{ textAlign: 'center',color:'green' }}>Pedido</h4>
                    <p style={{color:'green'}}>Codigo Cliente: {datos.cliente}</p>
                    <p style={{color:'green'}}>Nombre Cliente: {datos.nombreCliente}</p>
                    <p style={{color:'green'}}>Correlativo: {datos.pedidoId}</p>
                    <p style={{color:'green'}}>Pedido AX: {datos.numeroPedido}</p>
                    <p style={{color:'green'}}>Total Pedido: {datos.totalPedido}</p>
                </div>
            </InfoWindow>}
        </Marker>
    )
}