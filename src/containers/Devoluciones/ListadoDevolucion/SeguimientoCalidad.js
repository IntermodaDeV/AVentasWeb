import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import MUIDataTable from "mui-datatables";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { DatePicker } from "@material-ui/pickers";
import { Dropdown } from "semantic-ui-react";
import moment from "moment";
import { useSelector } from 'react-redux';
import 'moment/locale/es';
import Dialog from "@material-ui/core/Dialog";
import PrintOutlined from '@material-ui/icons/PrintOutlined';
import { FaFileExcel } from "react-icons/fa";
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { useHistory } from 'react-router';

import { APIURL } from 'utils/Enviroment';
import { Loading } from 'components/Global/Loading';
import { IsAllow } from 'components/Seguridad/Permisos';
import { ImprimirTrackingDevolucionCalidad } from 'components/Devoluciones/ImprimirTrackingDevolucionCalidad';

export const SeguimientoCalidad = props => {
    const history = useHistory();
    const [state, setState] = useState({
        error: false,
        isLoaded: false,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        devoluciones: [],
        clientes: [],
        devolucion: null,
        Detalles: [],
    });

    // eslint-disable-next-line
    const [loading, setLoading] = useState(false);
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30));
    const [fechaFin, setFechaFin] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const [estado, setEstado] = useState(0);
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const [todos, setTodos] = useState(false);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);
    const [devolucion, setDevolucion] = useState(null);
    const [detalleDevolucion, setDetalleDevolucion] = useState([]);
    const [showDialog, setShowDialog] = useState(false);

    const cargarDevoluvionesAprobadas = async (fechainicio, fechafin) => {
        try {
            setState({ ...state, isLoaded: true });
            let Inicio = moment(fechainicio).format("YYYY-MM-DD");
            let Fin = moment(fechafin).format("YYYY-MM-DD");
            let Asesor = AsesorSelected == null ? AsesoresUsuario[0].Usuario : AsesorSelected;
            let ruta = todos ? `${APIURL}/api/trackingDevolucionCalidad/obtenerDevolucionesAprobadas/${Inicio}/${Fin}/${estado}` : `${APIURL}/api/trackingDevolucionCalidad/obtenerDevolucionesAprobadas/${Inicio}/${Fin}/${estado}/${Asesor}`;
            const request = await axios.get(ruta, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } }).catch(function (err) {

                setState({
                    ...state,
                    isLoaded: true,
                    devoluciones: []
                });

                let mensaje = "Ha ocurrido un error verifique su conexion a internet.";

                if (err.response) {
                    mensaje = err.response.data.Message;
                }

                Swal.fire({
                    title: 'Advertencia',
                    text: mensaje,
                    type: 'warning',
                    confirmButtonText: 'Ok'
                });
            });

            setState({
                ...state,
                isLoaded: true,
                devoluciones: request.data
            });
        } catch (err) {

        }
    }

    const hidePrint = () => {
        setShowDialog(false);
    }

    const handleFechaInicio = (fecha) => {
        setFechaInicio(fecha);
    }

    const handleFechaFin = (date) => {
        setFechaFin(date);
    }

    const DataDevoluciones = () => {
        let DataDevoluciones = [];
        state.devoluciones.map(devolucion => {
            let data = [
                devolucion.NumDevolucion,
                devolucion.PedidoDevolucion,
                devolucion.NumeroRMA,
                devolucion.CodigoCliente,
                devolucion.NombreCliente,
                devolucion.motivoDevolucion,
                devolucion.Usuario,
                moment(devolucion.FechaCreacion).format('DD/MM/YYYY') !== "Invalid date" ? moment(devolucion.FechaCreacion).format('DD/MM/YYYY') : "",
                devolucion.TotalUnidades,
                devolucion.SubTotal,
                devolucion.Estado,
                devolucion.EstadoBodega === 0 ? <span style={{ color: '#FA2016' }}> <strong> Rechazado </strong></span> :
                    devolucion.EstadoBodega === 1 ? <span style={{ color: '#2977F2' }}><strong>Recepcionado </strong></span> :
                        devolucion.EstadoBodega === 2 ? <span style={{ color: '#14DE19' }}><strong>Transferido a bodega</strong></span> :
                            <span style={{ color: 'black' }}><strong>-</strong></span>,
                <div>
                    <span className="mr-1">
                        {
                            (devolucion.Aprobado === true) &&
                            <Button className='my-1' variant="outlined" onClick={() => actualizarEstadoDevoluvion(devolucion.NumDevolucion, 0)} size="small" color={"primary"}>Rechazado</Button>
                        }
                        {
                            (devolucion.Aprobado === true) &&
                            <Button className='my-1' variant="outlined" onClick={() => actualizarEstadoDevoluvion(devolucion.NumDevolucion, 1)} size="small" color={"primary"}>Recepcionado</Button>
                        }
                        {
                            (devolucion.Aprobado === true) &&
                            <Button className='my-1' variant="outlined" onClick={() => actualizarEstadoDevoluvion(devolucion.NumDevolucion, 2)} size="small" color={"primary"}>Transferido a bodega</Button>
                        }
                    </span>

                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" size="small" onClick={() => { obtenerDetalleDevolucion(devolucion) }} color={"primary"}>
                            <PrintOutlined />
                        </Button>
                    </span >
                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" size="large" onClick={() => { obtenerReporteDevolucionTracking(devolucion.NumDevolucion) }} color={"primary"}>
                            <FaFileExcel />
                        </Button>
                    </span >
                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" size="large" onClick={() => { history.push({ pathname: "/devolucion-clasificacion", state: devolucion.NumDevolucion }); }} color={"primary"}>
                            Clasificación
                        </Button>
                    </span >
                </div>
            ]
            DataDevoluciones.push(data);
            return false;
        });
        return DataDevoluciones;
    }

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
    })

    const cancelarReinicio = e => {
        if (e.which === 116) {
            e.preventDefault();
        }
    }

    const actualizarEstadoDevoluvion = (NumDevolucion, newEstadoBodega) => {
        const nEstado = (newEstadoBodega === 0) ? "Rechazado" : (newEstadoBodega === 1) ? "Recepcionado" : "Transferido a bodega";
        Swal.fire({
            title: 'Aviso',
            text: `¿Se cambiara el estado la devolucion ${NumDevolucion} a ${nEstado}?`,
            type: 'warning',
            width: '600px',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.value) {
                cambiarEstado(NumDevolucion, newEstadoBodega);
            }
        })
    }

    const cambiarEstado = async (NumDevolucion, newEstadoBodega) => {
        try {
            await axios.put(`${APIURL}/api/trackingDevolucionCalidad/actualizarEstadoDevolucion/${NumDevolucion}/${newEstadoBodega}`, {}, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            cargarDevoluvionesAprobadas(fechaInicio, fechaFin);
            Swal.fire({
                title: 'Confirmado',
                text: 'Se cambio el estado exitosamente.',
                type: 'success',
            })
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se pudo actualizar el estado de la devolución.";

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


    const obtenerDetalleDevolucion = async (devoluvion) => {
        try {
            const request = await axios.get(`${APIURL}/api/trackingDevolucionCalidad/obtenerDetalleDevolucion/${devoluvion.NumDevolucion}`);
            setDevolucion(devoluvion);
            setDetalleDevolucion(request.data);
            setShowDialog(true);
        } catch (err) {

        }
    }


    const obtenerReporteDevolucionTracking = async (NumDevolucion) => {
        try {
            const request = await axios.get(`${APIURL}/api/trackingDevolucionCalidad/reporte/${NumDevolucion}`);
            const data = convertirData(request.data);
            guardarExcel(data, NumDevolucion);
        } catch (err) {

        }
    }

    const convertirData = (data) => {
        return data.map((el) => {
            const { $id, ...NumDevolucion } = el;

            return {
                ...NumDevolucion
            }
        })
    }

    const guardarExcel = (csvData, NumDevolucion) => {
        const fileName = `Productos Devolucion Tracking Calidad ${NumDevolucion}`;
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    }


    useEffect(() => {
        if (!IsAllow("/seguimientoCalidad")) {
            props.history.push('/home');
        }
        setAsesorSelected(AsesoresUsuario[0].Usuario);

        window.addEventListener('keydown', cancelarReinicio);
        return () => {
            window.removeEventListener('keydown', cancelarReinicio);
        }
        // eslint-disable-next-line
    }, [])


    return (
        <div className="px-3">
            <Loading title="Sincronizando Devoluviones Aprobadas" open={loading} />
            <h1 style={{ textAlign: 'center' }}>Seguimiento de Calidad</h1>
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
                        placeholder="Estado"
                        selection
                        style={{ zIndex: 999 }}
                        onChange={(e, { value }) => {
                            setEstado(value);
                        }}
                        options={[
                            { key: 0, value: 0, text: "Rechazado" },
                            { key: 1, value: 1, text: "Recepcionado" },
                            { key: 2, value: 2, text: "Transferido a bodega" },
                            { key: 3, value: 3, text: "Pendiente de Aprobación Ventas" },
                            { key: 4, value: 4, text: "Aprobadas" },
                            { key: 5, value: 5, text: "Todos" },
                        ]}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        value={estado}
                    />
                </div>
                <div className='col-lg-2 my-lg-0 col-6 my-1' style={{ paddingTop: 10 }}>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" checked={todos} onClick={() => { setTodos((prev) => (!prev)) }} />
                        <label class="form-check-label" for="flexCheckDefault">
                            Todos los asesores
                        </label>
                    </div>
                </div>
                <div className='col-lg-2 my-lg-0 col-6 my-1' style={{ paddingTop: 10 }}>
                    <Dropdown
                        disabled={todos}
                        placeholder="Asesor"
                        selection
                        style={{ zIndex: 999 }}
                        onChange={(e, { value }) => setAsesorSelected(value)}
                        options={AsesoresUsuario.map((Ase) => ({ key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }))}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        value={AsesorSelected}
                    />
                </div>
                <div className="col-lg-2 col-sm-4 col-6" style={{ paddingTop: 10 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => { cargarDevoluvionesAprobadas(fechaInicio, fechaFin) }}>Obtener
                    </Button>
                </div>
            </div>
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Listado Devoluviones"}
                        data={DataDevoluciones()}
                        columns={HeadersListaDevoluviones}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>
            <Dialog
                open={showDialog}
                onClose={() => hidePrint()}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
            >
                {
                    devolucion && detalleDevolucion &&
                    <ImprimirTrackingDevolucionCalidad
                        hidePrint={hidePrint}
                        Pedido={devolucion}
                        gruposXDetPed={detalleDevolucion}
                    />
                }
            </Dialog >
        </div>
    );
}

const HeadersListaDevoluviones = [
    "Num. Devolucion",
    "Pedido Devolucion",
    "Num. RMA",
    "Codigo Cliente",
    "Nombre CLiente",
    "Motivo Devolucion",
    "Asesor",
    "Fecha",
    "Total Unidades",
    "Subtotal",
    "Estado AX",
    "Seguimiento Calidad",
    {
        label: "Acciones",
        options: {
            filter: false,
            sort: false,
        }
    },
];

const DatatableOptions = {
    filterType: "dropdown",
    responsive: "scrollMaxHeight",
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
                    rowsPerPageOptions={[15, 50, 100]}
                    ActionsComponent={CustomFooter}
                    labelRowsPerPage="Filas por página:"
                />
            </TableRow>
        </TableFooter>
    ),
    textLabels: {
        body: {
            noMatch: "No se han encontrado devoluciones",
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
    }
};
