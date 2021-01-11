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
import { DatePicker } from "@material-ui/pickers";

export const SincronizacionColeccionEspecifica = props => {
    const [empresa, setEmpresa] = useState("IMHN");
    const [coleccion, setColeccion] = useState('');
    const [listaEspecifica, setListaEspecifica] = useState([]);
    const [checked, setChecked] = useState(false);
    const [forzar, setForzar] = useState(false);
    const [fechaSelected, setFechaSelected] = useState(new Date());
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
            const data = { IdGestor: GESTOR_ESPECIFICO, EmpresaId: empresa, ColeccionId: coleccion, Usuario: localStorage.getItem('codigo'),Forzar:forzar?"1":"0" };
            await axios.post(`${APIURL}/api/SincronizacionEspecifico/Coleccion/upload`, data);
            cargarListaEspecifica();
        } catch (err) {
            console.log(err);
            let mensaje = "Error al procesar solicitud.";


            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'OK',
            });
        }
    }

    const cargarListaEspecifica = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/SincronizacionEspecifico/${localStorage.getItem('codigo')}`);
            setListaEspecifica(request.data);
        } catch (err) {

        }
    }

    const enviarSincronizacionEspecificaEmpresas = async () => {
        for (let pais of EMPRESAS_ASIGNADAS) {
            try {
                const data = { IdGestor: GESTOR_ESPECIFICO, EmpresaId: pais.EmpresaId, ColeccionId: coleccion, Usuario: localStorage.getItem('codigo'),Forzar:forzar?"1":"0" };
                await axios.post(`${APIURL}/api/SincronizacionEspecifico/Coleccion/upload`, data);
                cargarListaEspecifica();
            } catch (err) {

            }
        }
    }
    const verificarColeccion = async () => {
        try {
            const data = await axios.get(`${APIURL}/api/SincronizacionEspecifico/verificar/${empresa}/${coleccion}`);
            let EsValida = data.data.CodigoPaquete !== null ? true : false;
            if (!EsValida) {
                return mostrarAdvertencia("Paquete Incorrecto", "El código del paquete no existe, favor verifique", "warning");
            }

            if (checked) {
                enviarSincronizacionEspecificaEmpresas();
            } else {
                enviarSincronizacionEspecifica();
            }
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se pudo verificar el paquete.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok'
            });
        }
    }
    const enviarSincronizacion = () => {
        if (checked === true && coleccion === "") {
            mostrarAdvertencia("Información necesaria", "Ingrese el codigo de colección.", "warning");
        } else if (checked === false && (empresa === "" || coleccion === "")) {
            mostrarAdvertencia("Información necesaria", "Seleccione pais o ingrese el codigo de colección.", "warning");
        } else {
            Swal.fire({
                title: 'Confirmar',
                text: `¿Está seguro de sincronizar el paquete ${coleccion}?`,
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#06bf53',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí',
                cancelButtonText: 'No',
            }).then((result) => {
                if (result.value) {
                    verificarColeccion();
                }
            })
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
                    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <DatePicker
                            disableToolbar
                            autoOk
                            label={"Fecha"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            //disablePast
                            value={fechaSelected}
                            maxDate={new Date()}
                            minDate={new Date().setDate(new Date().getDate() - 14)}
                            onChange={(date) => setFechaSelected(date)}
                        />
                        <div class="mt-3 form-check">
                            <input type="checkbox" class="form-check-input" id="exampleCheck1" checked={checked} onClick={() => { setChecked(!checked) }} />
                            <label class="form-check-label" for="exampleCheck1">Todas las empresas asignadas</label>
                        </div>
                        <Dropdown
                            style={{ width: '15%' }}
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
                            disabled={checked}
                        />
                        <div class="mt-3 form-check">
                            <input type="checkbox" class="form-check-input" id="exampleCheck2" checked={forzar} onClick={() => { setForzar(!forzar) }} />
                            <label class="form-check-label" for="exampleCheck2">Sincronización forzosa</label>
                        </div>
                        <input className="form-control form-control-lg" style={{ width: "15%" }} placeholder="Codigo colección" type="text" onChange={(e => { setColeccion(e.target.value.toUpperCase()) })} />
                        <button type="button" className="btn btn-primary" onClick={enviarSincronizacion}>Enviar</button>
                        <button type="button" className="btn btn-primary" onClick={cargarListaEspecifica}><CachedIcon /></button>
                    </div>
                </CardBody>
            </Card>
            <div style={{ marginTop: 30 }}>
                <SincronizacionTable listado={listaEspecifica} fecha={fechaSelected} Recargar={cargarListaEspecifica} />
            </div>
        </div>
    )
}