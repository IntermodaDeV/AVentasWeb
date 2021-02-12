import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InboxIcon from '@material-ui/icons/Inbox';

export const ColorSinStockModal = props => {
    const { open, colores, close } = props;

    return (
        <Dialog
            scroll={'paper'}
            open={open}
            onClose={close}
        >
            <DialogTitle className="text-center" id="scroll-dialog-title">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Colores sin stock
                    <button className="btn btn-primary" onClick={close}>x</button>
                </div>
            </DialogTitle>
            <DialogContent>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Codigo</th>
                            <th scope="col">Color</th>
                            <th scope="col">Descripcion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {colores.map((color) => (
                            <tr>
                                <td>{color.CodigoColor}</td>
                                <td>{color.NombreColor}</td>
                                <td><span style={{ float: 'right', color: 'red', fontWeight: 'bold', borderRadius: '5px', padding: 2 }}><InboxIcon />Sin Stock</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DialogContent>
        </Dialog >
    )
}