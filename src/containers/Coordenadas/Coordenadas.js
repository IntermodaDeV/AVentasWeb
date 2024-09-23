import React, { Component } from 'react';
import { Dropdown } from "semantic-ui-react";
import GoogleMapReact from 'google-map-react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import styles from 'containers/Coordenadas/Coordenadas.module.css';
import {APIURL} from 'utils/Enviroment';


// const CustomMarker = ({ text }) => <div>{text}</div>;
export default class Coordenadas extends Component {
    urlApi = APIURL; 
    state = {
        isLoaded: false,
        Eventos: [],
        Configuraciones : [],
        mostarEvento: false,
        isModalLoaded: false,
        Acciones: [],
        RutaSeleccionada: null,
        Rutas: [],
        map: null,
        maps: null,
        marcadores: []
    }
    componentDidMount() {
        this.cargarRutas();
        this.cargarConfiguraciones();
    }
    cargarRutas = async () => {
        fetch(this.urlApi + "/api/coordenadasXCliente", {
            headers: {
                'Authorization':
                    'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(res => {
                if (res.status === 401) {
                    localStorage.setItem('token', '');
                    window.location.reload();
                }
                if (res.status === 200) {
                    res.json()
                        .then(
                            (result) => {

                                this.setState({
                                    Rutas: result,
                                    isLoaded: true
                                });


                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                this.setState({
                                    error: true
                                });
                            }
                        )
                }

            })
    }


    cargarConfiguraciones = async () => {
        const { data, error } = await get(`${APIURL}/api/configuraciones`, "Configuraciones");
        if (error) {
            console.log(error);
        } else {

            this.setState({
                Configuraciones: data
            });
        }
    }


    selectCliente = (cliente) => {
        this.setState({
            ClienteSeleccionado: cliente
        });
    }
    selectRuta = (ruta) => {
        this.setState({
            RutaSeleccionada: ruta,
            ClienteSeleccionado: ruta.Clientes ? ruta.Clientes[0] : null
        });
        this.renderMarkers(ruta);
    }
    handleDropdownOnChange = (value) => {
        var val = JSON.parse(value);
        this.selectRuta(val);
    }
    renderMarkers(RutaSeleccionada) {
        let map = this.state.map;
        this.state.marcadores.forEach(marcador => {
            marcador.setMap(null);
        });
        RutaSeleccionada.Clientes.forEach(cliente => {
            var infowindow = new this.state.maps.InfoWindow({
                content: cliente.Nombre
            });
            let marker = new this.state.maps.Marker({
                position: {
                    lat: cliente.Coordenadas[0].Latitud,
                    lng: cliente.Coordenadas[0].Longitud
                },
                // label: cliente.Nombre,
                map: map,
                title: cliente.Nombre
            });
            marker.addListener('click', function () {
                infowindow.open(map, marker);
            });
            map.addListener('click', function () {
                infowindow.close();
            });
            this.state.marcadores.push(marker);
        });

    }
    setMapsApi = (map, maps) => {
        this.setState({ map, maps });
    }
    render() {
        const { error, isLoaded } = this.state;
        let APIKEY = this.state.Configuraciones.ApiKey_GoogleMaps;
        
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        }
        return (
            <>
                <div className="row" style={{ height: '100%' }}>

                    <div className="col">
                        <h5 className="font-weight-light">
                            Ruta
                        </h5>
                        <div className={styles.Sticky}>
                            <Dropdown
                                placeholder="Seleccione una Ruta"
                                fluid
                                search
                                selection
                                onChange={(e, { value }) => this.handleDropdownOnChange(value)}
                                options={this.state.Rutas.map(ruta => {
                                    return { key: ruta.CodigoRuta, value: JSON.stringify(ruta), text: ruta.Nombre }
                                })}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                            // value={Value}
                            />
                        </div>
                        <div >
                            <List component="nav" >

                                {this.state.RutaSeleccionada && this.state.RutaSeleccionada.Clientes.length === 0 ?
                                    <ListItem
                                        disabled
                                    >
                                        <ListItemText primary={"La Ruta Seleccionada no tiene clientes con coordenadas."} />
                                    </ListItem>
                                    : null}
                                {this.state.RutaSeleccionada ? this.state.RutaSeleccionada.Clientes.map((cliente, index) => {
                                    return (
                                        <ListItem
                                            key={index}
                                            button
                                            selected={this.state.ClienteSeleccionado ? (this.state.ClienteSeleccionado.CodigoCliente === cliente.CodigoCliente) : (index === 0)}
                                            onClick={() => this.selectCliente(cliente)}
                                        >
                                            <ListItemText primary={cliente.Nombre} />
                                        </ListItem>
                                    )
                                }) : null}
                            </List>
                        </div>
                    </div>
                    <div className="col p-0" style={{ marginTop: '-7px', borderLeft: '1px solid #ddd' }}>
                        <div style={{ height: '100%', width: '100%' }}>
                            <GoogleMapReact
                                bootstrapURLKeys={{ key: APIKEY }}
                                
                                defaultCenter={
                                    {
                                        lat: 15.497377,
                                        lng: -88.036478
                                    }
                                }
                                center={
                                    this.state.ClienteSeleccionado ?
                                        {
                                            lat: this.state.ClienteSeleccionado.Coordenadas[0].Latitud,
                                            lng: this.state.ClienteSeleccionado.Coordenadas[0].Longitud
                                        } :
                                        null}
                                defaultZoom={15}
                                onGoogleApiLoaded={({ map, maps }) => { this.setMapsApi(map, maps) }}
                                yesIWantToUseGoogleMapApiInternals={true}
                            >
                            </GoogleMapReact>

                        </div>
                    </div>
                </div>
            </>
        );

    }
}





