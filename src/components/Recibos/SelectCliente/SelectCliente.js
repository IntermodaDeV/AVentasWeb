import React, { useState, useEffect } from 'react';
import styles from 'components/Pedidos/SelectCliente/SelectCliente.module.css';
import { Dropdown } from "semantic-ui-react";
import MySnackbarContentWrapper from 'components/Global/snackbar'
import 'semantic-ui-css/semantic.min.css'
import { SyncLoader } from 'react-spinners';
import {
    Button,
    Grow,
    Snackbar,
    Card,
    CardContent,
} from '@material-ui/core';

const TransitionGrow = React.forwardRef(function Transition(props, ref) {
    return <Grow ref={ref} {...props} />;
});

const SelectCliente = (props) => {

    const [Value, setValue] = useState(null);

    useEffect(() => {
        if (props.codigoClientePreseleccionado !== null && props.clientes.length > 0) {
            let cliente = props.clientes.find(cl => {
                return cl.Codigo === props.codigoClientePreseleccionado;
            });
            if (cliente) {
                setValue(JSON.stringify(cliente));
                props.onSelect((cliente));
            }
        }
        // eslint-disable-next-line
    }, [props.clientes]);

    let infoCliente = null;
    // let FacturacionEntrega = null;
    var alerta = false;
    var options = [];

    const handleOnChange = (value) => {
        var val = JSON.parse(value);

        setValue(value);
        props.onSelect(val);
    }

    props.clientes.map(el => {
        var cliente = { key: el.Codigo, value: JSON.stringify(el), text: el.Codigo + ' - ' + el.Nombre }
        options.push(cliente);
        return 0;
    })

    if (!(props.clienteSelected != null && (props.clienteSelected.FacturacionEntrega === "No" || props.clienteSelected.FacturacionEntrega === "Nunca"))) {
        /*  FacturacionEntrega = (
             <div className="alert alert-danger alert-dismissible fade show" role="alert">
                 <FiAlertTriangle style={{ fontSize: '20px', color: 'red' }} />  El cliente actualmente se encuentra en mora.
             </div>
         ) */


        if (props.clienteSelected !== null && props.clienteSelected !== false) {
            alerta = true;
        }

    };

    if (props.clienteSelected) {
        if (props.infoCliente)
            infoCliente = props.infoCliente(props, styles)

    }
    return (
        <Card className="my-2" style={{ overflow: 'unset' }}>
            <CardContent>
                <div>
                    <div className="row mt-2">
                        <div className="col">
                            <h5 className="font-weight-light">
                                Nuevo Recibo
                    </h5>
                            <hr />
                        </div>
                    </div>
                    <div className={'row mb-3'}>
                        <div className={'col-xl-10 col-lg-10 col-xs-12 col-sm-10'} >
                            <Dropdown
                                placeholder="Ingrese Cliente"
                                fluid
                                search
                                selection
                                loading={props.clientes === [] ? true : false}
                                onChange={(e, { value }) => handleOnChange(value)}
                                options={options}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                                value={Value}
                            />
                        </div>

                        <div className={'col-xl-2 col-lg-2 col-xs-12 col-sm-2'}>
                            <Button
                                disabled={props.clienteSelected ? false : true}
                                onClick={props.setCliente}
                                variant="contained"
                                color="primary">
                                Continuar
                    </Button>
                        </div>
                    </div>

                    {
                        props.loading &&
                        <div style={{ textAlign: "center", marginTop: '25px' }}>
                            <SyncLoader
                                size={20}
                                color={'#31547C'}
                                loading={props.loading} />
                        </div>
                    }

                    {infoCliente}

                    <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} style={{ zIndex: 10 }} open={alerta} TransitionComponent={TransitionGrow}>
                        <MySnackbarContentWrapper
                            variant="error"
                            message="El cliente actualmente se encuentra en mora"
                        />
                    </Snackbar>
                </div>
            </CardContent>
        </Card>
    );
}
export default SelectCliente;



