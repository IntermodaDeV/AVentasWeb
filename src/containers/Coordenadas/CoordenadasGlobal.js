import React,{useRef,useEffect,useState} from 'react';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import {APIURL,APIKEY} from 'utils/Enviroment';
import { Dropdown } from "semantic-ui-react/";

const paises = 
[
    {id:1,value:'*',pais:"Todos"},
    {id:2,value:'IMHN',pais:"Honduras"},
    {id:3,value:'IMGT',pais:"Guatemala"},
    {id:4,value:'IMCR',pais:"Costa Rica"}
]

const CoordenadasGlobal = (props)=>
{
    const mapRef  = useRef();
    const mapsRef = useRef();
    const [coordenadas,setCoordenadas] = useState([]);
    // eslint-disable-next-line
    const [marcadores,setMarcadores]   = useState([]);

    const cargarRutas = ()=>
    {
        axios({
            url:APIURL + "/api/cliente/global",
            method:'GET',
            headers:{
                'Authorization':'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(e=>{
        setCoordenadas(e.data);
    })
        .catch(err=>console.warn(err));
    }

    const renderMarkers = (clientes)=>{
        
        if(marcadores.length>0){
            marcadores.forEach(marcador => {
                marcador.setMap(null);
            });
        }

        clientes.forEach(cliente=>{
            var infowindow = new mapsRef.current.InfoWindow({
                content: cliente.ACCOUNT + " " + cliente.NAME
            });
            let marker = new mapsRef.current.Marker({
                position:{
                    lat: parseFloat(cliente.LATITUDE),
                    lng: parseFloat(cliente.LONGITUD)
                },
                map: mapRef.current,
                title: cliente.NAME
            });
            marker.addListener('click', function () {
                infowindow.open(mapRef.current, marker);
            });
            mapRef.current.addListener('click', function () {
                infowindow.close();
            });

            marcadores.push(marker);
        });
        setBounds(clientes);
    }

    const handleDropdownChange = (value)=>
    {
        if(value==='*')
        {
            renderMarkers(coordenadas);
            return;
        }

        const clientes = coordenadas.filter(x=>x.COMPANY === value);
        renderMarkers(clientes);
    }

    const setBounds = (clientes)=>
    {
        const LatLngList = clientes.map(cliente=>(new mapsRef.current.LatLng(cliente.LATITUDE,cliente.LONGITUD)));
        let bounds = new mapsRef.current.LatLngBounds();

        for(let LatLng of LatLngList)
        {
            bounds.extend(LatLng);
        }

       mapRef.current.fitBounds(bounds);
    }

    useEffect(()=>{
        cargarRutas();
    },[])

    if(coordenadas.length===0)
    {
        return <h1>Coordenadas no disponbles</h1>
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
                            <Dropdown
                                placeholder="Seleccione pais"
                                fluid
                                search
                                selection
                                onChange={(e, { value }) => handleDropdownChange(value)}
                                options={paises.map(ruta => {
                                    return { key: ruta.id, value: ruta.value, text: ruta.pais }
                                })}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                            />
                            <GoogleMapReact
                                bootstrapURLKeys={{ key: APIKEY }}
                                
                                defaultCenter={
                                    {
                                        lat: 15.497377,
                                        lng: -88.036478
                                    }
                                }
                                center={
                                    {
                                        lat: 15.497377,
                                        lng: -88.036478
                                    }
                                    }
                                defaultZoom={15}
                                onGoogleApiLoaded={({ map, maps }) => {  
                                    mapRef.current  = map;
                                    mapsRef.current = maps;
                                 }}
                                yesIWantToUseGoogleMapApiInternals={true}
                            >
                                
                            </GoogleMapReact>

        </div>
    )

}

export default CoordenadasGlobal;