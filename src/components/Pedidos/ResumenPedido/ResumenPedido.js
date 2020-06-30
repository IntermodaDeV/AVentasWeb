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
import {useSelector,useDispatch} from 'react-redux';
import { Dropdown } from "semantic-ui-react/";
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import ClienteContado from '../SelectCliente/ClienteContado';

const ResumenPedido = (props) => {
    const [firma, setFirma] = React.useState(null);
    const [mostrarFirma, setMostrarFirma] = React.useState(false);
    const [ErrorFecha, setErrorFecha] = React.useState(false);
    const [ErrorFirma, setErrorFirma] = React.useState(true);
    const [FechaEntrega, setFechaEntrega] = React.useState((props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaInicio).toDate() : moment().toDate());
    var sigPad = {};
    const [flete,setFlete] = React.useState(0);
    const [openContado,setOpenContado] = React.useState(false);
    const clienteContado = useSelector(e=>e.clienteContado);
    const empresas = useSelector(e=>e.Empresas);
    const empresa = empresas.find(x=>x.COMPANY_CODE === localStorage.getItem('empresa').toUpperCase());
    let comunidadSelected = "";
    let modoEntrega = "";
    let habilitado = false;

    if(clienteContado===null)
    {
        if(props.Cliente.ComunidadAutonoma!==""){
            comunidadSelected = props.Cliente.ComunidadAutonoma;
            habilitado = true;
        }

        if(props.Cliente.ModoEntrega!==""){
            modoEntrega = props.Cliente.ModoEntrega;
        }
    }

    console.log(props);

    const dispatch = useDispatch();
    const impuesto = useSelector(e=>e.Impuesto);
    const lineaSeleccionada = useSelector(e=>e.LineaSeleccionada);
    const TipoCredito = useSelector(e=>e.TipoPedido);
    const modoVenta = TipoCredito.TipoPedido === 'Contado'?'Contado':'Credito';
    const requiereEntrega = useSelector(e=>e.requiereEntrega);
    const empresasTransporte = useSelector(e=>e.empresasTransporte);
    const precioCajas = useSelector(e=>e.precioCajas);
    const comunidadesAutonomas = useSelector(e=>e.comunidadesAutonomas);
    const [transporte,setTransporte]= React.useState(modoEntrega);
    const [comunidad,setComunidad] = React.useState(comunidadSelected);
    const esBiomedico = (lineaSeleccionada.IdLinea === "BIO" && requiereEntrega);

    var gruposTalla = Object.keys(props.tableValue);
    var unidadesTotales = 0;
    var totalGlobal = 0.00;
    const componentRef = React.useRef();
    var nuevafecha = new Date();
    var fecha = moment(nuevafecha).toDate();
    var moneda = (props.Cliente != null) ? ((props.Cliente.Moneda !== null && props.Cliente.Moneda !== '') ? props.Cliente.Moneda : 'Lps') : 'Lps';

    const calcularFlete = () => {
        if(comunidad==="" || transporte===""){
            return 0;
        }

        const precioCaja = precioCajas.find(x=>x.STATE===comunidad && x.CODE === transporte);
        if(precioCaja === null || precioCaja === undefined){
            return 0;
        }

        const multiploCaja = empresasTransporte.find(x=>x.CODE === transporte);
        if(multiploCaja === null || multiploCaja === undefined || multiploCaja.MULTIPLO === 0){
            return 0;
        }

        let division = parseFloat(unidadesTotales) / parseFloat(multiploCaja.MULTIPLO);

        if (!(division % 1 === 0))
        {
            division += 1;
        }

        let cajas = Math.trunc(division);

        if(cajas === 0)
        {
            cajas = 1;
        }

        const impuestoLocal = 0.15;

        const valorImpuesto = (cajas*precioCaja.UNITVALUEBOXES) * impuestoLocal;
        const valorFlete    = (cajas*precioCaja.UNITVALUEBOXES) + valorImpuesto;

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
let GrupoTalla = "";
let TotalUnidad = 0;
const IsSame = (GrupoTallaId) => {
    let found = false;
    if(GrupoTalla === ""){
        GrupoTalla = GrupoTallaId;
    }
    else if(GrupoTalla === GrupoTallaId){
        found = true;
    }
    return found;
}

    const ApruebaBio = () =>{
        return clienteContado !== null 
                && clienteContado.RTN === '' 
                && lineaSeleccionada.IdLinea === "BIO" 
                && ((totalGlobal + impuesto)+flete)>10000;
    }

    const Finalizar = () => {
        if(ApruebaBio())
        {
            setOpenContado(true);
        }else{
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
    }

    React.useEffect(()=>{
        if(lineaSeleccionada.IdLinea === "BIO")
        {
            const valorFlete = calcularFlete();
            setFlete(valorFlete)
            dispatch({type:'SET_FLETE',payload:valorFlete});
        }
         // eslint-disable-next-line
    },[comunidad,transporte]);
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

                let ColoresProductos =  Object.keys(producto.Colores).map((key)=>(producto.Colores[key]));
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
    let CantDist = 0;
    const getTableGroup = (productos, tallas, grupoTalla, index) => {
        let grupoTabla = { total: 0, tabla: null };
        let Same = false;
        grupoTabla.tabla = (
            <table className={'table table-responsive-xs'} style={{ marginBottom: '0' }} key={index}>
                <thead>
                    <tr style={{ backgroundColor: '#d9d9d9' }}>
                        <th className={"CodigoHeader"}>

                        </th>
                        {tallas.map((talla, index) => {
                            Same = IsSame(talla.GrupoTallaId);
                            return (
                                <>
                                {
                                   talla.Distribucion.length !== 0  && Same === false &&
                                   talla.Distribucion.map((dist, index3) => {
                                   CantDist += parseInt(dist.Cantidad)
                                      return (
                                      <th key={index}>
                                         {
                                             <div key={index3}>{dist.NombreTalla}</div>
                                         }
                                      </th>
                                      )
                                  })
                               }
                               {
                               talla.Distribucion.length === 0 &&
                               <th className={'text-center'} style={{ minWidth: 42 }} key={index}>
                                    {talla.Talla}
                                </th>
                                }
                              </> 
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

        let ArregloProductos =  Object.keys(producto.Colores).map((key)=>(producto.Colores[key]));
        ArregloProductos.sort((a, b) => a.NombreColor < b.NombreColor ? -1 : 1);
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
                
                {ArregloProductos.map((codigoColor, index2) => {
                    var color = codigoColor;
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
        let Count= 0;
        let arreglo = [];
        let totalcantidad = 0;
        let PrecioDistribucion = 0;
        let TotalXProdDist = 0;
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
                        Count ++;
                        var valorTalla = color.Tallas[codigoTalla];
                        var tallas =  Object.keys(color.Tallas).length;
                        let TotalXTalla = 0;
                        //var backOrder = (valorTalla.Cantidad > valorTalla.Disponible) ? (valorTalla.Cantidad - valorTalla.Disponible) : 0;
                        totalXColor = parseInt(totalXColor, 10) + (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                        colorTabla.total = totalXColor;
                        return (
                            <>
                            {
                                valorTalla.Distribucion.length !== 0 &&
                                valorTalla.Distribucion.map((dist, index4) => {
                                TotalXTalla = dist.Cantidad *  valorTalla.Cantidad;
                                TotalXProdDist += TotalXTalla;
                                TotalUnidad +=  TotalXTalla;
                                let cant = 0;
                                    if(tallas === 1){
                                        totalcantidad = dist.Cantidad *  valorTalla.Cantidad;
                                        PrecioDistribucion = valorTalla.Precio/CantDist
                                    }
                                    else{
                                        if(Count === 1){
                                            arreglo.push({ NombreTalla: dist.NombreTalla, cant : dist.Cantidad *  valorTalla.Cantidad});                          
                                            PrecioDistribucion = PrecioDistribucion === 0? valorTalla.Precio/CantDist : valorTalla.Precio/CantDist;
                                           
                                            return false;
                                        }
                                        else{
                                            const listaTallas = arreglo.filter(x=>x.NombreTalla===dist.NombreTalla);
                                            cant = dist.Cantidad *  valorTalla.Cantidad
                                            totalcantidad = listaTallas[0].cant + cant;
                                        }     
                                    }

                                return(
                                    <td key={index4} style={{ textAlign: "center" }}>
                                    <div className="row">
                                        <div className="col-12 px-0">
                                            <span>{PrecioDistribucion}</span>
                                        </div>
                                        <div className="col-12 px-0">
                                            <span>{totalcantidad}</span>
                                        </div>
                                    </div>
                                </td>
                                )
                                })
                            }
                            {
                                valorTalla.Distribucion.length === 0 && 
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
                            }
                            
                            </>
                        )
                    })
                }
                <td style={{
                    textAlign: 'center',
                    alignItems: 'center',
                    verticalAlign: 'middle',
                    fontWeight: 600,
                }}>{TotalXProdDist !==0 ? TotalXProdDist : totalXColor}</td>

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
                                {esBiomedico && <><div className="col-xl-6 col-lg-5 col-md-12 col-sm-3 py-md-0 pt-sm-0  py-3 p-0">
                                    <Dropdown
                                        placeholder="Seleccione empresa transporte"
                                        fluid
                                        search
                                        selection
                                        onChange={(e, { value }) =>{
                                            setTransporte(value);
                                            
                                        }}
                                        defaultValue={modoEntrega}
                                        options={empresasTransporte.filter(x=>x.ACTIVE).map(empresa => {
                                            return {key:empresa.CODE, value:empresa.CODE,text:empresa.TXT}
                                        })}
                                        noResultsMessage={"No hay resultados"}
                                        closeOnChange={true}
                                    />
                                </div>
                                <div className="col-xl-6 col-lg-5 col-md-12 col-sm-3 py-md-0 pt-sm-0  py-3 p-0">
                                    <Dropdown
                                        placeholder="Seleccione comunidad autonoma"
                                        fluid
                                        search
                                        selection   
                                        onChange={(e, { value }) =>{
                                            setComunidad(value);
                                            
                                        }}
                                        defaultValue={comunidadSelected}
                                        disabled={habilitado}
                                        options={comunidadesAutonomas.map(comunidad => {
                                            return {key:comunidad.STATEID, value:comunidad.STATEID,text:comunidad.NAME}
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
                            {(lineaSeleccionada.IdLinea === "BIO" && requiereEntrega) && <div className="row">
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
                                {moneda} {numberWithCommas((totalGlobal + impuesto)+flete)}
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

            {esBiomedico && <Dialog
            disableBackdropClick 
            scroll={'paper'}
            open={openContado}
            >
                <CancelPresentationIcon onClick={()=>{setOpenContado(false)}}/>
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Requiere {empresa.FISCAL_DOCUMENT}
                    </div>
                </DialogTitle>
                <DialogContent>
                
                    <ClienteContado ruta={props.Cliente.CodigoRuta} cliente={clienteContado}/>
                    
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
                                <p>{empresa.FISCAL_DOCUMENT}: {empresa.NIFCIF}</p>
                            </div>
                        </div>

                        <div id="mid">
                            <div className="row">
                                <div className="col-6">
                                <div className="info">
                                        <h2>{
                                            (clienteContado!==null && clienteContado!==undefined)?((totalGlobal * 1.15)<10000) ? 'Consumidor Final' : clienteContado.Nombre: props.Cliente.Nombre
                                            }</h2>
                                        <p>
                                            Dirección : {(clienteContado!==null && clienteContado!==undefined)? clienteContado.Direccion:props.Cliente.Direccion}<br />
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
                                            Asesor: {localStorage.getItem('asesor')}<br />
                                            Modo Venta: {modoVenta}<br />
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
                                    {TotalUnidad !== 0? TotalUnidad : unidadesTotales}
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

                                { (flete>0) && <div className="row TotalRow">
                                    <div className="col-5 labelTotal text-left">
                                        Flete:
                                    </div>

                                    <div className="col-7 valueTotal">
                                        {numberWithCommas(flete)}
                                    </div>
                                </div>}

                                <div className="row TotalRow">
                                    <div className="col-5 labelTotal text-left">
                                        Impuesto:
                                    </div>

                                    <div className="col-7 valueTotal">
                                    {numberWithCommas((impuesto))}
                                    </div>
                                </div>

                                <div className="row TotalRow">
                                    <div className="col-5 labelTotal text-left">
                                        Total {moneda}:
                                    </div>

                                    <div className="col-7 valueTotal">
                                    {numberWithCommas((totalGlobal + impuesto)+flete)}
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

