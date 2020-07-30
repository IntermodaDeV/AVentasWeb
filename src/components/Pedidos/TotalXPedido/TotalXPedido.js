import React, { useState, useEffect } from 'react';
import {useSelector} from 'react-redux';
const TotalXPedido = (props) => {
    const Monedas = useSelector(e=>e.Monedas);
    const moneda = Monedas.find(e=>e.IdMoneda === props.cliente.Moneda).Abreviacion;
    const [Limite, setLimite] = useState(null);

    useEffect(() => {
                setLimite(props.cliente.LimiteCredito);
        // if (props.TipoPedido.TipoPedido === "Ordinario") {
        //     let cupoCredito = props.cliente.CuentaCorriente.find(cc => cc.Descripcion === "Total cupo de crédito");
        //     if (cupoCredito !== null) {
        //     }
        // } else if (props.TipoPedido.TipoPedido !== "Contado") {

        //     let acuerdoVenta = props.cliente.AcuerdosVenta.find(av => av.IdTipoPedido === props.TipoPedido.IdTipoPedido);
        //     if (acuerdoVenta !== undefined) {
        //         setLimite(acuerdoVenta.Saldo);
        //     }
        // }
        // eslint-disable-next-line
    }, []);

    let tempTotal = props.TotalPedido||0;
    let colorDiferencia = (((Limite ? Limite : 0) - tempTotal)) < 0 ? 'red' : (props.color ? props.color : 'black');
    if (props.row) {
        return (
            <div className="row" style={{ color: props.color ? props.color : 'black' }}>
                <div className='col'>
                    {`Total Pedido: ${moneda} ` + numberWithCommas(tempTotal)}
                </div>
                <div className='col'>
                    {props.AcuerdoVenta ? `Saldo Acuerdo: ${moneda} ` + numberWithCommas(props.AcuerdoVenta.Saldo) : `Límite Crédito: ${moneda} ` + (Limite !== null ? numberWithCommas(Limite) : "no aplica").toString()}
                </div>
                <div className='col' style={{ color: colorDiferencia }}>
                    {`Saldo Disponible: ${moneda} ` + (numberWithCommas((Limite ? Limite : 0) - tempTotal)).toString()}
                </div>
            </div>
        );
    }
    else if (props.lineal) {
        return (
            <div className="row " style={{ color: props.color ? props.color : 'black', display: 'flex', justifyContent: 'flex-end' }}>
                <div className="mx-3">
                    {`Total Pedido: ${moneda} ` + numberWithCommas(tempTotal)}
                </div>
                <div className="mx-3">
                    {props.AcuerdoVenta ? `Saldo Acuerdo: ${moneda} ` + numberWithCommas(props.AcuerdoVenta.Saldo) : `Límite Crédito: ${moneda} ` + (Limite !== null ? numberWithCommas(Limite) : "no aplica").toString()}
                </div>
                <div className="mx-3" style={{ color: colorDiferencia }}>
                    {`Saldo Disponible: ${moneda} ` + (numberWithCommas((Limite ? Limite : 0) - tempTotal)).toString()}
                </div>
            </div>
        );
    }
    else {
        return (
            <>
                <div>
                    {"Total Pedido: " + numberWithCommas(tempTotal)}
                </div>
                <div>
                    {"Límite Crédito: " + (Limite !== null ? numberWithCommas(Limite) : "no aplica").toString()}
                </div>
                <div>
                    {"Saldo Disponible: " + (numberWithCommas((Limite ? Limite : 0) - tempTotal)).toString()}
                </div>
            </>
        );
    }

}


const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const areEqual = (prevProps, nextProps) => {
    return false;
}
export default React.memo(TotalXPedido, areEqual);
