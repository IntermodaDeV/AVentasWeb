import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown } from "semantic-ui-react";
import axios from 'axios';
import {
    Card,
    CardBody,
    CardHeader,
} from 'reactstrap';
import Swal from 'sweetalert2/dist/sweetalert2.js';

import { APIURL } from 'utils/Enviroment';
import { TablaPaqueteBodega } from './components/TablaPaqueteBodega';
import { IsAllow } from 'components/Seguridad/Permisos';

export const PaqueteBodega = props => {
    const [almacenes, setAlmacenes] = useState([]);
    const [sitios, setSitios] = useState([]);
    const [colecciones, setColecciones] = useState([]);
    const [coleccionesCopia, setColeccionesCopia] = useState([]);
    const [sitiosCopia, setSitiosCopia] = useState([]);
    const [almacenesCopia, setAlmacenesCopia] = useState([]);
    const [coleccion, setColeccion] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [almacen, setAlmacen] = useState('');
    const [sitio, setSitio] = useState('');
    const [paquetes, setPaquetes] = useState([]);

    const empresas = useSelector(e => e.Empresas);

    const cargarColecciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/colecciones/bodega`);
            setColecciones(request.data);
        } catch (err) {

        }
    }

    const cargarPaquetes = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/bodega/paquetes`);
            setPaquetes(request.data);
        } catch (err) {

        }
    }

    const cargarAlmacenes = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/bodega/almacen`);
            setAlmacenes(request.data);
        } catch (err) {

        }
    }

    const cargarSitios = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/bodega/sitio`);
            setSitios(request.data);
        } catch (err) {

        }
    }

    const cambiarEstado = async (id) => {
        try {
            await axios.post(`${APIURL}/api/bodega/modificar/${id}/${localStorage.getItem('codigo')}`);
            Swal.fire({
                title: '¡Modificado con exito!',
                text: "Se ha cambiado el estado del paquete con exito.",
                type: 'success',
                confirmButtonText: 'OK',
            });

            cargarPaquetes();
        } catch (err) {
            Swal.fire({
                title: 'Ocurrio un error',
                text: "No se pudo cambiar el estado del paquete",
                type: 'error',
                confirmButtonText: 'OK',
            });
        }
    }

    const crearBodegaEspecifico = async () => {
        if (coleccion !== '' && empresa !== '' && sitio !== '' && almacen !== '') {
            const data = {
                coleccion, empresa, sitio, almacen, usuario: localStorage.getItem('codigo')
            }
            await axios.post(`${APIURL}/api/bodega`, data);
            Swal.fire({
                title: '¡Creado con exito!',
                text: "Se ha creado el paquete para bodega especifico",
                type: 'success',
                confirmButtonText: 'OK',
            });
        } else {
            Swal.fire({
                title: 'Campos requeridos',
                text: "Todos los campos son obligatorios",
                type: 'error',
                confirmButtonText: 'OK',
            });
        }
    }

    const seleccionarEmpresa = empresa => {
        let sitioFiltrados = sitios.filter(x => x.Empresa === empresa);
        let coleccionesFiltrado = colecciones.filter(x => x.Empresa === empresa);
        setEmpresa(empresa);
        setSitio('');
        setAlmacen('');
        setColeccion('');
        setSitiosCopia((prev) => ([...sitioFiltrados]));
        setColeccionesCopia((prev) => ([...coleccionesFiltrado]));
    }

    const seleccionarSitio = sitio => {
        let almacenesFiltrados = almacenes.filter(x => x.SitioId === sitio);
        setSitio(sitio);
        setAlmacenesCopia((prev) => ([...almacenesFiltrados]));
    }

    useEffect(() => {
        if (!IsAllow("/configuracion-paquete-bodega")) {
            props.history.push('/home');
        }
        cargarColecciones();
        cargarAlmacenes();
        cargarSitios();
        cargarPaquetes();

        // eslint-disable-next-line
    }, []);

    return (
        <div className="container-fluid">
            <Card>
                <CardHeader>
                    Paquete bodega especifica
                </CardHeader>
                <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <Dropdown
                            style={{ width: "5%", zIndex: 999 }}
                            placeholder="Seleccione empresa"
                            search
                            selection
                            value={empresa}
                            onChange={(e, { value }) => { seleccionarEmpresa(value) }}
                            options={empresas.map(empresa => {
                                return { key: empresa.COMPANY_CODE, value: empresa.COMPANY_CODE, text: empresa.COMPANY_CODE }
                            })}
                            noResultsMessage={"No hay resultados"}
                        />
                        <Dropdown
                            style={{ width: "5%", zIndex: 999 }}
                            placeholder="Seleccione coleccion"
                            search
                            selection
                            value={coleccion}
                            onChange={(e, { value }) => { setColeccion(value) }}
                            options={coleccionesCopia.map((coleccion, index) => {
                                return { key: index, value: coleccion.Codigo, text: coleccion.Codigo }
                            })}
                            noResultsMessage={"No hay resultados"}
                        />
                        <Dropdown
                            style={{ width: "5%", zIndex: 999 }}
                            placeholder="Seleccione sitio"
                            search
                            selection
                            value={sitio}
                            onChange={(e, { value }) => { seleccionarSitio(value) }}
                            options={sitiosCopia.map(sitio => {
                                return { key: sitio.Id, value: sitio.Id, text: sitio.Nombre }
                            })}
                            noResultsMessage={"No hay resultados"}
                        />
                        <Dropdown
                            style={{ width: "5%", zIndex: 999 }}
                            placeholder="Seleccione almacen"
                            search
                            selection
                            value={almacen}
                            onChange={(e, { value }) => { setAlmacen(value) }}
                            options={almacenesCopia.map(almacen => {
                                return { key: almacen.Id, value: almacen.Almacen, text: almacen.Nombre }
                            })}
                            noResultsMessage={"No hay resultados"}
                        />
                        <button onClick={crearBodegaEspecifico} className="btn btn-primary">Agregar</button>
                    </div>
                </CardBody>
            </Card>
            <br />
            <TablaPaqueteBodega paquetes={paquetes} cambiarEstado={cambiarEstado} />
        </div>
    )
}