import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MapaAsesor } from 'components/Coordenadas/MapaAsesor';
import { ListaAsesores } from 'components/Coordenadas/ListaAsesores';
import { APIURL } from 'utils/Enviroment';
import { IsAllow } from 'components/Seguridad/Permisos';

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

        if (!IsAllow("/ultima-geolocalizacion-monitoreo")) {
            props.history.push('/home');
        }

        cargarAsesores();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        let intervaloUbicacion = setInterval(cargarUltimaLocalizacionIntervalo, 15000);

        return () => {
            clearInterval(intervaloUbicacion);
        }
    }, [cargarUltimaLocalizacionIntervalo]);

    const seleccionarAsesor = (codigo) => {
        setAsesor(codigo);
        cargarUltimaLocalizacion(codigo);
    }

    return (
        <div style={{ height: '100vh' }} className="row">
            <div className="col-md-3 h-100">
                <ListaAsesores asesores={asesores} seleccionarAsesor={seleccionarAsesor} asesorSeleccionado={asesor} />
            </div>
            {validarCoordenadas()
                ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h1>Coordenadas no disponibles</h1>
                </div>
                : <div className="col-md-9" style={{ height: '100vh', width: '100%' }}>
                    <MapaAsesor longitude={ubicacion.longitude} latitude={ubicacion.latitude} asesor={asesor} />
                </div>
            }
        </div>
    );
}