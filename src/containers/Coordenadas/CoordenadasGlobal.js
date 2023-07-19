import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import { APIURL, APIKEY } from 'utils/Enviroment';
import { Dropdown } from "semantic-ui-react/";

import {
    /*Button,*/
    Col,
    Row,
} from 'reactstrap';
import { string } from 'prop-types';

const paises =
    [
        { id: 1, value: '*', pais: "Todos" },
        { id: 2, value: 'IMHN', pais: "Honduras" },
        { id: 3, value: 'IMGT', pais: "Guatemala" },
        { id: 4, value: 'IMCR', pais: "Costa Rica" },
        { id: 5, value: 'IMSL', pais: "El Salvador" },
    ]

const estadoCredito =
    [
        { id: 1, value: '*', estado: "Todos" },
        { id: 2, value: 'Todo', estado: "Suprimido" },
        { id: 3, value: 'No', estado: "Activo Habilitado" },
        { id: 4, value: 'Factura', estado: "Activo con Mora" },
    ]

const getTodos = () => {
    return [
        {
            $id: "Todos",
            codigo: "*",
            empresa: "Todos",
            nombre: "Todos"
        }
    ]
}

const CoordenadasGlobal = (props) => {
    const [paiseSelected, setpaiseSelected] = useState(null);
    const [paisList, setpaisList] = useState([]);
    const [asesores, setAsesores] = useState([]);
    const [asesor, setAsesor] = useState(null);
    const [asesoresFiltrados, setAsesoresFiltrados] = useState([]);
    const mapRef = useRef();
    const mapsRef = useRef();
    const [coordenadas, setCoordenadas] = useState([]);
    const [estado, setEstado] = useState(null);
    // eslint-disable-next-line
    const [marcadores, setMarcadores] = useState([]);
    useEffect(() => {
        cargarRutas();
        cargarAsesores();
    }, [])

    const cargarRutas = () => {
        axios({
            url: APIURL + "/api/cliente/ubicacion/global",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(e => {
                setCoordenadas(e.data);
            })
            .catch(err => console.warn(err));

    }

    const cargarAsesores = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Geoposicion/asesores`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setAsesores(request.data);
        } catch (err) {
            console.log(err);
        }
    }

    const renderMarkers = (clientes) => {
        if (marcadores.length > 0) {
            marcadores.forEach(marcador => {
                marcador.setMap(null);
            });
        }

        clientes.forEach(cliente => {
            var icon = "";
            var estado = "";

            switch (cliente.CREDITSTATUS) {
                case "Todo":
                    icon = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
                    estado = "Suprimido"
                    break;
                case "No":
                    icon = "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
                    estado = "Activo Habilitado"
                    break;
                case "Factura":
                    icon = "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
                    estado = "Mora"
                    break;
                default:
                    icon = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
                    estado = "No identificado"
                    break;
            }

            const contentString =
                "<div style={styles.infowindow}>" +
                "<p style={{ styles.infowindowTitle}}><b>" + cliente.NAME + "</b></p>" +
                "<p style={{ fontSize: 13 }}><b>Código Cliente: </b> " + cliente.ACCOUNT + "</p>" +
                "<p style={{ fontSize: 13 }}><b>Asesor: </b>" + cliente.ADVISERNAME + "</p>" +
                "<p style={{ fontSize: 13 }}><b>Estado Comercial: </b>" + estado + "</p>" +
                "<p style={{ fontSize: 13 }}>" + cliente.LATITUDE + "," + cliente.LONGITUD + "</p>" +
                "</div>";


            var infowindow = new mapsRef.current.InfoWindow({
                content: contentString
            });
            let marker = new mapsRef.current.Marker({
                position: {
                    lat: parseFloat(cliente.LATITUDE),
                    lng: parseFloat(cliente.LONGITUD)
                },
                map: mapRef.current,
                title: cliente.NAME,
                icon: {
                    url: icon,
                },
            });
            marker.addListener('click', function () {
                infowindow.open(mapRef.current, marker);
            });
            mapRef.current.addListener('click', function () {
                infowindow.close();
            });

            marcadores.push(marker);
        });
        setBounds(clientes);
    }

    const handleDropdownChangeCountry = (value) => {
        setpaiseSelected(value)
        setAsesor('*');
        if (value === '*') {
            if (estado !== '*' && estado != null) {
                const clientes = coordenadas.filter(x => x.CREDITSTATUS === estado);
                renderMarkers(clientes);
                setAsesoresFiltrados([]);
                return;
            }
            setpaisList(coordenadas);
            renderMarkers(coordenadas);
            setAsesoresFiltrados([]);
            return;
        }

        let filtrados = asesores.filter(x => x.empresa.toUpperCase() === value);
        let todos = getTodos();
        let newlist = [...todos, ...filtrados]
        setAsesoresFiltrados(newlist);


        if (estado != '*' && estado != null) {
            const clientes = coordenadas.filter(x => x.CREDITSTATUS === estado && x.COMPANY === value);
            renderMarkers(clientes);
            return;
        }

        const paisesFiltrados = coordenadas.filter(x => x.COMPANY === value);
        setpaisList(paisesFiltrados);
        renderMarkers(paisesFiltrados);
        return;
    }

    const handleDropdownChangeAsesor = (value) => {
        setAsesor(value);
        setEstado('*');
        if (value === '*') {
            renderMarkers(paiseSelected === '*' ? coordenadas : paisList);
            setEstado(null);
            return;
        }
        setEstado(null);
        renderMarkers(paisList.filter(x => x.ADVISER === value));
    }

    const handleDropdownChangeStatus = (value) => {
        setEstado(value);
        if (value === '*') {
            if (paiseSelected != null && paiseSelected != '*') {
                if (asesor != null && asesor != '*') {
                    renderMarkers(paisList.filter(x => x.ADVISER === asesor));
                    return;
                }
                renderMarkers(paisList);
                return;
            }
            else {
                renderMarkers(coordenadas);
                return
            }
        }

        if (paiseSelected != '*' && paiseSelected != null) {
            if (asesor != null && asesor != '*') {
                renderMarkers(paisList.filter(x => x.CREDITSTATUS === value && x.ADVISER === asesor));
                return;
            }
            renderMarkers(paisList.filter(x => x.CREDITSTATUS === value));
            return;
        } else {
            const filtradas = coordenadas.filter(x => x.CREDITSTATUS === value);
            renderMarkers(filtradas);
        }


    }

    const setBounds = (clientes) => {
        const LatLngList = clientes.map(cliente => (new mapsRef.current.LatLng(cliente.LATITUDE, cliente.LONGITUD)));
        let bounds = new mapsRef.current.LatLngBounds();

        for (let LatLng of LatLngList) {
            bounds.extend(LatLng);
        }

        mapRef.current.fitBounds(bounds);
    }

    if (coordenadas.length === 0) {
        return <h1>Coordenadas no disponbles</h1>
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Row >
                <Col>
                    <Dropdown
                        placeholder="Seleccione pais"
                        fluid
                        search
                        selection
                        onChange={(e, { value }) => handleDropdownChangeCountry(value)}
                        options={paises.map(ruta => {
                            return { key: ruta.id, value: ruta.value, text: ruta.pais }
                        })}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                    />
                </Col>
                <Col>
                    <Dropdown
                        placeholder="Seleccione asesor"
                        fluid
                        search
                        selection
                        onChange={(e, { value }) => handleDropdownChangeAsesor(value)}
                        options={asesoresFiltrados.map(asesor => {
                            return { key: asesor.id, value: asesor.codigo, text: asesor.nombre }
                        })}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                    />
                </Col>
                <Col>
                    <Dropdown
                        placeholder="Seleccione el estado crediticio"
                        fluid
                        search
                        selection
                        onChange={(e, { value }) => handleDropdownChangeStatus(value)}
                        options={estadoCredito.map(ruta => {
                            return { key: ruta.id, value: ruta.value, text: ruta.estado }
                        })}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        value={estado}
                    />
                </Col>
            </Row>
            <br></br>

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
                defaultZoom={15}
                onGoogleApiLoaded={({ map, maps }) => {
                    mapRef.current = map;
                    mapsRef.current = maps;
                    renderMarkers(coordenadas);
                }}
                yesIWantToUseGoogleMapApiInternals={true}
            >

            </GoogleMapReact>

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
        zIndex: 99
    },
    infowindowTitle: {
        textAlign: 'center',
        fontSize: 18
    }
}

export default CoordenadasGlobal;