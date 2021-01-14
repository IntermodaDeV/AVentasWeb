import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APIKEY, APIURL } from 'utils/Enviroment';
import {IsAllow} from 'components/Seguridad/Permisos';
import Swal from 'sweetalert2/dist/sweetalert2.js';
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
            if (asesor === "") {
                Swal.fire({
                    title: 'Advertencia',
                    text: "Seleccione un asesor.",
                    type: 'warning',
                    confirmButtonText: 'OK',
                });
                return;
            }
            const request = await axios.get(`${APIURL}/api/Geoposicion/recorrido`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, params: { asesor, FechaInicio: fechaInicio, FechaFin: fechaFin } });
            setRecorrido(request.data);
        } catch (err) {
            console.log(err);
        }
    }

    const filtroAsesoresPorPais = (pais) => {
        let filtrados = asesores.filter(x => x.empresa.toUpperCase() === pais.toUpperCase());
        setAsesoresFiltrados(filtrados);
    }

    const validarCoordenadas = () => {
        return Object.keys(recorrido).length > 0 && recorrido.coordenadas && recorrido.coordenadas.length > 0;
    }

    useEffect(() => {
        if(!IsAllow("/recorrido-monitoreo"))
        {
          props.history.push('/home');
        }
        cargarAsesores();

        //eslint-disable-next-line
    }, [])

    return (
        <div>
            <FormularioReconstruccion asesoresFiltrados={asesoresFiltrados} filtroAsesoresPorPais={filtroAsesoresPorPais} cargarRecorrido={cargarRecorrido} />
            {validarCoordenadas()?
                <MapaReconstruccion
                recorrido={recorrido}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100vh` }} />}
                mapElement={<div style={{ height: `100%` }} />}
                googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${APIKEY}&v=weekly.exp&libraries=geometry,drawing,places`}
            />
            :
                <h1 style={{textAlign:'center'}}>No hay coordenadas disponibles.</h1>
            }
        </div>
    )
}