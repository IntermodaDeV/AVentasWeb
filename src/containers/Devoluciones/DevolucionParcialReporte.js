import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dropdown } from "semantic-ui-react";
//import { ImprimirDevolucionOriginal } from 'components/Devoluciones/ImprimirDevolucionOriginal';
import { ImprimirPedidoDevolucion } from 'components/Devoluciones/ImprimirPedidoDevolucion';
import { APIURL } from 'utils/Enviroment';

export const DevolucionParcialReporte = props => {
    const { ValoresPedido, Finalizar } = props;

    /*const [nuevoTableValue, setNuevoTableValue] = useState({});
    const [valorPedido, setValorPedido] = useState({});*/

    const [devolucion, setDevolucion] = useState(null);
    const [detalleDevolucion, setDetalleDevolucion] = useState([]);

    const generarOpciones = () => {
        return ValoresPedido.devolucionesGeneradas.map(x => ({ key: x.factura, value: x.factura, text: x.factura }));
    }

    /*const generarTableValue = (factura) => {
        let tableValueGenerado = {};
        for (let grupoTalla of Object.keys(tableValue)) {
            for (let producto of Object.keys(tableValue[grupoTalla].Productos)) {
                if (tableValue[grupoTalla].Productos[producto].Factura.factura === factura) {
                    if (grupoTalla in tableValueGenerado) {
                        tableValueGenerado[grupoTalla].Productos[producto] = tableValue[grupoTalla].Productos[producto];
                    } else {
                        tableValueGenerado[grupoTalla] = {};
                        tableValueGenerado[grupoTalla].ListaTallas = tableValue[grupoTalla].ListaTallas;
                        tableValueGenerado[grupoTalla].Productos = {};
                        tableValueGenerado[grupoTalla].Productos[producto] = tableValue[grupoTalla].Productos[producto];
                    }
                }
            }
        }

        return tableValueGenerado;
    }

    const handleChangeFactura = (factura) => {
        const indiceValorPedido = ValoresPedido.devoluciones.findIndex(x => x.FacturaOriginal === factura);
        const indiceDevolucionGenerada = ValoresPedido.devolucionesGeneradas.findIndex(x => x.factura === factura);

        let nuevoValorPedido = ValoresPedido.devoluciones[indiceValorPedido];
        nuevoValorPedido.Correlativo = ValoresPedido.devolucionesGeneradas[indiceDevolucionGenerada].referencia;
        const tableValueGenerado = generarTableValue(factura);
        setNuevoTableValue(tableValueGenerado);
        setValorPedido(nuevoValorPedido);
    }*/

    useEffect(() => {
        if (ValoresPedido.devolucionesGeneradas.length === 1) {
            obtenerDevolucionCompleta();
        }

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

            {/*(Object.keys(nuevoTableValue)).length !== 0 &&
                <ImprimirDevolucionOriginal tableValue={nuevoTableValue}
                    Cliente={Cliente}
                    ValoresPedido={valorPedido}
            Finalizar={Finalizar} />*/}


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