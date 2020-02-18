import React, { useState } from 'react';
import styles from 'components/ListadoPedidos/DetallePedido.module.css';
// import PopupState, { bindToggle, bindPopper } from 'material-ui-popup-state';
import GoogleMapReact from 'google-map-react';
import { FaArrowLeft } from "react-icons/fa";
import {
    Fab,
    // Grow,
    // Card,
    // CardMedia,
    // CardContent,
    // Paper,
    // Popper,
    // Typography,
} from "@material-ui/core";
import moment from "moment";
import 'moment/locale/es'
moment.locale('es');

const DetallePedido = (props) => {

    const [maps, setMaps] = useState({ map: null, maps: null })

    const TotalPedido = () => {
        var total = 0;
        props.pedido.DetallesXPedido.forEach(detallePedido => {
            if (isNaN(detallePedido.MontoLinea)) {
                total += detallePedido.MontoLinea;
            }
        });
        return total;
    }

    const renderMarkers = () => {
        let cliente = { latitud: 0, longitud: 0 };

        let clienteUbicacion = props.clientes.some(clien => {

            if (clien.Codigo === props.pedido.CodigoCliente) {
                cliente.latitud = clien.Latitud;
                cliente.longitud = clien.Longitud;
                return true
            }
            return false;
        })

        if (clienteUbicacion) {
            addMarker(props.pedido.Cliente.Nombre, { lat: cliente.latitud, lng: cliente.longitud }, "blue", '')
        }

        addMarker(props.pedido.PedidoId, { lat: props.pedido.location.latitude, lng: props.pedido.location.longitude }, "red", '')


    }

    const addMarker = (title, latLng, color, pinText) => {
        let map = maps.map;
        //https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_[color][character].png
        //color	red, black, blue, green, grey, orange, purple, white, yellow
        //character	A-Z, 1-100, !, @, $, +, -, =, (%23 = #), (%25 = %), (%26 = &), (blank = •)
        let url = `https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_${color}${pinText}.png`;

        let infowindow = new maps.maps.InfoWindow({
            content: title,
        });
        let marker = new maps.maps.Marker({
            position: latLng,
            map: map,
            icon: {
                url: url,
            },
            title: title,
        });
        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });
        map.addListener('click', function () {
            infowindow.close();
        });
    }

    const setMapsApi = (map, maps) => {
        setMaps({ map: map, maps: maps });
    }

    if (maps.map !== null) {
        renderMarkers();
    }
    console.log('object :', props);
    return (
        <div className="px-3">
            <div>
                <Fab size="small" color="default" onClick={() => props.RegresarListaPedidos()} className={"mx-1"} style={{ transform: 'scale(0.8)' }}>
                    <FaArrowLeft size={"15px"} />
                </Fab>
                <h3 className="m-auto" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    {props.pedido.PedidoId}
                </h3>
                <hr />
            </div>

            <div className="px-3">
                <div className="row">
                    <div className="col-md-6 col-12 my-md-0 mb-3 p-0 pr-md-2">

                        <h5 className={"font-weight-light"}>
                            Ubicación:
                                    </h5>
                        {
                            props.pedido.location ?
                                <div style={{ height: '300px', width: '100%' }}>
                                    <GoogleMapReact
                                        bootstrapURLKeys={{ key: "AIzaSyBFVcn8D5GEMWbyhrx2C9pmdO70tiZ2oN8" }}
                                        defaultCenter={
                                            {
                                                lat: props.pedido.location.latitude,
                                                lng: props.pedido.location.longitude
                                            }
                                        }
                                        center={{
                                            lat: props.pedido.location.latitude,
                                            lng: props.pedido.location.longitude
                                        }}
                                        defaultZoom={16}
                                        onGoogleApiLoaded={({ map, maps }) => { setMapsApi(map, maps) }}
                                        yesIWantToUseGoogleMapApiInternals={true}
                                    >
                                    </GoogleMapReact>

                                </div>
                                :
                                <div>
                                    Ubicación no disponible
                                        </div>
                        }

                    </div>
                    <div className="col-md-6 col-12 p-0 pl-md-2">
                        <h5 className={"font-weight-light"}>
                            Información:
                                    </h5>
                        <table className="table table-xl-responsive table-striped" style={{ border: 'none' }}>
                            <tbody>
                                <tr>


                                    <td className={styles.InfoLabel}>
                                        {'Codigo de cliente: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.pedido.Cliente.Codigo}
                                    </td>
                                </tr>
                                <tr>


                                    <td className={styles.InfoLabel}>
                                        {'Nombre del cliente: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.pedido.Cliente.Nombre}
                                    </td>
                                </tr>
                                <tr>


                                    <td className={styles.InfoLabel}>
                                        {'EmpresaId: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.pedido.EmpresaId}
                                    </td>
                                </tr>
                                <tr>


                                    <td className={styles.InfoLabel}>
                                        {'Acuerdo de Venta: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.pedido.AcuerdoVenta}
                                    </td>
                                </tr>
                                <tr>


                                    <td className={styles.InfoLabel}>
                                        {'Fecha: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {moment(props.pedido.FechaActual).format('DD/MM/YYYY') !== "Invalid date" ? moment(props.pedido.FechaActual).format('DD/MM/YYYY') : ""}
                                    </td>
                                </tr>
                                <tr>

                                    <td className={styles.InfoLabel}>
                                        {'Fecha Entrega: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {moment(props.pedido.FechaEntrega).format('DD/MM/YYYY') !== "Invalid date" ? moment(props.pedido.FechaEntrega).format('DD/MM/YYYY') : ""}
                                    </td>
                                </tr>
                                <tr>

                                    <td className={styles.InfoLabel}>
                                        {'Observación: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.pedido.Observacion}
                                    </td>
                                </tr>
                                <tr>

                                    <td className={styles.InfoLabel}>
                                        Total Unidades:
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.pedido.TotalUnidades}
                                    </td>
                                </tr>
                                <tr>

                                    <td className={styles.InfoLabel}>
                                        Total {props.pedido.Cliente.Moneda}:
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {numberWithCommas((props.pedido.TotalXPedido))}
                                    </td>
                                </tr>
                                {
                                    (props.pedido.Firma !== "") &&
                                    <tr>

                                        <td className={styles.InfoLabel}>
                                            {'Firma: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            <img style={{ width: 150, height: "auto" }} alt={"Firma"} src={props.pedido.Firma}></img>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="w-100 mw-100 overflow-auto">
                    {props.pedido.gruposXDetPed.map((grupoTalla, index1) => {
                        let cantidad = 3;
                        return (
                            <table className={'table table-bordered table-xl-responsive'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index1}>
                                <thead>
                                    <tr className={styles.TrTest}>
                                        <th className={styles.ThTest}>

                                        </th>
                                        {grupoTalla.ListaTalla.map((talla, index2) => {
                                            cantidad++;
                                            return (
                                                <th className={styles.ThTest} key={index2}>
                                                    {talla.Talla}
                                                </th>
                                            )
                                        })}
                                        <th className={styles.ThTest} >Cantidad</th>
                                        <th className={styles.ThTest} >Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupoTalla.prodsXDetPed.map((producto, index2) => {
                                        return (
                                            <React.Fragment key={index2} >
                                                <tr className={styles["tbody"]}>
                                                    <td className="p-1" colSpan={grupoTalla.ListaTalla.length + 3} >
                                                        <div className="row">

                                                            <div variant="contained">
                                                                <div className="row">
                                                                    <div className="pl-1 pr-3">
                                                                        {producto.CodigoProducto}
                                                                    </div>
                                                                    <div>{producto.NombreProducto}</div>
                                                                </div>
                                                            </div>

                                                            {/* <PopupState variant="popper" popupId={producto.NombreProducto + index2}>
                                                                {popupState => (
                                                                    <>
                                                                        <div variant="contained" {...bindToggle(popupState)}>
                                                                            <div className="row">
                                                                                <div className="pl-1 pr-3">
                                                                                    {producto.CodigoProducto}
                                                                                </div>
                                                                                <div>{producto.NombreProducto}</div>
                                                                            </div>
                                                                        </div>
                                                                        <Popper {...bindPopper(popupState)}
                                                                            transition
                                                                            placement="top"
                                                                            modifiers={{
                                                                                flip: {
                                                                                    enabled: true
                                                                                },
                                                                                preventOverflow: {
                                                                                    enabled: true,
                                                                                    boundariesElement: "scrollParent"
                                                                                },
                                                                                arrow: {
                                                                                    enabled: true
                                                                                }
                                                                            }}>
                                                                            {({ TransitionProps }) => (
                                                                                <Grow {...TransitionProps} timeout={350}>
                                                                                    <Paper>
                                                                                        <Card style={{ display: 'flex', }}>
                                                                                            <CardMedia
                                                                                                style={{ backgroundSize: 'contain', width: '100px' }}
                                                                                                image={producto.Imagen ? producto.Imagen : "http://www.quesoselllanojaral.com/img/nodisponible.png"}
                                                                                                title={producto.NombreProducto}
                                                                                            />
                                                                                            <CardContent>
                                                                                                <Typography component="h5" variant="h5">
                                                                                                    {producto.NombreProducto}
                                                                                                </Typography>
                                                                                                <Typography variant="subtitle1" color="textSecondary">
                                                                                                    {producto.CodigoProducto}
                                                                                                </Typography>
                                                                                            </CardContent>
                                                                                        </Card>
                                                                                    </Paper>
                                                                                </Grow>
                                                                            )}
                                                                        </Popper>
                                                                    </>
                                                                )}
                                                            </PopupState> */}
                                                        </div>

                                                    </td>
                                                </tr>
                                                {producto.coloresXProdXDetPed.map((color, index3) => {
                                                    let detalles = Array(grupoTalla.ListaTalla.length).fill(null);
                                                    color.DetallesXPedido.forEach(detalleXPedido => {
                                                        detalles[grupoTalla.ListaTalla.findIndex(tall => tall.Talla === detalleXPedido.Talla)] = detalleXPedido;
                                                    });

                                                    let cellSize = 100 / cantidad;
                                                    return (
                                                        <tr key={index3}>
                                                            <td className="p-1" style={{
                                                                textAlign: 'center',
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle',
                                                                fontWeight: 600,
                                                                width: `${cellSize}%`,
                                                            }}>
                                                                {color.NombreColor}
                                                            </td>
                                                            {detalles.map((det, index4) => {
                                                                return (
                                                                    <td key={index4} className="p-1 text-center" style={{ width: `${cellSize}%` }}>
                                                                        <label>{det ? det.Cantidad : 0}</label>
                                                                    </td>
                                                                )
                                                            })}
                                                            <td className="p-1" style={{
                                                                textAlign: 'center',
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle',
                                                                fontWeight: 600,
                                                                width: `${cellSize}%`,
                                                            }}>{color.CantidadXColor}</td>

                                                            <td className="p-1" style={{
                                                                textAlign: 'right',
                                                                alignItems: 'center',
                                                                verticalAlign: 'middle',
                                                                fontWeight: 600,
                                                                width: `${cellSize}%`,
                                                            }}>{numberWithCommas(color.TotalXColor)}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </React.Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )
                    })}
                </div>
                {/* {
                    props.pedido &&
                    <div className="row" style={{ maxWidth: '100%' }}>

                        <div className="col-6">
                            <div className="thanks">
                                {
                                    props.pedido.Firma === null ?
                                        <div style={{ width: '100%', height: '160px', }}></div> :
                                        <img src={props.pedido.Firma} alt={"Firma"} data-holder-rendered="true" />
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
                                    {props.pedido.TotalUnidades}
                                </div>
                            </div>

                            <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Subtotal:
                                </div>

                                <div className="col-7 valueTotal">
                                    {numberWithCommas(props.pedido.SubTotalXPedido)}
                                </div>
                            </div>

                            <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Impuesto:
                                </div>

                                <div className="col-7 valueTotal">
                                    {numberWithCommas((props.pedido.Impuesto))}
                                </div>
                            </div>

                            <div className="row TotalRow">
                                <div className="col-5 labelTotal text-left">
                                    Total {props.pedido.Cliente.Moneda}:
                                </div>

                                <div className="col-7 valueTotal">
                                    {numberWithCommas((props.pedido.TotalXPedido))}
                                </div>
                            </div>
                        </div>
                    </div>
                } */}
                {props.pedido.DetallesXPedido ? (<h3>{"Total: Lps."} <span><b>{TotalPedido()}</b></span></h3>) : null}
            </div>
        </div>
    )
}

const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export default DetallePedido;