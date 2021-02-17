import React, { useEffect, useState } from 'react';
import Button from "@material-ui/core/Button";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { DatePicker } from "@material-ui/pickers";
import MUIDataTable from "mui-datatables";
import { Dropdown } from "semantic-ui-react";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import moment from "moment";
import axios from 'axios';
import 'moment/locale/es';

import DetalleRecibo from 'components/ListadoRecibos/DetalleRecibo';
import { Loading } from 'components/Global/Loading';
import { APIURL } from 'utils/Enviroment';

export const ListaRecibosFlotante = props => {
    const [recibos, setRecibos] = useState([]);
    const [recibo, setRecibo] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));
    const [estado, setEstado] = useState(0);

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

    const cargarRecibosFlotantes = async (fechainicio, fechafinal) => {
        try {
            let Inicio = moment(fechainicio).format("YYYY-MM-DD");
            let Fin = moment(fechafinal).format("YYYY-MM-DD");
            const request = await axios.get(`${APIURL}/api/Recibo/flotante/${Inicio}/${Fin}/${estado}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setRecibos(request.data);
        } catch (err) {

        }
    }



    const handleFechaInicio = (fecha) => {
        let date = moment(fecha).toDate();

        let fech = moment(fecha).toDate();
        fech.setMonth(date.getMonth() + 1);

        setStartDate(date);
        setEndDate(fech);
    }

    const handleFechaFin = (fecha) => {
        let date = moment(fecha).toDate();

        const diffTime = new Date(date) - new Date(startDate);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            setEndDate(date);
        }
        else {
            let fech = new Date();
            fech.setDate(startDate.getDate() + 6);
            setEndDate(fech);
        }
    }

    const RegresarListaRecibos = () => {
        setRecibo(null);
    }

    const cambiarRecibo = (recibo) => {
        setRecibo(recibo);
    }

    const cancelarReciboFlotante = async (id) => {
        try {
            await axios.post(`${APIURL}/api/recibo/flotante/cancelar/${id}`, {}, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            cargarRecibosFlotantes(startDate, endDate);
            Swal.fire({
                title: 'Confirmado',
                text: 'Recibo cancelado con exito.',
                type: 'success',
            })
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se pudo cancelar el recibo.";

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

    const sincronizarReciboFlotante = async (id) => {
        try {
            setLoading(true);
            await axios.post(`${APIURL}/api/recibo/flotante/sincronizar/${id}`, {}, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } });
            setLoading(false);
            cargarRecibosFlotantes(startDate, endDate);
            Swal.fire({
                title: 'Confirmado',
                text: 'Recibo aprobado con exito.',
                type: 'success',
            })
        } catch (err) {
            let mensaje = "Ha ocurrido un error y no se pudo aprobar el recibo.";

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

    const peticionCancelarRecibo = (id, correlativo) => {
        Swal.fire({
            title: 'Aviso',
            text: `¿Esta seguro de cancelar el recibo flotante ${correlativo}?`,
            type: 'warning',
            width: '600px',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                cancelarReciboFlotante(id);
            }
        })
    }

    const peticionSincronizarRecibo = (id, correlativo) => {
        Swal.fire({
            title: 'Aviso',
            text: `¿Esta seguro de aprobar el recibo flotante ${correlativo}?`,
            type: 'warning',
            width: '600px',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                sincronizarReciboFlotante(id);
            }
        })
    }

    const DataRecibos = () => {
        let DataRecibos = [];

        recibos.forEach(recib => {
            let fechaIni = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            let fechaFin = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            fechaFin.setDate(fechaFin.getDate() + 1);

            if (moment(fechaIni) < moment(recib.Fecha) && moment(recib.Fecha) < moment(fechaFin)) {
                let data =
                {
                    NumeroRecibo: recib.NumeroRecibo,
                    CodigoCliente: recib.CodigoCliente,
                    Fecha: moment(recib.Fecha).format('DD/MM/YYYY') !== "Invalid date" ? moment(recib.Fecha).format('DD/MM/YYYY') : "",
                    IdTipoPago: recib.TipoPago.Descripcion,
                    Valor: recib.Valor,
                    IdMoneda: recib.IdMoneda,
                    CodigoAsesor: recib.CodigoAsesor,
                    Acciones:
                        <div>
                            <span className="mr-1">
                                <Button className='my-1' variant="outlined" onClick={() => cambiarRecibo(recib)} size="small" color={"primary"}>Detalle</Button>
                            </span>
                            {recib.Estado === 0 && <>
                                <span className="ml-1">
                                    <Button className='my-1' variant="outlined" size="small" color={"primary"} onClick={() => { peticionSincronizarRecibo(recib.Id, recib.NumeroRecibo) }}>
                                        Aprobar
                                </Button>
                                </span >
                                <span className="ml-1">
                                    <Button className='my-1' variant="outlined" size="small" color={"primary"} onClick={() => { peticionCancelarRecibo(recib.Id, recib.NumeroRecibo) }}>
                                        Cancelar
                                </Button>
                                </span >
                            </>}
                        </div>
                }

                DataRecibos.push(data);
            }
        });
        return DataRecibos;
    }

    useEffect(() => {
        cargarRecibosFlotantes("1900-01-01", "1900-01-01");

        //eslint-disable-next-line
    }, [])

    if (recibo != null) {
        return (
            <DetalleRecibo
                recibo={recibo}
                RegresarListaRecibos={RegresarListaRecibos}
            />
        )
    }

    return (
        <div>
            <Loading open={isLoading} title={"Sincronizando Recibo"} />
            <h1 style={{ textAlign: 'center' }}>Recibos flotante</h1>
            <div className="px-3">
                <div className="row mb-3">
                    <div className='col-lg-2 my-lg-0 col-6 my-1'>
                        <DatePicker
                            disableToolbar
                            autoOk
                            label={"Fecha Inicio"}
                            variant="inline"
                            format={"DD/MM/YYYY"}
                            value={startDate}
                            onChange={(date) => handleFechaInicio(date)}
                        />

                    </div>
                    <div className='col-lg-2 my-lg-0 col-6 my-1'>
                        <DatePicker
                            disableToolbar
                            autoOk
                            label={"Fecha Fin"}
                            variant="inline"
                            minDate={props.startDate}
                            format={"DD/MM/YYYY"}
                            value={endDate}
                            onChange={(date) => handleFechaFin(date)}
                        />
                    </div>
                    <div className='col-lg-2 my-lg-0 col-6 my-1' style={{ paddingTop: 10 }}>
                        <Dropdown
                            placeholder="Estado"
                            selection
                            style={{ zIndex: 999 }}
                            onChange={(e, { value }) => setEstado(value)}
                            options={[
                                { key: 0, value: 0, text: "Pendientes" },
                                { key: 1, value: 1, text: "Aprobados" },
                                { key: 2, value: 2, text: "Cancelados" }
                            ]}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            value={estado}
                        />
                    </div>
                    <div className="col-lg-1 col-sm-2 col-4" style={{ paddingTop: 10 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => cargarRecibosFlotantes(startDate, endDate)}
                        >Obtener
                    </Button>
                    </div>
                </div>
                <div>
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Listado Recibos"}
                            data={DataRecibos()}
                            columns={HeadersListaRecibos}
                            options={DatatableOptions}
                        />
                    </MuiThemeProvider>
                </div>
            </div>
        </div>
    )
}

const HeadersListaRecibos = [
    {
        name: "NumeroRecibo",
        label: "Numero Recibo",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Fecha",
        label: "Fecha",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "CodigoCliente",
        label: "Codigo Cliente",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "IdTipoPago",
        label: "TipoPago",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Valor",
        label: "Valor",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "IdMoneda",
        label: "Moneda",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "CodigoAsesor",
        label: "Codigo Asesor",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Acciones",
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
                    rowsPerPageOptions={[10, 15, 100]}
                    ActionsComponent={CustomFooter}
                    labelRowsPerPage="Filas por página:"
                />
            </TableRow>
        </TableFooter>
    ),
    textLabels: {
        body: {
            noMatch: "No se han encontrado recibos",
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