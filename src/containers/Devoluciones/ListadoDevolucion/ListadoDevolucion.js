import React, { useEffect, useState } from 'react';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import axios from 'axios';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import PrintOutlined from '@material-ui/icons/PrintOutlined';
//import GridOnIcon from '@material-ui/icons/GridOn';
import { FaFileExcel,FaInfo } from "react-icons/fa";
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { Dropdown } from "semantic-ui-react";
import { useSelector } from 'react-redux';
import { APIURL } from 'utils/Enviroment';
import { ImprimirPedidoDevolucion } from 'components/Devoluciones/ImprimirPedidoDevolucion';
import moment from 'moment';
import Swal from 'sweetalert2/dist/sweetalert2.js';

export const ListadoDevolucion = (props) => {
    const [devoluciones, setDevoluciones] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [devolucion, setDevolucion] = useState(null);
    const [detalleDevolucion, setDetalleDevolucion] = useState([]);
    const [asesores, setAsesores] = useState([]);
    const [AsesorSelected, setAsesorSelected] = useState(null);

    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);

    useEffect(() => {
        setAsesorSelected(AsesoresUsuario[0].Usuario);
        ObtenerlistadoDevoluciones();

        let asesoresMap = AsesoresUsuario.map((Ase) => ({ key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }));
        asesoresMap.unshift({ key: "Todo", value: "Todo", text: "Todo" });
        setAsesores(asesoresMap);
        // eslint-disable-next-line
    }, [])


    const ObtenerlistadoDevoluciones = async () => {
        try {
            let asesor = AsesorSelected ? AsesorSelected : AsesoresUsuario[0].Usuario;
            const request = await axios.get(`${APIURL}/api/devolucion/listado/${asesor}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            console.log(request.data)
            setDevoluciones(request.data);
        } catch (err) {
            console.log(err)
        }
    }

    const handleOnChangeAsesor = (value) => {
        setAsesorSelected(value);
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
    const HeadersListaPedidos = [
        {
            label: "Codigo Interno",
            name: "NumExpediente",
            options: {
                filter: true,
            }
        },
        {
            label: "Numero RMA",
            name: "numeroRMA",
            options: {
                filter: true,
            }
        },
        {
            label: "Pedido AX",
            name: "pedidoAx",
            options: {
                filter: true,
            }
        },
        {
            label: "Codigo Cliente",
            name: "codigoCliente",
            options: {
                filter: true,
            }
        },
        {
            label: "Nombre Cliente",
            name: "nombreCliente",
            options: {
                filter: true,
            }
        },
        {
            label: "Motivo de Devolucion",
            name: "motivoDev",
            options: {
                filter: true,
            }
        },
        {
            label: "Cantidad",
            name: "Cantidad",
            options: {
                filter: true,
            }
        },
        {
            label: "Fecha Creacion",
            name: "FechaCreacion",
            options: {
                filter: true,
            }
        },
        {
            label: "Línea",
            name: "Linea",
            options: {
                filter: true,
            }
        },
        {
            label: "Estado",
            name: "Estado",
            options: {
                filter: true,
            }
        },
        {
            label: "Observación",
            name: "observacion",
            options: {
                filter: false,
            }
        },
        {
            label: "Seguimiento Calidad",
            name: "SeguimientoCalidad",
            options: {
                filter: false,
            }
        },
        {
            label: "Realizado por:",
            name: "usuario",
            options: {
                filter: false,
            }
        },
        {
            label: "Factura Destino:",
            name: "facturaDestino",
            options: {
                filter: false,
            }
        },
        {
            label: "Acciones",
            name: "acciones",
            options: {
                filter: false,
            }
        }
    ]

    const hidePrint = () => {
        setShowDialog(false);
    }

    const obtenerDetalleDevolucion = async (devolucionSeleccionada) => {
        try {
            const request = await axios.get(`${APIURL}/api//devolucion/detalle/${devolucionSeleccionada.NumDevolucion}`);
            setDevolucion(devolucionSeleccionada);
            setDetalleDevolucion(request.data);
            setShowDialog(true);
        } catch (err) {

        }
    }


    const convertirData = (data) => {
        return data.map((el) => {
            const { $id, ...dev } = el;

            return {
                ...dev
            }
        })
    }

    const guardarExcel = (csvData, dev) => {
        const fileName = `Productos Devolucion ${dev}`;
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    const obtenerReporteDevolucion = async (dev) => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/reporte/${dev}`);
            const data = convertirData(request.data);
            guardarExcel(data, dev);
        } catch (err) {

        }
    }

    const mostrarDetalleDevolucion = (e) => {
        const notaCredito = e.NotaCredito === null ? "No disponible" : e.NotaCredito;
        const fechaNotaCredito = e.FechaNotaCredito === null ? "No disponible" : moment(e.FechaNotaCredito).format('DD/MM/YYYY hh:mm a');
        const fechaCreacionAx = e.FechaCreacionAx === null ? "No disponible" : moment(e.FechaCreacionAx).format('DD/MM/YYYY hh:mm a');
        const fechaCreacion = moment(e.FechaCreacion).format('DD/MM/YYYY hh:mm a');

        Swal.fire({
            title: "<h3>Detalle AX</h3>",
            html: `<div><p><b>Fecha Ingreso:</b> ${fechaCreacion}</p><p><b>Fecha Ingreso AX:</b> ${fechaCreacionAx}</p><p><b>Fecha Nota Credito:</b> ${fechaNotaCredito}</p><p><b>Nota Credito:</b> ${notaCredito}</p></div>`,
        });
    }

    const Data = () => {
        return devoluciones.map(p => (
            [
                p.NumDevolucion,
                p.NumeroRMA,
                p.PedidoDevolucion,
                p.CodigoCliente,
                p.NombreCliente,
                `${p.MotivoDevolucionDetalle.CodigoMotivoDevolucion} - ${p.MotivoDevolucionDetalle.Descripcion}`,
                p.TotalUnidades,
                moment(p.FechaCreacion).format("DD/MM/YYYY"),
                p.IdLinea,
                p.Estado,
                p.Observacion,
                p.EstadoBodega === 0 ? <span style={{ color: '#FA2016' }}> <strong> Rechazado </strong></span> :
                p.EstadoBodega === 1 ? <span style={{ color: '#2977F2' }}><strong>Recepcionado </strong></span> :
                p.EstadoBodega === 2 ? <span style={{ color: '#14DE19' }}><strong>Transferido a bodega</strong></span> :
                <span style={{color: 'black'}}><strong>-</strong></span> ,
                p.Estado === "No autorizado" ? p.UsuarioModifica : "",
                p.FacturaDestino,
                <div>
                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" size="small" onClick={() => { obtenerDetalleDevolucion(p) }} color={"primary"}>
                            <PrintOutlined />
                        </Button>
                    </span >
                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" size="large" onClick={() => { obtenerReporteDevolucion(p.NumDevolucion) }} color={"primary"}>
                            <FaFileExcel />
                        </Button>
                    </span >
                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" size="large" onClick={() => { mostrarDetalleDevolucion(p) }} color={"primary"}>
                            <FaInfo />
                        </Button>
                    </span >
                </div>
            ]
        ));
    }

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
    return (
        <div className="px-3">
            <div className="row mb-3">
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
                        onClick={() => ObtenerlistadoDevoluciones()}>Obtener
                    </Button>
                </div>
            </div>
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Listado de Devoluciones"}
                        data={Data()}
                        columns={HeadersListaPedidos}
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
                    <ImprimirPedidoDevolucion
                        hidePrint={hidePrint}
                        Pedido={devolucion}
                        gruposXDetPed={detalleDevolucion}
                    />
                }
            </Dialog >

        </div>
    );
}