import React, { useState } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';

export const PedidoMarker = props => {
    const { datos } = props;
    const [open, setOpen] = useState(false);

    return (
        <Marker onClick={() => { setOpen(true) }} clickable position={{ lat: datos.lat, lng: datos.lng }} icon={{ url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_green.png" }} >
            {open && <InfoWindow onCloseClick={() => { setOpen(false) }}>
                <div>
                    <h4 style={{ textAlign: 'center' }}>Pedido</h4>
                    <p>Codigo Cliente: {datos.cliente}</p>
                    <p>Nombre Cliente: {datos.nombreCliente}</p>
                    <p>Correlativo: {datos.pedidoId}</p>
                    <p>Pedido AX: {datos.numeroPedido}</p>
                    <p>Total Pedido: {datos.totalPedido}</p>
                </div>
            </InfoWindow>}
        </Marker>
    )
}