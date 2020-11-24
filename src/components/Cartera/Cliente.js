import React from 'react';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

export const Cliente = (props) => {
    let style, styleText;

    if (props.seleccionado === undefined) {
        style = {
            border: '1px solid #ccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
        }

        styleText = {
            fontFamily: 'Calibri',
            color: "#000000",
            fontWeight: "normal"
        }

    } else {
        style = {
            border: '1px solid #ccc',
            cursor: 'pointer',
            backgroundColor: (props.seleccionado.Codigo === props.codigo) ? "#243746" : "",
            display: 'flex',
            alignItems: 'center',
        }

        styleText = {
            fontFamily: 'Calibri',
            color: (props.seleccionado.Codigo === props.codigo) ? "#ffffff" : "#000000",
            fontWeight: (props.seleccionado.Codigo === props.codigo) ? "bold" : "normal"
        }
    }

    return (
        <div onClick={() => { props.seleccionarCliente(props.codigo) }} style={style}>
            <div style={{ marginRight: '10px', marginLeft: '10px' }}>
                <AccountCircleRoundedIcon />
            </div>
            <div>
                <h5 style={styleText}>{props.nombre}</h5>
                <h6 style={styleText}>{props.codigo}</h6>
            </div>
        </div>
    )
}