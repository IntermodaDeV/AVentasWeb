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
import { IsAllow } from 'components/Seguridad/Permisos';

export const Cartera = props => {
    const dispatch = useDispatch();
    const clientes = useSelector(e => e.Cartera);
    const [value, setValue] = useState(0);
    const [cliente, setCliente] = useState(clientes[0]);
    const [loading, setLoading] = useState(true);
    const [filtrados, setFiltrados] = useState([]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const cargarCartera = async () => {
        const { data, error } = await get(`${APIURL}/api/cliente`, "Cartera");

        if (error) {
            console.log(error);
            setLoading(false);
        } else {
            dispatch({ type: "SET_CARTERA", payload: data });
            setFiltrados(data);
            setLoading(false);
        }
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
                    <TextField
                        onChange={(e) => { handleChangeBusqueda(e.target.value) }}
                        style={{ width: '100%', marginBottom: '15px' }}
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
                    <ListaClientes clientes={filtrados} seleccionarCliente={seleccionarCliente} seleccionado={cliente} />
                </div>
                    <div className="col-md-9">
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