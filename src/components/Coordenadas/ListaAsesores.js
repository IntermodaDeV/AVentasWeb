import React from 'react';
import { AsesorCard } from './AsesorCard';

export const ListaAsesores = props => {
    return (
        <div style={{ height: '100%', overflow: 'scroll' }}>
            {props.asesores.sort((a,b)=>(a.nombre.localeCompare(b.nombre))).map((asesor) => (
                <AsesorCard
                    seleccionarAsesor={props.seleccionarAsesor}
                    nombre={asesor.nombre}
                    codigo={asesor.codigo}
                    empresa={asesor.empresa}
                    key={asesor.codigo}
                    asesorSeleccionado={props.asesorSeleccionado}
                />)
            )}
        </div>
    )
}