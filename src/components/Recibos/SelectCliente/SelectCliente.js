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
import {useDispatch,useSelector} from 'react-redux';
import CachedIcon from '@material-ui/icons/Cached';
import axios from 'axios';
import { Loading } from 'components/Global/Loading';
import { APIURL } from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { verificarConexion } from 'utils/http';
import {FiAlertTriangle} from 'react-icons/fi';

const TransitionGrow = React.forwardRef(function Transition(props, ref) {
    return <Grow ref={ref} {...props} />;
});

const SelectCliente = (props) => {

    const [Value, setValue] = useState(null);
    const dispatch = useDispatch();
    const [loading,setLoading] = useState(false);
    const RecibosCache = useSelector(e=>e.RecibosEnCache);
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
        //dispatch({type:'DELETE_RECIBO_CUOTASCUENTACORRIENTE'})
        //dispatch({type:'DELETE_RECIBO_CLIENTESELECTED'})
        // eslint-disable-next-line
    }, [props.clientes]);

    // let FacturacionEntrega = null;
    var alerta = false;
    var EsVisible = false;
    var options = [];

    const mostrarAdvertencia = (title,text,type)=>{
        Swal.fire({
            title: title,
            text: text,
            type: type,
            confirmButtonText: 'Ok',
        })
    }

    const recargarClientes = async () => {
        let isOnline = await verificarConexion();
        if (localStorage.getItem("Conexion") === "offline") {
            mostrarAdvertencia("Modo Offline", "Se encuentra en modo offline, no puede actualizar registros.", "warning");
        } else {
            if (!isOnline) {
                mostrarAdvertencia('Sin internet', 'Necesita internet para poder actualizar los registros.', 'warning');
            } else {
                setLoading(true)
                axios.get(`${APIURL}/api/cliente/cuenta`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                        'Content-Type': 'application/json'
                    }
                })
                    .then(data => {
                        setLoading(false)
                        dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: data.data })
                    })
                    .catch(err => {
                        setLoading(false);
                        console.log(err)
                    })
            }
        }
    }

    const handleRecarga = () => {
        Swal.fire({
            title: 'Aviso',
            text: '¿Desea actualizar la información en el modulo de recibos?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                recargarClientes();
                props.ModuloConfiguraciones();
            }
        })
    }

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
    if(props.clienteSelected != null) 
        localStorage.setItem('EmpresaCliente', props.clienteSelected.EmpresaId);
        
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

    if (props.clienteSelected != null && props.clienteSelected.EmpresaId.toUpperCase() !== localStorage.getItem('empresa').toUpperCase() && props.clienteSelected !== false) {
        EsVisible = true;
    }

    const mensajeError = () => {
        if (props.clienteSelected !== null) {
            if (props.clienteSelected.FacturacionEntrega === "Todo") return "El cliente actualmente se encuentra bloqueado.";
            if (props.clienteSelected.FacturacionEntrega === "Factura") return "El cliente actualmente se encuentra deshabilitado por mora.";
        }
    }

    const Validacion = async () => {
        let isOnline = await verificarConexion();
        if (RecibosCache.length > 0 && isOnline && localStorage.getItem("Conexion") === "Online") {
            Swal.fire({
              title: 'Pendiente a Sincronizar',
              text: 'Tiene recibos en bandeja de salida, debera sincronizar para poder registrar un nuevo recibo.',
              type: 'error',
              confirmButtonText: 'OK',
          });
        }
        else{
            props.setCliente();
        }
        
    }
    
    return (
        <>
        {
            RecibosCache.length > 0 && localStorage.getItem("Conexion") === "Online" &&
            <div style={{ textAlign: 'center', fontSize: '24px' }} className="alert alert-danger alert-dismissible fade show" role="alert">
                <FiAlertTriangle style={{ fontSize: '28px', color: 'red' }} /> Tiene recibos en bandeja de salida, necesita sincronizar para poder registrar un nuevo recibo.
            </div>
        }
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
                                onClick={() => Validacion()}
                                variant="contained"
                                color="primary">
                                Continuar
                            </Button>
                            <Button style={{marginLeft:15}} onClick={handleRecarga} variant="contained" color="primary"><CachedIcon/></Button>
                        </div>
                        <Loading open={loading} title={"Cargando clientes"}/>
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
                            message={mensajeError()}
                        />
                    </Snackbar>

                    <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} style={{ zIndex: 10 }} open={EsVisible} TransitionComponent={TransitionGrow}>
                        <MySnackbarContentWrapper
                            variant="error"
                            message="El cliente seleccionado no pertenece a su pais"
                        />
                    </Snackbar>
                </div>
            </CardContent>
        </Card>
        </>
    );
}
export default SelectCliente;



