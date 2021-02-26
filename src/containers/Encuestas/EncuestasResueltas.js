import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DatePicker } from "@material-ui/pickers";
import { Dropdown } from "semantic-ui-react";
import axios from 'axios';
import Button from "@material-ui/core/Button";
import moment from "moment";
import { TablaResueltas } from 'components/Encuestas/EncuestasResueltas/TablaResueltas';
import { APIURL } from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';

export const EncuestasResueltas = props => {
    const dispatch = useDispatch();
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario)
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7));
    const [fechaFin, setFechaFin] = useState(new Date());
    const [encuestasResueltas, setEncuestasResueltas] = useState([]);
    //const [checked, setChecked] = useState(false);
    const [asesorSelected, setAsesorSelected] = useState(AsesoresUsuario[0].Usuario);

    useEffect(() => {
        setAsesorSelected(AsesoresUsuario[0].Usuario);
        let inicioFecha = moment(fechaInicio).format("YYYY-MM-DD");
        let finalFecha = moment(fechaFin).add(1, 'day').format("YYYY-MM-DD");
        cargarEncuestasResueltas(inicioFecha,finalFecha);
        // eslint-disable-next-line
    }, []);
    const cargarEncuestasResueltas = async (inicio, final) => {
        try {
            const request = await axios.get(`${APIURL}/api/encuesta/resueltas/${inicio}/${final}/${asesorSelected}`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setEncuestasResueltas(request.data);
        } catch (err) {

        }
    }


    const cargarEncuestas = (inicio, final) => {
        let inicioFecha = moment(inicio).format("YYYY-MM-DD");
        let finalFecha = moment(fechaFin).add(1, 'day').format("YYYY-MM-DD");

        /*if (checked) {
            cargarEncuestasResueltasTodos(inicioFecha, finalFecha);
        } else {*/
            cargarEncuestasResueltas(inicioFecha, finalFecha);
        //}
    }

    const cargarFormulario = async (encuestaId) => {
        try {
            const request = await axios.get(`${APIURL}/api/EncuestaSelected/${encuestaId}/${localStorage.getItem("codigo")}`);
            if (request.data.length > 0) {
                dispatch({ type: 'SET_ENCUESTASELECTED', payload: request.data })
                props.history.push("/Encuesta/Resueltas/Formulario");
            }
            else {
                Swal.fire({
                    title: 'Encuesta vacia',
                    text: '¡La encuesta no tiene contenido, no puede acceder!',
                    type: 'warning',
                    confirmButtonText: 'Ok',
                });
            }
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }

    const cargarRespuestas = async (respuestaId) => {
        try {
            const request = await axios.get(`${APIURL}/api/encuesta/resueltas/detalle/${respuestaId}`);
            dispatch({ type: 'SET_RESPUESTADETALLE', payload: request.data })
            console.log(request.data)
        } catch (err) {
            console.log("Ha ocurrido un error", err.response)
        }
    }
    const detalleEncuesta = (encuestaId, respuestaId) => {
        cargarRespuestas(respuestaId)
        cargarFormulario(encuestaId)
    }

    return (
            <div>
                <div className="row mb-3">
                    <div className='col-lg-2 my-lg-0 col-6 my-1'>
                        <DatePicker
                            disableToolbar
                            autoOk
                            label={"Fecha Inicio"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            value={fechaInicio}
                            onChange={(date) => setFechaInicio(date)}
                        />

                    </div>
                    <div className='col-lg-2 my-lg-0 col-6 my-1'>
                        <DatePicker
                            disableToolbar
                            autoOk
                            label={"Fecha Fin"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            value={fechaFin}
                            onChange={(date) => setFechaFin(date)}
                        />
                    </div>
                    <div className='col-lg-2 my-lg-0 col-6 my-1' style={{ paddingTop: 10 }}>
                        <Dropdown
                            placeholder="Asesor"
                            selection
                            style={{ zIndex: 999 }}
                            onChange={(e, { value }) => setAsesorSelected(value)}
                            options={AsesoresUsuario.map((Ase) => ({ key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }))}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            value={asesorSelected}
                        />
                    </div>
                    <div className="col-lg-1 col-sm-2 col-4" style={{ paddingTop: 10 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => cargarEncuestas(fechaInicio, fechaFin)}
                        >
                            Obtener
                    </Button>
                    </div>
                </div>
                <TablaResueltas encuestasResueltas={encuestasResueltas} detalleEncuesta={detalleEncuesta} />
            </div>
    )
}