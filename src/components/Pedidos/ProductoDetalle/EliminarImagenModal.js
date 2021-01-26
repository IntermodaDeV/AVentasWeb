import React, { useState, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { EliminarModal } from './EliminarModal';

export const EliminarImagenModal = props => {
    const { open, hideEliminar, listaImagenes, listaColores, codigoProducto, navegar } = props;
    const [imagenesProducto, setImagenesProducto] = useState([]);
    const [imagenesColor, setImagenesColor] = useState([]);
    const [imagen, setImagen] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [codigoImagen, setCodigoImagen] = useState(0);

    const obtenerImagenes = () => {

        if (listaImagenes.length > 0) {
            let listaImagenesData = listaImagenes.map(x => ({ IdFotografia: x.IdFotografia, Fotografia: x.FotografiaProducto, Nombre: x.NombreFotografia, CodigoColor: x.CodigoColor }));
            setImagenesProducto(listaImagenesData);
        }

        if (listaColores.length > 0) {
            let listaImagenesData = [];
            listaColores.forEach(color => {
                if (color.ListaImagenes.length > 0) {
                    let listaColoresData = color.ListaImagenes.map(x => ({ IdFotografia: x.IdFotografia, Fotografia: x.FotografiaProducto, Nombre: x.NombreFotografia, CodigoColor: x.CodigoColor }));
                    listaImagenesData = [...listaImagenesData, ...listaColoresData];
                }
            });

            setImagenesColor(listaImagenesData);
        }
    }

    const seleccionarImagen = (nuevaImagen, codigo) => {
        setImagen(nuevaImagen);
        setCodigoImagen(codigo);
    }

    const eliminarImagen = codigoImagen => {
        setMostrar(true);
        setCodigoImagen(codigoImagen);
    }

    const ocultarTodo = () => {
        setMostrar(false);
        hideEliminar();
    }

    useEffect(() => {
        obtenerImagenes();
        // eslint-disable-next-line
    }, []);

    return (
        <Dialog
            scroll={'paper'}
            open={open}
        >
            <DialogTitle className="text-center" id="scroll-dialog-title">
                <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Eliminar Imagen {codigoProducto}
                </div>
            </DialogTitle>
            <DialogContent>
                <EliminarModal open={mostrar} navegar={navegar} ocultarTodo={ocultarTodo} hideEliminar={() => { setMostrar(false) }} codigoImagen={codigoImagen} codigoProducto={codigoProducto} />
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'inline-block' }}>
                        {imagenesProducto.length > 0 && <><h2>Imagenes en producto</h2>
                            <ListaImagenes codigoImagen={codigoImagen} listaImagenes={imagenesProducto} seleccionarImagen={seleccionarImagen} eliminarImagen={eliminarImagen} /></>}
                        {imagenesColor.length > 0 && <><h2>Imagenes en colores</h2>
                            <ListaImagenes codigoImagen={codigoImagen} listaImagenes={imagenesColor} seleccionarImagen={seleccionarImagen} eliminarImagen={eliminarImagen} /></>}
                    </div>
                    <div style={{ width: '600px', height: '800px', float: 'right', position: 'sticky', top: 5 }}>
                        <button className="btn btn-primary" style={{ float: 'right' }} onClick={hideEliminar}>Cerrar</button>
                        {imagen !== "" && <img alt="imagenaeliminar" style={{ width: '100%', height: '100%' }} src={imagen} />}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const ListaImagenes = props => {
    const { listaImagenes, seleccionarImagen, eliminarImagen, codigoImagen } = props;

    return <ul className="list-group">
        {listaImagenes.map(x => (<li style={{ cursor: 'pointer' }} onClick={() => { seleccionarImagen(x.Fotografia, x.IdFotografia) }} className={`list-group-item d-flex justify-content-between align-items-center ${(codigoImagen === x.IdFotografia ? 'active' : '')}`} key={x.IdFotografia}>
            <div>
                <p>Imagen: {x.Nombre}</p>
                <p>Codigo Color: {x.CodigoColor}</p>
            </div>
            <button onClick={() => { eliminarImagen(x.IdFotografia) }} className="btn btn-danger">Eliminar</button>
        </li>))}
    </ul>
}