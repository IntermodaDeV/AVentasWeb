import React, { useState, useEffect } from 'react';
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
import {useDispatch} from 'react-redux';

const TransitionGrow = React.forwardRef(function Transition(props, ref) {
    return <Grow ref={ref} {...props} />;
});

const SelectCliente = (props) => {

    const [Value, setValue] = useState(null);
    const dispatch = useDispatch();

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

    // let FacturacionEntrega = null;
    var alerta = false;
    var options = [];

    const handleOnChange = (value) => {
        var val = JSON.parse(value);

        setValue(value);
        props.onSelect(val);
        localStorage.setItem('isVencido',false);
        localStorage.setItem('isAnticipo',false);
        localStorage.setItem('isFavor',false);
        localStorage.setItem("saldoFavor",0);
        dispatch({type:'delete_pedidoselected'});
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
                        <div className={'col-xl-10 col-lg-10 col-sm-9 col-12 mt-2'} >
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

                        <div className={'col-xl-2 col-lg-2 col-sm-3 col-12 mt-2 text-lg-left text-right'}>
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



