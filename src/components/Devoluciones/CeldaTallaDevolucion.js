import React from 'react';
import ReactTextTransition, { presets } from "react-text-transition";
import styles from "components/Pedidos/Global/CeldaTallas.module.css";
import Swal from 'sweetalert2/dist/sweetalert2.js'

export const CeldaTallaDevolucion = (props) => {
    const [Focused, setFocused] = React.useState(null);

    const onFocus = () => {
        setFocused(true);
        props.onFocus();
    }

    const alertaFisicoDisponible = () => {
        return Swal.fire({
            title: 'Alerta',
            text: "Excede el fisico original del pedido",
            type: 'warning',
            showConfirmButton: false,
            timer: 1500
        });
    }

    const handleChange = (text, codigoProducto, codigoColor, grupoTalla, codigoTalla, precio) => {
        const cantidad = isNaN(parseInt(text.target.value)) ? 0 : parseInt(text.target.value);

        if (props.disponible < cantidad) {
            return alertaFisicoDisponible();
        }

        props.onChange(text, codigoProducto, codigoColor, grupoTalla, codigoTalla, precio);
    }


    const isDisabled = () => {
        if (props.precio === 0 || props.disponible === 0) {
            return true;
        }

        return false;
    }

    return (
        <td className="p-1" style={{ backgroundColor: Focused ? '#D5EEE3' : 'unset', verticalAlign: "middle" }} >
            <div className={"row " + styles.Border}>
                {
                    <>
                        <div className={"col-12 px-0 " + styles.BordetBottom} style={{ fontSize: 11, textAlign: 'center' }}>
                            <div className="row">

                                <div className="d-flex m-auto" style={{ color: props.disponible === 0 ? "red" : "seagreen", fontWeight: "bold" }}>
                                    Stock: <ReactTextTransition
                                        text={props.disponible}
                                        spring={presets.stiff}
                                        className="px-1 TextTransitionNoAnimation"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                }
                <div className="col-12 px-0" style={{ fontSize: 11, textAlign: 'center' }}>

                    <div className="row">
                        <div className="d-flex pr-1 m-auto">
                            Precio: {props.precio.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
            <hr className="m-0 my-1" />
            <input
                disabled={isDisabled()}
                onFocusCapture={() => onFocus()}
                onKeyDownCapture={(event) => props.handleArrowKeys(event)}
                type="text"
                ref={props.ref}
                pattern="[0-9]*"
                placeholder={"0"}
                maxLength={4}
                value={props.cantidad}
                style={{ maxWidth: "100%", border: 'none', textAlign: 'center', width: '100%' }}
                onChange={(text) => handleChange(text, props.codigoProducto, props.codigoColor, props.grupoTalla, props.codigoTalla, props.precio)}
            />
        </td >
    );
}