import React, { useState } from 'react';
import { Dropdown } from "semantic-ui-react";
import 'semantic-ui-css/semantic.min.css'
import { InformacionGeneral } from 'components/Cartera/InformacionGeneral';
import {
    Card,
    CardContent,
    Button,
} from '@material-ui/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { useDispatch, useSelector } from 'react-redux';


const ClienteSelected = (props) => {
    const [value, setValue] = useState();
    const clientes = useSelector(e => e.clientes);
    const dispatch = useDispatch();

    

    
    const ClienteImpuestosGlobal = useSelector(e => e.ClienteImpuestosGlobal);
    const ProductoImpuestosGlobal = useSelector(e => e.ProductoImpuestosGlobal);
    


    const handleOnChange = (value) => {
        setValue(JSON.parse(value));
    }

    const obtenerClientes = () => {
        return clientes.map(el => ({ key: el.Codigo, value: JSON.stringify(el), text: `${el.Codigo}-${el.Nombre}` }))
    }

    const continuarDevolucion = (cliente) => {
        console.log(cliente)
        if (cliente.FacturacionEntrega === "Todo") {
            Swal.fire({
                title: 'Bloqueado',
                text: 'Actualmente no se tiene relación comercial con el cliente. Su cuenta ha sido bloqueada para todo tipo de transacción.',
                type: 'error',
                confirmButtonText: 'OK',
            });
          return;
        }else if (cliente.FacturacionEntrega === "No" && cliente.Credito[0].Disponible === 1) {
            Swal.fire({
                title: 'Aviso',
                text: 'El cliente no tiene credito disponible, el pedido no sera autorizado automaticamente. Comunicarse con el departamento de créditos.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                ruta()
            })
        } else if (cliente.Credito[0].Disponible <= 1  && cliente.FacturacionEntrega === "Factura") {
            Swal.fire({
                title: 'Aviso',
                text: 'El cliente actualmente se encuentra deshabilitado y sin credito disponible, su cuenta esta en mora. El pedido no sera autorizado automticamente.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                ruta()
            })
        }else if (cliente.Credito[0].Disponible > 1  && cliente.FacturacionEntrega === "Factura") {
            Swal.fire({
                title: 'Aviso',
                text: 'El cliente actualmente se encuentra deshabilitado, su cuenta esta en mora. El pedido no sera autorizado automáticamente.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                ruta()
            })
        } else {
            ruta()
        }


        
    }

    const ruta = () =>{
        dispatch({ type: 'SET_TRASLADO_CLIENTE', payload: value })
        let impuestosCliente = ClienteImpuestosGlobal.filter(x => x.EMPRESA === value.EmpresaId);
        let impuestoProductosCliente = ProductoImpuestosGlobal.filter(x=>x.EMPRESA===value.EmpresaId);
        dispatch({ type: 'SET_RECOLOCACIONCLIENTEIMPUESTO', payload: impuestosCliente })
        dispatch({ type: 'SET_RECOLOCACIONPRODUCTOINMPUESTO', payload: impuestoProductosCliente })
        props.history.push("recolocacion-pedido/recolocacion")
    }

    return (
        <>
            <Card className="my-2" style={{ overflow: 'unset' }}>
                <CardContent>
                    <div>
                        <div className="row mt-2">
                            <div className="col">
                                <h5 className="font-weight-light">
                                    Recolocar Pedido
                                </h5>
                                <hr />
                            </div>
                        </div>
                        <div className={'row mb-3'}>
                            <div className={'col-xl-10 col-lg-10 col-sm-9 col-12 mt-2'} >
                                <Dropdown
                                    placeholder="Seleccione Cliente"
                                    fluid
                                    search
                                    selection
                                    onChange={(e, { value }) => handleOnChange(value)}
                                    options={obtenerClientes()}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 999 }}
                                    multiple={false}
                                    value={value}
                                />
                            </div>
                            <div className={'col-xl-2 col-lg-2 col-sm-3 col-12 mt-2 text-lg-left text-right'}>
                                <Button
                                    disabled={value ? false : true}
                                    onClick={() => continuarDevolucion(value)}
                                    variant="contained"
                                    color="primary">
                                    Continuar
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {value && <div style={{ marginTop: 20 }}> <InformacionGeneral cliente={value} /></div>}
        </>
    );
}
export default ClienteSelected;