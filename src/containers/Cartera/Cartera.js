import React, { useEffect, useState } from 'react';
import { get } from 'utils/http';
import { APIURL } from 'utils/Enviroment';
import { useDispatch, useSelector } from 'react-redux';
import { ListaClientes } from 'components/Cartera/ListaClientes';
import { InformacionGeneral } from 'components/Cartera/InformacionGeneral';
import { CuentaCorriente } from 'components/Cartera/CuentaCorriente';
import { Route, Switch } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import PersonIcon from '@material-ui/icons/Person';
import { Loading } from 'components/Global/Loading';
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { IsAllow } from 'components/Seguridad/Permisos';
import CachedIcon from '@material-ui/icons/Cached';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import axios from 'axios';
import { Dropdown } from "semantic-ui-react";
import { verificarConexion } from 'utils/http';

export const Cartera = props => {
    const dispatch = useDispatch();
    const clientes = useSelector(e => e.Cartera);
    const [value, setValue] = useState(0);
    const [cliente, setCliente] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [filtrados, setFiltrados] = useState([]);
    const AsesoresUsuario = useSelector(e=>e.Permisos[0].AsesoresUsuario);
    const [asesor,setAsesor] = useState(AsesoresUsuario[0]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const cargarCartera = async (codigo) => {
        if(AsesoresUsuario.length === 1){
            const { data, error } = await get(`${APIURL}/api/cliente/${asesor.Usuario}`, "Cartera");
            if (error) {
                console.log(error);
                setLoading(false);
            } else {
                dispatch({ type: "SET_CARTERA", payload: data });
                setFiltrados(data);
                setLoading(false);
            }
        }

        if(AsesoresUsuario.length > 1){
            try{
                let seleccionado = asesor.Usuario;
                if(codigo){
                    seleccionado = codigo
                }
                setCliente(undefined);
                setLoading(true);
                const request = await axios.get(`${APIURL}/api/cliente/${seleccionado}`,{headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}});
                dispatch({ type: "SET_CARTERA", payload: request.data });
                setFiltrados(request.data);
                setLoading(false);
            }catch(err){
                console.log(err);
            }
        }
    }

    const recargarClientes = async () =>{
        if (localStorage.getItem("Conexion") === "offline") {
            Swal.fire({
                title: "Modo Offline",
                text: "Se encuentra en modo offline, no puede actualizar registros.",
                type: "warning",
                confirmButtonText: 'Ok',
            })
        } else {
            let isOnline = await verificarConexion();
            if (isOnline) {
                localStorage.removeItem('expiracion-Cartera');
                setCliente(undefined);
                setLoading(true);
                cargarCartera();
            } else {
                Swal.fire({
                    title: 'Sin Internet',
                    text: 'Necesita internet para sincronizar la cartera',
                    type: 'warning',
                    confirmButtonText: 'Ok',
                })
            }
        }
    }

    const handleRecarga = () => {
        Swal.fire({
            title: 'Aviso',
            text: '¿Desea actualizar la información en cartera de clientes?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                recargarClientes();
            }
        })
    }

    useEffect(() => {
        if (!IsAllow("/cartera")) {
            props.history.push('/home');
        }
        cargarCartera();
        dispatch({ type: 'SET_CUENTAIMPRIMIR', payload: [] });
        // eslint-disable-next-line
    }, []);

    const seleccionarCliente = id => {
        const clienteSeleccionado = clientes.find(x => x.Codigo === id);
        setCliente(clienteSeleccionado);
    }

    const redirectCartera = () => {
        props.history.push('/cartera');
    }

    const redirectRoles = () => {
        props.history.push('/cartera/cuenta');
    }

    const handleChangeBusqueda = (busqueda) => {
        if (busqueda === "") {
            setFiltrados(clientes);
            return;
        }

        const filtradosNuevos = clientes.filter(x => x.Nombre.includes(busqueda.toUpperCase()) || x.Codigo.includes(busqueda.toUpperCase()));
        setFiltrados(filtradosNuevos);
    }

    return (
        <div style={{ height: '100vh' }} className="row">
            {loading
                ? <Loading open={loading} title="Cargando cartera de clientes" />
                : (<><div className="col-md-3 h-100">
                    <div style={{display:'flex',justifyContent:'space-between'}}>
                    <TextField
                        onChange={(e) => { handleChangeBusqueda(e.target.value) }}
                        style={{ width: '90%', marginBottom: '15px' }}
                        label="Buscar"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment>
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <Button style={{height:45}} onClick={handleRecarga} variant="contained" color="primary"><CachedIcon/></Button>
                    </div>
                    <ListaClientes clientes={filtrados} seleccionarCliente={seleccionarCliente} seleccionado={cliente} />
                </div>
                    <div className="col-md-9">
                        {AsesoresUsuario.length>1 && <Dropdown
                            placeholder="Seleccione cliente contado"
                            fluid
                            search
                            selection
                            onChange={(e, { value }) =>{
                                const seleccionado = AsesoresUsuario.find(x=>x.Usuario===value);
                                setAsesor(seleccionado);
                                cargarCartera(value);
                            }}
                            options={AsesoresUsuario.map(asesor => {
                                return {key:asesor.Usuario, value:asesor.Usuario,text:asesor.Usuario}
                            })}
                            noResultsMessage={"No hay resultados"}
                            closeOnChange={true}
                            value={asesor.Usuario}
                        />}
                        <Paper square>
                            <Tabs
                                value={value}
                                indicatorColor="primary"
                                textColor="primary"
                                onChange={handleChange}
                                aria-label="disabled tabs example"
                            >
                                <Tab onClick={redirectCartera} icon={<PersonIcon />} label="Informacion" />
                                <Tab onClick={redirectRoles} icon={<ContactMailIcon />} label="Cuenta Corriente" />
                            </Tabs>
                        </Paper>
                        <div style={{ height: '90%' }} className="card">
                            <Switch>
                                <Route exact path={`${props.match.url}`} render={(props) => <InformacionGeneral cliente={cliente} />} />
                                <Route exact path={`${props.match.url}/cuenta`} render={(props) => <CuentaCorriente cliente={cliente} />} />
                            </Switch>
                        </div>
                    </div></>)
            }
        </div>
    )
}