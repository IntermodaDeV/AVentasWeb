import React, { useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { APIKEY } from 'utils/Enviroment';
import moment from "moment";
import 'moment/locale/es';

export const MapaAsesor = props => {

    return (
        <GoogleMapReact
            bootstrapURLKeys={{ key: APIKEY }}
            defaultCenter={
                {
                    lat: 15.497377,
                    lng: -88.036478
                }
            }
            center={
                {
                    lat: 15.497377,
                    lng: -88.036478
                }
            }
            defaultZoom={10}
            yesIWantToUseGoogleMapApiInternals={true}
        >
            {props.ubicaciones.map((ubicacion) => (<Marker key={ubicacion.asesor} lat={ubicacion.latitude} lng={ubicacion.longitude} ubicacion={ubicacion} />))}
        </GoogleMapReact>
    )
}

const Marker = props => {
    const [visible, setVisible] = useState(false);

    const handleVisibleClick = () => {
        setVisible(!visible);
    }

    return <>
        <img style={{zIndex:-999}} onClick={handleVisibleClick} alt="marker" src={`https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png`} />
        {visible && <InfoWindow ubicacion={props.ubicacion} closewindow={handleVisibleClick} />}
    </>
}

const InfoWindow = props => {
    const { ultimaFecha, asesor, fechacheckout, nombrecliente, codigocliente } = props.ubicacion;
    return (
        <div style={styles.infowindow}>
            <h2 style={styles.infowindowTitle}>Datos</h2>
            <p style={{ fontSize: 13 }}><b>Asesor:</b> {asesor}</p>
            <p style={{ fontSize: 13 }}><b>Ultimo Cliente Visitado:</b> {`${codigocliente}-${nombrecliente}`}</p>
            <p style={{ fontSize: 13 }}><b>Ultima Visita:</b> {moment(fechacheckout).format('DD/MM/YYYY hh:mm a')}</p>
            <p style={{ fontSize: 13 }}><b>Ultima Actualización:</b> {moment(ultimaFecha).format('DD/MM/YYYY hh:mm a')}</p>
            <button style={styles.infowindowButton} onClick={props.closewindow}>Cerrar</button>
        </div>
    )
}

const styles = {
    infowindow: {
        width: 300,
        height: 240,
        background: '#fff',
        borderRadius: 10,
        padding: 5,
        boxShadow: '5px 5px #c1c1c1',
        zIndex:10
    },
    infowindowTitle: {
        textAlign: 'center'
    },
    infowindowButton: {
        width: '100%',
        borderStyle: 'none',
        color: '#fff',
        background: "#243746",
        borderRadius: 10,
        padding: 5,
        fontSize: 15
    },
    markerStyle: {
        position: 'absolute',
        width: 40,
        height: 40,
        left: -40 / 2,
        top: -40 / 2,

        border: '5px solid #f44336',
        borderRadius: 40,
        backgroundColor: 'white',
        textAlign: 'center',
        color: '#3f51b5',
        fontSize: 16,
        fontWeight: 'bold',
        padding: 4,
        cursor: 'pointer'
    }
}
