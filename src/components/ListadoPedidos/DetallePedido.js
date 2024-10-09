import React from 'react';
import styles from 'components/ListadoPedidos/DetallePedido.module.css';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { FaArrowLeft } from "react-icons/fa";
import { Fab } from "@material-ui/core";
import moment from "moment";
import 'moment/locale/es';
import {
    Popover,
    Box,
    Typography
} from '@material-ui/core';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import { InfoOutlined } from "@material-ui/icons";
import { useSelector } from 'react-redux';
moment.locale('es');


const DetallePedido = (props) => {
    const APIKEY = useSelector(e => e.Configuraciones.ApiKey_GoogleMaps);

    let initialCoors = { lat: props.pedido.locationCliente.latitude, lng: props.pedido.locationCliente.longitude };
    let longitudCliente = props.pedido.locationCliente.longitude;
    let latitudCliente = props.pedido.locationCliente.latitude;
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: APIKEY
    })

    const TotalPedido = () => {
        var total = 0;
        props.pedido.DetallesXPedido.forEach(detallePedido => {
            if (isNaN(detallePedido.MontoLinea)) {
                total += detallePedido.MontoLinea;
            }
        });
        return total;
    }

    const checkDist = (talla) => {
        let found = false;
        talla.Distribucion.map(() => {
            found = true;
            return false;
        })
        return found;
    }

    const Headers = (array) => {
        return (
            <thead>
                <tr>
                    {
                        array.map((dist, index) => {
                            return (
                                <th key={index} className={styles.ThTest}>{dist.NombreTalla}</th>
                            )
                        })
                    }
                </tr>

            </thead>
        )
    }

    const rad = (x) => {
        return x * Math.PI / 180;
    }

    const CalcularDistancia = (lat1, lon1, lat2, lon2) => {
        if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
            return 0;
        }

        var R = 6378.137;//Radio de la tierra en km
        var dLat = rad(lat2 - lat1);
        var dLong = rad(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return 1000 * d.toFixed(3);//Retorna valor en metros
    }

    const TableBody = (array, cantidad, Precio) => {
        let CantDist = 0;
        let TotalCant = 0;
        return (
            <tbody>
                <tr>
                    {array.map((dist, index) => {
                        CantDist += parseInt(dist.Cantidad)
                        return (
                            <td key={index} style={{ textAlign: 'center' }}>{dist.Cantidad * cantidad}</td>

                        )
                    })
                    }
                </tr>
                <tr>
                    {array.map((dist, index2) => {
                        TotalCant = Precio / CantDist
                        return (
                            <td key={index2} style={{ textAlign: 'center' }}>{TotalCant}</td>

                        )
                    })
                    }
                </tr>
            </tbody>
        )
    }

    let options = null;
    let color = "#FF0000";
    let zoom = 9;
    let distancia = 0;
    if (latitudCliente && longitudCliente) {
        distancia = CalcularDistancia(props.pedido.location.latitude, props.pedido.location.longitude, latitudCliente, longitudCliente)
        if (distancia <= 50) {
            color = "#1ECE39";
            zoom = 19;
        } else if (distancia <= 100) {
            color = "#F9EA06";
            zoom = 15;
        }else if(distancia > 100 && distancia <1000){
            zoom = 16;
          }
          else if(distancia > 1000){
            zoom = 8;
          }
        
        options = {
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35,
            clickable: false,
            draggable: false,
            editable: false,
            visible: true,
            radius: 30000,
            zIndex: 1,
        }
    }
    
    return (
        <div className="px-3">
            <div>
                <Fab size="small" color="default" onClick={() => props.RegresarListaPedidos()} className={"mx-1"} style={{ transform: 'scale(0.8)' }}>
                    <FaArrowLeft size={"15px"} />
                </Fab>
                <h3 className="m-auto" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    Num. Pedido: {props.pedido.PedidoId}
                </h3>
                <hr />
            </div>

            <div className="px-3">
                <div className="row">
                    <div className="col-md-6 col-12 my-md-0 mb-3 p-0 pr-md-2">

                        <h5 className={"font-weight-light"}>
                            Ubicación:
                        </h5>
                        {isLoaded && latitudCliente !== null && longitudCliente !== null ?
                                <div style={{ height: '300px', width: '100%' }}>
                                    <GoogleMap zoom={zoom} center={initialCoors} mapContainerStyle={{ height: '60vh' }}>
                                        {(props.pedido.location.latitude !== null && props.pedido.location.longitude !== null) && <Marker label={{
                                            text: "Pedido",
                                            color: "black",
                                            fontSize: "20px",
                                            fontWeight: "bold",
                                            display: "block"
                                        }} clickable position={{ lat: props.pedido.location.latitude, lng: props.pedido.location.longitude }} icon={{ url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png" }} />}

                                        {(latitudCliente !== null && longitudCliente !== null) && (<>
                                            <Circle
                                                center={initialCoors}
                                                radius={distancia}
                                                options={options}
                                            />
                                            <Marker label={{
                                                text: "Cliente",
                                                color: "black",
                                                fontSize: "20px",
                                                fontWeight: "bold",
                                                display: "block"
                                            }} clickable position={{ lat: latitudCliente, lng: longitudCliente }} icon={{ url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_blue.png" }} />
                                        </>)}
                                        
                                    </GoogleMap>
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
                                        {'Sincronizado: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {(props.pedido.Sincronizado) ? "Si" : "No"}
                                    </td>
                                </tr>
                                <tr>


                                    <td className={styles.InfoLabel}>
                                        {'Num. Pedido Ax: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {(props.pedido.NumeroPedido === "") ? "No Disponible" : props.pedido.NumeroPedido}
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
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        Distancia:
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {distancia + ' mtrs'}
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
                    {props.gruposXDetPed.map((grupoTalla, index1) => {
                        let cantidad = 3;
                        let IsDist = true;
                        return (
                            <table className={'table table-bordered table-xl-responsive'} style={{ borderColor: '#aaa', overflow: "auto" }} key={index1}>
                                <thead>
                                    <tr className={styles.TrTest}>
                                        <th className={styles.ThTest}>
                                        </th>
                                        {grupoTalla.ListaTalla.map((talla, index2) => {
                                            IsDist = checkDist(talla);
                                            cantidad++;
                                            return (
                                                <th className={styles.ThTest} key={index2} style={{ paddingBottom: (IsDist === true) && '1.3%' }}>
                                                    <div className="text-center">
                                                        {
                                                            <div>{talla.Talla}</div>
                                                        }
                                                    </div>
                                                </th>
                                            )
                                        })}
                                        <th className={styles.ThTest} >Cantidad</th>
                                        <th className={styles.ThTest} >Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupoTalla.prodsXDetPed.map((producto, index2) => {
                                        let ColoresProductos = Object.keys(producto.coloresXProdXDetPed).map((key) => (producto.coloresXProdXDetPed[key]));
                                        ColoresProductos.sort((a, b) => a.NombreColor < b.NombreColor ? -1 : 1);
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

                                                        </div>

                                                    </td>
                                                </tr>
                                                {ColoresProductos.map((color, index3) => {
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
                                                                        <div className="text-center">
                                                                            {

                                                                                IsDist === true && det !== null &&
                                                                                <PopupState variant="popper" popupId={det.Talla + index4}>
                                                                                    {popupState => (
                                                                                        <>
                                                                                            <div variant="contained" className={"text-center"}>
                                                                                                <label>{det ? det.Cantidad : 0}</label>
                                                                                                <InfoOutlined {...bindTrigger(popupState)} style={{ fontSize: '18px', cursor: 'pointer', margin: 'auto' }}> </InfoOutlined>
                                                                                            </div>
                                                                                            <Popover
                                                                                                {...bindPopover(popupState)}
                                                                                                style={{ zIndex: 900 }}
                                                                                                anchorOrigin={{
                                                                                                    vertical: 'bottom',
                                                                                                    horizontal: 'center',
                                                                                                }}
                                                                                                transformOrigin={{
                                                                                                    vertical: 'top',
                                                                                                    horizontal: 'center',
                                                                                                }}>
                                                                                                <Box p={2}>
                                                                                                    <div className="row mb-2">
                                                                                                        <Typography component="h5" variant="h5">
                                                                                                            {"Distribución de Tallas"}
                                                                                                        </Typography>
                                                                                                    </div>
                                                                                                    <div style={{ maxWidth: '300px', overflow: 'auto' }}>
                                                                                                        <table className="table table-striped table-bordered m-0">

                                                                                                            {Headers(det.TallaObject.Distribucion)}
                                                                                                            {TableBody(det.TallaObject.Distribucion, det.Cantidad, det.PrecioUnitario)}
                                                                                                        </table>
                                                                                                    </div>
                                                                                                </Box>

                                                                                            </Popover>
                                                                                        </>
                                                                                    )}
                                                                                </PopupState>
                                                                            }
                                                                            {
                                                                                IsDist === true && det === null && <label>{0}</label>
                                                                            }
                                                                            {
                                                                                IsDist === false && <label>{det ? det.Cantidad : 0}</label>
                                                                            }
                                                                        </div>
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