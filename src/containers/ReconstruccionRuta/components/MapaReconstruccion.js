import React from 'react';
import { withGoogleMap, GoogleMap, Polyline, withScriptjs, Marker } from 'react-google-maps';

//components
import { PedidoMarker } from './PedidoMarker';
import { ReciboMarker } from './ReciboMarker';
import inicio from 'assets/georecorrido/Inicia_dia.png';
import final from 'assets/georecorrido/Finaliza_dia.png';

const MapaReconstruccion = props => {
    const { coordenadas, recibos, pedidos } = props.recorrido;
    let initialCoors = { lat: coordenadas[0].lat, lng: coordenadas[0].lng };
    let lastCoors = { lat: coordenadas[coordenadas.length - 1].lat, lng: coordenadas[coordenadas.length - 1].lng };

    return (
        <GoogleMap defaultZoom={15} center={initialCoors}>
            <Marker position={initialCoors} icon={{ url: inicio }} />
            <Marker position={lastCoors} icon={{ url: final }} />
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