import React from 'react';
import styles from 'containers/Sincronizacion/SincronizacionListaMonitor.module.css'

export const SincronizacionTable = props => {
    const { listado } = props;

    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th className={styles.StickyHeader}>ID Lista</th>
                    <th className={styles.StickyHeader}>Código Gestor</th>
                    <th className={styles.StickyHeader}>Nombre Gestor</th>
                    <th className={styles.StickyHeader}>Módulo</th>
                    <th className={styles.StickyHeader}>Fecha</th>
                    <th className={styles.StickyHeader}>En Espera</th>
                    <th className={styles.StickyHeader}>En Ejecución</th>
                    <th className={styles.StickyHeader}>Finalizado</th>
                </tr>
            </thead>
            <tbody>
                {
                    listado.map((item, ind) => (
                        <tr key={ind} style={{ textAlign: "center" }}>
                            <td className="font-weight-bold">{item.ID}</td>
                            <td className="font-weight-bold">{item.ID_GESTOR}</td>
                            <td className="font-weight-bold">{item.NOMBRE}</td>
                            <td className="font-weight-bold">{item.MODULO}</td>
                            <td className="font-weight-bold">{item.FECHASTR}</td>
                            <td className="font-weight-bold">
                                <input
                                    type="checkbox"
                                    checked={item.EN_ESPERA}
                                    style={{ height: 25, width: 25 }}
                                    readOnly
                                />
                            </td>
                            <td className="font-weight-bold">
                                <input
                                    type="checkbox"
                                    checked={item.EN_EJECUCION}
                                    style={{ height: 25, width: 25, margin: "auto", textAlign: "center" }}
                                    readOnly
                                />
                            </td>
                            <td className="font-weight-bold">
                                <input
                                    type="checkbox"
                                    checked={item.FINALIZADO}
                                    style={{ height: 25, width: 25 }}
                                    readOnly
                                />
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    )
}