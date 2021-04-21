import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DatePicker } from "@material-ui/pickers";
import axios from 'axios';
import moment from 'moment';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { APIURL } from 'utils/Enviroment';

export const RangoFecha = props => {
    const [inicio, setInicio] = useState(new Date());
    const [final, setFinal] = useState(new Date());

    const convertirArreglo = data => {
        let resueltas = [];
        for (let encuesta of data) {
            let nuevo = {
                EncuestaId: encuesta.EncuestaId,
                Cliente: encuesta.Cliente,
                Fecha: encuesta.Fecha,
                Asesor: encuesta.Asesor
            }

            for (let detalle of encuesta.Detalle) {
                let respuestas = Object.keys(detalle);
                let preguntaRepetida = Object.keys(nuevo);

                if (preguntaRepetida.includes(detalle[respuestas[1]])) {
                    nuevo[detalle[respuestas[1]]] = nuevo[detalle[respuestas[1]]] + "," + detalle[respuestas[2]];
                } else {
                    nuevo[detalle[respuestas[1]]] = detalle[respuestas[2]];
                }
            }

            resueltas.push(nuevo);
        }

        return resueltas
    }

    const guardarExcel = csvData => {
        const fileName = "Pruebas";
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    const cargarData = async () => {
        try {
            let fechaInicio = moment(inicio).format("YYYY-MM-DD");
            let fechaFinal = moment(final).format("YYYY-MM-DD");
            const request = await axios.get(`${APIURL}/api/encuesta/excel/${fechaInicio}/${fechaFinal}/${props.encuestaId}`);

            if (request.data.length === 0) {
                alert("No hay registros");
                return;
            }

            const transformada = convertirArreglo(request.data);
            guardarExcel(transformada);
        } catch (err) {
            alert("Ha ocurrido un error y no se pudo obtener las encuestas.");
        }
    }

    return (
        <>
            <Dialog
                scroll={'paper'}
                open={props.open}
                onClose={() => { props.abrirRango(0) }}
            >
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Generar Excel
                    </div>
                </DialogTitle>
                <DialogContent>

                    <div className="d-flex flex-grow-1 align-items-center justify-content-between">

                        <DatePicker
                            disableToolbar
                            autoOk
                            label={"Fecha Inicio"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            value={inicio}
                            onChange={(date) => setInicio(date)}
                        />
                        <DatePicker
                            disableToolbar
                            autoOk
                            label={"Fecha Fin"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            value={final}
                            onChange={(date) => setFinal(date)}
                        />
                        <button className="btn btn-success" onClick={cargarData}>Generar Excel</button>
                    </div>
                </DialogContent>
            </Dialog>
        </>)
}