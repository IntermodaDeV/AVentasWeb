import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Fab } from "@material-ui/core";
import GoogleMapReact from "google-map-react";
import moment from "moment";
import "moment/locale/es";
import styles from "components/ListadoRecibos/DetalleRecibo.module.css";

const DetalleRecibo = (props) => {
  const { recibo } = props;
  const [maps, setMaps] = useState({ map: null, maps: null });

  const setMapsApi = (map, maps) => {
    setMaps({ map: map, maps: maps });
  };

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
            {recibo.Latitude !== null && recibo.Longitude !== null ? (
              <div style={{ height: "300px", width: "100%" }}>
                <GoogleMapReact
                  bootstrapURLKeys={{
                    key: "AIzaSyBYe6qlu-FWB8cCAMG52pdAPVs5W2cdODU",
                  }}
                  defaultCenter={{
                    lat: recibo.Latitude,
                    lng: recibo.Longitude,
                  }}
                  center={{
                    lat: recibo.Latitude,
                    lng: recibo.Longitude,
                  }}
                  defaultZoom={16}
                  onGoogleApiLoaded={({ map, maps }) => {
                    setMapsApi(map, maps);
                  }}
                  yesIWantToUseGoogleMapApiInternals={true}
                ></GoogleMapReact>
              </div>
            ) : (
              <div style={{ textAlign: "center", marginTop: "150px" }}>
                Ubicación no disponible
              </div>
            )}
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
