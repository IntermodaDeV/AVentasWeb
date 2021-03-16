import React, { useState, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { APIURL } from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import moment from "moment";
import xlsx from 'xlsx';

const CargarAsignaciones = (props) => {
    const { showDialog, setDialog } = props;
    const [initialData, setInitialData] = useState([]);
    const context = useRef();

    const readFile = file => {
        let reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = e => {
                let data = e.target.result;
                let readedData = xlsx.read(data, { type: 'binary', cellDates: true });

                if (readedData) {
                    resolve(readedData);
                } else {
                    reject("No se pudo leer el archivo");
                }
            }
            reader.readAsBinaryString(file);
        });
    }

    const convertirData = data => {
        let primeraPagina = data.SheetNames[0];
        let asignaciones = xlsx.utils.sheet_to_row_object_array(data.Sheets[primeraPagina]);

        return asignaciones.map(x => (
            {
                CodigoAsesor: x.CodigoAsesor,
                CodigoCliente: x.CodigoCliente,
                Empresa: x.Empresa,
                FechaAsignacion: x.FechaAsignacion,
                HoraFinal: x.HoraFinal,
                HoraInicio: x.HoraInicio,
                idPrioridad: x.idPrioridad,
                error: false
            }
        ));
    }

    const validarInformacion = data => {
        return data.map(x => {
            if (x.CodigoAsesor === undefined || x.CodigoAsesor === "") {
                x.error = true;
            }

            if (x.CodigoCliente === undefined || x.CodigoCliente === "") {
                x.error = true;
            }

            if (x.Empresa === undefined || x.Empresa === "") {
                x.error = true;
            }

            if (x.FechaAsignacion === undefined || x.FechaAsignacion === "") {
                x.error = true;
            }

            if (x.HoraFinal === undefined || x.HoraFinal === "") {
                x.error = true;
            }

            if (x.HoraInicio === undefined || x.HoraInicio === "") {
                x.error = true;
            }

            if (x.idPrioridad === undefined || x.idPrioridad === "") {
                x.error = true;
            }
            return x;

        });
    }

    const convertirFechaHora = data => {
        return data.map(x => {
            if (x.FechaAsignacion instanceof Date) {
                x.FechaAsignacion = moment(x.FechaAsignacion).format("DD/MM/YYYY");
            } else {
                x.FechaAsignacion = "";
            }

            if (x.HoraFinal instanceof Date) {
                x.HoraFinal = moment(x.HoraFinal).format("hh:mm a");
            } else {
                x.HoraFinal = "";
            }

            if (x.HoraInicio instanceof Date) {
                x.HoraInicio = moment(x.HoraInicio).format("hh:mm a");
            } else {
                x.HoraInicio = "";
            }

            return x;

        })
    }

    const handleUpload = (event) => {
        let file = event.target.files[0];

        if (file !== undefined && file !== null) {

            const extension = file.name.split('.')[1];

            if (extension !== "xlsx" && extension !== "xls") {
                Swal.fire({
                    title: 'Error',
                    text: "El formato del archivo no es permitido",
                    type: 'error',
                    confirmButtonText: 'Ok',
                    target: context.current
                });
                setInitialData([]);
                return;
            }

            readFile(file)
                .then((readedData) => {
                    let dataConvertida = convertirData(readedData);
                    let informacionValidada = validarInformacion(dataConvertida);
                    let horaFecha = convertirFechaHora(informacionValidada);
                    setInitialData(horaFecha);
                })
                .catch((error) => console.error(error));
        }
    };

    const save = () => {
        let existenVacios = initialData.some(x => x.error);
        if (existenVacios) {
            Swal.fire({
                title: 'Advertencia',
                text: "Se encontraron asignaciones con errores.",
                type: 'warning',
                confirmButtonText: 'Ok',
                target: context.current
            });

            return;
        }

        fetch(`${APIURL}/api/asignaciones/cargar`, {
            headers: {
                "Content-type": "application/json",
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            method: "POST",
            body: JSON.stringify(initialData)
        }).then(res => {
            if (res.status === 200) {
                res.json()
                    .then(resultado => {
                        Swal.fire({
                            title: 'Confirmado',
                            text: resultado.Message,
                            type: 'success',
                            confirmButtonText: 'Ok',
                            target: context.current
                        }).then(e => {
                            closeDialog();
                        })
                    });


            }

            if (res.status === 400) {
                res.json()
                    .then(resultado => {
                        if (resultado.Message.includes("El cliente no existe o no esta asignado al asesor. En asignacion")) {
                            let arreglo = Array.from(resultado.Message);
                            let indice = parseInt(arreglo[arreglo.length - 1]) - 1;
                            let copiaAsignaciones = initialData;
                            copiaAsignaciones[indice].error = true;
                            setInitialData((prev) => ([...copiaAsignaciones]));
                        }

                        if (resultado.Message.includes("Una o más asignaciones no se pueden crear ya que pertenecen a una fecha anterior.")) {
                            let arreglo = Array.from(resultado.Message);
                            let indice = parseInt(arreglo[arreglo.length - 1]) - 1;
                            let copiaAsignaciones = initialData;
                            copiaAsignaciones[indice].error = true;
                            setInitialData((prev) => ([...copiaAsignaciones]));
                        }

                        if (resultado.Message.includes("Una o más asignaciones tienen conflicto de horario para el cliente")) {
                            let arreglo = Array.from(resultado.Message);
                            let indice = parseInt(arreglo[7]) - 1;
                            let copiaAsignaciones = initialData;
                            copiaAsignaciones[indice].error = true;
                            setInitialData((prev) => ([...copiaAsignaciones]));
                        }

                        Swal.fire({
                            title: 'Error',
                            text: resultado.Message,
                            type: 'error',
                            confirmButtonText: 'Ok',
                            target: context.current
                        })
                    });
            }
        })

    };

    const closeDialog = () => {
        setInitialData([]);
        setDialog(false)
    }

    return (
        <Dialog
            open={showDialog}
            onClose={closeDialog}
        >
            <DialogTitle id="scroll-dialog-title">
                <h2>Cargar asignaciones</h2>
            </DialogTitle>
            <DialogContent>
                <div ref={context}></div>
                <input
                    type='file'
                    accept='.xlsx,.xls'
                    onChange={handleUpload}

                />
                {(initialData.length === 0)
                    ? <div style={{ width: "100%", height: "400px" }}></div>
                    : <div>
                        <TablaAsignaciones asignaciones={initialData} />
                        <br />
                        <Button
                            onClick={save}
                            color="primary"
                            variant="outlined"
                        >
                            Cargar agenda
                    </Button>
                    </div>
                }

            </DialogContent>
        </Dialog>
    )
}

const TablaAsignaciones = props => {

    const style = { textAlign: 'center' }

    return (
        <table className="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Codigo Asesor</th>
                    <th>Codigo Cliente</th>
                    <th>Empresa</th>
                    <th>Fecha Asignación</th>
                    <th>Hora Inicio</th>
                    <th>Hora Final</th>
                    <th>Prioridad</th>
                </tr>
            </thead>
            <tbody>
                {props.asignaciones.map((x, i) => (
                    <tr key={i} style={{ background: (x.error) ? "tomato" : "" }}>
                        <td>{i + 2}</td>
                        <td style={style}>{x.CodigoAsesor}</td>
                        <td style={style}>{x.CodigoCliente}</td>
                        <td style={style}>{x.Empresa}</td>
                        <td style={style}>{x.FechaAsignacion}</td>
                        <td style={style}>{x.HoraInicio}</td>
                        <td style={style}>{x.HoraFinal}</td>
                        <td style={style}>{x.idPrioridad}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default CargarAsignaciones;