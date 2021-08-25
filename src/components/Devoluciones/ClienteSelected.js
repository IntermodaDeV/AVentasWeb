import React, { useState } from 'react';
import { Dropdown } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'
import {
    Card,
    CardContent,
    Button,
} from '@material-ui/core';
import { useSelector } from 'react-redux';

const ClienteSelected = (props) => {
    const [value, setValue] = useState();
    const clientes = useSelector(e => e.clientes);

    const handleOnChange = (value) => {
        setValue(value);
    }

    const obtenerClientes = () => {
        return clientes.map(el => ({ key: el.Codigo, value: JSON.stringify(el), text: `${el.Codigo}-${el.Nombre}` }))
    }

    return (
        <>
            <Card className="my-2" style={{ overflow: 'unset' }}>
                <CardContent>
                    <div>
                        <div className="row mt-2">
                            <div className="col">
                                <h5 className="font-weight-light">
                                    Clientes para Devolución
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
                                <Button
                                    disabled={value ? false : true}
                                    onClick={() => props.cargarProductoDevolucion(value)}
                                    variant="contained"
                                    color="primary">
                                    Continuar
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
export default ClienteSelected;



