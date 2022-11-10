import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Fab } from "@material-ui/core";
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import moment from "moment";
import "moment/locale/es";
import styles from "components/ListadoRecibos/DetalleRecibo.module.css";
import {APIKEY} from 'utils/Enviroment';
const DetalleRecibo = (props) => {
  const { recibo } = props;
  const [maps, setMaps] = useState({ map: null, maps: null });
  let initialCoors = { lat: recibo.locationCliente.latitude,lng: recibo.locationCliente.longitude };
  let longitudCliente = recibo.locationCliente.longitude;
  let latitudCliente = recibo.locationCliente.latitude;
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: APIKEY
})
  const renderMarkers = () => {
    if (recibo.Latitude !== null && recibo.Longitude !== null) {
      addMarker(
        recibo.Cliente.Nombre,
        { lat: recibo.Latitude, lng: recibo.Longitude },
        "red",
        ""
      );
    }
  };

  const addMarker = (title, latLng, color, pinText) => {
    let map = maps.map;
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
    marker.addListener("click", function () {
      infowindow.open(map, marker);
    });
    map.addListener("click", function () {
      infowindow.close();
    });
  };

  if (maps.map !== null) {
    renderMarkers();
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
  let options = null;
  let color = "#FF0000";
  let zoom = 9;
  let LatitudpuntoMedio = 0;
  let LongitudpuntoMedio = 0;
  let distancia = 0;
  if(latitudCliente && longitudCliente)
  {
      distancia = CalcularDistancia(recibo.Latitude,recibo.Longitude, latitudCliente, longitudCliente)
      if(distancia <= 50){
          color = "#1ECE39";
          zoom = 19;
      }else if(distancia <= 100){
          color = "#F9EA06";
          zoom = 15;
      }else if(distancia > 100 && distancia <1000){
        zoom = 16;
      }
      else if(distancia > 1000){
        zoom = 8;
      }

      console.log("distncia " + distancia);
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
          zIndex: 1
      }
       LatitudpuntoMedio = (recibo.Latitude + latitudCliente) / 2
       LongitudpuntoMedio = (recibo.Longitude + longitudCliente) / 2
  }

  return (
    <div className="px-3">
      <div>
        <Fab
          size="small"
          color="default"
          onClick={() => props.RegresarListaRecibos()}
          className={"mx-1"}
          style={{ transform: "scale(0.8)" }}
        >
          <FaArrowLeft size={"15px"} />
        </Fab>
        <h3
          className="m-auto"
          style={{ display: "inline-block", verticalAlign: "middle" }}
        >
          {recibo.NumeroRecibo}
        </h3>
        <hr />
      </div>
      <div className="px-3">
        <div className="row">
          <div className="col-md-6 col-12 my-md-0 mb-3 p-0 pr-md-2">
            <h5 className={"font-weight-light"}>Ubicación:</h5>
           
            {isLoaded && latitudCliente !== null && longitudCliente !== null ? 
              <div style={{ height: "300px", width: "100%" }}>
                <GoogleMap zoom={zoom} center={ initialCoors} mapContainerStyle={{ height: '50vh' }}>
                
                  {(recibo.Longitude !== null && recibo.Latitude !== null) && <Marker label={{
                    text: "Recibo",
                    color: "black",
                    fontSize: "20px",
                    fontWeight: "bold",
                    display: "block"
                  }} clickable position={{ lat: recibo.Latitude, lng: recibo.Longitude }} icon={{ url: "https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_red.png" }} />}

                  {(latitudCliente !== null && longitudCliente !== null) && (
                    <>
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

                    </>
                  )}

                </GoogleMap>
              </div>
             : 
              <div style={{ textAlign: "center", marginTop: "150px" }}>
                Ubicación no disponible
              </div>
            }
          </div>
          <div className="col-md-6 col-12 p-0 pl-md-2">
            <h5 className={"font-weight-light"}>Información:</h5>
            <table
              className="table table-xl-responsive table-striped"
              style={{ border: "none" }}
            >
              <tbody>
                <tr>
                  <td className={styles.InfoLabel}>{"Codigo de cliente: "}</td>
                  <td className={styles.InfoLabelDetail}>
                    {recibo.Cliente.Codigo}
                  </td>
                </tr>
                <tr>
                  <td className={styles.InfoLabel}>{"Nombre del cliente: "}</td>
                  <td className={styles.InfoLabelDetail}>
                    {recibo.Cliente.Nombre}
                  </td>
                </tr>
                <tr>
                  <td className={styles.InfoLabel}>{"Empresa: "}</td>
                  <td className={styles.InfoLabelDetail}>
                    {recibo.CodigoCliente.split("-")[0]}
                  </td>
                </tr>
                <tr>
                  <td className={styles.InfoLabel}>{"Fecha Pago: "}</td>
                  <td className={styles.InfoLabelDetail}>
                    {moment(recibo.Fecha).format("DD/MM/YYYY hh:mm a") !==
                    "Invalid date"
                      ? moment(recibo.Fecha).format("DD/MM/YYYY hh:mm a")
                      : ""}
                  </td>
                </tr>
                <tr>
                  <td className={styles.InfoLabel}>Tipo Pago:</td>
                  <td className={styles.InfoLabelDetail}>
                    {recibo.TipoPago.Codigo}
                  </td>
                </tr>
                <tr>
                  <td className={styles.InfoLabel}>{"Moneda: "}</td>
                  <td className={styles.InfoLabelDetail}>{recibo.IdMoneda}</td>
                </tr>
                <tr>
                  <td className={styles.InfoLabel}>Descuento:</td>
                  <td className={styles.InfoLabelDetail}>
                    {numberWithCommas(recibo.Descuento)}
                  </td>
                </tr>
                <tr>
                  <td className={styles.InfoLabel}>Total Recibo:</td>
                  <td className={styles.InfoLabelDetail}>
                    {numberWithCommas(recibo.Valor)}
                  </td>
                </tr>
                <tr>
                    <td className={styles.InfoLabel}>
                        Distancia:
                    </td>
                    <td className={styles.InfoLabelDetail}>
                        {distancia + ' m'}
                    </td>
                </tr>
                
              </tbody>
            </table>
          </div>
          <div />
          <div className="w-100 mw-100 overflow-auto">
            <table
              className={"table table-bordered table-xl-responsive"}
              style={{ borderColor: "#aaa", overflow: "auto" }}
            >
              <thead>
                <tr className={styles.TrTest}>
                  <th className={styles.ThTest}>Documento</th>
                  <th className={styles.ThTest}>Factura</th>
                  <th className={styles.ThTest}>Fecha</th>
                  <th className={styles.ThTest}>Parcial</th>
                  <th className={styles.ThTest}>Descuento</th>
                  <th className={styles.ThTest}>Aplicado</th>
                </tr>
              </thead>
              <tbody>
                {recibo.DetalleRecibo.map((re, index) => (
                  <tr key={index}>
                    <th style={{ textAlign: "center" }}>{re.Tipo}</th>
                    <th style={{ textAlign: "center" }}>{re.Factura}</th>
                    <th style={{ textAlign: "center" }}>{moment(re.FechaFactura).format("DD/MM/YYYY")}</th>
                    <th style={{ textAlign: "center" }}>
                      {numberWithCommas(re.ValorSinDescuento)}
                    </th>
                    <th style={{ textAlign: "center" }}>
                      {numberWithCommas(re.Descuento)}
                    </th>
                    <th style={{ textAlign: "center" }}>
                      {numberWithCommas(re.Valor)}
                    </th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const numberWithCommas = (x) => {
  x = x.toFixed(2);
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export default DetalleRecibo;
