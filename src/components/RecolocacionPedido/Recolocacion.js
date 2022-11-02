import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
} from '@material-ui/core';
import axios from 'axios';
import moment from "moment";
import 'moment/locale/es';
import { APIURL } from 'utils/Enviroment';
import { mostrarModal } from 'utils/common';
import { Dropdown } from "semantic-ui-react";
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { DatePicker } from "@material-ui/pickers";
import { Loading } from 'components/Global/Loading';
import SignatureCanvas from 'react-signature-canvas';
import { useSelector, useDispatch } from 'react-redux';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { ExpandableRecolocacion } from './ExpandableRecolocacion';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumenExpandable.module.css';
import { ObtenerCoordenadas } from 'utils/common';
import { verificarConexion } from 'utils/http';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { post, postPedidoStorage } from 'utils/http';

export const Recolocacion = (props) => {
    let fechaInicioEntrega = moment().toDate();
    let fechaMinimaEntrega = moment().toDate();

    const [firma, setFirma] = useState(null);
    const [rma, setRma] = useState("");
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [ErrorFirma, setErrorFirma] = useState(true);
    const [mostrarFirma, setMostrarFirma] = useState(false);
    const [ErrorFecha, setErrorFecha] = useState(false);
    const [FechaEntrega, setFechaEntrega] = useState(fechaInicioEntrega);
    const [loading, setLoading] = useState(false);

    const Monedas = useSelector(e => e.AbreviacionMonedas);
    const ColeccionRecolocacion = useSelector(e => e.TrasladoPedido.coleccion);
    const clienteImpuestos = useSelector(e => e.TrasladoPedido.ClienteImpuestosRecolocacion);
    let tableValue = useSelector(e => e.TrasladoPedido.TableValue);
    const productoImpuestos = useSelector(e => e.TrasladoPedido.ProductoImpuestosRecolocacion);
    const clienteSeleccionado = useSelector(e => e.TrasladoPedido.clienteSeleccionado);
    const tiposPedido = useSelector(e => e.TiposPedido);
    const bodegaMaestro = useSelector(e => e.MaestroBodegaAlmacenes);
    const tipoCredito = useSelector(e => e.TrasladoPedido.tipoCreditoRecolocacion);
    const dispatch = useDispatch();

    let unidadesTotales = 0;
    let totalCant = 0;
    let totalGlobal = 0.00;
    let impuesto = 0;
    let productosSinCantidad = false;
    let sigPad = {};

    const bodega = bodegaMaestro.find(x => x.BodegaPrincipal === true && x.Estatus === true);
    const clienteImpuesto = clienteImpuestos.find(x => x.GRUPO === clienteSeleccionado.GrupoImpuesto);
    const moneda = Monedas.find(e => e.IdMoneda === clienteSeleccionado.Moneda).Abreviacion;

    const tipoCreditoRecolocacion = (tcredit) => {
        dispatch({ type: "SET_TIPOCREDITORECOLOCACION", payload: tcredit });
    }

    const numberWithCommasNoDec = (x) => {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    const numberWithCommas = (x) => {
        x = x.toFixed(2);
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    const onAcceptDate = (date) => {
        setErrorFecha(false);
        props.guardarFecha(date);
    }

    const onChangeDate = (date) => {
        setFechaEntrega(date);
        props.guardarFecha(date);
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
            //props.guardarFirma(sigPad.getCanvas().toDataURL('image/png'));
            setErrorFirma(false);
        }
    }
    const clearFirma = () => {
        sigPad.clear();
    }

    const obtenerProductoRma = async () => {
        try {
            if (rma != "") {
                setTitle("Obteniendo productos de la devolución");
                setOpen(true);
                const grupoPrecio = clienteSeleccionado.GrupoPrecio;
                const data = await axios.get(`${APIURL}/api/trasladopedido/obtenerproductos/${rma}/${clienteSeleccionado.EmpresaId}`);
                const coleccion = await axios.get(`${APIURL}/api/trasladopedido/getcoleccioneById/${data.data.coleccionId}`);
                dispatch({ type: "SET_COLECCIONRECOLOCACION", payload: coleccion.data });

                let codigoProductos = [...new Set(data.data.productos.map(x => x.codigoProducto))];
                let productosResult = [];

                for (let codigo of codigoProductos) {
                    let products = data.data.productos.filter(x => x.codigoProducto === codigo);
                    let colores = [...new Set(products.map(x => x.color))];
                    let tallas = [...new Set(products.map(x => x.talla))];
                    let nuevosProductos = await axios.get(`${APIURL}/api/trasladopedido/getProducto/${codigo}/${grupoPrecio}/${data.data.coleccionId}`, { params: { colores, tallas } });
                    productosResult.push(nuevosProductos.data)
                }

                agregarDevolucionCompleta(productosResult, data.data);

                setOpen(false);
            }
            else {
                mostrarModal('Recolocación', 'Debe llenar el campo del RMA para poder realizar esta acción.', "error");
            }
        } catch {

        }
    }

    const dataTipoCredito = () => {
        return tiposPedido.filter(x => x.Aplica_Todos).map(tipoPedido => ({ key: tipoPedido.TipoPedido, value: tipoPedido.TipoPedido, text: tipoPedido.TipoPedido }));
    }

    const agregarDevolucionCompleta = (productos, productosAPI) => {
        let miTableValue = {};
        const productosDevolver = productosAPI.productos;
        for (const producto of productos) {

            const productoDevolver = productosDevolver.filter(x => x.codigoProducto === producto.ProductoId);

            if (miTableValue[producto.GrupoTalla] === undefined) {
                miTableValue[producto.GrupoTalla] = {};
            }

            if (Object.keys(miTableValue[producto.GrupoTalla]).length === 0) {
                miTableValue[producto.GrupoTalla] = {};
                miTableValue[producto.GrupoTalla].Productos = {};
                miTableValue[producto.GrupoTalla].ListaTallas = producto.ListaTalla;
            }

            if (miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId] === undefined) {
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId] = {};
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Id = producto.CodigoProducto;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores = {};
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].ListaTallas = producto.ListaTalla
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].NombreProducto = producto.NombreProducto;
                miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].GrupoImpuesto = producto.GrupoImpuesto;

                for (const color of producto.ListaColores) {
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor] = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].NombreColor = color.NombreColor;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Color = color.Color;
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas = {}
                    miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].CodigoColor = color.CodigoColor;

                    for (const talla of producto.ListaTalla) {
                        let precio = 100;
                        const productoValores = productoDevolver.find(x => x.color === color.CodigoColor && x.talla.toUpperCase() === talla.Talla);

                        if (producto.fisicaDisponible.length !== 0) {
                            if (productoValores) {
                                const fisicoDisponible = producto.fisicaDisponible.find(x => x.IdTalla.toUpperCase() === productoValores.talla.toUpperCase() && productoValores.color.toUpperCase() === x.CodigoColor.toUpperCase());
                                if (fisicoDisponible) {

                                }
                            }

                        }

                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla] = {}
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Disponible = productoValores ? productoValores.cantidad : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Cantidad = productoValores ? productoValores.cantidad : 0;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Precio = precio;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].PrecioGeneral = precio;
                        miTableValue[producto.GrupoTalla]["Productos"][producto.ProductoId].Colores[color.CodigoColor].Tallas[talla.Talla].Talla = talla.Talla;
                    }
                }
            }
        }

        dispatch({ type: "SET_TABLEVALUERECOLOCACION", payload: miTableValue });
    }

    const calcularTipoVenta = () => {
        let isMora = !(clienteSeleccionado.FacturacionEntrega === 'No' || clienteSeleccionado.FacturacionEntrega === 'Nunca');
        if (isMora) {
            return 0;
        }
        if (ColeccionRecolocacion.coleccionTipo === 'B') {
            if (clienteSeleccionado.CuentaCorriente === null || clienteSeleccionado.CuentaCorriente.length === 0) {
                return 0;
            }
        }
        return 3;
    }

    useEffect(() => {
        const obtenerUltimoCorrelativo = async () => {
            try {
                const request = await axios.get(`${APIURL}/api/PedidosXCliente/correlativo/${localStorage.getItem('empresa')}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });
                localStorage.setItem("CorrelativoPedido", request.data)
            }
            catch (error) {
                console.log(error);
            }
        }

        obtenerUltimoCorrelativo();
    }, []);

    const recolocarPedido = () => {
        ObtenerCoordenadas((position) => {
            enviarRecolocacion({
                longitude: position.coords.longitude,
                latitude: position.coords.latitude
            })
        }, (error) => {
            enviarRecolocacion(null);
        });
    }

    const enviarRecolocacion = async (location) => {

        if (firma === null || firma === "") {
            Swal.fire({
                type: 'warning',
                title: 'Advertencia',
                text: "Por favor ingrese la firma.",
            });
        } else {
            setLoading(true);

            let nuevoSubtotal = clienteSeleccionado.IncluyeImpuesto ? totalGlobal - Number(localStorage.getItem('Impuesto')) : totalGlobal;
            let pedido = {
                NumeroReferencia: localStorage.getItem("CorrelativoPedido"),
                PedidoCache: localStorage.getItem("isOffline"),
                PedidoId: 100 + (Math.random() * (10000 - 100)),
                CodigoCliente: clienteSeleccionado.Codigo,
                Nombre: clienteSeleccionado.Nombre,
                Firma: firma,
                FechaEntrega: FechaEntrega,
                AcuerdoVenta: null,
                location: location,
                EmpresaUsuario: localStorage.getItem('empresa'),
                Linea: ColeccionRecolocacion.linea,
                CodigoColeccion: ColeccionRecolocacion.codigoColeccion,
                DetallePedido: [],
                TipoPedido: tipoCredito,
                TipoVenta: calcularTipoVenta(),
                ClienteContadoId: null,
                ModoVenta: (tipoCredito === 'Contado') ? 'Contado' : 'Credito',
                Flete: 0,
                RequiereEntrega: false,
                Impuesto: Number(localStorage.getItem('Impuesto')),
                subtotal: nuevoSubtotal,
                Direccion: clienteSeleccionado.Direccion,
                MonedaCliente: clienteSeleccionado.Moneda,
                BodegaEspecifica: false,
                Sitio: bodega.CodigoSitio,
                Almacen: bodega.Almacen
            };

            Object.keys(tableValue).map((grupoTalla, index) => {
                let productos = Object.keys(tableValue[grupoTalla].Productos);
                return productos.map((codigoProducto, index1) => {
                    let producto = tableValue[grupoTalla].Productos[codigoProducto];

                    Object.keys(producto.Colores).forEach((codigoColor) => {
                        let color = producto.Colores[codigoColor];
                        Object.keys(color.Tallas).forEach((codigoTalla) => {
                            let valorTalla = color.Tallas[codigoTalla];

                            let precio = { Precio: (valorTalla.Precio ? valorTalla.Precio : 0) };
                            let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));

                            let detalle = {
                                IdProducto: producto.Id,
                                CodigoProducto: codigoProducto,
                                NombreProducto: producto.NombreProducto,
                                CodigoColor: color.CodigoColor,
                                NombreColor: color.NombreColor,
                                Cantidad: cantidadXTalla,
                                Unidad: "Und",
                                PrecioUnitario: precio.Precio,
                                Talla: valorTalla.Talla,
                                CodigoColeccion: ColeccionRecolocacion.codigoColeccion,
                                PorcentajeDescuento: "",
                            }

                            pedido.DetallePedido.push(detalle);
                        });
                    });

                })
            })
            
            const isOnline = await verificarConexion();
            if (!isOnline || localStorage.getItem("Conexion") === "offline" || pedido.NumeroReferencia === "") {
                Swal.fire({
                    type: 'warning',
                    title: 'Advertencia',
                    text: "Actualmente no dispone de internet el pedido se guardara en cache.",
                });

                postPedidoStorage(pedido);
                setLoading(false);
            } else {
                const { data, error } = await post(APIURL + "/api/PedidosXCliente", pedido, "SET_PEDIDOSINCRONIZAR");
                console.log(data)
                if (error) {
                    if (error.response) {
                        let mensaje = error.response.data.Message;
                        Swal.fire({
                            type: 'error',
                            title: 'Error',
                            text: mensaje,
                        })
                        this.setState({ loadingRecibo: false });
                    }

                    setLoading(false);
                } else {
                    if (!data) {
                        Swal.fire({
                            type: 'warning',
                            title: 'Advertencia',
                            text: "Actualmente no dispone de internet el pedido se guardara en cache.",
                        });

                        postPedidoStorage(pedido);
                        setLoading(false);
                        return;
                    }

                    const { mensaje } = data;
                    if (mensaje) {
                        if (mensaje.includes("flotante")) {
                            Swal.fire({
                                type: 'warning',
                                title: 'Advertencia',
                                text: mensaje,
                            })
                        }

                        if (mensaje.includes("exito")) {
                            Swal.fire({
                                type: 'success',
                                title: 'Exito',
                                text: mensaje,
                            })
                        }

                        setLoading(false);
                    }
                    else {
                        Swal.fire({
                            type: 'warning',
                            title: 'Advertencia',
                            text: "Actualmente no dispone de internet el pedido se guardara en cache.",
                        });
                        setLoading(false);
                    }
                }
            }
        }
    }


    const obtenerTotales = producto => {
        let totales = { totalCantidad: 0 };

        Object.keys(producto.Colores).forEach((codigoColor) => {
            let color = producto.Colores[codigoColor];
            var totalXColor = 0;

            Object.keys(color.Tallas).forEach((codigoTalla) => {
                var valorTalla = color.Tallas[codigoTalla];
                totalXColor = parseInt(totalXColor, 10) + (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
            })
            totales.totalCantidad += totalXColor;
        })
        return totales;
    }

    return (
        <>
            <Loading open={open} title={title} />
            <Card className="my-2" style={{ overflow: 'unset', margin: '15px' }}>
                <CardContent>
                    <div>
                        <h3 style={{ marginLeft: 30 }}>Recolocación de devolución</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', marginTop: 40 }}>
                            <div style={{ display: 'flex', width: '80%', marginLeft: 30 }}>
                                <input type="text" className="mr-5 form-control" placeholder="RMA Devolución" onChange={(e) => { setRma(e.target.value) }} />
                            </div>
                            <hr />
                            <div style={{ display: 'flex', width: '40%', marginRight: 30 }}>
                                <Dropdown
                                    placeholder="Seleccione Tipo de Crédito"
                                    fluid
                                    search
                                    selection
                                    onChange={(e, { value }) => { tipoCreditoRecolocacion(value) }}
                                    options={dataTipoCredito()}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 999 }}
                                    multiple={false}
                                />
                            </div>

                            <button className="btn btn-success" onClick={obtenerProductoRma}>Registrar</button>
                        </div>
                    </div>
                    {(Object.keys(tableValue).length > 0) &&
                        <>
                            <hr />
                            {moment(new Date(ColeccionRecolocacion.ventaFinal)).isBefore(moment(new Date())) && <h3 style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>La venta final del paquete {ColeccionRecolocacion.codigoColeccion} fue {moment(new Date(ColeccionRecolocacion.ventaFinal)).format("DD/MM/YYYY")}</h3>}
                            <hr />
                            <form>
                                {Object.keys(tableValue).map((grupoTalla, index) => {
                                    let productos = Object.keys(tableValue[grupoTalla].Productos);
                                    return productos.map((codigoProducto, index1) => {
                                        let producto = tableValue[grupoTalla].Productos[codigoProducto];
                                        let tallas = tableValue[grupoTalla].Productos[codigoProducto].ListaTallas;
                                        const productoImpuesto = productoImpuestos.find(x => x.GRUPO === producto.GrupoImpuesto).IMPUESTO;
                                        let productoConCantidad = false;
                                        let { totalCantidad } = obtenerTotales(producto);
                                        totalCant += totalCantidad;

                                        Object.keys(producto.Colores).forEach((codigoColor) => {
                                            let color = producto.Colores[codigoColor];
                                            Object.keys(color.Tallas).forEach((codigoTalla) => {
                                                let valorTalla = color.Tallas[codigoTalla];
                                                let precio = { Precio: (valorTalla.Precio ? valorTalla.Precio : 0) };
                                                let cantidadXTalla = (isNaN(parseInt(valorTalla.Cantidad, 10)) ? 0 : parseInt(valorTalla.Cantidad, 10));
                                                productoConCantidad = productoConCantidad || (cantidadXTalla > 0);
                                                unidadesTotales = parseInt(unidadesTotales, 10) + cantidadXTalla;
                                                totalGlobal = (precio.Precio * cantidadXTalla) + totalGlobal;
                                                if (clienteImpuesto.IMPUESTO !== 0) {
                                                    if (clienteSeleccionado.IncluyeImpuesto) {
                                                        let nuevoImpuesto = ((precio.Precio * cantidadXTalla) * productoImpuesto);
                                                        totalGlobal -= nuevoImpuesto;
                                                        impuesto = nuevoImpuesto + impuesto;
                                                        localStorage.setItem('Impuesto', impuesto);
                                                    } else {
                                                        impuesto = ((precio.Precio * cantidadXTalla) * productoImpuesto) + impuesto;
                                                        localStorage.setItem('Impuesto', impuesto);
                                                    }
                                                }
                                            });
                                        });

                                        productosSinCantidad = productosSinCantidad || (!productoConCantidad);

                                        return (
                                            <ExpandableRecolocacion
                                                key={codigoProducto}
                                                grupoTalla={grupoTalla}
                                                producto={producto}
                                                codigoProducto={codigoProducto}
                                                tallas={tallas}
                                                totalCantidad={totalCantidad}
                                            />
                                        )

                                    })
                                })}
                            </form>
                            <div>

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
                                                    shouldDisableDate={(e) => (e.day() === 0)}
                                                    onAccept={(date) => onAcceptDate(date)}
                                                    value={FechaEntrega}
                                                    minDate={fechaMinimaEntrega}
                                                    maxDate={moment('2100-01-01').toDate()}
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
                                                {numberWithCommasNoDec(totalCant)}
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
                                                {moneda} {numberWithCommas(impuesto)}
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6 text-right">
                                                Total:
                                            </div>
                                            <div className="col-6">
                                                {moneda} {numberWithCommas(totalGlobal + impuesto)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div className={`row text-center ${styles['barra']}`} />
                            <button disabled={loading} onClick={recolocarPedido} className="btn btn-secondary" style={{ marginTop: 22, float: 'right', marginBottom: 10, }}>Finalizar recolocación</button>

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
                        </>
                    }
                </CardContent>
            </Card>
        </>
    );
}