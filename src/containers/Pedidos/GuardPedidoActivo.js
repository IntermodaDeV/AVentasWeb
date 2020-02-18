import React, { useState } from 'react';
import { matchPath, Prompt } from 'react-router-dom';
import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss';

const GuardPedidoActivo = (props) => {
    const [detenerNavegacion, setDetenerNavegacion] = useState(true);

    return (
        <>
            <Prompt
                when={detenerNavegacion && props.isPedidoActivo}
                message={(location) => {
                    if ((matchPath(location.pathname, {
                        path: [props.match.url + '/Colecciones/:TipoColeccion/:CodigoColeccion',
                        props.match.url + '/Colecciones/:TipoColeccion/:CodigoColeccion/:CodigoProducto',
                        props.match.url + '/MatrizResumen',
                        props.match.url + '/ResumenPedido'],
                    }) === null)) {
                        Swal.fire({
                            title: 'Aviso',
                            text: "Se borrará la información del pedido en curso",
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Borrar',
                            cancelButtonText: 'Cancelar',
                        }).then((result) => {
                            if (result.value === true) {
                                setDetenerNavegacion(false);
                                props.history.push(location.pathname);
                                props.onSetTableValue({});
                                props.onSetTotalPedido(0);
                                props.onSetNumeroOrden(null);
                            }
                        });
                    } else {
                        return true;
                    }
                    return false;

                }
                }
            />
        </>
    )
}
export default GuardPedidoActivo;
