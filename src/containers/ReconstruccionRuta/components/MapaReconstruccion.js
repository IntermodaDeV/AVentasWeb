import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker, InfoWindow } from '@react-google-maps/api';
import { APIKEY } from 'utils/Enviroment';
import moment from "moment";
import 'moment/locale/es';

//components
import { PedidoMarker } from './PedidoMarker';
import { ReciboMarker } from './ReciboMarker';
import inicio from 'assets/georecorrido/Inicia_dia.png';
import final from 'assets/georecorrido/Finaliza_dia.png';

const MapaReconstruccion = props => {
    const { coordenadas, recibos, pedidos } = props.recorrido;
    let initialCoors = { lat: coordenadas[0].lat, lng: coordenadas[0].lng };
    let lastCoors = { lat: coordenadas[coordenadas.length - 1].lat, lng: coordenadas[coordenadas.length - 1].lng };
    const [inicioruta, setInicio] = useState(false);
    const [finalruta, setFinal] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: APIKEY
    })

    const [options, setOptions] = useState({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        clickable: false,
        draggable: false,
        editable: false,
        visible: true,
        radius: 30000,
        paths: coordenadas,
        zIndex: 1
    })


    const onLoad = React.useCallback(function callback(mapi) {
        const lineSymbol = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            strokeColor: "#393",
        };
        setOptions((prevState) => ({
            ...prevState, icons: [{
                icon: lineSymbol,
                offset: "100%",
            }]
        }))
    }, [])

    const animateCircle = (line) => {
        console.log(line)
        if (line.icons) {
            let count = 0;
            window.setInterval(() => {
                count = (count + 1) % 200;
                const icons = line.get("icons");
                icons[0].offset = count / 2 + "%";
                line.set("icons", icons);
            }, 200);
        }
    }

    const onUnmount = React.useCallback(function callback(map) {
        
    }, [])

    const onLoadPolyline = polyline => {
        animateCircle(polyline)
    }

    const clicMarcadorInicio = () => {
        setInicio(!inicioruta);
    }

    const clicMarcadorFinal = () => {
        setFinal(!finalruta);
    }

    return isLoaded ? (
        <GoogleMap zoom={15} center={initialCoors} mapContainerStyle={{ height: '100vh' }} onLoad={onLoad} onUnmount={onUnmount}>
            <Marker position={initialCoors} icon={{ url: inicio }} onClick={clicMarcadorInicio}>
                {inicioruta && <InfoWindow onCloseClick={clicMarcadorInicio}>
                    <div>
                        <h4 style={{ textAlign: 'center', color: 'green' }}>Inicio Ruta</h4>
                        <p style={{ textAlign: 'center', color: 'green' }}>{moment(new Date(coordenadas[0].fecha)).format('DD/MM/YYYY hh:mm a')}</p>
                    </div>
                </InfoWindow>}
            </Marker>
            <Marker position={lastCoors} icon={{ url: final }} onClick={clicMarcadorFinal}>
                {finalruta && <InfoWindow onCloseClick={clicMarcadorFinal}>
                    <div>
                        <h4 style={{ textAlign: 'center', color: 'red' }}>Final Ruta</h4>
                        <p style={{ textAlign: 'center', color: 'red' }}>{moment(new Date(coordenadas[coordenadas.length - 1].fecha)).format('DD/MM/YYYY hh:mm a')}</p>
                    </div>
                </InfoWindow>}
            </Marker>
            {(recibos && recibos.length > 0)
                && recibos.map((x) => <ReciboMarker key={x.reciboId} datos={x} />)}

            {(pedidos && pedidos.length > 0)
                && pedidos.map((x) => <PedidoMarker key={x.pedidoId} datos={x} />)}

            <Polyline
                onLoad={onLoadPolyline}
                path={coordenadas}
                options={options}
            />
        </GoogleMap>
    ) : <></>
}

export default React.memo(MapaReconstruccion)