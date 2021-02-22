import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { DatePicker } from "@material-ui/pickers";
import { Dropdown } from "semantic-ui-react";
import axios from 'axios';
import Button from "@material-ui/core/Button";
import moment from "moment";

import { TablaResueltas } from 'components/Encuestas/EncuestasResueltas/TablaResueltas';
import { APIURL } from 'utils/Enviroment';

export const EncuestasResueltas = props => {
    const [fechaInicio, setFechaInicio] = useState(new Date());
    const [fechaFin, setFechaFin] = useState(new Date());
    const [encuestasResueltas, setEncuestasResueltas] = useState([]);
    const [checked, setChecked] = useState(false);
    const [asesorSelected, setAsesorSelected] = useState(null);

    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);

    const cargarEncuestasResueltas = async (inicio, final) => {
        try {
            const request = await axios.get(`${APIURL}/api/encuesta/resueltas/${inicio}/${final}/${asesorSelected}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setEncuestasResueltas(request.data);
        } catch (err) {

        }
    }

    const cargarEncuestasResueltasTodos = async (inicio, final) => {
        try {
            const request = await axios.get(`${APIURL}/api/encuesta/resueltas/${inicio}/${final}/todos`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setEncuestasResueltas(request.data);
        } catch (err) {

        }
    }

    const cargarEncuestas = (inicio, final) => {
        let inicioFecha = moment(inicio).format("YYYY-MM-DD");
        let finalFecha = moment(final).format("YYYY-MM-DD");

        if (checked) {
            cargarEncuestasResueltasTodos(inicioFecha, finalFecha);
        } else {
            cargarEncuestasResueltas(inicioFecha, finalFecha);
        }
    }

    const detalleEncuesta = (encuestaId, cliente, asesor) => {
        props.history.push({ pathname: '/encuesta/detalle', state: { encuestaId, cliente, asesor } })
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
                <div class="mt-3 form-check">
                    <input type="checkbox" class="form-check-input" id="exampleCheck1" checked={checked} onClick={() => { setChecked(!checked) }} />
                    <label class="form-check-label" for="exampleCheck1">Todos los asesores asignados</label>
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