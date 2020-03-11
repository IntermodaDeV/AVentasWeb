import React from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { Fab } from "@material-ui/core";

const DetalleRecibo = (props) => {
    return (
        <div className="px-3">
            <div>
                <Fab size="small" color="default" onClick={() => props.RegresarListaRecibos()} className={"mx-1"} style={{ transform: 'scale(0.8)' }}>
                    <FaArrowLeft size={"15px"} />
                </Fab>
                <h3 className="m-auto" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    {props.recibo.NumeroRecibo}
                </h3>
                <hr />
            </div>

        </div>
    )
}

// const numberWithCommas = (x) => {
//     x = x.toFixed(2);
//     var parts = x.toString().split(".");
//     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     return parts.join(".");
// }

export default DetalleRecibo;