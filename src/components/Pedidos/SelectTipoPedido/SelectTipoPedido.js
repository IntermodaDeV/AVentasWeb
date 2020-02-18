import React from 'react';
import {
    Button,
} from 'reactstrap';
import { Menu, MenuItem, Divider, Typography, Zoom } from '@material-ui/core';

const SelectTipoPedido = (props) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = event => {
        setAnchorEl(event.currentTarget);
    };

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

                {props.tiposPedido.map((tipoPedido, index) => {

                    if (tipoPedido.Aplica_Todos) {
                        return (
                            <div key={index} className="col-xl-3 col-md-6 col-lg-6 col-12">
                                <Button style={{ marginBottom: '10px' }} key={index} onClick={() => props.setTipoPedido(tipoPedido)} outline color="secondary" size="lg" block>{tipoPedido.TipoPedido}</Button>
                            </div>
                        );
                    }
                    if (props.Cliente.AcuerdosVenta != null && props.Cliente.AcuerdosVenta.length > 0) {
                        let acuertosVenta = [];
                        props.Cliente.AcuerdosVenta.forEach(ac => {
                            if (ac.IdTipoPedido === tipoPedido.IdTipoPedido) {
                                acuertosVenta.push(ac);
                            }
                        });//(ac => ac.IdTipoPedido === tipoPedido.IdTipoPedido);

                        if (acuertosVenta.length > 0) {
                            let plural = acuertosVenta.length === 1 ? "Acuerdo" : "Acuerdos";
                            return (
                                <div key={index} className="col-xl-3 col-md-6 col-lg-6 col-12">
                                    <Button style={{ marginBottom: '10px' }} key={index} onClick={handleClick} outline color="secondary" size="lg" block>{tipoPedido.TipoPedido}</Button>
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
                                        {/* onClick={() => props.setTipoPedido(tipoPedido)} */}
                                        {acuertosVenta.map((ac, index) => {
                                            let showDivider = !(acuertosVenta.length - 1 === index);
                                            return (
                                                <>
                                                    <MenuItem key={index} onClick={() => props.setTipoPedido(tipoPedido, ac)} >
                                                        <div>
                                                            <h4 className='font-weight-light my-1'>
                                                                {'#' + ac.IdAcuerdoxCliente}
                                                            </h4>
                                                            <h6 className='text-muted my-1'>
                                                                {'Saldo: ' + numberWithCommasNoDec(ac.Saldo)}
                                                            </h6>
                                                        </div>
                                                        {/* <b className='mr-1'>{'#' + ac.IdAcuerdoxCliente}</b>
                                                        {'Saldo: ' + ac.Saldo} */}
                                                    </MenuItem>
                                                    {
                                                        showDivider &&
                                                        <Divider component="li" />
                                                    }

                                                </>
                                            );
                                        })}
                                    </Menu>
                                </div>
                            );
                        }
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