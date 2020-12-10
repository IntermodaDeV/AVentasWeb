import React, { useState, useEffect } from 'react';
import styles from 'components/Pedidos/SelectCliente/SelectCliente.module.css';
import Historico from 'components/Pedidos/SelectCliente/Historico';
import { Dropdown } from "semantic-ui-react";
import { FiAlertTriangle } from 'react-icons/fi';
import MySnackbarContentWrapper from 'components/Global/snackbar'
import 'semantic-ui-css/semantic.min.css'
import { SyncLoader } from 'react-spinners';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import {
    Button,
    Slide,
    Grow,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Snackbar
} from '@material-ui/core';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import ClienteContado from './ClienteContado';
import {useDispatch,useSelector} from 'react-redux';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import logo from './iconfinder_Close_2001866.png';
import {numberWithCommas} from 'utils/common';
import CachedIcon from '@material-ui/icons/Cached';
import axios from 'axios';
import { Loading } from 'components/Global/Loading';
import { APIURL } from 'utils/Enviroment';
import { verificarConexion } from 'utils/http';

const TransitionGrow = React.forwardRef(function Transition(props, ref) {
    return <Grow ref={ref} {...props} />;
});

const TransitionSlide = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles(theme => ({
    appBar: {
        position: 'sticky',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
}));

const SelectCliente = (props) => {
    const [open, setOpen] = useState(false);
    const [Value, setValue] = useState(null);
    const [openContado,setOpenContado] = useState(false);
    const dispatch = useDispatch();
    const clienteContado = useSelector(e=>e.clienteContado);
    const clientes = useSelector(e=>e.clientesContado);
    const Monedas = useSelector(e=>e.AbreviacionMonedas);
    const Comunidad = useSelector(e=>e.comunidadesAutonomas);
    const BloqueoCredito = useSelector(e=>e.Permisos[0].BloqueoCredito);
    const [loading,setLoading] = useState(false);
    const [mensaje,setMensaje] = useState("Cargando clientes")

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

    const classes = useStyles();
    let infoCliente = null;
    let FacturacionEntrega = null;
    let empresa = localStorage.getItem('empresa');
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

    const recargarClientes = async () =>{
        let isOnline = await verificarConexion();
        if (localStorage.getItem("Conexion") === "offline") {
            mostrarAdvertencia("Modo Offline", "Se encuentra en modo offline, no puede actualizar registros.", "warning");
        } else {
            if (!isOnline) {
                mostrarAdvertencia('Sin internet', 'Necesita internet para poder actualizar los registros.', 'warning');
            } else {
                setLoading(true)
                axios.get(APIURL + "/api/cliente/pedido", {
                    headers: {
                        'Authorization':
                            'Bearer ' + localStorage.getItem('token')
                    }
                }).then(data => {
                    dispatch({ type: 'STORE_CLIENTES', clientes: data.data })
                    recargarListaPrecios(data.data);
                }).catch(err => {
                    console.log(err);
                    setLoading(false)
                })
            }
        }
    }

    const recargarListaPrecios = data => {
        setMensaje("Cargando colecciones")
        const listaPrecios = [...new Set(data.map(x => x.GrupoPrecio))];
        const paises = [...new Set(data.map(x => x.EmpresaId))];

        axios.get(APIURL + "/api/colecciones/listaprecios", {
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                ListaPrecios: listaPrecios,
                Paises: paises
            }
        })
            .then(data => { 
                dispatch({type:'SET_LISTAPRECIOS',payload:data.data});
                setLoading(false);
                setMensaje("Cargando clientes")
            })
            .catch(err => {
                setLoading(false);
                console.log(err)
            });
    }

   const continuarPedido = ()=>{
    if(props.autocompleteValue.Credito[0].Disponible<=1){
        Swal.fire({
            title: 'Aviso',
            text: 'El cliente no tiene credito disponible, el pedido no sera autorizado automaticamente.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.value) {
                props.setCliente();
            }
          })
    }else{
        props.setCliente();
    }
    props.onSetTableValue({});
    props.onSetTotalPedido(0);
    props.onSetNumeroOrden(null);
    localStorage.removeItem("ColeccionSeleccionada");
   }

    const handleClose = () => {
        setOpen(false);
    }

    const handleOnChange = (value) => {
        var val = JSON.parse(value);

        setValue(value);
        props.onSelect(val);
        dispatch({type:'DELETE_CLIENTECONTADO'});
        dispatch({type:'DELETE_REQUIEREENTREGA'});
        dispatch({type:'DELETE_FLETE'});
        localStorage.setItem('Impuesto',0);
    }

    props.clientes.forEach(el => {
        var cliente = { key: el.Codigo, value: JSON.stringify(el), text: el.Codigo + ' - ' + el.Nombre }
        options.push(cliente);
    })

    if (!(props.autocompleteValue != null && (props.autocompleteValue.FacturacionEntrega === "No" || props.autocompleteValue.FacturacionEntrega === "Nunca"))) {
        FacturacionEntrega = (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <FiAlertTriangle style={{ fontSize: '20px', color: 'red' }} />  El cliente actualmente se encuentra con bloqueo ó en mora.
            </div>
        )


        if (props.autocompleteValue !== null && props.autocompleteValue !== false) {
            alerta = true;
        }

    };

    if (props.autocompleteValue != null && props.autocompleteValue.EmpresaId.toUpperCase() !== empresa.toUpperCase() && props.autocompleteValue !== false) {
        EsVisible = true;
    }

    if (props.autocompleteValue) {
        let DisponibleTotal = 0;
        let ValorCreditoTotal = 0;
        let CXCTotal = 0;
        infoCliente = (
            <Card>
                <CardContent>
                    <div className="row">
                        <div className="col-md-6">
                            <span className={styles["TCenterContainer"]}>
                                <h5 className={styles["TCenter"]}>Información General</h5>
                            </span>
                            <table className='table table-responsive-xl' style={{ border: "none" }}>
                                <tbody>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Codigo: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Codigo}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Nombre:'}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Nombre}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Bloqueo Crediticio: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.FacturacionEntrega}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Grupo Precios: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {`${props.autocompleteValue.GrupoPrecio} - ${props.autocompleteValue.NombreGrupoPrecio}`}</td>
                                    </tr>
                                    <tr>
                                        <td className={styles.InfoLabel} >
                                            {'Departamento: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.ComunidadAutonoma?Comunidad.find(x=>x.STATEID===props.autocompleteValue.ComunidadAutonoma).NAME:''}
                                        </td>
                                    </tr>                                                                      
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Direccion: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Direccion}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div>
                                {FacturacionEntrega}
                            </div>

                        </div>
                        {(!BloqueoCredito) &&
                        <div className="col-md-6">
                            <span className={styles["TCenterContainer"]}>
                                <h5 className={styles["TCenter"]}>Información Crediticia</h5>
                            </span>                           
                            <table className="table table-responsive-xl">
                                <thead>
                                    <tr>
                                        <th>
                                            Tipo
                                    </th>
                                        <th>
                                            Valor Credito
                                    </th>
                                    <th>
                                            Saldo CxC
                                    </th>
                                        <th>
                                            Disponible
                                    </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.autocompleteValue.Credito.map((credito, index) => {
                                        DisponibleTotal = DisponibleTotal + credito.Disponible;
                                        ValorCreditoTotal = ValorCreditoTotal + credito.Valor;
                                        CXCTotal = CXCTotal + credito.SaldoTotal;
                                        return (
                                            <tr key={index}>

                                                <td>{credito.Tipo}</td>
                                                <td style={{color:credito.Valor>0?'green':'red'}}>{credito.Valor ? numberWithCommas(credito.Valor) : 0}</td>
                                                <td>{credito.SaldoTotal ? numberWithCommas(credito.SaldoTotal) : 0}</td>
                                                <td style={{color:credito.Disponible>0?'green':'red'}}>{credito.Disponible ? numberWithCommas(credito.Disponible) : 0}</td>
                                            </tr>
                                        )
                                    })}
                                    <tr>
                                        <td>{<b>Total</b>}</td>
                                        <td style={{color:parseFloat(numberWithCommas(ValorCreditoTotal))>0?'green':'red'}}>{Monedas.find(e=>e.IdMoneda === props.autocompleteValue.Moneda).Abreviacion} {numberWithCommas(ValorCreditoTotal)}</td>
                                        <td>{Monedas.find(e=>e.IdMoneda === props.autocompleteValue.Moneda).Abreviacion} {numberWithCommas(CXCTotal)}</td>
                                        <td style={{color:parseFloat(numberWithCommas(DisponibleTotal))>0?'green':'red'}}>{Monedas.find(e=>e.IdMoneda === props.autocompleteValue.Moneda).Abreviacion} {numberWithCommas(DisponibleTotal)}</td>
                                    </tr>
                                    <tr>
                                        {props.autocompleteValue.Nombre.includes('CONSUMIDOR FINAL') && <td><Button onClick={()=>setOpenContado(true)} variant="contained" color="primary">{(clienteContado===null)?'Crear cliente contado':'Editar cliente contado'}</Button></td>}
                                        {props.autocompleteValue.Nombre.includes('CONSUMIDOR FINAL') && <td>
                                        <Dropdown
                                                placeholder="Seleccione cliente contado"
                                                fluid
                                                search
                                                selection
                                                onChange={(e, { value }) =>{
                                                    let cliente = clientes.find(x=>x.id===value);
                                                    dispatch({type:'SET_CLIENTECONTADO',payload:cliente});
                                                }}
                                                options={clientes.map(cliente => {
                                                    return {key:cliente.id, value:cliente.id,text:cliente.Nombre}
                                                })}
                                                noResultsMessage={"No hay resultados"}
                                                closeOnChange={true}
                                        />
                                            </td>}
                                        {props.autocompleteValue.Nombre.includes('CONSUMIDOR FINAL') && <td>Cliente Seleccionado: {clienteContado===null?'Ninguno':clienteContado.Nombre}</td>}
                                    </tr>
                                </tbody>
                            </table>
                        </div>}

                    </div>

                </CardContent>
            </Card>
        );
    }
    return (
        <div className="col">
            <Dialog
            disableBackdropClick 
            scroll={'paper'}
            open={openContado}
            >
                <img alt="closeicon" src={logo} style={{width:'30px',height:'30px',marginLeft:'500px'}} onClick={()=>{setOpenContado(false)}}/>
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Cliente Contado
                    </div>
                </DialogTitle>
                <DialogContent>
                
                   { props.autocompleteValue!==null && <ClienteContado cliente={clienteContado} validacion={false}/>}
                    
                </DialogContent>
        </Dialog>
            <Card style={{ overflow: 'unset' }}>

                <CardContent>
                    <div className="row mt-2">
                        <div className="col">
                            <h5 className="font-weight-light">
                                Nuevo Pedido
                                </h5>
                            <hr />
                        </div>
                    </div>
                    <div className={'row mb-3'}>
                        <div className={'col-xl-10 col-lg-10 col-sm-9 col-12 mt-2'} >
                            <Dropdown
                                className="Holis"
                                placeholder="Ingrese Cliente"
                                fluid
                                search
                                selection
                                onChange={(e, { value }) => handleOnChange(value)}
                                options={options}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                                value={Value}
                            />
                        </div>

                        <div className={'col-xl-2 col-lg-2 col-sm-3 col-12 mt-2 text-lg-left text-right'}>
                            <Button
                                disabled={props.autocompleteValue ? false : true}
                                onClick={continuarPedido}
                                variant="contained"
                                color="primary">
                                Continuar
                                </Button>
                                <Button style={{marginLeft:15}} onClick={recargarClientes} variant="contained" color="primary"><CachedIcon/></Button>
                        </div>
                    </div>

                </CardContent>


            </Card>

            {/* <div>
                        <SignatureCanvas canvasProps={{width: 400, height: 400, className: 'sigCanvas'}}
                            ref={sigPad} />
                    </div> */}
            <div style={{ textAlign: "center", marginTop: '25px' }}>
                <SyncLoader
                    size={20}
                    color={'#31547C'}
                    loading={props.loading} />
            </div>
            {infoCliente}

            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} style={{ zIndex: 10 }} open={alerta} TransitionComponent={TransitionGrow}>
                <MySnackbarContentWrapper
                    variant="error"
                    message="El cliente actualmente se encuentra con bloqueo ó  en mora."
                />
            </Snackbar>

            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} style={{ zIndex: 10 }} open={EsVisible} TransitionComponent={TransitionGrow}>
                        <MySnackbarContentWrapper
                            variant="error"
                            message="El cliente seleccionado no pertenece a su pais"
                        />
            </Snackbar>

            {
                props.autocompleteValue &&
                <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={TransitionSlide}>
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" className={classes.title}>
                                Histórico
                            </Typography>
                            <Button color="inherit" onClick={handleClose}>
                                Cerrar
                            </Button>
                        </Toolbar>
                    </AppBar>

                    <Historico nombre={props.autocompleteValue.Nombre} />

                </Dialog>
            }
            <Loading open={loading} title={mensaje}/>
        </div>
    );
}
export default SelectCliente;



