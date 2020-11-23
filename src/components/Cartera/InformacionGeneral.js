import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import styles from 'components/Pedidos/SelectCliente/SelectCliente.module.css';
import { useSelector } from 'react-redux';
import { FiAlertTriangle } from 'react-icons/fi';
import { numberWithCommas } from 'utils/common';

export const InformacionGeneral = props => {
    const Monedas = useSelector(e => e.AbreviacionMonedas);
    const Comunidad = useSelector(e => e.comunidadesAutonomas);
    let FacturacionEntrega = null;
    let DisponibleTotal = 0;
    let ValorCreditoTotal = 0;
    let CXCTotal = 0;

    if (props.cliente === undefined) {
        return <h3>Seleccione un cliente</h3>
    }

    if ((props.cliente.FacturacionEntrega === "No" || props.cliente.FacturacionEntrega === "Nunca")) {
        FacturacionEntrega = (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <FiAlertTriangle style={{ fontSize: '20px', color: 'red' }} />  El cliente actualmente se encuentra con bloqueo ó en mora.
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
                                        {props.cliente.ComunidadAutonoma ? Comunidad.find(x => x.STATEID === props.cliente.ComunidadAutonoma).NAME : ''}
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
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}