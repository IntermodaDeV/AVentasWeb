import React, { useState, useEffect } from 'react';
import { Dropdown } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'
import {
    Card,
    CardContent,
    Button,
} from '@material-ui/core';
const ClienteSelected = (props) => {
    const [Value, setValue] = useState([]);
    useEffect(() => {
        props.cargarClientes();
        // eslint-disable-next-line
    }, []);

    var options = [];
    const handleOnChange = (value) => {
        setValue(value);
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
                                    options={options}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 999 }}
                                    multiple={false}
                                    value={Value}
                                />
                            </div>
                            <div className={'col-xl-2 col-lg-2 col-sm-3 col-12 mt-2 text-lg-left text-right'}>
                                <Button
                                    disabled={Value ? false : true}
                                    onClick={()=>props.cargarProductoDevolucion(Value)}
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



