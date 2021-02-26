import React from 'react'
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import {useSelector,useDispatch} from 'react-redux';
import Button from '@material-ui/core/Button';
import jsPDF from "jspdf";
import Logo from './LogoSinLetrasInv.png';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import "jspdf-autotable";
import 'moment/locale/es';
import {DescargarCuentaExcel} from 'components/Cartera/DescargarCuentaExcel';
import axios from 'axios';
import {APIURL} from 'utils/Enviroment';
import { verificarConexion } from 'utils/http';
moment.locale('es')

const columnRender = (columnMeta, updateDirection) => {
    return <th key={2}
        className={"MuiTableCell-root MuiTableCell-head MUIDataTableHeadCell-root-433 MUIDataTableHeadCell-fixedHeaderCommon-435 MUIDataTableHeadCell-fixedHeaderXAxis-436 MUIDataTableHeadCell-fixedHeaderYAxis-437"}
    >{columnMeta.name}</th>;
}
const columns = [

    { name: 'Documento', label: 'Documento', options: { customHeadRender: columnRender } },
    { name: 'Tipo', label: 'Tipo', options: { customHeadRender: columnRender } },
    { name: 'Numero', label: 'Numero', options: { customHeadRender: columnRender } },
    { name: 'Acuerdo No.', label: 'Acuerdo No.', options: { customHeadRender: columnRender } },
    { name: 'Numero Cuota', label: 'Numero Cuota', options: { customHeadRender: columnRender } },
    { name: 'Fecha', label: 'Fecha', options: { customHeadRender: columnRender } },
    { name: 'Vencimiento', label: 'Vencimiento', options: { customHeadRender: columnRender } },
    { name: 'Dias', label: 'Dias', options: { customHeadRender: columnRender } },
    { name: 'Valor', label: 'Valor', options: { customHeadRender: columnRender } },
    { name: 'Saldo', label: 'Saldo', options: { customHeadRender: columnRender } },
    { name: 'Fecha Descuento', label: 'Fecha Descuento', options: { customHeadRender: columnRender } },
    { name: 'Dias', label: 'Dias', options: { customHeadRender: columnRender } },
    { name: 'Descuento', label: 'Descuento', options: { customHeadRender: columnRender } },
    { name: 'A Pagar', label: 'A Pagar', options: { customHeadRender: columnRender } },
    { name: 'Moneda', label: 'Moneda', options: { customHeadRender: columnRender } },
]

if(localStorage.getItem('empresa')==='IMGT')
{
    columns.splice(3,0,{ name: 'Numero FEL', label: 'Numero FEL', options: { customHeadRender: columnRender } })
}

const numberWithCommas = (numero)=>(numero.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));

const CuentaCorrienteTable = props => {
    const cuentaCorriente = useSelector(e=>e.CuentaImprimir);
    const clientesPedido = useSelector(c=>c.clientes);
    const clientesRecibo = useSelector(c=>c.Recibo);
    const permisos = useSelector(e=>e.Permisos[0]);
    const dispatch = useDispatch();
    const [ocultar,setOcultar] = React.useState(false);

    let data = []
    const options = {
        filterType: 'none',
        sort: false,
        pagination: false,
        responsive: "scrollMaxHeight",
        print: false,
        filter: false,
        viewColumns: false,
        download: false,
        selectableRows: 'none',

        expandableRowsOnClick: false,
        textLabels: {
            body: {
                noMatch: "Nada que mostrar.",
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
            }
        },
        // onRowsSelect: (currentRowsSelected, allRowsSelected) => {
        //   setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
        // },


    }
    data = props.CuotasCuentaCorriente.map(cuenCorr => {
          return Object.values(cuenCorr)
    })

    
    const generatePDF = () =>{
        const unit = "pt";
        const size = "letter"; 
        const orientation = "portrait";

        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(7);

        const title = `
                                          ESTADO DE CUENTA PROVISIONAL

    Codigo:    ${props.clienteSelected.Codigo}              Fecha: ${moment(new Date()).format("DD/MM/YYYY")}
    Nombre:    ${props.clienteSelected.Nombre}
    Direcciòn: ${props.clienteSelected.Direccion}
        `;

        const headers = [['Documento','Numero','Fecha','Vencimiento','Dias','Valor','Saldo','Descuento','Dias','Descuento','A Pagar']];
        const data = cuentaCorriente.map(e=>[e.Tipo,
            e.Factura,
            e.FechaFactura,
            e.FechaVencimiento,
            e.Dias,
            numberWithCommas(e.Valor),
            numberWithCommas(e.Saldo),
            e.FechaMaxDescuento,
            e.DiasV,
            numberWithCommas(e.Descuento),
            numberWithCommas(e.APagar)
        ]);
        const cantidadFacturas = data.length;
        const totalValor = cuentaCorriente.reduce((pre,curr)=>(pre+curr.Valor),0);
        const totalSaldo = cuentaCorriente.reduce((pre,curr)=>(pre+curr.Saldo),0);
        const totalDescuento = cuentaCorriente.reduce((pre,curr)=>(pre+curr.Descuento),0);
        const totalPagar = cuentaCorriente.reduce((pre,curr)=>(pre+curr.APagar),0);

        data.push([`Facturas: ${cantidadFacturas}`,'','','','',numberWithCommas(totalValor),numberWithCommas(totalSaldo),'','',numberWithCommas(totalDescuento),numberWithCommas(totalPagar)]);

        let content = {
            styles:{fontSize:7},
            startY: 50,
            head: headers,
            body: data,
            didDrawPage:function (data) {
                if (Logo) {
                    doc.addImage(Logo, 'PNG', 40, 0, 33, 33);
                }
        }}

        doc.text(title, 180, 0);
        doc.autoTable(content);
        doc.save(`Reporte-${props.clienteSelected.Codigo}.pdf`)

        Swal.fire({
            title: "¡Documento Descargado!",
            text: "Revise su panel de notificaciones o su carpeta de descargas.",
            type: 'success',
            confirmButtonText: 'Ok',
        });
    }

    const actualizarCoordenadasPedido = (longitud, latitud) => {
        let copiaClientes = clientesPedido;
        let indice = copiaClientes.map(x => x.Codigo).indexOf(props.clienteSelected.Codigo);
        copiaClientes[indice].Longitud = longitud;
        copiaClientes[indice].Latitud = latitud;
        dispatch({ type: 'STORE_CLIENTES', clientes: copiaClientes });
    }

    const actualizarCoordenadasRecibo = (longitud, latitud) => {
        let copiaClientes = clientesRecibo.clientes;
        let indice = copiaClientes.map(x => x.Codigo).indexOf(props.clienteSelected.Codigo);
        copiaClientes[indice].Longitud = longitud;
        copiaClientes[indice].Latitud = latitud;
        dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: copiaClientes });
    }

    const actualizarData = request => {
        const { latitud, longitud } = request.data;
        actualizarCoordenadasPedido(longitud, latitud);
        actualizarCoordenadasRecibo(longitud, latitud);
    }

    const enviarCoordenadasApi = async (coor) => {
        try {
            const data = {
                cliente: props.clienteSelected.Codigo,
                latitud: coor.latitude,
                longitud: coor.longitude
            }
            const request = await axios.post(`${APIURL}/api/cliente/coordenadas`, data);
            setOcultar(true);
            actualizarData(request);
            Swal.fire({
                title: 'Confirmado',
                text: "Coordenadas del cliente han sido actualizadas con éxito.",
                type: 'success',
                confirmButtonText: 'OK',
            });
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: "Ha ocurrido un error y no se pudo obtener las coordenadas.",
                type: 'error',
                confirmButtonText: 'OK',
            });
        }
    }

    const ObtenerCoordenadas = (resolve, reject) => {
        const timeout = new Promise((resolve, reject) => {
            setTimeout(reject, 10000);
        });

        const geolocationPromise = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve(position);
                },
                (error) => { reject(error) },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        });
        Promise.race([timeout, geolocationPromise]).then((value) => resolve(value)).catch((error) => reject(error))
    }

    const mensajeErrorCoordenadas = () => {
        Swal.fire({
            title: 'Error',
            text: "Ha ocurrido un error y no se pudo obtener las coordenadas.",
            type: 'error',
            confirmButtonText: 'OK',
        });
    }

    const confirmacionCoordenadas = async () => {
        let isOnline = await verificarConexion();
        if (localStorage.getItem("Conexion") === "Online" && isOnline) {
            Swal.fire({
                title: 'Confirmar',
                text: `¿Está seguro de realizar el pinneo en la ubicacón actual?`,
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#06bf53',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí',
                cancelButtonText: 'No',
            }).then((result) => {
                if (result.value) {
                    ObtenerCoordenadas((position) => {
                        enviarCoordenadasApi({
                            longitude: position.coords.longitude,
                            latitude: position.coords.latitude
                        })
                    }, (error) => {
                        Swal.fire({
                            title: 'Error',
                            text: "Ha ocurrido un error y no se pudo obtener las coordenadas.",
                            type: 'error',
                            confirmButtonText: 'OK',
                        });
                    });
                }
            })
        } else {
            Swal.fire({
                title: 'Modo Offline',
                text: "Se encuentra en modo offline, no puede actualizar registros.",
                type: 'warning',
                confirmButtonText: 'OK',
            });
        }
    }

    const verificarObtencionCoordenadas = () => {
        navigator.permissions.query({ name: 'geolocation' }).then(res => {
            if (res.state === "granted") {
                confirmacionCoordenadas();
            } else {
                Swal.fire({
                    title: 'Advertencia',
                    text: "Habilite la geoposición en su dispositivo para realizar esta acción.",
                    type: 'warning',
                    confirmButtonText: 'OK',
                });
            }
        }).catch(err => {
            mensajeErrorCoordenadas()
        })
    }

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            {(!props.cartera) && (<>
                {((props.clienteSelected.Latitud === null || props.clienteSelected.Longitud === null) && ocultar === false && permisos.AsesoresUsuario.length === 1) && <Button onClick={verificarObtencionCoordenadas} style={{ marginBottom: '10px', marginRight: 5 }} variant="contained" color="primary">Guardar coordenadas</Button>}
            </>)}
            {(cuentaCorriente.length > 0) && (<div style={{ display: 'inline' }}>
                <Button onClick={generatePDF} style={{ marginBottom: '10px' }} variant="contained" color="primary">Generar Reporte</Button>
                <DescargarCuentaExcel cliente={props.clienteSelected.Codigo} />
            </div>)}
            <MUIDataTable
                title={''}
                data={data}
                columns={columns}
                options={options}
            />
        </MuiThemeProvider>
    )
}

const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScrollMaxHeight: {
                maxHeight: 'unset !important',
            }
        },
        MuiToolbar: {
            root: {
                display: 'flex !important',
            }
        },
        MUIDataTableToolbar: {
            actions: {
                textAlign: 'end !important',
            }
        }
    }
})

export default CuentaCorrienteTable;



