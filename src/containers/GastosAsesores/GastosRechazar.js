import React, { useState, useEffect, useRef } from 'react';
import moment from "moment";
import 'moment/locale/es';
import { APIURL } from 'utils/Enviroment';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import axios from 'axios';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Button } from "@material-ui/core";
import MUIDataTable from "mui-datatables";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog from "@material-ui/core/Dialog";
import TextField from '@material-ui/core/TextField';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import DetalleGasto from 'components/GastoAsesores/DetalloGasto/DetalleGasto'
import { IsAllow } from 'components/Seguridad/Permisos';
import { DatePicker } from "@material-ui/pickers";

moment.locale('es');

const GastosRechazar = (props) => {
    const [gastos, setGastos] = useState([]);
    const [showModalCancelar, setshowModalCancelar] = useState(false);
    const [IdRechazado, setIdRechazado] = useState("");
    const [detalle, setDetalle] = useState(false);
    const [detalleGasto, setDetalleGasto] = useState([])
    const [idDetalle, setIdDetalle] = useState(null);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const [buttonsEnabled, setButtonsEnabled] = useState(false);

    const context = useRef();

    useEffect(() => {
        if (!IsAllow('/GiraAsesores/GastosRechazar')) {
            props.history.push('/home');
        }
        cargarHistorialGastos()
    }, [])

    const handleFechaInicio = (fecha) => {

        var date = moment(fecha).toDate();

        var fech = moment(fecha).toDate();
        fech.setMonth(date.getMonth() + 1);

        setStartDate(date);
        setEndDate(fech);
    }

    const handleFechaFin = (fecha) => {
        var date = moment(fecha).toDate();

        const diffTime = new Date(date) - new Date(startDate);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            setEndDate(date);
        }
        else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
            });

            Toast.fire({
                type: 'error',
                title: 'Ingrese Fecha Válida',
            })
            var fech = new Date();
            fech.setDate(startDate.getDate() + 6);
            setEndDate(fech);
        }
    }

    const getGastoDetalle = async (id, detalle) => {
        setIdDetalle(id)
        setDetalleGasto(detalle)
        setDetalle(true)
    }

    const RegresarGastosPendientes = () => {
        setDetalle(false)
    }

    const validationSchema = yup.object().shape(
        {
            Observacion: yup.string().required('La observacion es obligatorio'),
        });

    const showModalCancelado = (id) => {
        console.log(id)
        setshowModalCancelar(true)
        setIdRechazado(id)
    }

    const cargarHistorialGastos = async () => {
        try {
            var Inicio = moment(startDate).format("YYYY-MM-DD");
            var Fin = moment(endDate).format("YYYY-MM-DD");
            const request = await axios.get(`${APIURL}/api/Gira/GastosAprobados/${localStorage.getItem("empresa")}/${Inicio}/${Fin}`);
            setGastos(request.data)
        } catch (err) {
            console.log(err)
        }
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

    const rechazarGasto = async (value) => {
        setButtonsEnabled(true)
        console.log('cancelando')
        const request = await axios.post(`${APIURL}/api/Gira/ActualizarEstadoGasto/${IdRechazado}/3/${value.Observacion}/${localStorage.getItem("codigo")}/-`)
        if (request.data === 1) {
            Swal.fire({
                title: 'Confirmado',
                text: "Gasto Rechazado Existosamente",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                cargarHistorialGastos();
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar el gasto',
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
        setshowModalCancelar(false)
        setButtonsEnabled(false)
    }


    const DataGastos = () => {
        let DataGastos = [];

        gastos.map(gasto => {
            console.log(gasto)
            let data = [
                gasto.tipo,
                gasto.categoria,
                gasto.UsuarioAsesor,
                gasto.serie,
                gasto.NoFactura,
                gasto.Descripcion == null ? '-' : gasto.Descripcion,
                gasto.importeExento,
                gasto.importeGravado,
                moment(gasto.FechaFactura).format("DD/MM/YYYY"),
                moment(gasto.FechaCreacion).format("DD/MM/YYYY HH:MM"),
                <div>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => getGastoDetalle(gasto.IdGastoViajeDetalle, gasto)} size="small" color={"primary"} disabled={buttonsEnabled}>Detalle</Button>
                    </span>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => showModalCancelado(gasto.IdGastoViajeDetalle)} size="small" color={"primary"} disabled={buttonsEnabled}>Rechazar</Button>
                    </span>
                </div>
            ]
            DataGastos.push(data)
        })
        return DataGastos;
    }



    const HeaderHistorialGastos = [
        {
            name: "tipo",
            label: "Tipo Gasto",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "categoria",
            label: "Categoria Gasto",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "UsuarioAsesor",
            label: "Asesor",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "serie",
            label: "No Serie",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "NoFactura",
            label: "No Factura",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "Descripcion",
            label: "Descripcion Asesor",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "importeExento",
            label: "Importe Exento",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "importeGravado",
            label: "Importe Gravado",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "FechaFactura",
            label: "Fecha Factura",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
            }
        },
        {
            name: "FechaCreacion",
            label: "Fecha Creacion",
            Option: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta, updateValue) => {
                    return (
                        <p>{value[0]}</p>
                    )
                }
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
        filter: true,
        filterType: "dropdown",
        responsive: "scrollMaxHeight",
        print: false,
        download: false,
        selectableRows: 'none',
        search: true,
        viewColumns: false,
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
                noMatch: "No se han encontrado gastos aprobados",
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
    }

    let initialValues = { Observacion: "" };
    return (
        <div className="px-3">
            <div class="row mb-3">
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
                        minDate={startDate}
                        format={"DD/MM/YYYY"}
                        value={endDate}
                        onChange={(date) => handleFechaFin(date)}
                    />
                </div>
            </div>
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Gastos Aprobados"}
                    data={DataGastos()}
                    columns={HeaderHistorialGastos}
                    options={DatatableOptions}
                />
            </MuiThemeProvider>

            <Dialog open={showModalCancelar} aria-labelledby="form-dialog-title">
                <DialogTitle style={{ textAlign: 'center' }} id="form-dialog-title">Observaciones</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            rechazarGasto(values)
                        }}
                    >
                        {({ errors, resetForm, values, setValues }) => (
                            <div ref={context}>
                                <Form>
                                    <div className="form-group">
                                        <Field
                                            label="Observacion"
                                            name="Observacion"
                                            error={!!errors.Observacion}
                                            helperText={errors.Observacion}
                                            style={{ fontSize: '40px', width: '450px', marginRight: '20px' }}
                                            as={TextField}
                                            className="form-control"
                                        />
                                    </div>
                                    <DialogActions>
                                        <Button onClick={() => { setshowModalCancelar(false) }} color="primary">
                                            Cancelar
                                        </Button>
                                        <Button type="submit" color="sucess">Guardar</Button>
                                    </DialogActions>
                                </Form>

                            </div>
                        )}

                    </Formik>
                </DialogContent>
            </Dialog>
            <Dialog open={detalle} fullScreen={true}>
                <DetalleGasto id={idDetalle} detalle={detalleGasto} RegresarGastosPendientes={RegresarGastosPendientes}></DetalleGasto>
            </Dialog>
        </div>
    )


};

export default GastosRechazar;