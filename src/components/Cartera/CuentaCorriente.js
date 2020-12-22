import React, { useState, useEffect } from 'react';
import CuentaCorrienteTable from 'containers/CuentaCorriente/CuentaCorienteTable';
import styles from "components/Recibos/Facturas/CuotasTable.module.css";
import moment from 'moment';

export const CuentaCorriente = props => {
    const [cuotas, setCuotas] = useState([]);

    const calcularCuotasCuentaCorriente = () => {
        let agrupacionCuentCorriente = [];
        let totalSaldo = 0;
        let totalAPagar = 0;
        props.cliente.AcuerdosXTipoPedido.forEach(acuXTip => {
            acuXTip.Acuerdos.forEach(acu => {
                acu.Facturas.forEach(fact => {
                    fact.Cuotas.forEach(cuot => {
                        let diasVencimiento = moment().diff(cuot.FechaVencimiento, 'days') * -1;
                        let diasDescuento = moment().diff(cuot.FechaMaxDescuento, 'days') * -1;
                        let aPagar = cuot.Saldo;
                        if (diasDescuento >= 0 && cuot.Descuento) {
                            aPagar -= cuot.Descuento;
                        }
                        totalSaldo += cuot.Saldo;
                        totalAPagar += aPagar;
                        let colorFuente = diasVencimiento < 0 ? "text-danger font-weight-bold" : diasVencimiento < 15 ? "font-weight-bold " + styles.WarnRecibo : "";
                        if (localStorage.getItem('empresa') === 'imgt') {
                            agrupacionCuentCorriente.push({
                                Tipo: <span className={colorFuente}>{cuot.TipoDocumento}</span>, // Tipo
                                TipoPedido: <span className={colorFuente}>{acuXTip.TipoPedido}</span>,// TipoPedido
                                Factura: <span className={colorFuente}>{fact.Factura}</span>,// Factura
                                NumeroFEL: <span className={colorFuente}>{fact.NumeroFEL}</span>,
                                IdAcuerdoxCliente: <span className={colorFuente}>{cuot.IdAcuerdoxCliente}</span>,// IdAcuerdoxCliente
                                NumeroCuota: <span className={colorFuente}>{cuot.NumeroCuota}</span>,// NumeroCuota
                                FechaFactura: <span className={colorFuente}>{moment(cuot.FechaFactura).format("DD/MM/YYYY")}</span>,// FechaFactura
                                FechaVencimiento: <span className={colorFuente}>{moment(cuot.FechaVencimiento).format("DD/MM/YYYY")}</span>,// FechaVencimiento
                                Dias: <span className={colorFuente}>{isNaN(diasVencimiento) ? "" : diasVencimiento}</span>,// Dias
                                Valor: <span className={colorFuente}>{cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Valor
                                Saldo: <span className={colorFuente}>{cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Saldo
                                FechaMaxDescuento: <span className={colorFuente}>{moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== "Invalid date" ? moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") : ""}</span>,// FechaMaxDescuento
                                DiasV: <span className={colorFuente}>{isNaN(diasDescuento) ? "" : diasDescuento}</span>, // DiasV
                                Descuento: <span className={colorFuente}>{cuot.Descuento.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Descuento
                                APagar: <span className={colorFuente}>{aPagar.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// APagar
                                idmoneda: <span className={colorFuente}>{cuot.IdMoneda}</span>,// idmoneda
                            });

                        }
                        else {
                            agrupacionCuentCorriente.push({
                                Tipo: <span className={colorFuente}>{cuot.TipoDocumento}</span>, // Tipo
                                TipoPedido: <span className={colorFuente}>{acuXTip.TipoPedido}</span>,// TipoPedido
                                Factura: <span className={colorFuente}>{fact.Factura}</span>,// Factura
                                IdAcuerdoxCliente: <span className={colorFuente}>{cuot.IdAcuerdoxCliente}</span>,// IdAcuerdoxCliente
                                NumeroCuota: <span className={colorFuente}>{cuot.NumeroCuota}</span>,// NumeroCuota
                                FechaFactura: <span className={colorFuente}>{moment(cuot.FechaFactura).format("DD/MM/YYYY")}</span>,// FechaFactura
                                FechaVencimiento: <span className={colorFuente}>{moment(cuot.FechaVencimiento).format("DD/MM/YYYY")}</span>,// FechaVencimiento
                                Dias: <span className={colorFuente}>{isNaN(diasVencimiento) ? "" : diasVencimiento}</span>,// Dias
                                Valor: <span className={colorFuente}>{cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Valor
                                Saldo: <span className={colorFuente}>{cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Saldo
                                FechaMaxDescuento: <span className={colorFuente}>{moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") !== "Invalid date" ? moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY") : ""}</span>,// FechaMaxDescuento
                                DiasV: <span className={colorFuente}>{isNaN(diasDescuento) ? "" : diasDescuento}</span>, // DiasV
                                Descuento: <span className={colorFuente}>{cuot.Descuento.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// Descuento
                                APagar: <span className={colorFuente}>{aPagar.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,// APagar
                                idmoneda: <span className={colorFuente}>{cuot.IdMoneda}</span>,// idmoneda
                            });

                        }
                    });
                });
            });
        });

        console.log(agrupacionCuentCorriente);

        agrupacionCuentCorriente.sort((a, b) => {
            if (moment(a.FechaVencimiento.props.children, "DD/MM/YYYY").isAfter(moment(b.FechaVencimiento.props.children, "DD/MM/YYYY"), 'day')) {
                return 1;
            }
            if (moment(a.FechaVencimiento.props.children, "DD/MM/YYYY").isBefore(moment(b.FechaVencimiento.props.children, "DD/MM/YYYY"), 'day')) {
                return -1;
            }
            if (moment(a.FechaVencimiento.props.children, "DD/MM/YYYY").isSame(moment(b.FechaVencimiento.props.children, "DD/MM/YYYY"), 'day')) {
                return -1;
            }

            if (a.Factura.props.children < b.Factura.props.children) {

                return -1;
            }
            if (a.Factura.props.children > b.Factura.props.children) {

                return 1;
            }

            if (a.NumeroCuota.props.children < b.NumeroCuota.props.children) {

                return -1;
            }
            if (a.NumeroCuota.props.children > b.NumeroCuota.props.children) {

                return 1;
            }
            return 0;

        });

        agrupacionCuentCorriente.push({
            Tipo: <h6 className="font-weight-bolder text-dark">Totales</h6>,// Tipo
            TipoPedido: null,// TipoPedido
            Factura: null,// Factura
            IdAcuerdoxCliente: null,// IdAcuerdoxCliente
            NumeroCuota: null,// NumeroCuota
            FechaFactura: null,// FechaFactura
            FechaVencimiento: null,// FechaVencimiento
            Dias: null,// Dias
            Valor: null,// Valor
            Saldo: (<label className="font-weight-bolder text-dark">
                {totalSaldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
            </label>),// Saldo
            FechaMaxDescuento: null,// FechaMaxDescuento
            DiasV: null,// DiasV
            Descuento: null,// Descuento
            APagar: (<label className="font-weight-bolder text-dark">
                {totalAPagar.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
            </label>),// APagar
            idmoneda: null,// idmoneda
        });

        setCuotas(agrupacionCuentCorriente);
    }

    useEffect(() => {
        if (props.cliente !== undefined) {
            calcularCuotasCuentaCorriente();
        }
        // eslint-disable-next-line
    }, [props.cliente])

    if (props.cliente === undefined) {
        return <h3>Seleccione un cliente</h3>
    }

    return <CuentaCorrienteTable
        clienteSelected={props.cliente}
        CuotasCuentaCorriente={cuotas}
    />
}