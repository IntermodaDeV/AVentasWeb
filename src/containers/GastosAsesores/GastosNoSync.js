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
import { IsAllow } from 'components/Seguridad/Permisos';

moment.locale('es');

const GastosNoSync = (props) => {
    const [gastos, setGastos] = useState([]);
    const [showModalCancelar, setshowModalCancelar] = useState(false);
    const [IdRechazado, setIdRechazado] = useState("");
    const context = useRef();

    useEffect(() => {
        if (!IsAllow('/GiraAsesores/GastosNoSincronizados')) {
            props.history.push('/home');
        }
        cargarHistorialGastos()
        // eslint-disable-next-line
    }, [])

    const validationSchema = yup.object().shape(
        {
            Observacion: yup.string().required('La observacion es obligatorio'),
        });

    const showModalCancelado = (id) => {
        setshowModalCancelar(true)
        setIdRechazado(id)
    }

    const cargarHistorialGastos = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/GastosNoSincornizados/${localStorage.getItem("empresa")}`);
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

    const aprobarGasto = async (id) => {

        const enviarAX = await axios.get(`${APIURL}/api/DatosEnviarAX/${id}`)
        console.log(enviarAX.data.Content)
        if (enviarAX.data.Content === '"OK"') {
            const request = await axios.post(`${APIURL}/api/ActualizarEstadoGasto/${id}/2/-/${localStorage.getItem("codigo")}/-`);
            if (request.data === 1) {
                Swal.fire({
                    title: 'Confirmado',
                    text: "Gasto Aprobado y enviado a AX Existosamente",
                    type: 'success',
                    confirmButtonText: 'Ok',
                }).then(e => {
                    cargarHistorialGastos();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Gasto Enviado a AX pweo no ACTUALIZADO en la base de datos',
                    type: 'error',
                    confirmButtonText: 'Ok',
                });
            }
        } else {
            const request = await axios.post(`${APIURL}/api/ActualizarEstadoGasto/${id}/4/-/${localStorage.getItem("codigo")}/${enviarAX.data.Content}`);
            if (request.data === 1) {
                Swal.fire({
                    title: 'Error',
                    text: "Mensaje: " + enviarAX.data.Content,
                    type: 'error',
                    confirmButtonText: 'Ok',
                }).then(e => {
                    cargarHistorialGastos();
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Error al actualizar el estado del gasto',
                    type: 'error',
                    confirmButtonText: 'Ok',
                });
            }
        }


    }

    const rechazarGasto = async (value) => {
        console.log('cancelando')
        const request = await axios.post(`${APIURL}/api/ActualizarEstadoGasto/${IdRechazado}/3/${value.Observacion}/${localStorage.getItem("codigo")}/-`)
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
    }

    const DataGastos = () => {
        let DataGastos = [];

        gastos.map(gasto => {
            let data = [
                gasto.tipo,
                gasto.categoria,
                gasto.UsuarioAsesor,
                gasto.serie,
                gasto.NoFactura,
                gasto.Descripcion == null ? '-' : gasto.Descripcion,
                gasto.MensajeAX,
                gasto.importeGravado,
                gasto.importeExento,
                gasto.ValorFactura,
                moment(gasto.FechaFactura).format("DD/MM/YYYY"),
                moment(gasto.FechaCreacion).format("DD/MM/YYYY"),
                <div>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => aprobarGasto(gasto.IdGastoViajeDetalle)} size="small" color={"primary"}>Sincronizar</Button>
                    </span>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => showModalCancelado(gasto.IdGastoViajeDetalle)} size="small" color={"primary"}>Rechazar</Button>
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
            name: "MensajeAX",
            label: "Mensaje AX",
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
            name: "ValorFactura",
            label: "Valor Factura",
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
        filter: false,
        filterType: "dropdown",
        responsive: "scrollMaxHeight",
        print: false,
        download: false,
        selectableRows: 'none',
        search: false,
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
                noMatch: "No se han encontrado gastos no sincronizados",
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
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Gastos No Sincronizados"}
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
        </div>
    )

};

export default GastosNoSync;