import React, { useState, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { APIURL } from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { mostrarAlerta } from 'utils/common';
import { Loading } from 'components/Global/Loading';
import { useSelector } from 'react-redux';
import moment from "moment";
import axios from 'axios';
import xlsx from 'xlsx';

const CargarInventario = (props) => {
    const { showDialog, setDialog, productosCargados, asesor, fecha } = props;
    const [initialData, setInitialData] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const clienteSelected = useSelector(e => e.ClienteInventario);
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
        let inventario = xlsx.utils.sheet_to_row_object_array(data.Sheets[primeraPagina]);

        return inventario.map(x => (
            {
                CodBarra: x.CodBarra,
                error: false
            }
        ));
    }

    const validarInformacion = data => {
        return data.map(x => {
            if (x.CodBarra === undefined || x.CodBarra === "") {
                x.error = true;
            }
            return x;
        });
    }


    const handleUpload = (event) => {
        let file = event.target.files[0];
        if (file !== undefined && file !== null) {
            const extension = file.name.split('.')[1];
            if (extension !== "xlsx" && extension !== "xls" && extension !== "csv") {
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
                    setInitialData(informacionValidada);
                })
                .catch((error) => console.error(error));
        }
    };

    const save = async () => {
        setIsDisabled(true);
        setLoading(true);
        let existenVacios = initialData.some(x => x.error);
        if (existenVacios) {
            Swal.fire({
                title: 'Advertencia',
                text: "Se encontraron lineas del excel con errores.",
                type: 'warning',
                confirmButtonText: 'Ok',
                target: context.current
            });
            return;
        }
        try {
            var fechaInv = moment(fecha).format("YYYY-MM-DD");
            const res = await axios.post(`${APIURL}/api/inventario/cargar/${asesor}/${clienteSelected.Codigo}/${fechaInv}`,
                JSON.stringify(initialData),
                {
                    headers: {
                        "Content-type": "application/json",
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                }
            );

            if (res.status === 200) {
                closeDialog();
                productosCargados(res.data);
                setIsDisabled(false);
                setLoading(false);
                Swal.fire({
                    title: 'Confirmado',
                    text: "El archivo fue cargado con éxito.",
                    type: 'success',
                    confirmButtonText: 'Ok',
                    target: context.current
                }).then(e => {
                })

            }

            if (res.status === 400) {
                closeDialog();
                setIsDisabled(false);
                setLoading(false);
                Swal.fire({
                    title: 'Error',
                    text: "El archivo no se pudo cargar.",
                    type: 'error',
                    confirmButtonText: 'Ok',
                    target: context.current
                }).then(e => {
                })
            }
        }
        catch (err) {
            let mensaje = "No se pudo obtener los registros.";
            let error = "FCPI04";

            if (err.response.data) {
                mensaje = err.response.data.Message;
                error = err.response.data.ErrorCode;
            }
            mostrarAlerta("Error " + error, mensaje, "error");
        }
    };

    const closeDialog = () => {
        setInitialData([]);
        setDialog(false)
    }

    return (
        <div>
            <Loading open={loading} title="Cargando" />
            <Dialog
                open={showDialog}
                onClose={closeDialog}
            >
                <DialogTitle id="scroll-dialog-title">
                    <h2>Cargar inventario</h2>
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
                            <TablaAsignaciones inventario={initialData} />
                            <br />
                            <Button
                                onClick={save}
                                color="primary"
                                variant="outlined"
                                disabled={isDisabled}
                            >
                                Cargar inventario
                            </Button>
                        </div>
                    }

                </DialogContent>
            </Dialog>
        </div>
    )
}

const TablaAsignaciones = props => {
    const style = { textAlign: 'center' }
    return (
        <table className="table">
            <thead>
                <tr>
                    <th>#</th>
                    <th style={style}>Cod.Barra</th>
                </tr>
            </thead>
            <tbody>
                {props.inventario.map((x, i) => (
                    <tr key={i} style={{ background: (x.error) ? "tomato" : "" }}>
                        <td>{i + 1}</td>
                        <td style={style}>{x.CodBarra}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default CargarInventario;