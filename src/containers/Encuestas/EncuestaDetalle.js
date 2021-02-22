import React from 'react';

export const EncuestaDetalle = props => {
    const { cliente, encuestaId, asesor } = props.location.state;

    return <h1>{asesor}</h1>
}