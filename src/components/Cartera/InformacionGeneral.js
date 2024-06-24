import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import styles from 'components/Pedidos/SelectCliente/SelectCliente.module.css';
import { useSelector } from 'react-redux';
import { FiAlertTriangle } from 'react-icons/fi';
import { numberWithCommas } from 'utils/common';
import { ReservadoDetalleLinea } from 'components/Pedidos/SelectCliente/ReservadoDetalleLinea';

export const InformacionGeneral = props => {
    const [verPedidoPendientes, setVerPedidoPendientes] = useState(false);
    const [detalleColeccion, setDetalleColeccion] = useState([]);
    const Monedas = useSelector(e => e.AbreviacionMonedas);
    let FacturacionEntrega = null;
    let DisponibleTotal = 0;
    let ValorCreditoTotal = 0;
    let CXCTotal = 0;

    if (props.cliente === undefined) {
        return <h3>Seleccione un cliente</h3>
    }

    const mensajeError = () => {
        if (props.cliente !== null) {
            if (props.cliente.FacturacionEntrega === "Factura") return "El cliente actualmente se encuentra deshabilitado por mora.";
            if (props.cliente.FacturacionEntrega === "Todo") return "El cliente actualmente se encuentra bloqueado.";
        }
    }

    const reservadoCliente = () => {
        if (props.cliente.ReservadoClientePorLinea && props.cliente.ReservadoClientePorLinea.length === 0) {
            return <h5 style={{ textAlign: "center", marginTop: 10 }}>No hay valores reservados.</h5>
        }

        var abreviacion = Monedas.find(e => e.IdMoneda === props.cliente.Moneda).Abreviacion;

        return (
            <><span className={styles["TCenterContainer"]}>
                <h5 className={styles["TCenter"]}>Pendiente Facturación</h5>
            </span>
                <table className="table table-responsive-xl">
                    <thead>
                        <tr>
                            <th>Colección</th>
                            <th>Monto</th>
                            <th>Unidades</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.cliente.ReservadoClientePorLinea.map((reservado, index) => {

                            return (
                                <tr key={index}>
                                    <td>{reservado.Linea}</td>
                                    <td>{numberWithCommas(reservado.MontoPendiente)}</td>
                                    <td>{numberWithCommas(reservado.UnidadesPendientes)}</td>
                                    <td> <button onClick={() => { setVerPedidoPendientes(true); setDetalleColeccion(reservado) }} style={{ display: "block" }} className="btn btn-secondary">Ver detalle</button></td>
                                </tr>
                            )
                        })}
                        <tr>
                            <td><b>Total Reservado</b></td>
                            <td >{abreviacion} {numberWithCommas(props.cliente.ReservadoClientePorLinea.reduce((prev, curr) => prev + curr.MontoPendiente, 0))}</td>
                            <td >{numberWithCommas(props.cliente.ReservadoClientePorLinea.reduce((prev, curr) => prev + curr.UnidadesPendientes, 0))}</td>
                        </tr>
                        <tr>
                            <td style={{color:"red"}}><b>VALORES DE LOS PEDIDOS NO INCLUYEN ISV.</b></td>
                        </tr>
                    </tbody>
                </table>
                <ReservadoDetalleLinea open={verPedidoPendientes} detalle={detalleColeccion} close={() => { setVerPedidoPendientes(false) }} abreviacion={abreviacion} />

            </>)
    }

    if ((props.cliente.FacturacionEntrega !== "No" && props.cliente.FacturacionEntrega !== "Nunca")) {
        FacturacionEntrega = (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <FiAlertTriangle style={{ fontSize: '20px', color: 'red' }} /> {mensajeError()}
            </div>
        )
    }
    return (
        <Card>
            <CardContent>
                <div className="row">
                    <div className="col-md-6">
                        <span className={styles["TCenterContainer"]}>
                            <h5 className={styles["TCenter"]}>Información General</h5>
                        </span>
                        <table className='table table-responsive-xl' style={{ border: "none" }}>
                            <tbody>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Codigo: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.cliente.Codigo}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Nombre:'}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.cliente.Nombre}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Conocido como:'}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.cliente.Alias}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Bloqueo Crediticio: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.cliente.FacturacionEntrega}</td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Grupo Precios: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {`${props.cliente.GrupoPrecio} - ${props.cliente.NombreGrupoPrecio}`}</td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel} >
                                        {'Departamento: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.cliente.Departamento}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel} >
                                        {'Ciudad: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.cliente.Ciudad}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Direccion: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.cliente.Direccion}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div>
                            {FacturacionEntrega}
                        </div>

                    </div>
                    <div className="col-md-6">
                        <span className={styles["TCenterContainer"]}>
                            <h5 className={styles["TCenter"]}>Información Crediticia</h5>
                        </span>
                        <table className="table table-responsive-xl">
                            <thead>
                                <tr>
                                    <th>
                                        Tipo
                                    </th>
                                    <th>
                                        Valor Credito
                                    </th>
                                    <th>
                                        Saldo CxC
                                    </th>
                                    <th>
                                        Disponible
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.cliente.Credito.map((credito, index) => {
                                    DisponibleTotal = DisponibleTotal + credito.Disponible;
                                    ValorCreditoTotal = ValorCreditoTotal + credito.Valor;
                                    CXCTotal = CXCTotal + credito.SaldoTotal;
                                    return (
                                        <tr key={index}>

                                            <td>{credito.Tipo}</td>
                                            <td style={{ color: credito.Valor > 0 ? 'green' : 'red' }}>{credito.Valor ? numberWithCommas(credito.Valor) : 0}</td>
                                            <td>{credito.SaldoTotal ? numberWithCommas(credito.SaldoTotal) : 0}</td>
                                            <td style={{ color: credito.Disponible > 0 ? 'green' : 'red' }}>{credito.Disponible ? numberWithCommas(credito.Disponible) : 0}</td>
                                        </tr>
                                    )
                                })}
                                <tr>
                                    <td>{<b>Total</b>}</td>
                                    <td style={{ color: parseFloat(numberWithCommas(ValorCreditoTotal)) > 0 ? 'green' : 'red' }}>{Monedas.find(e => e.IdMoneda === props.cliente.Moneda).Abreviacion} {numberWithCommas(ValorCreditoTotal)}</td>
                                    <td>{Monedas.find(e => e.IdMoneda === props.cliente.Moneda).Abreviacion} {numberWithCommas(CXCTotal)}</td>
                                    <td style={{ color: parseFloat(numberWithCommas(DisponibleTotal)) > 0 ? 'green' : 'red' }}>{Monedas.find(e => e.IdMoneda === props.cliente.Moneda).Abreviacion} {numberWithCommas(DisponibleTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className='mt-5'>
                            {reservadoCliente()}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}