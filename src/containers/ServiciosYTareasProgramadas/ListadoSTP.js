import React, { useEffect, useState, useRef } from 'react';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Dialog from "@material-ui/core/Dialog";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import Button from "@material-ui/core/Button";
import axios from 'axios';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import { Grid, Typography } from '@material-ui/core';
import { APIURL } from 'utils/Enviroment';
import styles from 'containers/Agenda/Agenda.module.css';
import { Loading } from 'components/Global/Loading';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { FormControlLabel, Checkbox } from '@material-ui/core/';
import moment from 'moment';
import { DatePicker } from "@material-ui/pickers";


export const ListadoSTP = (props) => {
    const [showDialog, setShowDialog] = useState(false);
    const [incidencia, setIncidencia] = useState(null);
    const [servicios, setServicios] = useState([]);
    const [estadoNuevo, setEstadoNuevo] = useState(null);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const context = useRef();


    const [id, setId] = useState("");
    const [codigo, setCodigo] = useState("");
    const [tipoServicio, setTipoServicio] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [proximaEjecucionEnvio, setProximaEjecucionEnvio] = useState("");
    const [UltimaEjecucionEnvio, setUltimaEjecucionEnvio] = useState("");
    const [proximaEjecucionGenerarArchivo, setProximaEjecucionGenerarArchivo] = useState("");
    const [ultimaEjecucionGenerarArchivo, setUltimaEjecucionGenerarArchivo] = useState("");
    const [automatico, setAutomatico] = useState(false);
    const [activo, setActivo] = useState(false);
    const [reIniciar, setReIniciar] = useState(false);
    const [reIniciarGenerarcionArchivo, setReIniciarGenerarcionArchivo] = useState(false);
    const [numeroEjecucion, setNumeroEjecucion] = useState("");

    const [proximaEjecucionEnvioDisable, setProximaEjecucionEnvioDisable] = useState(true);
    const [proximaEjecucionGenerarArchivoDisable, setProximaEjecucionGenerarArchivoDisable] = useState(true);

    useEffect(() => {
        if (!IsAllow("/ServiciosTareas")) {
            props.history.push('/home');
        }
        obtenerEstados();
        obtenerServiciosYTareas();
    }, []);

    const cargarFormulario = (p) => {
        console.log(p);
        setId(p.Id);
        setCodigo(p.Codigo);
        setTipoServicio(p.TipoServicio);
        setDescripcion(p.Descripcion);
        setProximaEjecucionEnvio(p.ProximaEjecucionEnvio);
        setUltimaEjecucionEnvio(p.UltimaEjecucionEnvio);
        setProximaEjecucionGenerarArchivo(p.ProximaEjecucionGenerarArchivo);
        setUltimaEjecucionGenerarArchivo(p.UltimaEjecucionGenerarArchivo);
        setAutomatico(p.Automatico);
        setActivo(p.Activo);
        setReIniciar(p.ReIniciar);
        setReIniciarGenerarcionArchivo(p.ReIniciarGenerarcionArchivo);
        setNumeroEjecucion(p.NumeroEjecucion)
        setShowDialog(true)
        if (p.ReIniciar) {
            setProximaEjecucionEnvioDisable(false);
        }

        if (p.ReIniciarGenerarcionArchivo) {
            setProximaEjecucionGenerarArchivoDisable(false);
        }
    }

    const actualizarServicio = async () => {
        try {
            let data = {
                Id: id,
                ProximaEjecucionEnvio: proximaEjecucionEnvio,
                ProximaEjecucionGenerarArchivo: proximaEjecucionGenerarArchivo,
                ReIniciar: reIniciar,
                ReIniciarGenerarcionArchivo: reIniciarGenerarcionArchivo
            }

            console.log(data);

            await axios.put(`${APIURL}/api/update/ServiciosTareas`, data, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
            });

            obtenerServiciosYTareas();

            Swal.fire({
                title: 'Exito',
                text: "Servicio Modificado Correctamente",
                type: 'success',
                confirmButtonText: 'Ok',
                target: context.current
            });

        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err,
                type: 'error',
                confirmButtonText: 'Ok',
                target: context.current
            });
        }
    }
    const obtenerServiciosYTareas = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/getServiciosTareas/getSevicios`);
            setServicios(request.data);
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: "Error al obtener los estados:", err,
                type: 'error',
                confirmButtonText: 'Ok',
                target: context.current
            });
        }
    };

    const getMuiTheme = () => createMuiTheme({
        overrides: {
            MUIDataTable: {
                responsiveScrollMaxHeight: {
                    maxHeight: 'unset !important',
                }
            },
            MUIDataTableBodyRow: {
                root: {
                    '&:nth-child(odd)': {
                        backgroundColor: '#f8f8f8'
                    }
                }
            },
        }
    });

    const HeadersListaPedidos = [
        { label: "Codigo", name: "Codigo", options: { filter: true } },
        { label: "TipoServicio", name: "TipoServicio", options: { filter: true } },
        { label: "ProximaEjecucionEnvio", name: "ProximaEjecucionEnvio", options: { filter: true } },
        { label: "UltimaEjecucionEnvio", name: "UltimaEjecucionEnvio", options: { filter: true } },
        { label: "ProximaEjecucionGenerarArchivo", name: "ProximaEjecucionGenerarArchivo", options: { filter: true } },
        { label: "UltimaEjecucionGenerarArchivo", name: "UltimaEjecucionGenerarArchivo", options: { filter: true } },
        { label: "Automatico", name: "Automatico", options: { filter: true } },
        { label: "Activo", name: "Activo", options: { filter: true } },
        { label: "Numero de ejecucion", name: "NumeroEjecucion", options: { filter: true } },
        { label: "Acciones", name: "acciones", options: { filter: true } },
    ];

    const Data = () => {
        return servicios.map(p => (
            [
                p.Codigo,
                p.TipoServicio,
                moment(p.ProximaEjecucionEnvio).format("DD/MM/YYYY hh:mm a"),
                moment(p.UltimaEjecucionEnvio).format("DD/MM/YYYY hh:mm a"),
                moment(p.ProximaEjecucionGenerarArchivo).format("DD/MM/YYYY hh:mm a"),
                moment(p.UltimaEjecucionGenerarArchivo).format("DD/MM/YYYY hh:mm a"),
                p.Automatico.toString(),
                p.Activo.toString(),
                p.NumeroEjecucion,
                <div>
                    <Button className='my-1' variant="outlined" onClick={() => { cargarFormulario(p) }} size="small" color={"primary"}>Modificar</Button>
                </div>

            ]
        ));
    };

    const DatatableOptions = {
        filter: true,
        filterType: "dropdown",
        responsive: "standard",
        print: false,
        download: false,
        selectableRows: 'none',
        customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage) => (
            <TableFooter>
                <TableRow>
                    <TablePagination
                        count={count}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onChangePage={(_, page) => changePage(page)}
                        onChangeRowsPerPage={event => changeRowsPerPage(event.target.value)}
                        rowsPerPageOptions={[5, 10, 15]}
                        labelRowsPerPage="Filas por página:"
                    />
                </TableRow>
            </TableFooter>
        ),
        textLabels: {
            body: {
                noMatch: "No se han encontrado incidencias",
                toolTip: "Ordenar",
            },
            pagination: {
                next: "Siguiente",
                previous: "Anterior",
                rowsPerPage: "Filas por página:",
                displayRows: "de",
            },
            toolbar: {
                search: "Buscar",
                downloadCsv: "Descargar CSV",
                print: "Imprimir",
                viewColumns: "Ver Columnas",
                filterTable: "Filtrar Tabla",
            },
            filter: {
                all: "Todos",
                title: "Filtros",
                reset: "Quitar",
            },
            viewColumns: {
                title: "Mostrar Columnas",
                titleAria: "Mostrar/Esconder Columnas",
            },
            selectedRows: {
                text: "Fila(s) seleccionadas",
                delete: "Borrar",
                deleteAria: "Borrar Filas Seleccionadas",
            },
        },
    };

    return (
        <div className="px-3">
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Listado de reportes en visitas"}
                        data={Data()}
                        columns={HeadersListaPedidos}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>

            <Dialog
                open={showDialog}
                onClose={() => setShowDialog(false)}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    style: {
                        margin: 0,
                        maxHeight: '100%',
                        minHeight: '80vh',
                    },
                }}
            >
                <DialogTitle>Configuraciones Servicio</DialogTitle>
                <DialogContent dividers style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 210px)' }}>

                    {showDialog &&

                        <Grid container spacing={2} style={{ marginBottom: '20px' }}>
                            <Grid item xs={12}>
                                <Grid container spacing={2} style={{ marginBottom: '20px' }}>
                                    <Grid item xs={12} sm={12} md={4} >
                                        <Typography className={styles.BorderHeader}>
                                            Codigo
                                        </Typography>
                                        <TextField
                                            value={codigo}
                                            disabled
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4} >
                                        <Typography className={styles.BorderHeader}>
                                            TipoServicio
                                        </Typography>
                                        <TextField
                                            value={tipoServicio}
                                            disabled
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>
                                            Numero Ejecucion
                                        </Typography>
                                        <TextField
                                            value={numeroEjecucion}
                                            fullWidth
                                            multiline
                                            variant="outlined"

                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>
                                            Ultima Ejecucion Envio
                                        </Typography>
                                        <TextField
                                            value={moment(UltimaEjecucionEnvio).format("DD/MM/YYYY hh:mm a")}
                                            disabled
                                            fullWidth
                                            multiline
                                            variant="outlined"

                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>ReIntentar</Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={reIniciar}
                                                    name="UltimaEjecucionEnvioCheck"
                                                    color="primary"
                                                    onChange={() => { setReIniciar(!reIniciar); setProximaEjecucionEnvioDisable(!proximaEjecucionEnvioDisable) }}
                                                />
                                            }
                                            label="ReIniciar Envio"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>
                                            Proxima Ejecucion Envio
                                        </Typography>
                                        <DatePicker
                                            disableToolbar
                                            disabled={proximaEjecucionEnvioDisable}
                                            autoOk
                                            label={"-"}
                                            variant="inline"
                                            format={"DD/MM/YYYY HH:mm"}
                                            value={proximaEjecucionEnvio ? new Date(proximaEjecucionEnvio) : null}
                                            onChange={(date) => { //setProximaEjecucionEnvio(date)
                                                if (date) {
                                                    // Crear una nueva instancia de Date
                                                    const updatedDate = new Date(date);
                                                    // Establecer la hora a las 12:00 AM en la zona horaria local
                                                    updatedDate.setHours(0, 0, 0, 0);

                                                    // Convertir a formato ISO ajustado a UTC-6 (Honduras)
                                                    const utcDate = new Date(updatedDate.getTime() - (6 * 60 * 60 * 1000)); // Ajustar a UTC-6
                                                    const formattedDate = utcDate.toISOString().replace('Z', ''); // Quitar la 'Z' que indica UTC

                                                    // Guardar la fecha en el formato "2024-10-24T06:00:00"
                                                    setProximaEjecucionEnvio(formattedDate);
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>
                                            Ultima Ejecucion Generar Archivo
                                        </Typography>
                                        <TextField
                                            value={moment(ultimaEjecucionGenerarArchivo).format("DD/MM/YYYY hh:mm a")}
                                            disabled
                                            fullWidth
                                            multiline
                                            variant="outlined"

                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>ReIntentar</Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={reIniciarGenerarcionArchivo}
                                                    name="reIniciarGenerarcionArchivoCheck"
                                                    color="primary"
                                                    onChange={() => { setReIniciarGenerarcionArchivo(!reIniciarGenerarcionArchivo); setProximaEjecucionGenerarArchivoDisable(!proximaEjecucionGenerarArchivoDisable); }}
                                                />
                                            }
                                            label="ReIniciar Generarcion Archivo"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>
                                            Proxima Ejecucion Generar Archivo
                                        </Typography>
                                        <DatePicker
                                            disabled={proximaEjecucionGenerarArchivoDisable}
                                            disableToolbar
                                            autoOk
                                            label={"-"}
                                            variant="inline"
                                            format={"DD/MM/YYYY HH:mm"}
                                            value={proximaEjecucionGenerarArchivo ? new Date(proximaEjecucionGenerarArchivo) : null}
                                            onChange={(date) => {
                                                if (date) {
                                                    if (date) {
                                                        // Crear una nueva instancia de Date
                                                        const updatedDate = new Date(date);
                                                        // Establecer la hora a las 12:00 AM en la zona horaria local
                                                        updatedDate.setHours(0, 0, 0, 0);

                                                        // Convertir a formato ISO ajustado a UTC-6 (Honduras)
                                                        const utcDate = new Date(updatedDate.getTime() - (6 * 60 * 60 * 1000)); // Ajustar a UTC-6
                                                        const formattedDate = utcDate.toISOString().replace('Z', ''); // Quitar la 'Z' que indica UTC

                                                        // Guardar la fecha en el formato "2024-10-24T06:00:00"
                                                        setProximaEjecucionGenerarArchivo(formattedDate);
                                                    }
                                                }
                                            }}
                                        />
                                    </Grid>


                                    <Grid item xs={12} sm={12} md={12}>
                                        <Typography className={styles.BorderHeader}>
                                            Descripcion
                                        </Typography>
                                        <TextField
                                            value={descripcion}
                                            fullWidth
                                            multiline
                                            variant="outlined"

                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>Automático</Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    disabled
                                                    checked={automatico}
                                                    name="Automatico"
                                                    color="primary"
                                                />
                                            }
                                            label="Automático"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>Activo</Typography>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    disabled
                                                    checked={activo}
                                                    name="Automatico"
                                                    color="primary"
                                                />
                                            }
                                            label="Activo"
                                        />
                                    </Grid>

                                </Grid>
                            </Grid>
                        </Grid>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { actualizarServicio(); setShowDialog(!showDialog); }} color="primary">
                        Guardar
                    </Button>
                    <Button onClick={() => { setShowDialog(!showDialog) }} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>


        </div>
    );
};
