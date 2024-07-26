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
import { Grid, Typography, Select, MenuItem } from '@material-ui/core';
import { APIURL } from 'utils/Enviroment';
import moment from "moment";
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import styles from 'containers/Agenda/Agenda.module.css';
import { Loading } from 'components/Global/Loading';
import notFound from 'assets/nodisponible.png';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { DatePicker } from "@material-ui/pickers";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Dropdown } from "semantic-ui-react";
import { useSelector } from 'react-redux';


export const ListadoReportesVisita = () => {
    const [incidencias, setIncidencias] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [incidenciaDetalle, setIncidenciaDetalle] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [incidencia, setIncidencia] = useState(null);
    const [estados, setEstados] = useState([]);
    const [estadosCombo, setEstadosCombo] = useState([]);
    const [showModalCmabiarEstado, setCambiarEstado] = useState(false);
    const [estadoNuevo, setEstadoNuevo] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [title, setTitle] = useState("");
    const context = useRef();
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30));
    const [fechaFin, setFechaFin] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const [asesores, setAsesores] = useState([]);
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const [estadoSelect, setEstadoSelected] = useState(null);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);

    useEffect(() => {
        obtenerEstados();
        asesoresData();
    }, [fechaInicio, fechaFin]);


    const estadoFuntion = (e) => {
        const selectedEstado = estados.find(estado => estado.Id == (e.idEstado + 1));
        setEstadoNuevo(selectedEstado);
    };

    const asesoresData = () => {
        AsesoresUsuario.map((Ase) => {
            let Valores = { key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }
            asesores.push(Valores);
        })
    }

    const actualizarEstado = async () => {
        try {
            let data = {
                Id: incidencia.id,
                IdEstado: estadoNuevo.Id
            }

            await axios.put(`${APIURL}/api/incidencia/actualizarIncidencia`, data);
            ObtenerlistadoIncidencias();
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

    const EliminarImagenes = async () => {
        setOpen(true);
        setTitle("Eliminado Imagenes");
        try {

            await axios.delete(`${APIURL}/api/incidencia/eliminarImagenes`);
            setOpen(false);
        } catch (err) {
            setOpen(false);
            Swal.fire({
                title: 'Error',
                text: "Error al eliminar las imagenes: ", err,
                type: 'error',
                confirmButtonText: 'Ok',
                target: context.current
            });
        }
    }

    const obtenerDetalleDevolucion = async (inc) => {
        try {
            setIncidencia(inc);
            console.log(incidencia);
            const request = await axios.get(`${APIURL}/api/incidencia/obtenerIncidenciaDetalle/${inc.id}`);

            if (request.data.length <= 0) {
                setSelectedImage(notFound);
            } else {
                setIncidenciaDetalle(request.data);
                setSelectedImage(request.data[0].fotografia || notFound);
            }
            setShowDialog(true);
        } catch (err) {
            console.error("Error al obtener el detalle de la incidencia:", err);
            Swal.fire({
                title: 'Error',
                text: "Error al obtener el detalle de la incidencia:", err,
                type: 'error',
                confirmButtonText: 'Ok',
                target: context.current
            });
        }
    };

    const resetIncidenciaSeleccionada = () => {
        setIncidenciaDetalle([]);
        setSelectedImage(null);
    }

    const obtenerEstados = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/incidencia/obtenerEstadosIncidencia`);
            setEstados(request.data);

            let defaultValue = { key: 0, value: 0, text: "Todos" }
            estadosCombo.push(defaultValue);

            request.data.map((e) => {
                let Valores = { key: e.Id, value: e.Id, text: e.Estado }
                estadosCombo.push(Valores);
            });
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

    const ObtenerlistadoIncidencias = async () => {

        if(AsesorSelected == null){
            Swal.fire({
                title: 'Error',
                text: "Seleccione un asesor ",
                type: 'error',
                confirmButtonText: 'Ok',
                target: context.current
            });
            return false;
        }

        if(estadoSelect == null){
            Swal.fire({
                title: 'Error',
                text: "Seleccione un estado ",
                type: 'error',
                confirmButtonText: 'Ok',
                target: context.current
            });
            return false;
        }

        setOpen(true);
        setTitle("Cargando Reportes");
        try {

            var Inicio = moment(fechaInicio).format("YYYY-MM-DD");
            var Fin = moment(fechaFin).add(1, 'days').format("YYYY-MM-DD");
            console.log(`${APIURL}/api/incidencia/obtenerIncidencias/${Inicio}/${Fin}`)
            const request = await axios.get(`${APIURL}/api/incidencia/obtenerIncidencias/${Inicio}/${Fin}/${AsesorSelected}/${estadoSelect}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            setIncidencias(request.data);
            setOpen(false);
        } catch (err) {            
            Swal.fire({
                title: 'Error',
                text: "Error al obtener el listado de reporte en visita: ", err,
                type: 'error',
                confirmButtonText: 'Ok',
                target: context.current
            });
            setOpen(false);
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
        { label: "Cliente", name: "Cliente", options: { filter: true } },
        { label: "Asesor", name: "Asesor", options: { filter: true } },
        { label: "Observacion", name: "Observacion", options: { filter: true } },

        {
            label: "Estado", name: "Estado", options: {
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const color = tableMeta.rowData[7];

                    return (
                        <div style={{
                            backgroundColor: color || '#FFFFFF',
                            color: '#000000',
                            padding: '5px',
                            borderRadius: '5px',
                            textAlign: 'center'
                        }}>
                            {value}
                        </div>
                    );
                }
            }
        },
        { label: "Tipo Incidencia", name: "TipoIncidencia", options: { filter: true } },
        { label: "Fecha", name: "Fecha", options: { filter: true } },
        { label: "Acciones", name: "acciones", options: { filter: true } },
        {
            label: "Color", name: "Color", options: {
                filter: true,
                display: false
            }
        }
    ];

    const Data = () => {
        return incidencias.map(p => (
            [
                p.cliente,
                p.asesor,
                p.observacion,
                p.estado,
                p.tipoIncidencia,
                moment(p.fecha).format("DD/MM/YYYY hh:mm a"),
                <div>
                    {p.idEstado == 1 &&
                        <Button className='my-1' variant="outlined" onClick={() => { estadoFuntion(p); setCambiarEstado(true); setIncidencia(p) }} size="small" color={"primary"}>En Proceso</Button>
                    }

                    {p.idEstado == 2 &&
                        <Button className='my-1' variant="outlined" onClick={() => { estadoFuntion(p); setCambiarEstado(true); setIncidencia(p) }} size="small" color={"primary"}>Completar</Button>
                    }

                    <Button className='my-1' variant="outlined" onClick={() => obtenerDetalleDevolucion(p)} size="small" color={"primary"}>Ver Detalle</Button>

                </div>,
                p.color
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

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const textFieldStyle = {
        marginTop: 8,
        borderColor: '#2196F3',
        borderWidth: '2px',
        borderRadius: '5px',
        padding: '8px',
        backgroundColor: '#FFFFFF',
    };

    const inputLabelStyle = {
        color: '#2196F3',
        fontWeight: 'bold'
    };

    const inputPropsStyle = {
        color: '#000000',
        fontWeight: 'bold'
    };

    const imgStyle = {
        transition: 'transform 0.25s ease',
    };

    const imgHoverStyle = {
        transform: 'scale(1.5)',
        zIndex: 10,
    };

    const handleFechaInicio = (fecha) => {
        setFechaInicio(fecha);

        var fech = moment(fecha).add(30, 'days')
        setFechaFin(fech);
    }

    const handleFechaFin = (date) => {
        //var date = moment(fecha).toDate();
        setFechaFin(date);
    }

    const exportToExcel = (data, filename) => {

        setOpen(true);
        setTitle("Generando Excel");

        const fieldsToRemove = ['$id', 'color', 'id', 'idEstado'];
        console.log(data);
        const transformedData = data.map(item => {
            // Eliminar los campos no deseados
            const filteredItem = Object.keys(item).reduce((acc, key) => {
                if (!fieldsToRemove.includes(key)) {
                    acc[key] = item[key];
                }
                return acc;
            }, {});

            // Distribuir las URLs de las fotos en columnas separadas
            const photos = item.fotos.reduce((acc, foto, index) => {
                acc[`foto_${index + 1}`] = foto;
                return acc;
            }, {});

            return {
                ...filteredItem,
                ...photos
            };
        });

        const ws = XLSX.utils.json_to_sheet(transformedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Incidencias");

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, `${filename}.xlsx`);
        setOpen(false);
    };


    const handleExportFiltered = () => {
        exportToExcel(incidencias, "Incidencias_Filtradas");
    };

    return (
        <div className="px-3">
            <div className="row mb-3">
                <div className='col-lg-2 col-sm-4 col-12'>
                    <DatePicker
                        disableToolbar
                        autoOk
                        label={"Fecha Inicio"}
                        variant="inline"
                        format={"DD/MM/YYYY"}
                        value={fechaInicio}
                        onChange={(date) => handleFechaInicio(date)}
                    />

                </div>
                <div className='col-lg-2 col-sm-4 col-12'>
                    <DatePicker
                        disableToolbar
                        autoOk
                        minDate={fechaInicio}
                        maxDate={moment(fechaInicio).add(365, 'days')}
                        label={"Fecha Fin"}
                        variant="inline"
                        format={"DD/MM/YYYY"}
                        value={fechaFin}
                        onChange={(date) => handleFechaFin(date)}
                    />
                </div>

                <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                    <Dropdown
                        placeholder="Asesor"
                        selection
                        style={{ zIndex: 999 }}
                        onChange={(e, { value }) => setAsesorSelected(value)}
                        options={asesores}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                    //value={AsesorSelected}
                    />
                </div>

                <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                    <Dropdown
                        placeholder="Estados"
                        selection
                        style={{ zIndex: 999 }}
                        onChange={(e, { value }) => setEstadoSelected(value)}
                        options={estadosCombo}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                    //value={AsesorSelected}
                    />                   
                </div>

                <div className="col-lg-2 col-sm-4 col-6" style={{ paddingTop: 10 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => { ObtenerlistadoIncidencias() }}>Obtener
                    </Button>
                </div>
                <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                    <button onClick={() => { setOpenDelete(true) }} className={`btn btn-info`} >Limpiar Imagenes </button>
                </div>
                <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                    <button onClick={() => {handleExportFiltered(); }} className={`btn btn-info`} >Exportar Excel </button>
                </div>

                            
            </div>
            <Loading open={open} title={title} />
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

            {/* Modal para mostrar detalles del reporte */}
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
                <DialogTitle>Detalles del reporte</DialogTitle>
                <DialogContent dividers style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 210px)' }}>

                    {showDialog &&

                        <Grid container spacing={2} style={{ marginBottom: '20px' }}>
                            <Grid item xs={12}>
                                <Grid container spacing={2} style={{ marginBottom: '20px' }}>
                                    <Grid item xs={12} sm={12} md={4} >
                                        <Typography className={styles.BorderHeader}>
                                            Cliente
                                        </Typography>
                                        <TextField
                                            value={incidencia.cliente}
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                            disabled
                                            style={textFieldStyle}
                                            InputLabelProps={{ style: inputLabelStyle }}
                                            InputProps={{ style: inputPropsStyle }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4} >
                                        <Typography className={styles.BorderHeader}>
                                            Asesor
                                        </Typography>
                                        <TextField
                                            value={incidencia.asesor}
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                            disabled
                                            style={textFieldStyle}
                                            InputLabelProps={{ style: inputLabelStyle }}
                                            InputProps={{ style: inputPropsStyle }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>
                                            Estado
                                        </Typography>
                                        <TextField
                                            value={incidencia.estado}
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                            disabled
                                            style={textFieldStyle}
                                            InputLabelProps={{ style: inputLabelStyle }}
                                            InputProps={{ style: inputPropsStyle }}

                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>
                                            Tipo
                                        </Typography>
                                        <TextField
                                            value={incidencia.tipoIncidencia}
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                            disabled
                                            style={textFieldStyle}
                                            InputLabelProps={{ style: inputLabelStyle }}
                                            InputProps={{ style: inputPropsStyle }}

                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={4}>
                                        <Typography className={styles.BorderHeader}>
                                            Fecha
                                        </Typography>
                                        <TextField
                                            value={moment(incidencia.fecha).format("DD/MM/YYYY hh:mm a")}
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                            disabled
                                            style={textFieldStyle}
                                            InputLabelProps={{ style: inputLabelStyle }}
                                            InputProps={{ style: inputPropsStyle }}

                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={8}>
                                        <Typography className={styles.BorderHeader}>
                                            Observación
                                        </Typography>
                                        <TextField
                                            value={incidencia.observacion}
                                            fullWidth
                                            multiline
                                            variant="outlined"
                                            disabled
                                            style={textFieldStyle}
                                            InputLabelProps={{ style: inputLabelStyle }}
                                            InputProps={{ style: inputPropsStyle }}
                                        />

                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                {/* Imagen principal con lupa */}
                                {selectedImage && (
                                    <div style={{ position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
                                        <img
                                            src={selectedImage}
                                            alt="Imagen principal"
                                            style={{ ...imgStyle, ...(isZoomed && imgHoverStyle), maxWidth: '50%', height: 'auto', borderRadius: '10px', cursor: 'zoom-in' }}
                                            onMouseEnter={() => setIsZoomed(true)}
                                            onMouseLeave={() => setIsZoomed(false)}
                                            onClick={() => handleImageClick(selectedImage)}
                                            onError={(e) => {
                                                e.target.onerror = null; // Evita bucles infinitos
                                                e.target.src = notFound; // Cambia la fuente a la imagen local
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Miniaturas */}
                                {incidenciaDetalle.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', overflowX: 'auto' }}>
                                        {incidenciaDetalle.map((detalle, index) => (
                                            <div key={index} style={{ cursor: 'pointer' }} onClick={() => setSelectedImage(detalle.fotografia)}>
                                                <img
                                                    src={detalle.fotografia}
                                                    alt={`Miniatura ${index + 1}`}
                                                    style={{ width: '100px', height: 'auto', borderRadius: '5px', border: selectedImage === detalle.fotografia ? '2px solid blue' : '2px solid transparent' }}
                                                    onError={(e) => {
                                                        e.target.onerror = null; // Evita bucles infinitos
                                                        e.target.src = notFound; // Cambia la fuente a la imagen local
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Grid>
                        </Grid>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setShowDialog(false); resetIncidenciaSeleccionada(); }} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Cambiar estado */}
            {showModalCmabiarEstado &&
                <Dialog
                    scroll={'paper'}
                    open={showModalCmabiarEstado}
                    className={styles.AtenderContainer}
                    onClose={() => setCambiarEstado(false)}
                    aria-labelledby="No-Atendido-Modal">
                    <DialogTitle
                        className="text-center"
                        id="scroll-dialog-title">
                        <div
                            style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif', padding: 2 }}>
                            Cambiar Estado
                        </div>
                    </DialogTitle>
                    <DialogContent >
                        Se cambiara el estado a <b> {estadoNuevo.Estado}</b>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => setCambiarEstado(false)} color="primary">
                            Cancelar
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            className={"py-1"}
                            style={{ height: '35px' }}
                            onClick={() => { actualizarEstado(); setCambiarEstado(false) }}
                        >
                            Aceptar
                        </Button>
                    </DialogActions>
                </Dialog>
            }
            <Dialog
                scroll={'paper'}
                open={openDelete}
                className={styles.AtenderContainer}
                onClose={() => setOpenDelete(false)}
                aria-labelledby="No-Atendido-Modal">
                <DialogTitle
                    className="text-center"
                    id="scroll-dialog-title">
                    <div
                        style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif', padding: 2 }}>
                        Eliminar Imagenes
                    </div>
                </DialogTitle>
                <DialogContent >
                    Se eliminaran las imagenes con 30 días depues de ser completada la incidencia
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setOpenDelete(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        className={"py-1"}
                        style={{ height: '35px' }}
                        onClick={() => { setOpenDelete(false); EliminarImagenes(); }}
                    >
                        Aceptar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
