import React from 'react';
import styles from 'components/Pedidos/ResumenPedido/ResumenPedido.module.css';
import 'components/Pedidos/ResumenPedido/recibo.css';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from "@material-ui/core/Typography";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DatePicker } from "@material-ui/pickers";
import { ScaleLoader } from 'react-spinners';
import moment from "moment";
import 'moment/locale/es';
import SignatureCanvas from 'react-signature-canvas';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { useSelector, useDispatch } from 'react-redux';
import { Dropdown } from "semantic-ui-react/";
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import ClienteContado from '../SelectCliente/ClienteContado';

const ResumenPedido = (props) => {

    let fechaInicioEntrega = moment().toDate();
    let fechaMinimaEntrega = moment().toDate();

    if(props.coleccion.ColeccionTipo === "F"){
        fechaInicioEntrega = moment(props.coleccion.EntregaFinal).toDate();
        fechaMinimaEntrega = moment(props.coleccion.EntregaInicio).toDate()
    }else{
        fechaInicioEntrega = moment(fechaInicioEntrega, "DD-MM-YYYY").add(3, 'days');
        fechaMinimaEntrega = moment(fechaMinimaEntrega, "DD-MM-YYYY").add(2, 'days');

        if(fechaInicioEntrega.day()===0){
            fechaInicioEntrega = moment(fechaInicioEntrega, "DD-MM-YYYY").add(1, 'days');
        }
    }

    const [firma, setFirma] = React.useState(null);
    const [mostrarFirma, setMostrarFirma] = React.useState(false);
    const [ErrorFecha, setErrorFecha] = React.useState(false);
    const [ErrorFirma, setErrorFirma] = React.useState(true);
    const [FechaEntrega, setFechaEntrega] = React.useState(fechaInicioEntrega);
    const TipoCredito = useSelector(e => e.TipoPedido);
    var sigPad = {};
    const [flete, setFlete] = React.useState(0);
    const [openContado, setOpenContado] = React.useState(false);
    const clienteContado = useSelector(e => e.clienteContado);
    const BloqueoCredito = useSelector(e=>e.Permisos[0].BloqueoCredito);
    const empresas = useSelector(e => e.Empresas);
    const empresa = empresas.find(x => x.COMPANY_CODE === localStorage.getItem('empresa').toUpperCase());
    let comunidadSelected = "";
    let modoEntrega = "";
    let habilitado = false;

    if (clienteContado === null) {
        if (props.Cliente.ComunidadAutonoma !== "") {
            comunidadSelected = props.Cliente.ComunidadAutonoma;
            habilitado = true;
        }

        if (props.Cliente.ModoEntrega !== "") {
            modoEntrega = props.Cliente.ModoEntrega;
        }
    }

    let pais = "HND";
    if(localStorage.getItem('empresa')==='IMGT'){
        pais = "GTM"
    }else if (localStorage.getItem('empresa')==='imcr'){
        pais = "CRI";
    }

    const dispatch = useDispatch();
    const impuesto = Number(localStorage.getItem('Impuesto'));
    const lineaSeleccionada = useSelector(e => e.LineaSeleccionada);

    const requiereEntrega = useSelector(e => e.requiereEntrega);
    const empresasTransporte = useSelector(e => e.empresasTransporte);
    const precioCajas = useSelector(e => e.precioCajas);
    const comunidadesAutonomas = useSelector(e => e.comunidadesAutonomas);
    const [transporte, setTransporte] = React.useState(modoEntrega);
    const [comunidad, setComunidad] = React.useState(comunidadSelected);
    const esBiomedico = (lineaSeleccionada.IdLinea === "BIO" && requiereEntrega);
    const Monedas = useSelector(e=>e.AbreviacionMonedas);

    var gruposTalla = Object.keys(props.tableValue);
    var unidadesTotales = 0;
    var totalGlobal = 0.00;

    const moneda = Monedas.find(e=>e.IdMoneda === props.Cliente.Moneda).Abreviacion;
    const calcularFlete = () => {
        if (comunidad === "" || transporte === "") {
            return 0;
        }

        const precioCaja = precioCajas.find(x => x.STATE === comunidad && x.CODE === transporte);
        if (precioCaja === null || precioCaja === undefined) {
            return 0;
        }

        const multiploCaja = empresasTransporte.find(x => x.CODE === transporte);
        if (multiploCaja === null || multiploCaja === undefined || multiploCaja.MULTIPLO === 0) {
            return 0;
        }

        let division = parseFloat(unidadesTotales) / parseFloat(multiploCaja.MULTIPLO);

        if (!(division % 1 === 0)) {
            division += 1;
        }

        let cajas = Math.trunc(division);

        if (cajas === 0) {
            cajas = 1;
        }

        const impuestoLocal = 0.15;

        const valorImpuesto = (cajas * precioCaja.UNITVALUEBOXES) * impuestoLocal;
        const valorFlete = (cajas * precioCaja.UNITVALUEBOXES) + valorImpuesto;

        return valorFlete;
    }

    const closeDialogFirma = () => {
        if (sigPad.isEmpty()) {
            setMostrarFirma(false);
            setFirma(null);
            props.guardarFirma(null);
            setErrorFirma(true);
        }
        else {
            setMostrarFirma(false);
            setFirma(sigPad.getCanvas().toDataURL('image/png'));
            props.guardarFirma(sigPad.getCanvas().toDataURL('image/png'));
            setErrorFirma(false);
        }
    }
    const clearFirma = () => {
        sigPad.clear();
    }

    const ApruebaBio = () => {
        return clienteContado !== null
            && clienteContado.RTN === ''
            && lineaSeleccionada.IdLinea === "BIO"
            && ((totalGlobal + impuesto) + flete) > 10000;
    }

    const correlativoCache = (correlativo) => {
        if (correlativo === "") {
            if (localStorage.getItem("CorrelativoPedido") === undefined || localStorage.getItem("CorrelativoPedido") === null) {
                localStorage.setItem("CorrelativoPedido", localStorage.getItem("CorrelativoPedidoDiario"));
            }
            else {
                let CorrelativoActual = localStorage.getItem("CorrelativoPedido");
                let Iniciales = CorrelativoActual.substring(0, CorrelativoActual.lastIndexOf('-') + 1);
                let NumeroActual = CorrelativoActual.substring(CorrelativoActual.lastIndexOf('-') + 1);
                let NumeroSiguiente = Number(NumeroActual) + 1;
                localStorage.setItem("CorrelativoPedido", Iniciales + NumeroSiguiente);
            }
            localStorage.setItem("CorrelativoPedidoCache", true);
        } else {
            localStorage.setItem("CorrelativoPedidoCache", false);
            localStorage.setItem("CorrelativoPedido", correlativo)
        }
    }

    const Finalizar = async () => {
        props.guardarFecha(FechaEntrega);
        if (ApruebaBio()) {
            setOpenContado(true);
        } else {
            if (!props.loadingRecibo) {
                if (ErrorFecha || ErrorFirma) {

                    var mensajeError = 'Error'
                    if (ErrorFirma) {
                        mensajeError = 'Ingrese Firma';
                    }
                    else if (ErrorFecha) {
                        mensajeError = 'Fecha Entrega no es válida';
                    }

                    Swal.fire({
                        type: 'error',
                        title: 'Error',
                        text: mensajeError,
                    })

                    props.desactivarLoading();
                }
                else {
                    if (props.NumeroOrden) {
                        props.FinalizarPedidoOnline();
                    } else {
                        if ((props.Cliente.FacturacionEntrega !== "No" && props.Cliente.FacturacionEntrega !== "Nunca")) {
                            Swal.fire({
                                title: 'Aviso',
                                text: 'El pedido será subido a AX pero no será autorizado automáticamente, porque el cliente actualmente se encuentra con bloqueo ó  en mora.',
                                type: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Continuar',
                                cancelButtonText: 'Cancelar'
                            }).then(async (result) => {
                                if (result.value) {
                                    const { correlativo } = await props.obtenerUltimoCorrelativo();
                                    correlativoCache(correlativo);
                                    props.enviarPedido(correlativo);
                                }
                            })
                        } else if ((totalGlobal + impuesto) > props.Cliente.CreditoDisponible && TipoCredito.TipoPedido !== 'Contado') {
                            Swal.fire({
                                title: 'Aviso',
                                text: 'El pedido será subido a AX pero no será autorizado automáticamente, porque superó su límite de crédito.',
                                type: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Continuar',
                                cancelButtonText: 'Cancelar'
                            }).then(async (result) => {
                                if (result.value) {
                                    const { correlativo } = await props.obtenerUltimoCorrelativo();
                                    correlativoCache(correlativo);
                                    props.enviarPedido(correlativo);
                                }
                            })
                        }
                        else {
                            const { correlativo } = await props.obtenerUltimoCorrelativo();
                            correlativoCache(correlativo);
                            props.enviarPedido(correlativo);
                        }

                    }
                }
            }
        }
    }

    const cancelarReinicio = e => {
        if (e.which === 116) {
            e.preventDefault();
        }
    }

    React.useEffect(() => {
        window.addEventListener('keydown', cancelarReinicio);
        return () => {
            window.removeEventListener('keydown', cancelarReinicio);
        }
    }, [])

    React.useEffect(() => {
        if (lineaSeleccionada.IdLinea === "BIO" && props.Cliente.Codigo.includes('IMHN')) {
            const valorFlete = calcularFlete();
            setFlete(valorFlete)
            dispatch({ type: 'SET_FLETE', payload: valorFlete });
        }
        // eslint-disable-next-line
    }, [comunidad, transporte]);
    const onChangeDate = (date) => {
        setFechaEntrega(date);
        props.guardarFecha(date);
    }

    const onErrorDate = (date) => {
        //setErrorFecha(true);
    }

    const onAcceptDate = (date) => {
        setErrorFecha(false);
        props.guardarFecha(date);
    }

    const HeadersDetallePedido = [
        {
            name: "Producto",
            label: "Producto",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "Nombre",
            label: "Nombre",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "Cantidad",
            label: "Cantidad",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "Total",
            label: "Total",
            options: {
                filter: true,
                sort: true,
            }
        }
    ];

    var DataDetallePedido = [];
    gruposTalla.forEach((grupoTalla, index) => {
        var productos = Object.keys(props.tableValue[grupoTalla].Productos);
        if (props.tableValue[grupoTalla].Mostrar) {

            productos.forEach((codigoProducto) => {
                var producto = props.tableValue[grupoTalla].Productos[codigoProducto];
                let ColoresProductos = Object.keys(producto.Colores).map((key) => (producto.Colores[key]));
                ColoresProductos.sort((a, b) => a.NombreColor < b.NombreColor ? -1 : 1);

                var precio = producto.Precio.find(precioxProd => {
                    return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
                });
                if (precio === undefined) {
                    precio = {
                        Precio: 0
                    }
                }
                if (producto.Selected) {
                    var totalXProducto = 0;
                    var cantidadTotal = 0;
                    var Datos = [];
                    let TotalPrecio = 0;
                    ColoresProductos.forEach(codigoColor => {
                        var dato = {
                            color: codigoColor.NombreColor,
                            tallasXcolor: [],
                            cantidadTotal: 0,
                            total: 0.00
                        }
                        Object.keys(codigoColor.Tallas).forEach(codigoTalla => {
                            var talla = {
                                codigoTalla: codigoTalla,
                                cantidad: (isNaN(parseInt(codigoColor.Tallas[codigoTalla].Cantidad, 10))) ? 0 : parseInt(codigoColor.Tallas[codigoTalla].Cantidad, 10),
                                precio: numberWithCommas(codigoColor.Tallas[codigoTalla].Precio)
                            }
                            cantidadTotal = parseInt(cantidadTotal, 10) + talla.cantidad;
                            dato.tallasXcolor.push(talla);
                            dato.cantidadTotal += talla.cantidad;
                            dato.total = dato.total + (codigoColor.Tallas[codigoTalla].Precio * talla.cantidad)
                            TotalPrecio+=((codigoColor.Tallas[codigoTalla].Precio * talla.cantidad));
                        });
                        Datos.push(dato);
                    });
                    if (cantidadTotal > 0) {
                        totalXProducto = TotalPrecio;
                        unidadesTotales = unidadesTotales + cantidadTotal;
                        totalGlobal = totalGlobal + totalXProducto;
                        DataDetallePedido.push({
                            Producto: codigoProducto,
                            Nombre: producto.NombreProducto,
                            Cantidad: numberWithCommasNoDec(cantidadTotal),
                            Total: numberWithCommas(totalXProducto),
                            ExpandedRow: {
                                ListaTallas: producto.ListaTallas,
                                Datos: Datos
                            }
                        });

                    }
                }
            });

        }
    }
    );
    const DatatableOptions = {
        filterType: "dropdown",
        responsive: "scrollMaxHeight",
        print: false,
        download: false,
        expandableRows: true,
        expandableRowsOnClick: true,
        selectableRows: 'none',
        renderExpandableRow: (rowData, rowMeta) => {
            const colSpan = rowData.length + 1;
            return (
                <TableRow>
                    <TableCell colSpan={colSpan} >
                        <table className="table table-responsive-xl m-0">
                            <thead>
                                <tr>
                                    <th className={'text-center'}>
                                        Color
                                </th>
                                    {DataDetallePedido[rowMeta.dataIndex].ExpandedRow.ListaTallas.map((talla, index) => {
                                        return (
                                            <th className={'text-center'} key={index}>
                                                {talla.Talla}
                                            </th>
                                        )
                                    })}
                                    <th className={'text-center'}>
                                        Cantidad
                                </th>
                                    <th className={'text-center'}>
                                        Total
                                </th>
                                </tr>
                            </thead>
                            <tbody>
                                {DataDetallePedido[rowMeta.dataIndex].ExpandedRow.Datos.map((dato, index) => {
                                    if (dato.total !== 0) {
                                        return (
                                            <tr key={index}>
                                                <td className={'text-center'}>{dato.color}</td>
                                                {dato.tallasXcolor.map((tallaXColor, index2) => {
                                                    return (<td key={index2}>
                                                        <div className="row">
                                                            <div className="col-12" style={{ fontSize: 11, textAlign: 'center' }}>
                                                                {"Precio : " + tallaXColor.precio}
                                                            </div>
                                                        </div>
                                                        {/* <hr /> */}
                                                        <div style={{ textAlign: 'center' }}><label >{tallaXColor.cantidad}</label></div>

                                                    </td>)
                                                })}
                                                <td className={'text-center'}>
                                                    {dato.cantidadTotal}
                                                </td>
                                                <td className={'text-right'}>
                                                    {numberWithCommas(dato.total)}
                                                </td>
                                            </tr>
                                        )
                                    }
                                    return false;
                                })}



                            </tbody>
                        </table>

                    </TableCell>
                </TableRow>
            );
        },
        textLabels: {
            body: {
                noMatch: "No se han encontrado pedidos",
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
                all: "Click para Todos >",
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
        <Card className={styles.ResumenCard}>
            <CardHeader
                title={
                    <Typography gutterBottom variant="h5" component="h2">
                        {"Resumen Matriz"}
                    </Typography>}
                className={styles.ResumenCardHeader}
            />
            <CardContent >
                <div>
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={"Detalle del Pedido"}
                            data={DataDetallePedido}
                            columns={HeadersDetallePedido}
                            options={DatatableOptions}
                        />
                    </MuiThemeProvider>
                    <div className="row" style={{ paddingTop: '15px' }}>
                        <div className="col-xl-9 col-lg-8 col-md-7 col-12">
                            <div className="row">
                                <div className="col-xl-6 col-lg-7 col-md-12 col-sm-9 p-0">
                                    {
                                        (firma !== null) &&
                                        <div>

                                            <div className="row">
                                                <span>Firma:</span>
                                            </div>
                                            <div className="row">
                                                <img
                                                    alt={"Firma"}
                                                    src={firma}
                                                    onClick={() => setMostrarFirma(true)}
                                                    style={{
                                                        width: '350px',
                                                        height: '200px',
                                                    }} />
                                            </div>

                                        </div>
                                    }

                                    {
                                        (!(firma !== null)) && <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={() => setMostrarFirma(true)}>Firmar</button>
                                    }
                                </div>
                                <div className="col-xl-6 col-lg-5 col-md-12 col-sm-3 py-md-0 pt-sm-0  py-3 p-0">
                                    <DatePicker
                                        autoOk
                                        label="Fecha Entrega"
                                        variant="inline"
                                        format={"DD/MM/YYYY"}
                                        invalidDateMessage={"Fecha no es válida"}
                                        shouldDisableDate={(e)=>(e.day()===0)}
                                        onError={(error) => onErrorDate(error)}
                                        onAccept={(date) => onAcceptDate(date)}
                                        maxDateMessage={(props.coleccion.ColeccionTipo === "F") ? "La fecha es menor que la fecha final de entrega" : "Fecha no es válida"}
                                        minDateMessage={(props.coleccion.ColeccionTipo === "F") ? "La fecha es menor que la fecha inicial de entrega" : "Fecha no es válida"}
                                        value={FechaEntrega}
                                        minDate={fechaMinimaEntrega}
                                        maxDate={(props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaFinal).toDate() : moment('2100-01-01').toDate()}
                                        onChange={(date) => onChangeDate(date)}
                                    />
                                </div>
                                {(esBiomedico && props.Cliente.Codigo.includes('IMHN')) && <>
                                    <div className="col-xl-6 col-lg-5 col-md-12 col-sm-3 py-md-0 pt-sm-0  py-3 p-0">
                                        <Dropdown
                                            placeholder="Seleccione empresa transporte"
                                            fluid
                                            search
                                            selection
                                            onChange={(e, { value }) => {
                                                setTransporte(value);

                                            }}
                                            defaultValue={modoEntrega}
                                            options={empresasTransporte.map(empresa => {
                                                return { key: empresa.CODE, value: empresa.CODE, text: empresa.TXT }
                                            })}
                                            noResultsMessage={"No hay resultados"}
                                            closeOnChange={true}
                                        />
                                    </div>
                                    <div className="col-xl-6 col-lg-5 col-md-12 col-sm-3 py-md-0 pt-sm-0  py-3 p-0">
                                        <Dropdown
                                            placeholder="Seleccione departamento"
                                            fluid
                                            search
                                            selection
                                            onChange={(e, { value }) => {
                                                setComunidad(value);

                                            }}
                                            defaultValue={comunidadSelected}
                                            disabled={habilitado}
                                            options={comunidadesAutonomas.filter(e=>e.COUNTRYREGIONID===pais).map(comunidad => {
                                                return { key: comunidad.STATEID, value: comunidad.STATEID, text: comunidad.NAME }
                                            })}
                                            noResultsMessage={"No hay resultados"}
                                            closeOnChange={true}
                                        />
                                    </div> </>}
                            </div>
                        </div>
                        <div className='col-xl-3 col-lg-4 col-md-5 col-12'>
                            <div className="row">
                                <div className="col-6 text-right">
                                    Unidades:
                            </div>
                                <div className="col-6">
                                    {numberWithCommasNoDec(unidadesTotales)}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 text-right">
                                    Subtotal:
                                </div>
                                <div className="col-6">
                                    {moneda} {numberWithCommas(totalGlobal)}
                                </div>
                            </div>
                            {(lineaSeleccionada.IdLinea === "BIO"
                                && requiereEntrega
                                && props.Cliente.Codigo.includes('IMHN')) && <div className="row">
                                    <div className="col-6 text-right">
                                        Flete:
                                </div>
                                    <div className="col-6">
                                        {moneda} {numberWithCommas(flete)}
                                    </div>
                                </div>}
                            <div className="row">
                                <div className="col-6 text-right">
                                    ISV:
                                </div>
                                <div className="col-6">
                                    {moneda} {numberWithCommas(impuesto)}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 text-right">
                                    Total:
                                </div>
                                <div className="col-6">
                                    {moneda} {numberWithCommas((totalGlobal + impuesto) + flete)}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </CardContent>
            <div className="col-12">
                {(!BloqueoCredito) &&
                    <button disabled={props.loadingRecibo} className="btn btn-secondary float-right mb-3 mx-2" onClick={() => Finalizar()}>
                        {props.loadingRecibo ?
                            <ScaleLoader
                                css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                                size={'20px'}
                                color={'#fff'}
                                loading={props.loadingRecibo} /> : 'Finalizar'
                        }
                    </button>
                }
            </div>

            {esBiomedico && <Dialog
                disableBackdropClick
                scroll={'paper'}
                open={openContado}
                >
                <CancelPresentationIcon onClick={() => { setOpenContado(false) }} />
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Requiere {empresa.FISCAL_DOCUMENT}
                    </div>
                </DialogTitle>
                <DialogContent>

                    <ClienteContado cliente={clienteContado} validacion={true} />

                </DialogContent>
            </Dialog>}

            <Dialog
                open={mostrarFirma}
                onClose={() => setMostrarFirma(false)}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
            >
                <DialogTitle id="scroll-dialog-title">Firma del Cliente</DialogTitle>
                <DialogContent >
                    <div>
                        <SignatureCanvas
                            canvasProps={{ className: styles.sigCanvas }}
                            ref={(ref) => { sigPad = ref }} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMostrarFirma(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={() => clearFirma(false)} color="primary">
                        Limpiar
                    </Button>
                    <Button onClick={() => closeDialogFirma()} color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
            {
            props.mostrarRecibo &&
                props.CargarImpresionPedido({flete,totalGlobal,unidadesTotales,FechaEntrega,firma})
            }
        </Card >
    )

}

const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScrollMaxHeight: {
                maxHeight: 'unset !important',
            }
        },
        // MUIDataTableBodyRow: {
        //     root: {
        //         '&:nth-child(odd)': {
        //             backgroundColor: '#f8f8f8'
        //         }
        //     }
        // },
    }
});

const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const numberWithCommasNoDec = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


export default ResumenPedido;

