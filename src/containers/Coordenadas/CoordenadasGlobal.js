import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import { APIURL, APIKEY } from 'utils/Enviroment';
import { Dropdown } from "semantic-ui-react/";
import { useSelector } from 'react-redux';
import { IsAllow } from 'components/Seguridad/Permisos';
import {
    /*Button,*/
    Col,
    Container,
    Row,
} from 'reactstrap';

const paises =
    [
        { id: 1, value: '*', pais: "Todos" },
        { id: 2, value: 'IMHN', pais: "Honduras" },
        { id: 3, value: 'IMGT', pais: "Guatemala" },
        { id: 4, value: 'IMCR', pais: "Costa Rica" }
    ]

const getTodos= () => {
    return [
        { $id: "Todos",
        codigo: "Todos",
        empresa: "Todos",
        nombre: "Todos"}
    ]
}

const CoordenadasGlobal = (props) => {
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const [paiseSelected, setpaiseSelected] = useState(null);
    const [asesores, setAsesores] = useState([]);
    const [asesoresFiltrados, setAsesoresFiltrados] = useState([]);
    const mapRef = useRef();
    const mapsRef = useRef();
    const [coordenadas, setCoordenadas] = useState([]);
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
            var infowindow = new mapsRef.current.InfoWindow({
                content: cliente.ACCOUNT + " " + cliente.NAME
            });
            let marker = new mapsRef.current.Marker({
                position: {
                    lat: parseFloat(cliente.LATITUDE),
                    lng: parseFloat(cliente.LONGITUD)
                },
                map: mapRef.current,
                title: cliente.NAME
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

    const handleDropdownChange = (value) => {
        setpaiseSelected(value)  
        if (value === '*') {      
            renderMarkers(coordenadas);
            setAsesoresFiltrados([]);
            return;
        }

        let filtrados = asesores.filter(x => x.empresa.toUpperCase() === value);
        let todos = getTodos();
        let newlist =[...todos,...filtrados]
        setAsesoresFiltrados(newlist);

        const clientes = coordenadas.filter(x => x.COMPANY === value);
        renderMarkers(clientes);
    }

    const handleDropdownChangeAsesor = (value) => {
        setAsesorSelected(value)
        if (value === 'Todos') {
            const clientes = coordenadas.filter(x => x.COMPANY === paiseSelected);
            renderMarkers(paiseSelected=== '*' ? coordenadas : clientes);
            return;
        }

        const clientes = coordenadas.filter(x => x.ADVISER === value && x.COMPANY == paiseSelected);
        renderMarkers(clientes);
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
                        onChange={(e, { value }) => handleDropdownChange(value)}
                        options={paises.map(ruta => {
                            return { key: ruta.id, value: ruta.value, text: ruta.pais }
                        })}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                    //value={paiseSelected.value}
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
                    //value={paiseSelected.value}
                    />
                </Col>
            </Row>


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

export default CoordenadasGlobal;