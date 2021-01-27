import React, { useState } from 'react';
import { Marker, InfoWindow } from 'react-google-maps';

export const ReciboMarker = props => {
    const { datos } = props;
    const [open, setOpen] = useState(false);

    return (
        <Marker onClick={() => { setOpen(true) }} clickable position={{ lat: datos.lat, lng: datos.lng }} icon={{ url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_blue.png" }} >
            {open && <InfoWindow onCloseClick={() => { setOpen(false) }}>
                <div>
                    <h4 style={{ textAlign: 'center',color:'blue' }}>Recibo</h4>
                    <p>Recibo: {datos.numeroRecibo}</p>
                    <p>Codigo Cliente: {datos.cliente}</p>
                    <p>Nombre Cliente: {datos.nombreCliente}</p>
                    <p>Total Recibo: {`${datos.totalRecibo} ${datos.moneda}`}</p>
                </div>
            </InfoWindow>}
        </Marker>
    )
}