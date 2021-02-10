import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';

export const ReciboMarker = props => {
    const { datos } = props;
    const [open, setOpen] = useState(false);

    return (
        <Marker onClick={() => { setOpen(true) }} clickable position={{ lat: datos.lat, lng: datos.lng }} icon={{ url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_blue.png" }} >
            {open && <InfoWindow onCloseClick={() => { setOpen(false) }}>
                <div>
                    <h4 style={{ textAlign: 'center',color:'blue' }}>Recibo</h4>
                    <p style={{color:'blue'}}>Recibo: {datos.numeroRecibo}</p>
                    <p style={{color:'blue'}}>Codigo Cliente: {datos.cliente}</p>
                    <p style={{color:'blue'}}>Nombre Cliente: {datos.nombreCliente}</p>
                    <p style={{color:'blue'}}>Total Recibo: {`${datos.totalRecibo} ${datos.moneda}`}</p>
                </div>
            </InfoWindow>}
        </Marker>
    )
}