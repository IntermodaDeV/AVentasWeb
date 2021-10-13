import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from "semantic-ui-react";
import { ImprimirPedidoDevolucion } from 'components/Devoluciones/ImprimirPedidoDevolucion';
import { APIURL } from 'utils/Enviroment';

export const DevolucionParcialReporte = props => {
    const { ValoresPedido, Finalizar } = props;
    const [devolucion, setDevolucion] = useState(null);
    const [detalleDevolucion, setDetalleDevolucion] = useState([]);

    const generarOpciones = () => {
        return ValoresPedido.devolucionesGeneradas.map(x => ({ key: x.factura, value: x.factura, text: x.referencia }));
    }


    useEffect(() => {
        obtenerDevolucionCompleta();
        // eslint-disable-next-line
    }, [])

    const obtenerDevolucionCompleta = async () => {
        await obtenerDevolucion(ValoresPedido.devolucionesGeneradas[0].referencia);
        await obtenerDetalleDevolucion(ValoresPedido.devolucionesGeneradas[0].referencia);
    }

    const handleChangeFactura = async (factura) => {
        const indiceDevolucionGenerada = ValoresPedido.devolucionesGeneradas.findIndex(x => x.factura === factura);
        await obtenerDevolucion(ValoresPedido.devolucionesGeneradas[indiceDevolucionGenerada].referencia);
        await obtenerDetalleDevolucion(ValoresPedido.devolucionesGeneradas[indiceDevolucionGenerada].referencia);
    }

    const obtenerDevolucion = async (devolucion) => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/${devolucion}`);
            setDevolucion(request.data);
        } catch (err) {

        }
    }

    const obtenerDetalleDevolucion = async (devolucion) => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/detalle/${devolucion}`);
            setDetalleDevolucion(request.data);
        } catch (err) {

        }
    }

    return (
        <div>
            {(ValoresPedido.devolucionesGeneradas.length > 1) &&
                <Dropdown
                    placeholder="Seleccione Factura"
                    search
                    selection
                    options={generarOpciones()}
                    noResultsMessage={"No hay resultados"}
                    closeOnChange={true}
                    style={{ zIndex: 999 }}
                    multiple={false}
                    onChange={(e, { value }) => { handleChangeFactura(value) }}
                />
            }
            <br />

            {devolucion && detalleDevolucion &&
                <ImprimirPedidoDevolucion
                    hidePrint={Finalizar}
                    esDevolucion={true}
                    Pedido={devolucion}
                    gruposXDetPed={detalleDevolucion}
                />
            }
        </div>
    )

}