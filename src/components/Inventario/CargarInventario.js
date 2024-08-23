import React, { useState, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { APIURL } from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Loading } from 'components/Global/Loading';
import { useSelector, useDispatch } from 'react-redux';
import moment from "moment";
import axios from 'axios';
import xlsx from 'xlsx';

const CargarInventario = (props) => {
    const { showDialog, setDialog, productosCargados } = props;
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
            const res = await axios.post(`${APIURL}/api/inventario/cargar/${clienteSelected.EmpresaId}`,
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
                setLoading(false);
                Swal.fire({
                    title: 'Confirmado',
                    text: res.Message,
                    type: 'success',
                    confirmButtonText: 'Ok',
                    target: context.current
                }).then(e => {
                })

            }

            if (res.status === 400) {
                setIsDisabled(false);
                let inventario = [...new Set(res.Lista)];
                let copiaAsignaciones = initialData;

                for (let asignacion of inventario) {
                    copiaAsignaciones[asignacion].error = true;
                }

                Swal.fire({
                    title: 'Error',
                    text: res.Message,
                    type: 'error',
                    confirmButtonText: 'Ok',
                    target: context.current
                })

                res.json()
                    .then(resultado => {
                        Swal.fire({
                            title: 'Error',
                            text: resultado.Message,
                            type: 'error',
                            confirmButtonText: 'Ok',
                            target: context.current
                        })
                    });
            }
        }
        catch (error) {
            console.log(error);
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
                        <td>{i + 2}</td>
                        <td style={style}>{x.CodBarra}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default CargarInventario;