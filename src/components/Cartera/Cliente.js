import React, { useRef, useEffect } from 'react';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

export const Cliente = (props) => {
    let style, styleText, styleIcon;

    const myRef = useRef();

    useEffect(() => {
        if (props.seleccionado && myRef.current) {

            if (props.seleccionado.Codigo === props.codigo) {
                myRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }
         // eslint-disable-next-line
    }, [props.seleccionado]);

    if (props.seleccionado === undefined) {
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
            backgroundColor: (props.seleccionado.Codigo === props.codigo) ? "#243746" : "",
            display: 'flex',
            alignItems: 'center',
        }

        styleText = {
            fontFamily: 'Calibri',
            color: (props.seleccionado.Codigo === props.codigo) ? "#ffffff" : "#000000",
            fontWeight: (props.seleccionado.Codigo === props.codigo) ? "bold" : "normal"
        }

        styleIcon = {
            width: 42,
            height: 42,
            color: (props.seleccionado.Codigo === props.codigo) ? "#ffffff" : "#000000",
        }
    }

    return (
        <div ref={myRef} onClick={() => { props.seleccionarCliente(props.codigo) }} style={style}>
            <div style={{ marginRight: '10px', marginLeft: '10px' }}>
                <AccountCircleRoundedIcon style={styleIcon} />
            </div>
            <div>
                <h5 style={styleText}>{props.nombre}</h5>
                <h6 style={styleText}>{props.codigo}</h6>
            </div>
        </div>
    )
}