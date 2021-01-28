import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';

export const EliminarModal = props => {
    const { open, hideEliminar, codigoImagen } = props;

    const [codigo, setCodigo] = useState("");

    const handleChangeCodigo = (e) => {
        setCodigo(e);
    }

    const eliminarImagen = async () => {
        try {
            await axios.post(`${APIURL}/api/ColeccionesXLinea/eliminarimagen/${codigoImagen}`);
            props.ocultarTodo();
            Swal.fire({
                title: 'Confirmado',
                text: "Imagen eliminada con exito.",
                type: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                localStorage.removeItem("ColeccionSeleccionada");
                localStorage.removeItem("HoraIngreso");
                props.navegar.history.push("/Pedidos/Colecciones")
            });

        } catch (err) {
            props.ocultarTodo();
            let mensaje = "Ha ocurrido un error y no se pudo eliminar la imagen.";

            if (err.response) {
                mensaje = err.response.data.Message;
            }

            Swal.fire({
                title: 'Error',
                text: mensaje,
                type: 'error',
                confirmButtonText: 'Ok'
            });
        }
    }

    const handleEliminar = () => {
        if (codigo === codigoImagen.toString()) {
            eliminarImagen();
        } else {
            alert("Codigo de imagen no coincide");
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
                    Eliminar imagen producto
                </div>
            </DialogTitle>
            <DialogContent>

                <div className="d-flex flex-grow-1 align-items-center justify-content-center">
                    <div className="row">
                        <div className="col-12 text-center">
                            <p>¿Esta seguro en eliminar la imagen?</p>
                            <p>Escriba el codigo de la imagen para confirmar.</p>
                            <input type="text" className="form-control" onChange={(e) => { handleChangeCodigo(e.target.value) }} />
                            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-evenly' }}>
                                <button className="btn btn-success" onClick={handleEliminar}>Aceptar</button>
                                <button className="btn btn-primary" onClick={hideEliminar}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>


            </DialogContent>
        </Dialog>
    )
}