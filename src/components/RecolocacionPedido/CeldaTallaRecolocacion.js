import React from 'react';
import styles from "components/Pedidos/Global/CeldaTallas.module.css";

export const CeldaTallaRecolocacion = (props) => {

    return (
        <td className="p-1" style={{ backgroundColor: 'unset', verticalAlign: "middle" }} >
            <div className={"row " + styles.Border}>

                <div className="col-12 px-0" style={{ fontSize: 14, textAlign: 'center' }}>

                    <div className="row">
                        <div className="d-flex pr-1 m-auto">
                            Precio: {props.precio.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
            <hr className="m-0 my-1" />
            <input
                onKeyDownCapture={(event) => props.handleArrowKeys(event)}
                type="text"
                ref={props.ref}
                pattern="[0-9]*"
                placeholder={"0"}
                maxLength={4}
                value={props.cantidad}
                style={{ maxWidth: "100%", border: 'none', textAlign: 'center', width: '100%' }}
                disabled={true}
            />
        </td >
    );
}