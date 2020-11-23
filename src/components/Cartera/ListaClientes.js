import React from 'react';
import { Cliente } from './Cliente';

export const ListaClientes = props => {
    return (
        <div style={{ height: '100%', overflow: 'scroll' }}>
            {props.clientes.map((cliente) => (
                <Cliente
                    seleccionado={props.seleccionado}
                    seleccionarCliente={props.seleccionarCliente}
                    nombre={cliente.Nombre}
                    codigo={cliente.Codigo}
                    key={cliente.Codigo}
                />)
            )}
        </div>
    )
}