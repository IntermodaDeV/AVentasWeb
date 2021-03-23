import React from 'react';
import {
    Button,
} from 'reactstrap';
import { useSelector } from 'react-redux';

const SelectBodega = (props) => {
    const Bodegas = useSelector(b => b.MaestroBodegaAlmacenes);

    return (
        <>
            <div className="row">
                <div className="col">
                    <h5 className="font-weight-light">
                        Seleccionar Bodega
                    </h5>
                    <hr />
                </div>
            </div>

            <div className="row">

                {Bodegas.map((bodega, index) => {

                    if (bodega.BodegaPrincipal) {
                        return (
                            <div key={index} className="col-xl-3 col-md-6 col-lg-6 col-12">
                                <Button style={{ marginBottom: '10px' }} key={index} onClick={() => props.setBodega(bodega)} outline color="secondary" size="lg" block>{bodega.Etiqueta}</Button>
                            </div>
                        );
                    }

                    if (localStorage.getItem("Conexion") === "Online" && bodega.EmpresaId.toUpperCase() === props.Cliente.EmpresaId) {
                        return (
                            <div key={index} className="col-xl-3 col-md-6 col-lg-6 col-12">
                                <Button style={{ marginBottom: '10px' }} key={index} onClick={() => props.setBodega(bodega)} outline color="secondary" size="lg" block>{bodega.Etiqueta}</Button>
                            </div>
                        );
                    }
                    return false;
                })
                }
            </div>
        </>
    )
}

export default SelectBodega;