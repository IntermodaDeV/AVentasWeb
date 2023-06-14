import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Button } from "@material-ui/core";
import moment from "moment";
import 'moment/locale/es';
import { APIURL } from 'utils/Enviroment';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { useSelector } from 'react-redux';
import { Dropdown } from "semantic-ui-react";
import axios from 'axios';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import { DatePicker } from "@material-ui/pickers";
import DetalleGasto from 'components/GastoAsesores/DetalloGasto/DetalleGasto'
import Dialog from "@material-ui/core/Dialog";
import { IsAllow } from 'components/Seguridad/Permisos';
import jsPDF from "jspdf";

moment.locale('es');

const Gastos = (props) => {
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const [gastos, setGastos] = useState([]);
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);
    const [asesores, setAsesores] = useState([]);
    const [detalle, setDetalle] = useState(false);
    const [detalleGasto, setDetalleGasto] = useState([])
    const [idDetalle, setIdDetalle] = useState(null);
    const [tipoGasto, setTipoGasto] = useState([])
    const numberWithCommas = (numero) => (numero.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
    const [tipoSelected, setTipoSelected] = useState(null);
    const [tipoId, setTipoId] = useState('')

    useEffect(() => {
        if (!IsAllow('/GiraAsesores/HistorialGasto')) {
            props.history.push('/home');
        }
        setAsesorSelected(AsesoresUsuario[0].Usuario)
        cargarHistorialGastos(startDate, endDate)
        let asesoresMap = AsesoresUsuario.map((Ase) => ({ key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }));
        setAsesores(asesoresMap);

        getTipos();
        // eslint-disable-next-line
    }, [])

    const getTipos = async () => {
        await axios.get(`${APIURL}/api/Gira/TipoGasto/${localStorage.getItem("empresa")}`).then(resp => {
            let tipos = resp.data.map((tip) => ({ key: tip.Id, value: tip.Nombre, text: tip.Nombre }));
            setTipoGasto(tipos);
            setTipoSelected(tipos[0].text)
            setTipoId(tipos[0].key)

        })

    }

    const getGastoDetalle = async (id, detalle) => {
        setIdDetalle(id)
        setDetalleGasto(detalle)
        setDetalle(true)
    }

    const RegresarGastosPendientes = () => {
        setDetalle(false)
    }

    const cargarHistorialGastos = async (FechaInicio, FechaFin) => {
        try {
            let asesor = AsesorSelected ? AsesorSelected : AsesoresUsuario[0].Usuario;
            var Inicio = moment(FechaInicio).format("YYYY-MM-DD");
            var Fin = moment(FechaFin).format("YYYY-MM-DD");
            const request = await axios.get(`${APIURL}/api/Gira/HistorialGastos/${asesor}/${Inicio}/${Fin}`);
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

    const handleOnChangeAsesor = (value) => {
        setAsesorSelected(value);
    }

    const handleOnChangeTipo = (value) => {
        setTipoSelected(value);
        tipoGasto.forEach(temp => {
            if (value === temp.value) {
                setTipoId(temp.key)
            }
        })

    }

    const DataGastos = () => {
        let DataGastos = [];

        gastos.forEach(gasto => {

            let data = [
                gasto.tipo,
                gasto.categoria,
                gasto.serie,
                gasto.NoFactura,
                gasto.Descripcion == null ? '-' : gasto.Descripcion,
                gasto.DescripcionAdmin == null ? '-' : gasto.DescripcionAdmin,
                gasto.importeGravado,
                gasto.importeExento,
                gasto.ValorFactura,
                moment(gasto.FechaFactura).format("DD/MM/YYYY"),
                moment(gasto.FechaCreacion).format("DD/MM/YYYY HH:MM"),
                gasto.Estado,
                <span className="mr-1">
                    <Button className='my-1' variant="outlined" onClick={() => getGastoDetalle(gasto.IdGastoViajeDetalle, gasto)} size="small" color={"primary"}>Detalle</Button>
                </span>
            ]
            DataGastos.push(data)
        })
        return DataGastos;
    }

    const guardarPdf = async () => {
        const unit = "pt";
        const size = "letter";
        const orientation = "portrait";

        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(10);


        const headers = [['#', 'Tipo', 'Categoria', 'Descripcion', 'Fecha', (localStorage.getItem("empresa") == "IMHN" ? "Importe Gracado" : "-" ), (localStorage.getItem("empresa") == "IMHN" ? "Importe Exento" : "Cantidad / Importe Exento" ), 'Valor']];

        let date = new Date();
        let asesor = AsesorSelected ? AsesorSelected : AsesoresUsuario[0].Usuario;
        var Inicio = moment(startDate).format("YYYY-MM-DD");
        var Fin = moment(endDate).format("YYYY-MM-DD");
        const request = await axios.get(`${APIURL}/api/Gira/GastosPDF/${asesor}/${Inicio}/${Fin}/${tipoId}`);
        let datos = request.data;
        if (datos.length > 0) {
            const title = `



                                                                                Reporte ${tipoSelected}

        Nombre Completo: ${datos[0].nombre}
        
        Desde: ${moment(startDate).format("DD/MM/YYYY")}
        Hasta: ${moment(endDate).format("DD/MM/YYYY")}
        `;


            const data = datos.map(e => [
                e.$id,
                e.Tipo,
                e.categoria,
                e.descripcion,
                moment(e.fecha).format("DD/MM/YYYY"),
                numberWithCommas(e.importeGravado),
                numberWithCommas(e.importeExento),
                numberWithCommas(e.valor)
            ])

            const total = datos.reduce((pre, curr) => (pre + curr.valor), 0);
            data.push(['', '', '', '', '', '', '', numberWithCommas(total)]);

            let content = {
                styles: { fontSize: 8 },
                startY: 120,
                head: headers,
                body: data
            };
            doc.text(title, 25, 0);
            doc.autoTable(content);
            doc.save(`Reporte ${tipoSelected} ${asesor} ${moment(date).format("DD-MM-YYYY")}.pdf`)

            Swal.fire({
                title: "¡Documento Descargado!",
                text: "Revise su panel de notificaciones o su carpeta de descargas.",
                type: 'success',
                confirmButtonText: 'Ok',
            });
        } else {
            Swal.fire({
                title: "¡Documento no Descargado!",
                text: "No se encontraron gastos aprobados en el rango de fechas.",
                type: 'error',
                confirmButtonText: 'Ok',
            });
        }
        /*
        */

    }

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

    const HeaderHistorialGastos = [
        {
            name: "Tipo",
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
            name: "DescripcionAdmin",
            label: "Descripcion Admin",
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
            name: "Estado",
            label: "Estado",
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
        download: false,
        print: true,
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
                noMatch: "No se han encontrado gastos",
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
    return (
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
                        minDate={startDate}
                        format={"DD/MM/YYYY"}
                        value={endDate}
                        onChange={(date) => handleFechaFin(date)}
                    />
                </div>
                <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                    <Dropdown
                        placeholder="Asesor"
                        selection
                        style={{ zIndex: 999 }}
                        onChange={(e, { value }) => handleOnChangeAsesor(value)}
                        options={asesores}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        value={AsesorSelected}
                    />
                </div>
                <div className="col-lg-2 col-sm-4 col-6" style={{ paddingTop: 10 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => cargarHistorialGastos(startDate, endDate)}>Obtener
                    </Button>
                </div>
                <div>
                    <button onClick={() => guardarPdf()} style={{ display: "block" }} className="btn btn-secondary">Generar reporte</button>
                </div>
                <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                    <Dropdown
                        placeholder="Tipo Gasto"
                        selection
                        style={{ zIndex: 999 }}
                        onChange={(e, { value }) => handleOnChangeTipo(value)}
                        options={tipoGasto}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        value={tipoSelected}
                    />
                </div>
            </div>
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Historial de Gastos"}
                        data={DataGastos()}
                        columns={HeaderHistorialGastos}
                        options={DatatableOptions}

                    />
                </MuiThemeProvider>
            </div>
            <Dialog open={detalle} fullScreen={true}>
                <DetalleGasto id={idDetalle} detalle={detalleGasto} RegresarGastosPendientes={RegresarGastosPendientes}></DetalleGasto>
            </Dialog>

        </div>
    )
};

export default Gastos;