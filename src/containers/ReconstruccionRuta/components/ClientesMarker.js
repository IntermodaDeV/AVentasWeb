import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import moment from "moment";

export const ClientesMarker = props => {
    const { datos } = props;
    const [open, setOpen] = useState(false);
    return (
        <Marker onClick={() => { setOpen(true) }} clickable position={{ lat: datos.Latitud, lng: datos.Longitud }} icon={{ url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png" }} >
            {open && <InfoWindow onCloseClick={() => { setOpen(false) }}>
                <div>
                    <h4 style={{ textAlign: 'center',color:'black' }}>Cliente</h4>
                    <p style={{color:'black'}}>Codigo Cliente: {datos.cliente}</p>
                    <p style={{color:'black'}}>Nombre Cliente: {datos.NombreCliente}</p>
                    <p style={{color:'black'}}>Hora Inicio: {moment(datos.HoraInicio).format('LT')}</p>
                    <p style={{color:'black'}}>Hora Fin: {moment(datos.HoraFin).format('LT')}</p>
                    <p style={{color:'black'}}>¿Visita Finalizada?: {datos.Checkin  && datos.Checkout ? "Si" : "No"}</p>
                </div>
            </InfoWindow>}
        </Marker>
    )
}