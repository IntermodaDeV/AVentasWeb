import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { APIURL } from 'utils/Enviroment';
import axios from 'axios';

export const DepositosModal = props => {
    const { open, numeroRecibo } = props;
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
        >
            <DialogTitle className="text-center" id="scroll-dialog-title">
                <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Depositos recibo {numeroRecibo}
                </div>
            </DialogTitle>
            <DialogContent>

                <div style={{ width: '100%' }}>
                    <div style={{ display: 'inline-block' }}>
                        {depositos.map(x => <img key={x.id} src={`${APIURL}/uploads/${x.deposito}`} />)}
                    </div>
                    
                </div>
            </DialogContent>
        </Dialog>
    )
}
