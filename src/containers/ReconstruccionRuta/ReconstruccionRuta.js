import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APIKEY, APIURL } from 'utils/Enviroment';

//components
import MapaReconstruccion from './components/MapaReconstruccion';
import FormularioReconstruccion from './components/FormularioReconstruccion';

export const ReconstruccionRuta = props => {
    const [asesores, setAsesores] = useState([]);
    const [asesoresFiltrados, setAsesoresFiltrados] = useState([]);
    const [recorrido, setRecorrido] = useState({});

    const cargarAsesores = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Geoposicion/asesores`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setAsesores(request.data);
            setAsesoresFiltrados(request.data);
        } catch (err) {
            console.log(err);
        }
    }

    const cargarRecorrido = async (asesor, fechaInicio, fechaFin) => {
        try {
            const request = await axios.get(`${APIURL}/api/Geoposicion/recorrido`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, params: { asesor, FechaInicio: fechaInicio, FechaFin: fechaFin } });
            setRecorrido(request.data);
            console.log(request.data);
        } catch (err) {
            console.log(err);
        }
    }

    const filtroAsesoresPorPais = (pais) => {
        let filtrados = asesores.filter(x => x.empresa.toUpperCase() === pais.toUpperCase());
        setAsesoresFiltrados(filtrados);
    }

    useEffect(() => {
        cargarAsesores();
    }, [])

    return (
        <div>
            <FormularioReconstruccion asesoresFiltrados={asesoresFiltrados} filtroAsesoresPorPais={filtroAsesoresPorPais} cargarRecorrido={cargarRecorrido} />
            <MapaReconstruccion
                recorrido={recorrido}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100vh` }} />}
                mapElement={<div style={{ height: `100%` }} />}
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${APIKEY}&v=weekly.exp&libraries=geometry,drawing,places`}
            />
        </div>
    )
}