import React from 'react';
import ReactTextTransition, { presets } from "react-text-transition";
import {APIURL} from 'utils/Enviroment';
import styles from "components/Pedidos/Global/CeldaTallas.module.css";
import Swal from 'sweetalert2/dist/sweetalert2.js'

const CeldaTallas = (props) => {
    const [Focused, setFocused] = React.useState(null);
    const [Disponible, setDisponible] = React.useState(props.disponible);
    const urlApi = APIURL;
    const onFocus = () => {
        setFocused(true);
        props.onFocus();
        //CheckStock(props.codigoProducto, props.codigoColor, props.codigoTalla);
    }

    const alertaFisicoDisponible =() => {
        return Swal.fire({
            title: 'Alerta',
            text: "Excede el fisico disponible ",
            type: 'warning',
            showConfirmButton: false,
            timer: 1500
        });
    }
    const onBlur = (text, codigoProducto, codigoColor, codigoTalla, precio) => {
        const valor = (text.target.validity.valid) ? text.target.value : 0;

        props.CrearDetallePedidoOnline(codigoProducto, codigoColor, codigoTalla.slice(1), valor, precio);
        setFocused(false)
        props.onBlur();
    }

    // eslint-disable-next-line
    const CheckStock = async (codigoProducto, colorId, tallaId) => {
        if (navigator.onLine) {


            fetch(urlApi + `/api/FisicoDisponible?ProductoId=${encodeURI(codigoProducto)}&CodigoColor=${encodeURI(colorId)}&CodigoTalla=${encodeURI(tallaId.slice(1))}`, {
                method: 'GET',
            })
                .then(res => {
                    if (res.status === 200) {
                        res.json().then(
                            (result) => {
                                // let num = ~~((Math.random() * 10) + 1);
                                setDisponible(result.fisicaDisponible);
                            },
                        )
                    }
                })
        }
    }

    const handleChange = (text, codigoProducto, codigoColor, grupoTalla, codigoTalla, precio)=>
    {
            const cantidad = isNaN(parseInt(text.target.value))?0:parseInt(text.target.value);
            if(props.futuro === true && props.disponible < cantidad)
            {
                return alertaFisicoDisponible();
            }
            props.onChange(text, codigoProducto, codigoColor, grupoTalla, codigoTalla, precio);         
    }

    const isDisabled = () => {

        if(props.precio===0){
            return true;
        }

        if (props.futuro) {
            if (props.hasBackOrder === 'N' || props.hasBackOrder === 'n') {
                if (props.disponible === 0) {
                    return true;
                }
            }
        }
        return false;
    }
    return (
        <td className="p-1" style={{ backgroundColor: Focused ? '#D5EEE3' : 'unset', verticalAlign: "middle" }}>
            <div className={"row " + styles.Border}>
                {
                    props.futuro &&
                    <>
                        <div className={"col-12 px-0 " + styles.BordetBottom} style={{ fontSize: 11, textAlign: 'center' }}>
                            {/* <div className="row justify-content-center">
                                <div className="d-flex font-weight-bold m-auto">
                                    {"Stock: "}
                                </div>

                            </div> */}
                            <div className="row">
                                {/* <div class={styles.separator}></div> */}
                                <div className="d-flex m-auto">
                                    Stock: <ReactTextTransition
                                        text={Disponible}
                                        spring={presets.stiff}
                                        className="px-1 TextTransitionNoAnimation"
                                    />
                                </div>
                            </div>
                        </div>
                        {
                            (props.hasBackOrder !== 'N' && props.hasBackOrder !== 'n') ?
                                <div className={"col-12 px-0 " + styles.BordetBottom} style={{ fontSize: 11, textAlign: 'center' }}>
                                    {/* <div className="row justify-content-center">
                                        <div className="d-flex font-weight-bold m-auto">
                                            {"BackO: "}
                                        </div>
                                    </div> */}
                                    <div className="row">

                                        {/* <div class={styles.separator}></div> */}
                                        <div className="d-flex m-auto">
                                           <span className={props.backorder ? 'text-danger' : null}>{props.backorder}</span>
                                        </div>
                                    </div>
                                </div>
                                : null
                        }

                    </>

                }


                <div className="col-12 px-0" style={{ fontSize: 11, textAlign: 'center' }}>
                    {/* <div className="row justify-content-center">
                        <div className="d-flex font-weight-bold m-auto">
                            {"Precio: "}
                        </div>

                    </div> */}
                    <div className="row">
                        {/* <div class={styles.separator}></div> */}
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
                onBlurCapture={(text) => onBlur(text, props.codigoProducto, props.codigoColor, props.codigoTalla, props.precio)}
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
export default CeldaTallas;