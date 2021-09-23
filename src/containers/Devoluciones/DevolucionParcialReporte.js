import React, { useState } from 'react';
import { Dropdown } from "semantic-ui-react";
import { ImprimirDevolucionOriginal } from 'components/Devoluciones/ImprimirDevolucionOriginal';

export const DevolucionParcialReporte = props => {
    const { Cliente, tableValue, ValoresPedido, Finalizar } = props;

    const [nuevoTableValue, setNuevoTableValue] = useState({});
    const [valorPedido, setValorPedido] = useState({});

    const generarOpciones = () => {
        return ValoresPedido.devolucionesGeneradas.map(x => ({ key: x.factura, value: x.factura, text: x.factura }));
    }

    const generarTableValue = (factura) => {
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
    }

    return (
        <div>
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
            <br />

            {(Object.keys(nuevoTableValue)).length !== 0 &&
                <ImprimirDevolucionOriginal tableValue={nuevoTableValue}
                    Cliente={Cliente}
                    ValoresPedido={valorPedido}
                    Finalizar={Finalizar} />}
        </div>
    )

}