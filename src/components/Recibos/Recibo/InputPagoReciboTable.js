import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss';

const InputPago = (props) => {
    const [value, setValue] = useState(props.valor);
    let error = false;
    let faltante = localStorage.getItem('Faltante');
    let TotalRecibo = localStorage.getItem('TotalRecibo');

    console.log('props :', props);

    return (
        <TextField
            value={value}
            onChange={(event) => {
                let val = '';
                let falt = parseFloat(faltante);
                let inputVal = parseFloat(event.target.value);
                //debugger;
                console.log('props.indexArray :', props.indexArray);

                if (event.target.value !== '') {
                    if (props.indexArray === 0) {
                        if (TotalRecibo >= inputVal) {
                            val = event.target.value;
                        }
                        else {
                            error = true;
                        }
                    }
                    else {
                        if (falt >= inputVal) {
                            val = event.target.value;
                            error = false;
                        }
                        else {
                            error = true;
                        }
                    }
                    console.log('error :', error);

                    if (error) {
                        Swal.fire({
                            title: 'Error',
                            text: "El valor es excede el total de factura",
                            type: 'error',
                        });
                    }
                }
                else {
                    error = false;
                }
                setValue(val);
            }}
            onBlur={() => {
                let val = value;
                if (error) {
                    val = '';
                }

                props.OnpagosXReciboChange(
                    props.indexArray,
                    {
                        indexTiposPago: props.indexTiposPago,
                        indexTiposdePagoDetalle: props.indexTiposdePagoDetalle,
                        fecha: props.fecha,
                        valor: val,
                        indexMoneda: props.indexMoneda,
                        indexBanco: props.indexBanco,
                        referencia: props.referencia
                    }
                );

            }}
        />
    )
}

export default InputPago;