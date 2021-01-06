import React from 'react';
import { withGoogleMap, GoogleMap, Polyline, withScriptjs } from 'react-google-maps';

//components
import { PedidoMarker } from './PedidoMarker';
import { ReciboMarker } from './ReciboMarker';

const MapaReconstruccion = props => {
    const { coordenadas, recibos, pedidos } = props.recorrido;
    let initialCoors;

    if (coordenadas && coordenadas.length > 0) {
        initialCoors = {
            lat: coordenadas[0].lat, lng: coordenadas[0].lng
        }
    } else {
        initialCoors = {
            lat: 15.497377, lng: -88.036478
        }
    }

    return (
        <GoogleMap defaultZoom={15} defaultCenter={initialCoors}>
            {(recibos && recibos.length > 0)
                && recibos.map((x) => <ReciboMarker key={x.reciboId} datos={x} />)}

            {(pedidos && pedidos.length > 0)
                && pedidos.map((x) => <PedidoMarker key={x.pedidoId} datos={x} />)}

            <Polyline
                path={coordenadas}
                options={{
                    geodesic: true,
                    strokeColor: "red",
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                }}
            />
        </GoogleMap>
    )
}

export default withScriptjs(withGoogleMap(MapaReconstruccion));