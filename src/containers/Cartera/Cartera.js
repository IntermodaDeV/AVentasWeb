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
import { IsAllow, PermisoExcepcionDescuento } from 'components/Seguridad/Permisos';
import CachedIcon from '@material-ui/icons/Cached';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import axios from 'axios';
import { Dropdown } from "semantic-ui-react";
import { verificarConexion } from 'utils/http';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { FacturasReservadas } from 'components/Cartera/FacturasReservadas';
import { DiasGracia } from 'components/Cartera/DiasGracia';
import { ChequesContabilizados } from 'components/Cartera/ChequesContabilizados';
import moment from 'moment';
import { ExcepcionDescuento } from 'components/Cartera/ExcepcionDescuento';

export const Cartera = props => {
    const dispatch = useDispatch();
    const clientes = useSelector(e => e.Cartera);
    const [value, setValue] = useState(0);
    const [cliente, setCliente] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [filtrados, setFiltrados] = useState([]);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);
    const [asesor, setAsesor] = useState(AsesoresUsuario[0]);
    const [showClientes, setShowClientes] = useState(true);

    const calcularDescuentoNuevaLogica = (clienteSeleccionado) => {
        let cliente = { ...clienteSeleccionado };
        for (let AcuerdosXTipoPedido of cliente.AcuerdosXTipoPedido) {

            for (let Acuerdos of AcuerdosXTipoPedido.Acuerdos) {
                let acuerdosFacturas = Acuerdos.Facturas.filter(f => f.Descuento === 0);

                for (let Facturas of acuerdosFacturas) {
                    let Descuento = cliente.MaestroDescuento.length > 0 ? cliente.MaestroDescuento[0].DescuentoDetalle.filter(d => d.Linea === Facturas.IdLinea) : [];
                    let noAplicaDescuento = Descuento.length === 0;

                    let totalDocumentosAplicados = 0;

                    if (Facturas.DocumentosAplicadosAFacturas.length > 0) {
                        totalDocumentosAplicados = Facturas.DocumentosAplicadosAFacturas.reduce((prev, curr) => prev + curr.Valor, 0);
                    };

                    Facturas.Descuento = noAplicaDescuento ? 0 : Facturas.TotalFactura * (Descuento[0].Porcentaje / 100);
                    for (let Cuotas of Facturas.Cuotas) {

                        let valordescuento = 0;
                        if (AcuerdosXTipoPedido.AgrupaPorCuota === true) {
                            if (Acuerdos.DescuentoEnAcuerdos !== null) {
                                let Flete = 0;

                                let DocumentoCuota = cliente.DocumentosAplicadosxCuotas.find(x => x.IdAcuerdoxCliente === Acuerdos.Acuerdo && x.NumeroCuota === Cuotas.NumeroCuota);
                                if (DocumentoCuota !== undefined) {
                                    totalDocumentosAplicados = DocumentoCuota.Valor;
                                    Flete = DocumentoCuota.Flete;
                                }

                                if (Acuerdos.DescuentoEnAcuerdos != null) {
                                    let consumidoCuota = Cuotas.SaldoCuota - Cuotas.DisponibleCuota;
                                    let totalfactura = consumidoCuota - totalDocumentosAplicados - Flete;
                                    valordescuento = totalfactura * (Acuerdos.DescuentoEnAcuerdos.Porcentaje / 100);
                                }
                                Cuotas.Descuento = valordescuento.toFixed(2);
                            }
                        }
                        else {
                            let fechaMaxDescuent = noAplicaDescuento ? moment(Facturas.FechaFactura).format() : moment(Facturas.FechaFactura).add((Descuento[0].DiasDescuento + cliente.DiasTransporte), 'days').format();

                            Facturas.FechaMaxDescuento = fechaMaxDescuent;
                            Cuotas.FechaMaxDescuento = fechaMaxDescuent;

                            let totalfactura = Cuotas.ValorCuota - totalDocumentosAplicados - Cuotas.Flete
                            valordescuento = noAplicaDescuento ? 0 : totalfactura * (Descuento[0].Porcentaje / 100);
                            Cuotas.Descuento = valordescuento.toFixed(2);
                        }
                    };

                };
            };
        };

        return cliente;
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const cargarCartera = async (codigo) => {
        if (AsesoresUsuario.length === 1) {
            const { data, error } = await get(`${APIURL}/api/cliente/${asesor.Usuario}`, "Cartera");
            if (error) {
                console.log(error);
                setLoading(false);
            } else {
                dispatch({ type: "SET_CARTERA", payload: data });
                setFiltrados(data);
                setLoading(false);
                localStorage.setItem("UltimaSyncCartera", new Date())
            }
            cargarDocumentosPendientes();
        }

        if (AsesoresUsuario.length > 1) {
            try {
                let seleccionado = asesor.Usuario;
                if (codigo) {
                    seleccionado = codigo
                }
                setCliente(undefined);
                setLoading(true);
                const request = await axios.get(`${APIURL}/api/cliente/${seleccionado}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                const requestPendientes = await axios.get(`${APIURL}/api/documentospendientes/facturas`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                dispatch({ type: "SET_CARTERA", payload: request.data });
                dispatch({ type: "SET_DOCUMENTOSPENDIENTES", payload: requestPendientes.data });
                setFiltrados(request.data);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        }
    }

    const cargarDocumentosPendientes = async () => {
        try {
            const { data, error } = await get(`${APIURL}/api/documentospendientes/facturas`, "DocumentosPendientes");
            dispatch({ type: "SET_DOCUMENTOSPENDIENTES", payload: data });
            console.log(error);
        } catch (err) {

        }
    }

    const recargarClientes = async () => {
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
                localStorage.removeItem('expiracion-DocumentosPendientes');
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

    const moverClientesConFlecha = (e) => {
        if (e.which === 38) {
            e.preventDefault();
            if (localStorage.getItem("indice") !== "null" && localStorage.getItem("indice") !== "0") {
                let index = Number(localStorage.getItem("indice"));
                const nuevoCliente = calcularDescuentoNuevaLogica(clientes[index - 1]);
                setCliente(nuevoCliente);
                localStorage.setItem("indice", (index - 1));
                return;
            }
        } else if (e.which === 40) {
            e.preventDefault();
            if (localStorage.getItem("indice") === "null" && clientes.length > 0) {
                const nuevoCliente = calcularDescuentoNuevaLogica(clientes[0]);
                setCliente(nuevoCliente);
                localStorage.setItem("indice", 0);
                return;
            } else {
                let index = Number(localStorage.getItem("indice"));
                if ((index + 1) === clientes.length) {
                    return;
                }
                if ((index + 1) <= clientes.length) {
                    const nuevoCliente = calcularDescuentoNuevaLogica(clientes[index + 1]);
                    setCliente(nuevoCliente);
                    localStorage.setItem("indice", (index + 1));
                    return;
                }
            }
        }
    }

    useEffect(() => {
        if (!IsAllow("/cartera")) {
            props.history.push('/home');
        }
        cargarCartera();
        dispatch({ type: 'SET_CUENTAIMPRIMIR', payload: [] });
        localStorage.setItem("indice", null);

        window.addEventListener('keydown', moverClientesConFlecha);
        return () => {
            window.removeEventListener('keydown', moverClientesConFlecha)
            localStorage.removeItem("indice");
        }
        // eslint-disable-next-line
    }, []);

    const seleccionarCliente = id => {
        let index = clientes.map(x => x.Codigo).indexOf(id);
        const clienteSeleccionado = clientes.find(x => x.Codigo === id);
        localStorage.setItem("indice", index);
        const nuevoCliente = calcularDescuentoNuevaLogica(clienteSeleccionado);
        setCliente(nuevoCliente);
    }

    const redirectCartera = () => {
        props.history.push('/cartera');
    }

    const redirectRoles = () => {
        props.history.push('/cartera/cuenta');
    }

    const redirectDocumentosPendientes = () => {
        props.history.push('/cartera/facturas-reservadas');
    }

    const redirectChequesPosfechados = () => {
        props.history.push('/cartera/cheques-posfechados');
    }

    const redirectDiasGracia = () => {
        props.history.push('/cartera/dias-gracia');
    }

    const redirectExcepcionDescuento = () => {
        props.history.push('/cartera/excepcion-descuento');
    }

    const handleChangeBusqueda = (busqueda) => {
        if (busqueda === "") {
            setFiltrados(clientes);
            return;
        }

        const filtradosNuevos = clientes.filter(x => x.Nombre.includes(busqueda.toUpperCase()) || x.Codigo.includes(busqueda.toUpperCase()));
        setFiltrados(filtradosNuevos);
    }

    const handleClickShowClientes = () => {
        setShowClientes(!showClientes);
    }

    return (<>
        {!loading && <button className="btn btn-success" style={{ width: '10%', marginLeft: '15px' }} onClick={handleClickShowClientes} >{showClientes ? <>Ocultar Clientes <ArrowBackIosIcon /></> : <>Mostrar Clientes <ArrowForwardIosIcon /></>}</button>}
        <div style={{ height: '100vh' }} className="row">
            {loading
                ? <Loading open={loading} title="Cargando cartera de clientes" />
                : (<>{showClientes && <div className="col-md-3 h-100">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                        <Button style={{ height: 45 }} onClick={handleRecarga} variant="contained" color="primary"><CachedIcon /></Button>
                    </div>
                    <ListaClientes clientes={filtrados} seleccionarCliente={seleccionarCliente} seleccionado={cliente} />
                </div>}
                    <div className={`col-md-${showClientes ? "9" : "12"}`}>
                        <h4>Ultima Sincronización: {moment(localStorage.getItem("UltimaSyncCartera")).format("DD/MM/YYYY h:mm:ss a")}</h4>
                        {AsesoresUsuario.length > 1 && <Dropdown
                            placeholder="Seleccione Asesor"
                            fluid
                            search
                            selection
                            onChange={(e, { value }) => {
                                const seleccionado = AsesoresUsuario.find(x => x.Usuario === value);
                                setAsesor(seleccionado);
                                cargarCartera(value);
                            }}
                            options={AsesoresUsuario.map(asesor => {
                                return { key: asesor.Usuario, value: asesor.Usuario, text: asesor.Usuario }
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
                                <Tab onClick={redirectDocumentosPendientes} icon={<ContactMailIcon />} label="Facturas Reservadas" />
                                <Tab onClick={redirectChequesPosfechados} icon={<ContactMailIcon />} label="Cheques Posfechados" />
                                {PermisoExcepcionDescuento() && <Tab onClick={redirectExcepcionDescuento} icon={<ContactMailIcon />} label="Excepción Descuento" />}
                                {PermisoExcepcionDescuento() && <Tab onClick={redirectDiasGracia} icon={<ContactMailIcon />} label="Días de gracia" />}
                            </Tabs>
                        </Paper>
                        <div style={{ height: '90%' }} className="card">
                            <Switch>
                                <Route exact path={`${props.match.url}`} render={(props) => <InformacionGeneral cliente={cliente} />} />
                                <Route exact path={`${props.match.url}/cuenta`} render={(props) => <CuentaCorriente cliente={cliente} />} />
                                <Route exact path={`${props.match.url}/facturas-reservadas`} render={(props) => <FacturasReservadas cliente={cliente} />} />
                                <Route exact path={`${props.match.url}/cheques-posfechados`} render={(props) => <ChequesContabilizados cliente={cliente} />} />
                                {PermisoExcepcionDescuento() && <Route exact path={`${props.match.url}/excepcion-descuento`} render={(props) => <ExcepcionDescuento cliente={cliente} />} />}
                                {PermisoExcepcionDescuento() && <Route exact path={`${props.match.url}/dias-gracia`} render={(props) => <DiasGracia cliente={cliente} />} />}
                            </Switch>
                        </div>
                    </div></>)
            }
        </div>
    </>)
}