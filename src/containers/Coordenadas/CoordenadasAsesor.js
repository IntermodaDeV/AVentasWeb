import React, { useState, useEffect, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { MapaAsesor } from 'components/Coordenadas/MapaAsesor';
import { ListaAsesores } from 'components/Coordenadas/ListaAsesores';
import { APIURL } from 'utils/Enviroment';
import { IsAllow } from 'components/Seguridad/Permisos';

export const CoordenadasAsesor = props => {
    const [asesores, setAsesores] = useState([]);
    const [asesoresSeleccionados, setAsesoresSeleccionados] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [checked, setChecked] = useState(false);

    const cargarAsesores = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Geoposicion/asesores`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setAsesores(request.data);
        } catch (err) {
            console.log(err);
        }
    }

    const cargarUltimaLocalizacion = async () => {
        if (asesoresSeleccionados.length > 0) {
            try {
                const request = await axios.get(`${APIURL}/api/Geoposicion`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, params: { asesores: asesoresSeleccionados } });
                setUbicaciones(request.data);
            } catch (err) {
                console.log(err);
            }
        }
    }

    const cargarUltimaLocalizacionIntervalo = useCallback(async () => {
        if (asesoresSeleccionados.length > 0) {
            try {
                const request = await axios.get(`${APIURL}/api/Geoposicion`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, params: { asesores: asesoresSeleccionados } });
                setUbicaciones(request.data);
            } catch (err) {
                console.log(err);
            }
        }
    }, [asesoresSeleccionados])

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
        if (asesoresSeleccionados.includes(codigo)) {
            if (asesoresSeleccionados.length === 1) {
                limpiarMarcadores(); 
            }
            setAsesoresSeleccionados(asesoresSeleccionados.filter(x => x !== codigo));
        } else {
            setAsesoresSeleccionados([...asesoresSeleccionados, codigo]);
        }
    }

    const limpiarMarcadores = () => {
        setUbicaciones([]);
    }

    const handleClickTodosAsesores = () => {
        if (checked) {
            setAsesoresSeleccionados([]);
            limpiarMarcadores();
        } else {
            setAsesoresSeleccionados(asesores.map(x => x.codigo));
        }
        setChecked(!checked);
    }

    return (
        <div style={{ height: '100vh' }} className="row">
            <div className="col-md-3 h-100">
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Button style={{ height: 35 }} onClick={cargarUltimaLocalizacion} variant="contained" color="primary">Obtener Coordenadas</Button>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="exampleCheck1" checked={checked} onClick={handleClickTodosAsesores} />
                        <label class="form-check-label" for="exampleCheck1">Todos los asesores</label>
                    </div>
                </div>
                <ListaAsesores asesores={asesores} seleccionarAsesor={seleccionarAsesor} asesorSeleccionado={asesoresSeleccionados} />
            </div>
            {ubicaciones.length === 0
                ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h1>Coordenadas no disponibles</h1>
                </div>
                : <div className="col-md-9" style={{ height: '100vh', width: '100%' }}>
                    <MapaAsesor ubicaciones={ubicaciones} />
                </div>
            }
        </div>
    );
}