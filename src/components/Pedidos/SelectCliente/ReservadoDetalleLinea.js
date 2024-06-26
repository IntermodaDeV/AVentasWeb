import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { numberWithCommas } from 'utils/common';

export const ReservadoDetalleLinea = props => {
    const { open, detalle, close, abreviacion } = props;
    const [data, setData] = useState([]);

    useEffect(() => {
        if (Array.isArray(detalle.ReservadoClienteColeccionesLineas)) {
        const newData = detalle.ReservadoClienteColeccionesLineas.map(elemento => ({
            Coleccion: elemento.Coleccion,
            Linea: elemento.Linea,
            MontoPendiente: elemento.MontoPendiente,
            UnidadesPendientes: elemento.UnidadesPendientes
        }));

        setData(newData);
    }
    }, [detalle]);

    return (
        <Dialog
            scroll={'paper'}
            open={open}
            onClose={close}
        >
            <DialogTitle className="text-center" id="scroll-dialog-title">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Detalle Linea {detalle.Linea}
                    <button className="btn btn-primary" onClick={close}>x</button>
                </div>
            </DialogTitle>
            <DialogContent>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Colección</th>
                            <th scope="col">Unidades Pendientes</th>
                            <th scope="col">Monto Pendiente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.Coleccion}</td>
                                <td>{numberWithCommas(item.UnidadesPendientes)}</td>
                                <td>{numberWithCommas(item.MontoPendiente)}</td>
                            </tr>
                        ))}

                        <tr>
                            <td><b>Total Reservado</b></td>
                            <td >{numberWithCommas(data.reduce((prev, curr) => prev + curr.UnidadesPendientes, 0))}</td>
                            <td >{abreviacion} {numberWithCommas(data.reduce((prev, curr) => prev + curr.MontoPendiente, 0))}</td>

                        </tr>
                    </tbody>
                </table>
            </DialogContent>
        </Dialog >
    )
}