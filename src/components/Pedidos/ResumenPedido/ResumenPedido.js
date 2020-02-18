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
import ReactToPrint from 'react-to-print';
import moment from "moment";
import 'moment/locale/es';
import SignatureCanvas from 'react-signature-canvas';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Logo from 'assets/img/logo/Logoinv.png';
import Swal from 'sweetalert2/dist/sweetalert2.js';

const ResumenPedido = (props) => {
    const [firma, setFirma] = React.useState(null);
    const [mostrarFirma, setMostrarFirma] = React.useState(false);
    const [ErrorFecha, setErrorFecha] = React.useState(false);
    const [ErrorFirma, setErrorFirma] = React.useState(true);
    const [FechaEntrega, setFechaEntrega] = React.useState((props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaInicio).toDate() : moment().toDate());
    var sigPad = {};

    var gruposTalla = Object.keys(props.tableValue);
    var unidadesTotales = 0;
    var totalGlobal = 0.00;
    const componentRef = React.useRef();
    var nuevafecha = new Date();
    var fecha = moment(nuevafecha).toDate();
    var moneda = (props.Cliente != null) ? ((props.Cliente.Moneda !== null && props.Cliente.Moneda !== '') ? props.Cliente.Moneda : 'Lps') : 'Lps';

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
    const Finalizar = () => {
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
            }
            else {
                if (props.NumeroOrden) {
                    props.FinalizarPedidoOnline();
                } else {
                    props.enviarPedido();

                }
            }
        }
    }

    const onChangeDate = (date) => {
        setFechaEntrega(date);
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
                    Object.keys(producto.Colores).forEach(codigoColor => {
                        var dato = {
                            color: producto.Colores[codigoColor].NombreColor,
                            tallasXcolor: [],
                            cantidadTotal: 0,
                            total: 0.00
                        }
                        Object.keys(producto.Colores[codigoColor].Tallas).forEach(codigoTalla => {
                            var talla = {
                                codigoTalla: codigoTalla,
                                cantidad: (isNaN(parseInt(producto.Colores[codigoColor].Tallas[codigoTalla].Cantidad, 10))) ? 0 : parseInt(producto.Colores[codigoColor].Tallas[codigoTalla].Cantidad, 10),
                                precio: numberWithCommas(precio.Precio)
                            }
                            cantidadTotal = parseInt(cantidadTotal, 10) + talla.cantidad;
                            dato.tallasXcolor.push(talla);
                            dato.cantidadTotal += talla.cantidad;
                            dato.total = dato.total + (precio.Precio * talla.cantidad)
                        });
                        Datos.push(dato);
                    });
                    if (cantidadTotal > 0) {
                        totalXProducto = precio.Precio * cantidadTotal;
                        unidadesTotales = unidadesTotales + cantidadTotal;
                        totalGlobal = totalGlobal + totalXProducto;

                        DataDetallePedido.push({
                            Producto: codigoProducto,
                            Nombre: producto.NombreProducto,
                            Cantidad: numberWithCommasNoDec(cantidadTotal),
                            Total: numberWithCommas(totalXProducto),
                            ExpandedRow: {
                                ListaTallas: props.tableValue[grupoTalla].ListaTallas,
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
        responsive: "scrollFullHeight",
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

    const getTableGroup = (productos, tallas, grupoTalla, index) => {
        let grupoTabla = { total: 0, tabla: null };

        grupoTabla.tabla = (
            <table className={'table table-responsive-xs'} style={{ marginBottom: '0' }} key={index}>
                <thead>
                    <tr style={{ backgroundColor: '#d9d9d9' }}>
                        <th className={"CodigoHeader"}>

                        </th>
                        {tallas.map((talla, index) => {
                            return (
                                <th className={'text-center'} style={{ minWidth: 42 }} key={index}>
                                    {talla.Talla}
                                </th>
                            )
                        })}
                        <th>Cant</th>
                        <th>Total</th>
                    </tr>
                </thead>
                {productos.map((codigoProducto, index1) => {
                    var producto = props.tableValue[grupoTalla].Productos[codigoProducto];
                    var precio = producto.Precio.find(precioxProd => {
                        return precioxProd.GrupoPrecio === props.Cliente.GrupoPrecio;
                    });

                    if (precio === undefined) {
                        precio = {
                            Precio: 0
                        }
                    }
                    if (producto.Selected) {
                        let result = getTableProduct(producto, index1, codigoProducto, tallas, precio);
                        grupoTabla.total += result.total;
                        if (result.total !== 0) {
                            return result.tabla;
                        }
                    }
                    return false;
                })}
            </table>
        );
        return grupoTabla;
    }

    const getTableProduct = (producto, index1, codigoProducto, tallas, precio) => {
        let productosTabla = { total: 0, tabla: null };

        productosTabla.tabla = (
            <tbody key={index1}>
                <tr className="ColorRow">
                    {/* <td className="codigoProducto font-weight-bold">{codigoProducto}</td>
                    <td colSpan={tallas.length + 2}>
                        {producto.NombreProducto}
                    </td> */}
                    <td colSpan={tallas.length + 3} className="codigoProducto font-weight-bold">
                        {codigoProducto} <span className="font-weight-normal pl-4">{producto.NombreProducto}</span>
                    </td>
                </tr>
                {Object.keys(producto.Colores).map((codigoColor, index2) => {
                    var color = producto.Colores[codigoColor];
                    var totalXColor = 0;

                    let result = getTableColor(color, totalXColor, index2, precio);
                    productosTabla.total += result.total;
                    if (result.total !== 0) {
                        return result.tabla;
                    }
                    return null;
                })}
            </tbody>
        );
        return productosTabla;
    }

    const getTableColor = (color, totalXColor, index2, precio) => {
        let colorTabla = { total: 0, tabla: null };

        colorTabla.tabla = (
            <tr key={index2}>
                <td style={{
                    textAlign: 'center',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    //fontWeight: 600,
                }}>
                    {color.NombreColor}
                </td>
                {
                    Object.keys(color.Tallas).map((codigoTalla, index3) => {
                        var valorTalla = color.Tallas[codigoTalla];
                        console.log('valorTalla :', valorTalla);
                        //var backOrder = (valorTalla.Cantidad > valorTalla.Disponible) ? (valorTalla.Cantidad - valorTalla.Disponible) : 0;
                        totalXColor = parseInt(totalXColor, 10) + (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                        colorTabla.total = totalXColor;
                        return (
                            <td key={index3} style={{ textAlign: "center" }} >
                                <div className="row">
                                    <div className="col-12 px-0">
                                        <span>{valorTalla.Precio}</span>
                                    </div>
                                    <div className="col-12 px-0">

                                        <span>{valorTalla.Cantidad !== "" ? valorTalla.Cantidad : 0}</span>
                                    </div>
                                </div>
                            </td>
                        )
                    })
                }
                <td style={{
                    textAlign: 'center',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 600,
                }}>{totalXColor}</td>

                <td style={{
                    textAlign: 'right',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 600,
                }}>{numberWithCommas(precio.Precio * parseInt(totalXColor, 10))}</td>
            </tr>
        )
        return colorTabla;
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
                                        onError={(error) => onErrorDate(error)}
                                        onAccept={(date) => onAcceptDate(date)}
                                        maxDateMessage={(props.coleccion.ColeccionTipo === "F") ? "La fecha es menor que la fecha final de entrega" : "Fecha no es válida"}
                                        minDateMessage={(props.coleccion.ColeccionTipo === "F") ? "La fecha es menor que la fecha inicial de entrega" : "Fecha no es válida"}
                                        value={FechaEntrega}
                                        minDate={(props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaInicio).toDate() : moment().toDate()}
                                        maxDate={(props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaFinal).toDate() : moment('2100-01-01').toDate()}
                                        onChange={(date) => onChangeDate(date)}
                                    />
                                </div>

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
                            <div className="row">
                                <div className="col-6 text-right">
                                    ISV:
                                </div>
                                <div className="col-6">
                                    {moneda} {numberWithCommas(totalGlobal * 0.15)}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 text-right">
                                    Total:
                                </div>
                                <div className="col-6">
                                    {moneda} {numberWithCommas(totalGlobal * 1.15)}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </CardContent>
            <div className="col-12">

                <button className="btn btn-secondary float-right mb-3 mx-2" onClick={() => Finalizar()}>
                    {props.loadingRecibo ?
                        <ScaleLoader
                            css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                            size={'20px'}
                            color={'#fff'}
                            loading={props.loadingRecibo} /> : 'Finalizar'
                    }
                </button>

            </div>

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


            <Dialog
                open={props.mostrarRecibo}
                onClose={() => console.log("Cerrado")}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
            >
                <DialogTitle id="scroll-dialog-title">Vista Previa Pedido</DialogTitle>
                <DialogContent dividers={true} ref={componentRef} style={{ width: '100%' }}>
                    <div id={"invoice-POS"} style={{ boxShadow: 'unset' }}>

                        <div id="top">
                            <img alt={"Logo"} width={420} style={{ objectFit: 'contain' }} src={Logo} ></img>
                            <div className="info">
                                <p>RTN: 05019995124588</p>
                            </div>
                        </div>

                        <div id="mid">
                            <div className="row">
                                <div className="col-6">
                                    <div className="info">
                                        <h2>{props.Cliente.Nombre}</h2>
                                        <p>
                                            Dirección : {props.Cliente.Direccion}<br />
                                            Código    : {props.Cliente.Codigo}<br />
                                        </p>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="info">
                                        <h2>Pedido {props.NumeroOrden}</h2>
                                        <p>
                                            Fecha del pedido : {moment(fecha).format('DD/MM/YYYY hh:mm a')}<br />
                                            Entrega Sugerida : {moment(FechaEntrega).format('DD/MM/YYYY hh:mm a')}<br />
                                            Asesor: {'hbenitez'}<br />
                                        </p>
                                    </div>
                                </div >
                            </div>

                        </div>

                        {
                            gruposTalla.map((grupoTalla, index) => {

                                var productos = Object.keys(props.tableValue[grupoTalla].Productos);
                                var tallas = props.tableValue[grupoTalla].ListaTallas;
                                if (props.tableValue[grupoTalla].Mostrar) {
                                    let result = getTableGroup(productos, tallas, grupoTalla, index);

                                    if (result.total) {
                                        return result.tabla;
                                    }
                                }
                                return false;
                            })
                        }
                        <div className="row" style={{ maxWidth: '100%' }}>

                            <div className="col-6">
                                <div className="thanks">
                                    {
                                        firma === null ?
                                            <div style={{ width: '100%', height: '160px', }}></div> :
                                            <img src={firma} alt={"Firma"} data-holder-rendered="true" />
                                    }

                                </div>

                                <div className={'firma'}>
                                    <span className="signature">
                                        Firma
                                    </span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="row">
                                    <div className="col-5 labelTotal text-left">
                                        Unidades:
                                    </div>

                                    <div className="col-7 valueTotal">
                                        {unidadesTotales}
                                    </div>
                                </div>

                                <div className="row TotalRow">
                                    <div className="col-5 labelTotal text-left">
                                        Subtotal:
                                    </div>

                                    <div className="col-7 valueTotal">
                                        {numberWithCommas(totalGlobal)}
                                    </div>
                                </div>

                                <div className="row TotalRow">
                                    <div className="col-5 labelTotal text-left">
                                        Impuesto:
                                    </div>

                                    <div className="col-7 valueTotal">
                                        {numberWithCommas((totalGlobal * 0.15))}
                                    </div>
                                </div>

                                <div className="row TotalRow">
                                    <div className="col-5 labelTotal text-left">
                                        Total {moneda}:
                                    </div>

                                    <div className="col-7 valueTotal">
                                        {numberWithCommas((totalGlobal * 1.15))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="notices">
                            <div>NOTA:</div>
                            <div className="notice">Se notificará cuando ya se entreguen los productos en la fecha sugerida indicada.</div>
                        </div>

                        <div id="legalcopy">
                            <p className="legal"><br /><strong>Gracias!</strong>
                            </p>
                        </div> */}

                    </div>
                </DialogContent >
                <DialogActions>
                    <ReactToPrint
                        trigger={() =>
                            <Button color="primary">
                                Imprimir
                            </Button>
                        }
                        content={() => componentRef.current}
                    />
                    <Button onClick={() => props.reiniciarPedido()} color="primary">
                        Realizar Pedido Nuevo
                    </Button>
                    <Button onClick={() => props.cancelarPedido()} color="primary">
                        Finalizar
                    </Button>
                </DialogActions>
            </Dialog >

        </Card >
    )

}

const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScroll: {
                maxHeight: "67vh"
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

