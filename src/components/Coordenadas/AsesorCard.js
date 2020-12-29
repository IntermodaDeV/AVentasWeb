import React from 'react';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

export const AsesorCard = (props) => {
    let style, styleText, styleIcon;

    if (props.asesorSeleccionado.length === 0) {
        style = {
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
        }

        styleText = {
            fontFamily: 'Calibri',
            color: "#000000",
            fontWeight: "normal"
        }

        styleIcon = {
            width: 42,
            height: 42
        }

    } else {
        style = {
            cursor: 'pointer',
            backgroundColor: (props.asesorSeleccionado.includes(props.codigo)) ? "#243746" : "",
            display: 'flex',
            alignItems: 'center',
        }

        styleText = {
            fontFamily: 'Calibri',
            color: (props.asesorSeleccionado.includes(props.codigo)) ? "#ffffff" : "#000000",
            fontWeight: (props.asesorSeleccionado.includes(props.codigo)) ? "bold" : "normal"
        }

        styleIcon = {
            width: 42,
            height: 42,
            color: (props.asesorSeleccionado.includes(props.codigo)) ? "#ffffff" : "#000000",
        }
    }

    return (
        <div onClick={() => { props.seleccionarAsesor(props.codigo) }} style={style}>
            <div style={{ marginRight: '10px', marginLeft: '10px' }}>
                <AccountCircleRoundedIcon style={styleIcon} />
            </div>
            <div>
                <h5 style={styleText}>{props.nombre}</h5>
                <h6 style={styleText}>Codigo: {props.codigo.toUpperCase()}</h6>
                <h6 style={styleText}>Empresa: {props.empresa.toUpperCase()}</h6>
            </div>
        </div>
    )
}