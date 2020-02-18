import React from 'react';
import Linea from 'components/Pedidos/SelectLinea/Linea'


const SelectLinea = (props) => {

    return (
        <>

            <div className="row">
                <div className="col">
                    <h5 className="font-weight-light">
                        Seleccionar Linea
                    </h5>
                    <hr />
                </div>
            </div>
            <div className="row">

                {
                    props.maestroLineas.map((LineaIndividual, index) => {
                        return (
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12 my-2" key={index}>
                                <Linea setLinea={props.setLinea} Linea={LineaIndividual} />
                            </div>
                        );
                    })
                }
            </div>
        </>
    )
}

export default SelectLinea;