import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { IsAllow } from 'components/Seguridad/Permisos';
import Swal from 'sweetalert2/dist/sweetalert2.js';
//components
import MapaReconstruccion from './components/MapaReconstruccion';
import FormularioReconstruccion from './components/FormularioReconstruccion';
import inicio from 'assets/georecorrido/Inicia_dia.png';
import final from 'assets/georecorrido/Finaliza_dia.png';
import SinCoordenadas from 'assets/SinCoordenadas.png';

export const ReconstruccionRuta = props => {
    const [asesores, setAsesores] = useState([]);
    const [asesoresFiltrados, setAsesoresFiltrados] = useState([]);
    const [recorrido, setRecorrido] = useState({});
    const [clientesAgendado, setClientesAgendados] = useState([]);
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);

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

    const cargarAsignaciones = async (asesor, fechaInicio, fechaFin) => {
        try {
            const request = await axios.get(`${APIURL}/api/Asignaciones`, {
                params: { FechaInicio: fechaInicio, FechaFin: fechaFin, Asesor: asesor }, headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token'),
                }
            });
           setClientesAgendados(request.data[0].asignaciones)
        } catch (err) {

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
        if (!IsAllow("/recorrido-monitoreo")) {
            props.history.push('/home');
        }
        cargarAsesores();

        //eslint-disable-next-line
    }, [])

    const handleMostrarDescripcion = () => {
        setMostrarDescripcion(!mostrarDescripcion);
    }

    return (
        <div>
            <FormularioReconstruccion handleMostrarDescripcion={handleMostrarDescripcion} asesoresFiltrados={asesoresFiltrados} filtroAsesoresPorPais={filtroAsesoresPorPais} cargarRecorrido={cargarRecorrido} cargarAsignaciones={cargarAsignaciones} />
            {mostrarDescripcion && <Simbologia />}
            {validarCoordenadas() ?
                <MapaReconstruccion
                    recorrido={recorrido}
                    clientesAgendado={clientesAgendado}
                />
                :
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img alt="SinCoordenadas" style={{ width: '35%' }} src={SinCoordenadas} />
                   
                    
                </div>
            }
        </div>
    )
}

const Simbologia = () => {
    return <div style={{ position: 'absolute', zIndex: 999, width: 300, height: 350 }} className="card">
        <h3 style={{ textAlign: 'center', marginBottom: 10 }}>Simbologia</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <img style={{ width: 20, height: 30 }} src="https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_blue.png" alt="recibomarker" />
            <h5>Recibo</h5>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
            <img style={{ width: 20, height: 30 }} src="https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_green.png" alt="recibomarker" />
            <h5>Pedido</h5>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
            <img style={{ width: 20, height: 30 }} src="https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png" alt="clientemarker" />
            <h5>Cliente</h5>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
            <img src={inicio} alt="recibomarker" />
            <h5>Inicio Ruta</h5>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
            <img src={final} alt="recibomarker" />
            <h5>Final Ruta</h5>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
            <div style={{ borderBottom: '2px solid red', width: 100 }}></div>
            <h5>Recorrido</h5>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
            <h4 style={{ color: 'green', fontWeight: 'bold' }}>O</h4>
            <h5>Asesor</h5>
        </div>
    </div>
}