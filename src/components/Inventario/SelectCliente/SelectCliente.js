import React, { useState, useEffect } from 'react';
import { Dropdown } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'
import { InventarioAnterior } from 'components/Inventario/InventarioAnterior';
import {
    Card,
    CardContent,
    Button,
} from '@material-ui/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'
import { APIURL, APP_VERSION } from 'utils/Enviroment'


const ClienteSelected = (props) => {
    const [value, setValue] = useState();
    const clientes = useSelector(e => e.clientes);
    const dispatch = useDispatch();
    const [invAnterior, setInvAnterior] = useState(false);

    const handleOnChange = async (value) => {
        setValue(value);
        dispatch({ type: 'SET_INVENTARIOCLIENTE', payload: value })
        try {
            const request = await axios.get(`${APIURL}/api/inventarioIncompleto/${value.Codigo}`);
            if (request.data.length > 0) {
                dispatch({ type: 'SET_DETALLEINVENTARIO', payload: request.data })
                dispatch({ type: 'SET_INVENTARIOANTERIOR', payload: true })
                setInvAnterior(true);
            } else {
                setInvAnterior(false);
                dispatch({ type: 'SET_INVENTARIOANTERIOR', payload: false })
            }

        } catch (err) {

        }
    }

    const obtenerClientes = () => {
        return clientes.map(el => ({ key: el.Codigo, value: el, text: `${el.Codigo}-${el.Nombre}` }))
    }

    const continuarDevolucion = () => {
        ruta();
    }

    const ruta = () => {
        props.history.push("/inventario/inventario");
    }
    return (
        <>
            <Card className="my-2" style={{ overflow: 'unset' }}>
                <CardContent>
                    <div>
                        <div className="row mt-2">
                            <div className="col">
                                <h5 className="font-weight-light">
                                    Tomar Inventario
                                </h5>
                                <hr />
                            </div>
                        </div>
                        <div className={'row mb-3'}>
                            <div className={'col-xl-10 col-lg-10 col-sm-9 col-12 mt-2'} >
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
                                {!invAnterior && (
                                    <Button
                                        disabled={value ? false : true}
                                        onClick={() => continuarDevolucion(value)}
                                        variant="contained"
                                        color="primary">
                                        Nuevo
                                    </Button>
                                )}
                                {invAnterior && (
                                    <Button
                                        disabled={value ? false : true}
                                        onClick={() => continuarDevolucion(value)}
                                        variant="contained"
                                        color="secondary">
                                        Continuar
                                    </Button>
                                )}
                            </div>

                        </div>
                    </div>
                </CardContent>
            </Card>

            {value && <div style={{ marginTop: 20 }}> <InventarioAnterior cliente={value} /></div>}
        </>
    );
}
export default ClienteSelected;