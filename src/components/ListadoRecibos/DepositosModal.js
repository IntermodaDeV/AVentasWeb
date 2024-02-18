import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button } from '@material-ui/core';
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
                        {depositos.map(x => <DetalleDeposito key={x.id} recibo={numeroRecibo} deposito={x.deposito} id={x.id} dpi={x.dpi} />)}
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}

const DetalleDeposito = (props) => {
    const [dpi, setDpi] = useState(props.dpi);
    const [showModalUpload, setShowModalUpload] = useState(false);
    const [imagenDepositos, setImagenDepositos] = useState();

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

    const handleFilesChange = (e) => {
        setImagenDepositos(e.target.files);
    }

    const uploadDepositos = async () => {
        try {
            if (imagenDepositos === undefined) {
                alert("Seleccione uno o varios depositos para subir.");
                return;
            }

            let formData = new FormData();

            for (let i = 0; i < imagenDepositos.length; i++) {
                formData.append(`images`, imagenDepositos[i]);
            }

            await axios.post(`${APIURL}/api/recibo/comprobantes/actualizar/${props.recibo}/${props.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Depositos subidos con exito.");
            setShowModalUpload(false);
            setImagenDepositos(undefined);
        } catch (err) {
            alert("Ocurrio un error y no se pudieron subir los depositos");
        }
    }

    const eliminarImagenDeposito = async () => {
        try {
            const result = window.confirm(`¿Esta seguro de eliminar la imagen del recibo ${props.recibo}?`);
            if (result) {
                await axios.delete(`${APIURL}/api/recibo/comprobante/eliminar/${props.id}`);
                alert(`La imagen ha sido eliminado con exito.`);
            }
        } catch (err) {
            alert("Ocurrio un error y no se pudieron subir los depositos");
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Dialog
                open={showModalUpload}
                onClose={() => setShowModalUpload(false)}>
                <DialogTitle id="scroll-dialog-title">
                    <h2>Cargar depositos</h2>
                </DialogTitle>
                <DialogContent>
                    <input
                        type='file'
                        accept="image/*"
                        multiple
                        onChange={handleFilesChange}
                    />
                    {imagenDepositos !== undefined && <Button
                        onClick={uploadDepositos}
                        color="primary"
                        variant="outlined"
                    >
                        Cargar depositos
                    </Button>}
                </DialogContent>
            </Dialog>
            {PermisoUsuarioOficinaCreditos() && <div style={{ display: 'flex' }}>
                <label>Deposito por investigar:</label>
                <input type='text' className='form-control' value={dpi} onChange={(e) => setDpi(e.target.value)} />
                <button style={{ marginLeft: 10 }} className='btn btn-success' onClick={actualizarDpi}>Actualizar</button>
            </div>}
            <div>
                <img src={`${APIURL}/uploads/${props.deposito}`} />
                <button style={{ marginLeft: 10 }} className='btn btn-success' onClick={() => setShowModalUpload(true)}>Actualizar Imagen</button>
                {PermisoUsuarioOficinaCreditos() && <button style={{ marginLeft: 10 }} className='btn btn-danger' onClick={eliminarImagenDeposito}>Eliminar Imagen</button>}
            </div>
        </div>
    );
}