import React, { useState, useEffect } from 'react';
import { Dropdown } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'
import {
    Card,
    CardContent,
} from '@material-ui/core';

const ClienteSelected = (props) => {
    const [Value, setValue] = useState(null);
    useEffect(() => {
        props.cargarClientes();
        // eslint-disable-next-line
    },[]);

    var options = [];
    const handleOnChange = (value) => {
        var val = JSON.parse(value);
        setValue(value);
        props.cargarAcuerdosActivos(val)
    }

    props.clientes.map(el => {
        var cliente = { key: el.Codigo, value: JSON.stringify(el), text: el.Codigo + ' - ' + el.Nombre }
        options.push(cliente);
        return 0;
    })

    return (
        <>
            <Card className="my-2" style={{ overflow: 'unset' }}>
                <CardContent>
                    <div>
                        <div className="row mt-2">
                            <div className="col">
                                <h5 className="font-weight-light">
                                    Clientes
                            </h5>
                                <hr />
                            </div>
                        </div>
                        <div className={'row mb-3'}>
                            <div className={'col-xl-12 col-lg-12 col-sm-9 col-12 mt-2'} >
                                <Dropdown
                                    placeholder="Seleccione Cliente"
                                    fluid
                                    search
                                    selection
                                    onChange={(e, { value }) => handleOnChange(value)}
                                    options={options}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 999 }}
                                    value={Value}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
export default ClienteSelected;



