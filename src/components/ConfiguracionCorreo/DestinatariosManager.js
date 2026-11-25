import React, { useState } from 'react';
import { Chip } from '@material-ui/core';
import { Dropdown } from 'semantic-ui-react';
import Swal from 'sweetalert2';

const PREFIJO_USUARIO = 'usuario-';

export const DestinatariosManager = (props) => {
    const { label, destinatarios, usuariosSistema, onAgregar, onQuitar, disabled } = props;
    const [opcionAgregada, setOpcionAgregada] = useState(null);

    const opciones = [
        ...usuariosSistema.map((u) => ({ key: `${PREFIJO_USUARIO}${u.Id}`, value: `${PREFIJO_USUARIO}${u.Id}`, text: u.Usuario })),
        ...(opcionAgregada ? [opcionAgregada] : []),
    ];

    const handleAddItem = (e, { value }) => {
        setOpcionAgregada({ key: value, value, text: value });
    };

    const handleChange = async (e, { value }) => {
        const seleccionado = value[value.length - 1];

        if (!seleccionado) {
            return;
        }

        if (seleccionado.startsWith(PREFIJO_USUARIO)) {
            const usuarioId = Number(seleccionado.replace(PREFIJO_USUARIO, ''));
            await onAgregar({ UsuarioId: usuarioId, CorreoManual: null });
        } else if (seleccionado.includes('@')) {
            await onAgregar({ UsuarioId: null, CorreoManual: seleccionado });
        } else {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Escriba un correo válido.' });
        }

        setOpcionAgregada(null);
    };

    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4 }}>{label}</div>

            <div style={{ marginBottom: 8 }}>
                {destinatarios.length === 0 && (
                    <span style={{ color: 'rgba(0, 0, 0, 0.54)', fontSize: '0.875rem' }}>Sin destinatarios agregados.</span>
                )}
                {destinatarios.map((d) => (
                    <Chip
                        key={d.Id}
                        label={d.UsuarioId ? `${d.NombreUsuario} (${d.CorreoUsuario})` : d.CorreoManual}
                        onDelete={disabled ? undefined : () => onQuitar(d.Id)}
                        style={{ margin: '2px 4px 2px 0' }}
                    />
                ))}
            </div>

            {!disabled && (
                <Dropdown
                    placeholder="Busque un usuario o escriba un correo y presione Enter"
                    fluid
                    multiple
                    search
                    selection
                    allowAdditions
                    additionLabel="Agregar correo: "
                    value={[]}
                    onAddItem={handleAddItem}
                    onChange={handleChange}
                    options={opciones}
                    noResultsMessage="No hay resultados"
                />
            )}
        </div>
    );
};
