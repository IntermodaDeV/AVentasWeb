import React from 'react';

export const CeldaTallaInventario = (props) => {
    const handleChange = (text, codigoProducto, codigoColor, grupoTalla, codigoTalla) => {
        props.onChange(text, codigoProducto, codigoColor, grupoTalla, codigoTalla);
    }

    return (
        <td className="p-1" style={{ backgroundColor: 'unset', verticalAlign: "middle" }} >
            <input
                onKeyDownCapture={(event) => props.handleArrowKeys(event)}
                type="text"
                ref={props.ref}
                pattern="[0-9]*"
                placeholder={"0"}
                maxLength={4}
                value={props.cantidad}
                style={{ maxWidth: "100%", border: 'none', textAlign: 'center', width: '100%' }}
                onChange={(text) => handleChange(text, props.codigoProducto, props.codigoColor, props.grupoTalla, props.codigoTalla)}
            />
        </td >
    );
}