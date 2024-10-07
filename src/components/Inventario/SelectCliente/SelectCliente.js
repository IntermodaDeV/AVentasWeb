import React, { useState, useEffect } from 'react';
import { Dropdown } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css';
import { DatePicker } from "@material-ui/pickers";
import CargarInventario from 'components/Inventario/CargarInventario';
import { permisoEliminarInventario } from 'components/Seguridad/Permisos';
import { InventarioAnterior } from 'components/Inventario/InventarioAnterior';
import { ResumenExcel } from 'components/Inventario/ResumenExcel';
import { mostrarAlerta } from 'utils/common';
import { Card, CardContent, Button } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';

const ClienteSelected = (props) => {
    const [value, setValue] = useState();
    const clientes = useSelector(e => e.clientes);
    const dispatch = useDispatch();
    const [showDialog, setShowDialog] = useState(false);
    const [invAnterior, setInvAnterior] = useState();
    const [pendienteProcesar, setPendienteProcesar] = useState([]);
    const [procesar, setProcesar] = useState();
    const [asesores, setAsesores] = useState([]);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);
    const asesor = AsesoresUsuario.find(a => a.Usuario === localStorage.getItem('codigo'));
    const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30));
    const [AsesorSelected, setAsesorSelected] = useState(asesor ? asesor.Usuario : AsesoresUsuario[0].Usuario);

    const handleOnChange = async (value) => {
        setValue(value);
        dispatch({ type: 'SET_INVENTARIOCLIENTE', payload: value });
        try {
            if (permisoEliminarInventario()) {
                const request = await axios.get(`${APIURL}/api/pendienteProcesar/${value.Codigo}`);
                if (request.data) {
                    setPendienteProcesar(request.data);
                    setProcesar(true);
                } else {
                    setProcesar(false);
                }
            }
            const request = await axios.get(`${APIURL}/api/inventarioIncompleto/${value.Codigo}`);
            if (request.data.length > 0) {
                dispatch({ type: 'SET_DETALLEINVENTARIO', payload: request.data });
                dispatch({ type: 'SET_INVENTARIOANTERIOR', payload: true });
                setInvAnterior(true);
            } else {
                setInvAnterior(false);
                dispatch({ type: 'SET_INVENTARIOANTERIOR', payload: false });
            }

        } catch (err) {
            let mensaje = "No se pudo obtener los registros.";
            let error = "FCPI02";

            if (err.response) {
                mensaje = err.response.data.Message;
                error = err.response.data.ErrorCode;
            }

            mostrarAlerta("Error " + error, mensaje, "error");
        }
    };

    const handleFechaInicio = (fecha) => {
        setFechaInicio(fecha);
    };

    const handleOnChangeAsesor = (value) => {
        setAsesorSelected(value);
    };

    useEffect(() => {
        dispatch({ type: "SET_TABLEVALUEINVENTARIO", payload: {} });
        let asesoresMap = AsesoresUsuario.map(Ase => ({ key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }));
        setAsesores(asesoresMap);
    }, []);

    const obtenerClientes = () => {
        return clientes.map(el => ({ key: el.Codigo, value: el, text: `${el.Codigo}-${el.Nombre}` }));
    };

    const continuarInventrio = () => {
        ruta();
    };

    const ruta = () => {
        props.history.push("/inventario/inventario");
    };

    const handleInventarioCargado = (informacion) => {
        setPendienteProcesar(informacion);
        if (informacion.NoProcesados > 0)
            setProcesar(true)
        else
            setProcesar(false);
    };

    return (
        <>
            <Card className="my-2" style={{ overflow: 'unset' }}>
                <CardContent>
                    <div>
                        <div className="row mt-2">
                            <div className="col">
                                <h5 className="font-weight-light">Tomar Inventario</h5>
                                <hr />
                            </div>
                        </div>
                        {!permisoEliminarInventario() && (
                            <div className={'row mb-3'}>
                                <div className={'col-xl-10 col-lg-10 col-sm-9 col-12 mt-2'}>
                                    <Dropdown
                                        placeholder="Seleccione Cliente"
                                        fluid
                                        search
                                        selection
                                        onChange={(e, { value }) => handleOnChange(value)}
                                        options={obtenerClientes()}
                                        noResultsMessage={"No hay resultados"}
                                        closeOnChange={true}
                                        style={{ zIndex: 999 }}
                                        multiple={false}
                                        value={value}
                                    />
                                </div>
                                <div className={'col-xl-2 col-lg-2 col-sm-3 col-12 mt-2 text-lg-left text-right'}>
                                    {!invAnterior ? (
                                        <Button
                                            disabled={!value}
                                            onClick={() => continuarInventrio(value)}
                                            variant="contained"
                                            color="primary">
                                            Nuevo
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled={!value}
                                            onClick={() => continuarInventrio(value)}
                                            variant="contained"
                                            color="secondary">
                                            Continuar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        {permisoEliminarInventario() && (
                            <div className={'row mb-3'}>
                                <div className={'col-xl-7 col-lg-6 col-12 mt-2'}>
                                    <Dropdown
                                        placeholder="Seleccione Cliente"
                                        fluid
                                        search
                                        selection
                                        onChange={(e, { value }) => handleOnChange(value)}
                                        options={obtenerClientes()}
                                        noResultsMessage={"No hay resultados"}
                                        closeOnChange={true}
                                        style={{ zIndex: 999 }}
                                        multiple={false}
                                        value={value}
                                    />
                                </div>
                                <Dropdown
                                    placeholder="Asesor"
                                    selection
                                    style={{ marginLeft: '10px' }}
                                    onChange={(e, { value }) => handleOnChangeAsesor(value)}
                                    options={asesores}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    value={AsesorSelected}
                                />
                                <DatePicker
                                    disableToolbar
                                    autoOk
                                    style={{ marginLeft: '10px' }}
                                    label={"Fecha inventario"}
                                    variant="inline"
                                    format={"DD/MM/YYYY"}
                                    value={fechaInicio}
                                    onChange={(date) => handleFechaInicio(date)}
                                />
                                {!procesar && (
                                    <Button
                                        style={{ marginLeft: '10px' }}
                                        disabled={!value}
                                        onClick={() => setShowDialog(true)}
                                        variant="contained"
                                        color="secondary">
                                        Cargar Inventario
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <CargarInventario
                showDialog={showDialog}
                setDialog={() => setShowDialog(false)}
                productosCargados={handleInventarioCargado}
                asesor={AsesorSelected}
                fecha={fechaInicio}
            />
            {pendienteProcesar.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <ResumenExcel informacion={pendienteProcesar} />
                </div>
            )}
            {value && (
                <div style={{ marginTop: 20 }}>
                    <InventarioAnterior cliente={value} />
                </div>
            )}
        </>
    );
};

export default ClienteSelected;