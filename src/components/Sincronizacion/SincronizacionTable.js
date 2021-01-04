import React from 'react';
import styles from 'containers/Sincronizacion/SincronizacionListaMonitor.module.css'
import Swal from 'sweetalert2/dist/sweetalert2.js'
import { APIURL } from 'utils/Enviroment';
import axios from 'axios';

export const SincronizacionTable = props => {
    const { listado, fecha } = props;

    const mostrarAdvertencia = (idLista) => {
        Swal.fire({
            title: 'Aviso',
            text: "Está cancelando la ejecución de esta sincronización. Desea continuar?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                enviarCancelarLista(idLista);
            }
        })
    }

    const enviarCancelarLista = async (idListaACancelar) => {
        try {
            const data = { IdLista: idListaACancelar };
            console.log(data);
            await axios.post(`${APIURL}/api/SincronizacionEspecifico/Coleccion/cancelar`, data);

            Swal.fire(
                {
                    type: 'success',
                    title: 'Registro Actualizado',
                    showConfirmButton: false,
                    timer: 1500
                }
            ).then(() => {
                props.Recargar();
            })

        } catch (err) {
            console.log(err);
            let mensaje = "Error al procesar solicitud.";


            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'OK',
            }).then(() => {
                window.location.reload();
            })
        }
    }

    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th className={styles.StickyHeader}>Acciones</th>
                    <th className={styles.StickyHeader}>ID Lista</th>
                    <th className={styles.StickyHeader}>Código Gestor</th>
                    <th className={styles.StickyHeader}>Nombre Gestor</th>
                    <th className={styles.StickyHeader}>Módulo</th>
                    <th className={styles.StickyHeader}>Paquete</th>
                    <th className={styles.StickyHeader}>Empresa</th>
                    <th className={styles.StickyHeader}>Fecha</th>
                    <th className={styles.StickyHeader}>En Espera</th>
                    <th className={styles.StickyHeader}>En Ejecución</th>
                    <th className={styles.StickyHeader}>Finalizado</th>
                </tr>
            </thead>
            <tbody>
                {
                    listado.filter(x => new Date(x.FECHA).setHours(0, 0, 0, 0) === new Date(fecha).setHours(0, 0, 0, 0)).map((item, ind) => (
                        <tr key={ind} style={{ textAlign: "center" }}>
                            <td ><button type="button" class="btn btn-info" onClick={() => { mostrarAdvertencia(item.ID) }} disabled={!item.EN_ESPERA}>Cancelar</button></td>
                            <td className="font-weight-bold">{item.ID}</td>
                            <td className="font-weight-bold">{item.ID_GESTOR}</td>
                            <td className="font-weight-bold">{item.NOMBRE}</td>
                            <td className="font-weight-bold">{item.MODULO}</td>
                            <td className="font-weight-bold">{item.PAQUETE}</td>
                            <td className="font-weight-bold">{item.EMPRESA}</td>
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