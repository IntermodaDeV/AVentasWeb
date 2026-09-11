import React, { useState } from 'react';
import { TextField, Chip } from '@material-ui/core';

const separarCorreos = (texto) => (texto || '')
    .split(new RegExp('[;,]'))
    .map((correo) => correo.trim())
    .filter((correo) => correo.length > 0);

export const EmailChipInput = (props) => {
    const { label, name, value, onChange, helperText } = props;
    const [inputValue, setInputValue] = useState('');

    const correos = separarCorreos(value);

    const actualizar = (nuevosCorreos) => {
        onChange(name, nuevosCorreos.join(','));
    };

    const agregarCorreo = () => {
        const correo = inputValue.trim();

        if (correo.length === 0 || !correo.includes('@')) {
            return;
        }

        if (!correos.includes(correo)) {
            actualizar([...correos, correo]);
        }

        setInputValue('');
    };

    const eliminarCorreo = (correo) => {
        actualizar(correos.filter((c) => c !== correo));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarCorreo();
        } else if (e.key === 'Backspace' && inputValue.length === 0 && correos.length > 0) {
            eliminarCorreo(correos[correos.length - 1]);
        }
    };

    return (
        <TextField
            label={label}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={agregarCorreo}
            helperText={helperText}
            fullWidth
            margin="normal"
            InputProps={{
                startAdornment: correos.map((correo) => (
                    <Chip
                        key={correo}
                        label={correo}
                        onDelete={() => eliminarCorreo(correo)}
                        style={{ margin: '2px 4px 2px 0' }}
                    />
                )),
            }}
        />
    );
};
