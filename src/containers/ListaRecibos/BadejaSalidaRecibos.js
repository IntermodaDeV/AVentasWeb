import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Button } from "@material-ui/core";
import DetalleRecibo from 'components/ListadoRecibos/DetalleRecibo';
import { PrintOutlined } from '@material-ui/icons';
import moment from "moment";
import 'moment/locale/es';
import { APIURL } from 'utils/Enviroment';
import  TableFooter from "@material-ui/core/TableFooter";
import  TableRow from "@material-ui/core/TableRow";
import  TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { Dialog } from "@material-ui/core";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MUIDataTable from "mui-datatables";
import {IsAllow} from 'components/Seguridad/Permisos';
import ImpresionBandejaSalida from "components/ListadoRecibos/ImpresionBandejaSalida";
import {useSelector,useDispatch} from 'react-redux';
import { FiAlertTriangle } from 'react-icons/fi';
import axios from 'axios';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import { verificarConexion } from 'utils/http';
moment.locale('es');

const BadejaSalidaRecibos = (props) => {
    const urlApi = APIURL;
    const [recibos, setRecibos] = useState([]);
    const [recibo, setRecibo] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [DialogRecibo, setDialogRecibo] = useState(null);
    const [isLoading,setLoading] = useState(false);
    const RecibosCache = useSelector(r=> r.RecibosEnCache);
    const dispatch = useDispatch();

    useEffect(() => {
        if(!IsAllow("/lista-recibos-BandejaSalida"))
        {
            props.history.push('/home');
        }
        setRecibos(RecibosCache);
        // eslint-disable-next-line
    }, []);

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

    const mostrarAdvertencia = (title,text,type)=>{
        Swal.fire({
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Ok',
        })
    }
    const Sincronizar = async (reciboId) => {
        let isOnline = await verificarConexion();
        try {
            if (localStorage.getItem("Conexion") === "offline") {
                mostrarAdvertencia("Modo Offline", "Se encuentra en modo offline, no puede actualizar registros.", "warning");
            } else {
                if (!isOnline) {
                    mostrarAdvertencia('Sin internet', 'Necesita internet para poder actualizar los registros.', 'warning');
                } else {
                    setLoading(true);
                    const recibo = RecibosCache.find(x => x.ReciboId === reciboId);
                    let Ruta = recibo.EsAnticipo ? '/api/Recibo/Anticipo' : '/api/Recibo';
                    const request = await axios.post(urlApi + Ruta, recibo, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token'),
                            'Content-Type': 'application/json'
                        },
                    });

                    if (request.data) {
                        setLoading(false);
                        const nuevosRecibos = RecibosCache.filter(x => x.ReciboId !== reciboId);
                        dispatch({ type: "SET_RESETRECIBOSENCACHE", payload: nuevosRecibos });
                        setRecibos(nuevosRecibos);
                        Swal.fire({
                            type: 'success',
                            title: 'Sincronizado',
                            text: "Recibo sincronizado correctamente",
                        });
                    }
                }
            }
        }
        catch (err) {
            let mensaje = "Ha ocurrido un error y no se ha registrado el recibo.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }
            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok',
            });
            setLoading(false);
        }
    }

    const DataRecibos = () => {
        let DataRecibos = [];

        recibos.map(recib => {

                let data = {
                    NumeroRecibo: recib.CodigoUltimoRecibo,
                    CodigoCliente: recib.CodigoCliente,
                    NombreCliente : recib.NombreCliente,
                    Fecha: moment(recib.Fecha).format('DD/MM/YYYY') !== "Invalid date" ? moment(recib.Fecha).format('DD/MM/YYYY') : "",
                    FechaCheque: moment(recib.Fecha).format('DD/MM/YYYY') !== "Invalid date" ? moment(recib.Fecha).format('DD/MM/YYYY') : "",
                    IdBanco: recib.Pagos[0].Banco,
                    IdCuentaBancaria: "",
                    Valor: recib.Total,
                    IdMoneda: recib.Pagos[0].IdMoneda,
                    Sincronizado: "No",
                    CodigoAsesor: recib.Asesor,
                    IdFactura: recib.Facturas[0].IdFactura,
                    Descuento: recib.Facturas[0].Parcial2,
                    Acciones:
                        <div>

                             <span className="mr-1">
                                <Button className='my-1' variant="outlined" onClick={() => Sincronizar(recib.ReciboId)} size="small" color={"primary"}>Sincronizar</Button>
                            </span> 

                            <span className="ml-1">
                                <Button className='my-1' variant="outlined" onClick={() => Imprimir(recib)} size="small" color={"primary"}>
                                    <PrintOutlined />
                                </Button>
                            </span >
                        </div>
                }

                DataRecibos.push(data);
            return false;
        });

        return DataRecibos;
    }

    const Imprimir = (recibo) => {
        setDialogRecibo(recibo);
        setShowDialog(true);
    }

    const hidePrint = () => {
        setShowDialog(false);
        setDialogRecibo(null);
    }


    const RegresarListaRecibos = () => {
        setRecibo(null);
    }
    
    if (recibo != null) {
        
        return (
            <DetalleRecibo
                recibo={recibo}
                RegresarListaRecibos={RegresarListaRecibos} />
        )
    } else {
        return (
            <>
             <div className="px-3">
             <Dialog
                    disableBackdropClick 
                    scroll={'paper'}
                    open={isLoading}
                    >
                        <DialogTitle className="text-center" id="scroll-dialog-title">
                            <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                Sincronizando
                        </div>
                        </DialogTitle>
                        <DialogContent>
                        
                        <div className="d-flex flex-grow-1 align-items-center justify-content-center">
                                <div className="row">
                                    <div className="col-12 text-center">
                                        <CircularProgress disableShrink/>
                                    </div>
                                </div>
                            </div>
                        
                            
                        </DialogContent>
                </Dialog>
                <div style ={{textAlign:'center',fontSize: '28px'}} className="alert alert-danger alert-dismissible fade show" role="alert">
                    <FiAlertTriangle style={{ fontSize: '32px', color: 'red'}} /> Los recibos mostrados en esta pantalla están registrados únicamente en su dispositivo.
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

                <Dialog
                    open={showDialog}
                    onClose={() => hidePrint()}
                    scroll={'paper'}
                    aria-labelledby="scroll-dialog-title">
                    {
                        DialogRecibo &&
                        <ImpresionBandejaSalida
                            hidePrint={hidePrint}
                            recibo={DialogRecibo}
                        />
                    }
                </Dialog >
            </div>
            </>
        );
    }

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
        name: "NombreCliente",
        label: "Nombre Cliente",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "FechaCheque",
        label: "Fecha Cheque",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "IdBanco",
        label: "Banco",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "IdCuentaBancaria",
        label: "Cuenta Bancaria",
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
        name: "Sincronizado",
        label: "Sincronizado",
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
        name: "IdFactura",
        label: "Factura",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "Descuento",
        label: "Descuento",
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


export default BadejaSalidaRecibos;
