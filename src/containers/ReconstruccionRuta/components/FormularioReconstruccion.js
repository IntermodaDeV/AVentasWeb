import React, { useState } from 'react';
import moment from 'moment';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
import MomentUtils from '@date-io/moment';
import { Dropdown } from "semantic-ui-react";
import { useSelector } from 'react-redux';

const FormularioReconstruccion = props => {
    const { asesoresFiltrados, filtroAsesoresPorPais, cargarRecorrido } = props;

    const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
    const [asesor, setAsesor] = useState('');
    const [inicio, setInicio] = useState(moment().format("YYYY-MM-DD"));
    const [final, setFinal] = useState(moment().format("YYYY-MM-DD"));
    const EMPRESAS_ASIGNADAS = useSelector(e => e.Permisos[0].EmpresasUsuarios);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleInicioChange = (date) => {
        setInicio(date);
    }

    const handleFinalChange = (date) => {
        setFinal(date);
    }

    const handleClickObtenerRecorrido = () => {
        let fechaInicio = `${selectedDate.format("YYYY-MM-DD")} ${moment(inicio).format("hh:mm a")}`;
        let fechaFinal = `${selectedDate.format("YYYY-MM-DD")} ${moment(final).format("hh:mm a")}`;
        cargarRecorrido(asesor, fechaInicio, fechaFinal);
    }

    return (
        <Grid container justify="space-around">
            <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
                <KeyboardDatePicker
                    disableToolbar
                    disableFuture
                    variant="inline"
                    format="YYYY-MM-DD"
                    margin="normal"
                    id="date-picker-inline"
                    label="Fecha"
                    value={selectedDate}
                    autoOk
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                />
                <KeyboardTimePicker
                    margin="normal"
                    label="Inicio"
                    onChange={handleInicioChange}
                    value={inicio}
                    KeyboardButtonProps={{
                        'aria-label': 'change time',
                    }}
                />
                <KeyboardTimePicker
                    margin="normal"
                    label="Final"
                    value={final}
                    onChange={handleFinalChange}
                    KeyboardButtonProps={{
                        'aria-label': 'change time',
                    }}
                />
            </MuiPickersUtilsProvider>
            <Dropdown
                style={{ width: '15%', height: '30px', marginTop: 15 }}
                placeholder="Seleccione asesor"
                search
                selection
                onChange={(e, { value }) => {
                    setAsesor(value);
                }}
                options={asesoresFiltrados.map(asesor => {
                    return { key: asesor.codigo, value: asesor.codigo, text: asesor.nombre }
                })}
                closeOnChange={true}
            />
            <Dropdown
                style={{ width: '10%', height: '15%', marginTop: 15 }}
                placeholder="Seleccione empresa"
                search
                selection
                onChange={(e, { value }) => {
                    filtroAsesoresPorPais(value);
                }}
                options={EMPRESAS_ASIGNADAS.map(empresa => {
                    return { key: empresa.EmpresaId, value: empresa.EmpresaId, text: empresa.EmpresaId }
                })}
                closeOnChange={true}

            />
            <button class="btn btn-primary" style={{ width: '10%', height: '30px', marginTop: 15 }} onClick={handleClickObtenerRecorrido}>Obtener Recorrido</button>
        </Grid>
    );
}

export default FormularioReconstruccion;