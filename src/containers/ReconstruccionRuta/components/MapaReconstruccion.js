import React from 'react';
import { withGoogleMap, GoogleMap, Polyline, withScriptjs } from 'react-google-maps';

//components
import { PedidoMarker } from './PedidoMarker';
import { ReciboMarker } from './ReciboMarker';

const MapaReconstruccion = props => {
    const { coordenadas, recibos, pedidos } = props.recorrido;
    let initialCoors = {lat: coordenadas[0].lat, lng: coordenadas[0].lng};

    return (
        <GoogleMap defaultZoom={15} center={initialCoors}>
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