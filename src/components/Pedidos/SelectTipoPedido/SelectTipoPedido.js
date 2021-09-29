import React from 'react';
import {
    Button,
} from 'reactstrap';
import { Menu, MenuItem, Divider, Typography, Zoom } from '@material-ui/core';
import { useSelector } from 'react-redux';

const SelectTipoPedido = (props) => {
    const lineaSeleccionada = useSelector(e => e.LineaSeleccionada);
    const BloqueoCredito = useSelector(e => e.Permisos[0].BloqueoCredito);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [acuerdosSeleccionados, setAcuerdosSeleccionados] = React.useState([]);
    const [tipoPedidoSeleccionado, setTipoPedidoSeleccionado] = React.useState(null);

    const handleClick = (event, a, t) => {
        setAnchorEl(event.currentTarget);
        setAcuerdosSeleccionados(a);
        setTipoPedidoSeleccionado(t)
    };


    const acuerdosFiltrados = props.Cliente.AcuerdosVenta.filter(x => x.Linea === lineaSeleccionada.IdLinea);
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <div className="row">
                <div className="col">
                    <h5 className="font-weight-light">
                        Seleccionar Tipo de Pedido
                    </h5>
                    <hr />
                </div>
            </div>

            <div className="row">

                {props.tiposPedido.map((tipoPedido) => {

                    if (tipoPedido.Aplica_Todos) {

                        if (tipoPedido.TipoPedido === "Contado") {
                            return (
                                <div key={tipoPedido.TipoPedido} className="col-xl-3 col-md-6 col-lg-6 col-12">
                                    <Button style={{ marginBottom: '10px' }} onClick={() => props.setTipoPedido(tipoPedido)} outline color="secondary" size="lg" block>{tipoPedido.TipoPedido}</Button>
                                </div>
                            );
                        }

                        if (!BloqueoCredito) {
                            return (
                                <div key={tipoPedido.TipoPedido} className="col-xl-3 col-md-6 col-lg-6 col-12">
                                    <Button style={{ marginBottom: '10px' }} onClick={() => props.setTipoPedido(tipoPedido)} outline color="secondary" size="lg" block>{tipoPedido.TipoPedido}</Button>
                                </div>
                            );
                        }
                    }

                    let acuerdosFiltradoTipoPedido = acuerdosFiltrados.filter(x => x.IdTipoPedido === tipoPedido.IdTipoPedido);
                    if (acuerdosFiltradoTipoPedido.length > 0) {
                        let plural = acuerdosFiltradoTipoPedido.length === 1 ? "Acuerdo" : "Acuerdos";
                        return (
                            <div key={tipoPedido.TipoPedido} className="col-xl-3 col-md-6 col-lg-6 col-12">
                                <Button style={{ marginBottom: '10px' }} onClick={(e) => { handleClick(e, acuerdosFiltradoTipoPedido, tipoPedido) }} outline color="secondary" size="lg" block>{tipoPedido.TipoPedido}</Button>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    getContentAnchorEl={null}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    TransitionComponent={Zoom}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                >
                                    <li>
                                        <Typography
                                            className="text-center"
                                            color="textSecondary"
                                            display="block"
                                            variant="caption"
                                        >
                                            {plural} de Venta
                                        </Typography>
                                    </li>
                                    <Divider component="li" />
                                    {acuerdosSeleccionados.map((ac, index) => {
                                        let showDivider = !(acuerdosSeleccionados.length - 1 === index);
                                        return (
                                            <div key={ac.IdAcuerdoxCliente}>
                                                <MenuItem key={index} onClick={() => props.setTipoPedido(tipoPedidoSeleccionado, ac)} >
                                                    <div>
                                                        <h4 className='font-weight-light my-1'>
                                                            {'#' + ac.IdAcuerdoxCliente}
                                                        </h4>
                                                        <h6 className='text-muted my-1'>
                                                            {'Saldo: ' + numberWithCommasNoDec(ac.Saldo)}
                                                        </h6>
                                                    </div>
                                                </MenuItem>
                                                {
                                                    showDivider &&
                                                    <Divider component="li" />
                                                }
                                            </div>
                                        );
                                    })}
                                </Menu>
                            </div>
                        );
                    }

                    return false;

                })

                }
            </div>
        </>
    )
}



const numberWithCommasNoDec = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
export default SelectTipoPedido;