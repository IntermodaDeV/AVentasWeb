import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Dropdown } from "semantic-ui-react";
import { MapaAsesor } from 'components/Coordenadas/MapaAsesor';
import { APIURL } from 'utils/Enviroment';

export const CoordenadasAsesor = props => {
    const [asesores, setAsesores] = useState([]);
    const [asesor, setAsesor] = useState(null);
    const [ubicacion, setUbicacion] = useState(null);

    const cargarAsesores = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Geoposicion/asesores`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setAsesores(request.data);
        } catch (err) {
            console.log(err);
        }
    }

    const cargarUltimaLocalizacion = async (asesor) => {
        try {
            const request = await axios.get(`${APIURL}/api/Geoposicion/${asesor}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setUbicacion(request.data);
        } catch (err) {
            console.log(err);
        }
    }

    const cargarUltimaLocalizacionIntervalo = useCallback(async () => {
        if (asesor) {
            try {
                const request = await axios.get(`${APIURL}/api/Geoposicion/${asesor}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
                setUbicacion(request.data);
            } catch (err) {
                console.log(err);
            }
        }
    }, [asesor])

    const validarCoordenadas = () => {
        return (ubicacion === null || Object.keys(ubicacion).length === 0);
    }

    useEffect(() => {
        cargarAsesores();
    }, []);

    useEffect(() => {
        let intervaloUbicacion = setInterval(cargarUltimaLocalizacionIntervalo, 15000);

        return () => {
            clearInterval(intervaloUbicacion);
        }
    }, [cargarUltimaLocalizacionIntervalo]);

    return (
        <div>
            <Dropdown
                placeholder="Seleccione un asesor"
                fluid
                search
                selection
                onChange={(e, { value }) => {
                    setAsesor(value);
                    cargarUltimaLocalizacion(value);
                }}
                options={asesores.map(asesor => {
                    return { key: asesor.codigo, value: asesor.codigo, text: asesor.nombre }
                })}
                noResultsMessage={"No hay resultados"}
                closeOnChange={true}
            />
            {validarCoordenadas()
                ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <h1>Coordenadas no disponibles</h1>
                </div>
                : <div style={{ height: '100vh', width: '100%' }}>
                    <MapaAsesor longitude={ubicacion.longitude} latitude={ubicacion.latitude} asesor={asesor} />
                </div>
            }
        </div>
    );
}