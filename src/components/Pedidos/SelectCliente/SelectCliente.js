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
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import ClienteContado from './ClienteContado';
import {useDispatch} from 'react-redux';

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
    var alerta = false;
    var options = [];

    // const handleClickOpen = () => {
    //     setOpen(true);
    // }

    const handleClose = () => {
        setOpen(false);
    }

    const handleOnChange = (value) => {
        var val = JSON.parse(value);

        setValue(value);
        props.onSelect(val);
        dispatch({type:'DELETE_CLIENTECONTADO'});
        dispatch({type:'DELETE_REQUIEREENTREGA'});
    }

    props.clientes.forEach(el => {
        var cliente = { key: el.Codigo, value: JSON.stringify(el), text: el.Codigo + ' - ' + el.Nombre }
        options.push(cliente);
    })

    if (!(props.autocompleteValue != null && (props.autocompleteValue.FacturacionEntrega === "No" || props.autocompleteValue.FacturacionEntrega === "Nunca"))) {
        FacturacionEntrega = (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <FiAlertTriangle style={{ fontSize: '20px', color: 'red' }} />  El cliente actualmente se encuentra en mora.
            </div>
        )


        if (props.autocompleteValue !== null && props.autocompleteValue !== false) {
            alerta = true;
        }

    };


    if (props.autocompleteValue) {

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
                                        <td className={styles.InfoLabel} >
                                            {'Departamento: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.ComunidadAutonoma}
                                        </td>
                                    </tr>
                                    {/* <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Facturacion Entrega: '}
                                        </td>
                                        <td> {props.autocompleteValue.FacturacionEntrega}</td>
                                    </tr> */}

                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Nombre:'}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.Nombre}
                                        </td>
                                    </tr>
                                    {/* <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Grupo Cliente: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.GrupoCliente}
                                        </td>
                                    </tr> */}
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'Estado Crediticio: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.autocompleteValue.FacturacionEntrega}</td>
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

                                {/* <Button
                                    onClick={handleClickOpen}
                                    className="mb-2"
                                    variant="outlined"
                                    color="primary">
                                    Histórico
                                </Button> */}

                                {FacturacionEntrega}
                            </div>

                        </div>
                        <div className="col-md-6">
                            <span className={styles["TCenterContainer"]}>
                                <h5 className={styles["TCenter"]}>Información Crediticia</h5>
                            </span>
                            {/* <button disabled="" className="btn btn-outline-primary disabled">Ultimo Pedido Lps. 25,000.00</button> */}
                            {/* <button disabled="" className="btn btn-outline-primary disabled">Limite de Credito Disponible Lps. 42,000.00</button> */}
                            <table className="table table-responsive-xl">
                                {/* <thead>
                                    <tr>
                                        <th>
                                            Descripcion
                                        </th>
                                        <th>
                                            Valor
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.autocompleteValue.CuentaCorriente.map((cuentaCorriente, index) => {
                                        let classBold = "";
                                        let classBoldDanger = "";
                                        if (cuentaCorriente.Descripcion === "Saldo cupo de crédito") {
                                            classBold += "font-weight-bold";
                                            classBoldDanger += "font-weight-bold";

                                            if (cuentaCorriente.Valor < 0) {
                                                classBoldDanger += " text-danger";
                                            }
                                        }
                                        return (
                                            <tr key={index}>
                                                <td className={classBold}>
                                                    {cuentaCorriente.Descripcion}
                                                </td>
                                                <td className={classBoldDanger}>
                                                    {cuentaCorriente.Valor.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody> */}
                                <thead>
                                    <tr>
                                        <th>
                                            Tipo
                                    </th>
                                        <th>
                                            Disponible
                                    </th>
                                        <th>
                                            SaldoTotal
                                    </th>
                                        <th>
                                            -15 Dias
                                    </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.autocompleteValue.Credito.map((credito, index) => {
                                        return (
                                            <tr key={index}>

                                                <td>{credito.Tipo}</td>
                                                <td>{credito.Disponible ? credito.Disponible.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : 0}</td>
                                                <td>{credito.SaldoTotal ? credito.SaldoTotal.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : 0}</td>
                                                <td>{credito.C15Dias ? credito.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') : 0}</td>
                                            </tr>
                                        )
                                    })}
                                    <tr>

                                        <td>{<b>Total</b>}</td>
                                        <td></td>
                                        <td>{props.autocompleteValue.Moneda} {props.autocompleteValue.Credito.reduce((acc, cur) => { return acc + ((cur.SaldoTotal ? cur.SaldoTotal : 0)) }, 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                                        <td>{props.autocompleteValue.Moneda} {props.autocompleteValue.Credito.reduce((acc, cur) => { return acc + ((cur.C15Dias ? cur.C15Dias : 0)) }, 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</td>
                                    </tr>
                                    <tr>
                                        {props.autocompleteValue.Nombre.includes('CONSUMIDOR FINAL') && <td><Button onClick={()=>setOpenContado(true)} variant="contained" color="primary">Cliente Contado</Button></td>}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

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
                <CancelPresentationIcon onClick={()=>{setOpenContado(false)}}/>
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Cliente Contado
                    </div>
                </DialogTitle>
                <DialogContent>
                
                   { props.autocompleteValue!==null && <ClienteContado ruta={props.autocompleteValue.CodigoRuta}/>}
                    
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
                                onClick={props.setCliente}
                                variant="contained"
                                color="primary">
                                Continuar
                                </Button>
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
                    message="El cliente actualmente se encuentra en mora"
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
        </div>
    );
}
export default SelectCliente;



