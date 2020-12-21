import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown } from "semantic-ui-react";
import { APIURL } from 'utils/Enviroment';
import {
    Card,
    CardBody,
    CardHeader,
} from 'reactstrap';
import { IsAllow } from 'components/Seguridad/Permisos';
import { SincronizacionTable } from 'components/Sincronizacion/SincronizacionTable';
import axios from 'axios';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import CachedIcon from '@material-ui/icons/Cached';

export const SincronizacionColeccionEspecifica = props => {
    const [empresa, setEmpresa] = useState('');
    const [coleccion, setColeccion] = useState('');
    const [listaEspecifica, setListaEspecifica] = useState([]);
    const EMPRESAS_ASIGNADAS = useSelector(e => e.Permisos[0].EmpresasUsuarios);
    const GESTOR_ESPECIFICO = parseInt(useSelector(e => e.Configuraciones.SyncColeccion));

    const mostrarAdvertencia = (title, text, type) => {
        Swal.fire({
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Ok',
        })
    }

    const enviarSincronizacionEspecifica = async () => {
        try {
            if (empresa === "" || coleccion === "") {
                mostrarAdvertencia("Información necesaria", "Seleccione pais o ingrese el codigo de colección.", "warning");
            } else {
                const data = { IdGestor: GESTOR_ESPECIFICO, EmpresaId: empresa, ColeccionId: coleccion, Usuario: localStorage.getItem('codigo') };
                await axios.post(`${APIURL}/api/SincronizacionEspecifico/Coleccion/upload`, data);
                cargarListaEspecifica();
            }
        } catch (err) {

        }
    }

    const cargarListaEspecifica = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/SincronizacionEspecifico/${localStorage.getItem('codigo')}`);
            setListaEspecifica(request.data);
        } catch (err) {

        }
    }

    useEffect(() => {
        if (!IsAllow("/sincronizacion-especifica-coleccion")) {
            props.history.push('/home');
        }
        cargarListaEspecifica();
        let intervalo = setInterval(cargarListaEspecifica, 30000);

        return () => {
            clearInterval(intervalo);
        }
        // eslint-disable-next-line
    }, []);

    return (
        <div className="container-fluid">
            <Card>
                <CardHeader>
                    Sincronización especifica colección
                </CardHeader>
                <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <Dropdown
                            style={{ width: '50%' }}
                            placeholder="Seleccione empresa"
                            search
                            selection
                            onChange={(e, { value }) => {
                                setEmpresa(value);
                            }}
                            options={EMPRESAS_ASIGNADAS.map(empresa => {
                                return { key: empresa.EmpresaId, value: empresa.EmpresaId, text: empresa.EmpresaId }
                            })}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                        />
                        <input className="form-control form-control-lg" style={{ width: "15%" }} placeholder="Codigo colección" type="text" onChange={(e => { setColeccion(e.target.value.toUpperCase()) })} />
                        <button type="button" className="btn btn-primary" onClick={enviarSincronizacionEspecifica}>Enviar</button>
                        <button type="button" className="btn btn-primary" onClick={cargarListaEspecifica}><CachedIcon /></button>
                    </div>
                </CardBody>
            </Card>
            <div style={{ marginTop: 30 }}>
                <SincronizacionTable listado={listaEspecifica} />
            </div>
        </div>
    )
}