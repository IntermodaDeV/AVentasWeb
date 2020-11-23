import React from 'react';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

export const Cliente = (props) => {
    let style;

    if (props.seleccionado === undefined) {
        style = {
            border: '1px solid #ccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
        }
    } else {
        style = {
            border: '1px solid #ccc',
            cursor: 'pointer',
            backgroundColor: (props.seleccionado.Codigo === props.codigo) ? "#ccc" : "",
            display: 'flex',
            alignItems: 'center',
        }
    }

    return (
        <div onClick={() => { props.seleccionarCliente(props.codigo) }} style={style}>
            <div style={{ marginRight: '10px', marginLeft: '10px' }}>
                <AccountCircleRoundedIcon />
            </div>
            <div>
                <h5 style={{ fontFamily: 'Calibri' }}>{props.nombre}</h5>
                <h6>{props.codigo}</h6>
            </div>
        </div>
    )
}