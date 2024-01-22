import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { APIURL } from 'utils/Enviroment';
import { PermisoUsuarioOficinaCreditos } from 'components/Seguridad/Permisos';
import axios from 'axios';

export const DepositosModal = props => {
    const { open, numeroRecibo, handleClose } = props;
    const [depositos, setDepositos] = useState([]);

    const obtenerDepositos = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/recibo/comprobantes/${numeroRecibo}`);
            setDepositos(request.data);
        } catch (err) {
            alert("ocurrio un error y no se pudieron obtener los depositos");
        }
    }

    useEffect(() => {
        obtenerDepositos();
    }, [numeroRecibo]);

    return (
        <Dialog
            scroll={'paper'}
            open={open}
            onClose={handleClose}
        >
            <DialogTitle className="text-center" id="scroll-dialog-title">
                <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Depositos recibo {numeroRecibo}
                </div>
            </DialogTitle>
            <DialogContent>

                <div style={{ width: '100%' }}>
                    <div style={{ display: 'inline-block' }}>
                        {depositos.map(x => <DetalleDeposito key={x.id} deposito={x.deposito} id={x.id} dpi={x.dpi} />)}
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}

const DetalleDeposito = (props) => {
    const [dpi, setDpi] = useState(props.dpi);

    const actualizarDpi = async () => {
        try {
            if (dpi === "") {
                alert("llenar el valor del deposito por investigar");
                return
            }

            await axios.post(`${APIURL}/api/recibo/comprobante/dpi/${props.id}`, { dpi });
            alert("deposito por investigar actualizado correctamente");
        } catch (err) {
            alert("no se pudo actualizar el deposito por investigar");
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {PermisoUsuarioOficinaCreditos() && <div style={{ display: 'flex' }}>
                <label>Deposito por investigar:</label>
                <input type='text' className='form-control' value={dpi} onChange={(e) => setDpi(e.target.value)} />
                <button style={{ marginLeft: 10 }} className='btn btn-success' onClick={actualizarDpi}>Actualizar</button>
            </div>}
            <div>
                <img src={`${APIURL}/uploads/${props.deposito}`} />
            </div>
        </div>
    );
}