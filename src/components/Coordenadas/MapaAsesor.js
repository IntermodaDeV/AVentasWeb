import React from 'react';
import GoogleMapReact from 'google-map-react';
import { APIKEY } from 'utils/Enviroment';

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
                    lat: props.latitude,
                    lng: props.longitude
                }
            }
            defaultZoom={15}
            yesIWantToUseGoogleMapApiInternals={true}
        >
            <Marker lat={props.latitude} lng={props.longitude} />
        </GoogleMapReact>
    )
}

const Marker = props => {
    return <img alt="marker" src={`https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png`} />
}