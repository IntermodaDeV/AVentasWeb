import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

export const DeshabilitarModal = props => {
    const { open, deshabilitar, coleccion, empresa, producto, hideDeshabilitar } = props;

    const [codigo, setCodigo] = useState("");

    const handleChangeCodigo = (e) => {
        setCodigo(e);
    }

    const deshabilitarProducto = () => {
        if (codigo === producto) {
            deshabilitar();
        } else {
            alert("No son iguales");
        }
    }

    return (
        <Dialog
            disableBackdropClick
            scroll={'paper'}
            open={open}
        >
            <DialogTitle className="text-center" id="scroll-dialog-title">
                <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Deshabilitar Producto
                </div>
            </DialogTitle>
            <DialogContent>

                <div className="d-flex flex-grow-1 align-items-center justify-content-center">
                    <div className="row">
                        <div className="col-12 text-center">
                            <p>¿Esta seguro en deshabilitar el producto de la coleccion {coleccion} para el pais {empresa}?</p>
                            <p>Escriba el codigo del producto para confirmar.</p>
                            <input type="text" className="form-control" onChange={(e) => { handleChangeCodigo(e.target.value) }} />
                            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-evenly' }}>
                                <button className="btn btn-success" onClick={deshabilitarProducto}>Aceptar</button>
                                <button className="btn btn-primary" onClick={hideDeshabilitar}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>


            </DialogContent>
        </Dialog>
    )
}