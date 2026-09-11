import React, { useEffect, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { Button, IconButton, Modal, TextField, Paper, Grid, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { Edit, Block, CheckCircle } from '@material-ui/icons';
import Swal from 'sweetalert2';
import { PermisoListadoConfiguracionCorreo, PermisoGrupoConfiguracionCorreo, PermisoDesactivarConfiguracionCorreo } from 'components/Seguridad/Permisos';
import { EmailChipInput } from 'components/ConfiguracionCorreo/EmailChipInput';

const usuarioActual = () => localStorage.getItem('codigo');

const valoresIniciales = {
    Id: null,
    EmpresaId: '',
    TipoConfiguracionId: '',
    CorreosDestino: '',
    CorreosCopia: '',
    Asunto: '',
    CuerpoPlantilla: '',
};

export const ConfiguracionCorreo = (props) => {
    const [data, setData] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState(null);
    const [modalData, setModalData] = useState(valoresIniciales);

    const puedeListar = PermisoListadoConfiguracionCorreo();
    const puedeCrearEditar = PermisoGrupoConfiguracionCorreo();
    const puedeDesactivar = PermisoDesactivarConfiguracionCorreo();

    const mostrarError = (mensajeDefault) => (err) => {
        let mensaje = mensajeDefault;

        if (err.response) {
            mensaje = err.response.data.Message || err.response.data;
        }

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
        });
    };

    const cargarEmpresas = async () => {
        try {
            const response = await axios.get(`${APIURL}/api/empresa/Empresas`);
            setEmpresas(response.data);
        } catch (err) {
            mostrarError('No se pudieron cargar las empresas.')(err);
        }
    };

    const cargarTipos = async () => {
        try {
            const response = await axios.get(`${APIURL}/api/configuracioncorreo/tipospermitidos/${usuarioActual()}`);
            setTipos(response.data);
        } catch (err) {
            mostrarError('No se pudieron cargar los tipos de configuración de correo permitidos.')(err);
        }
    };

    const cargarConfiguraciones = async () => {
        try {
            const response = await axios.get(`${APIURL}/api/configuracioncorreo/listar/${usuarioActual()}`);
            setData(response.data);
        } catch (err) {
            mostrarError('No se pudieron cargar las configuraciones de correo.')(err);
        }
    };

    useEffect(() => {
        if (!puedeListar) {
            props.history.push('/home');
            return;
        }

        cargarEmpresas();
        cargarTipos();
        cargarConfiguraciones();
        // eslint-disable-next-line
    }, []);

    const handleInputChange = (e) => {
        setModalData({ ...modalData, [e.target.name]: e.target.value });
    };

    const handleCorreosChange = (name, value) => {
        setModalData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        setModalData(valoresIniciales);
        setCurrentRow(null);
        setOpen(true);
    };

    const handleEdit = (row) => {
        setModalData({
            Id: row.Id,
            EmpresaId: row.EmpresaId,
            TipoConfiguracionId: row.TipoConfiguracionId,
            CorreosDestino: row.CorreosDestino,
            CorreosCopia: row.CorreosCopia || '',
            Asunto: row.Asunto || '',
            CuerpoPlantilla: row.CuerpoPlantilla || '',
        });
        setCurrentRow(row);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSave = async () => {
        if (!modalData.EmpresaId || !modalData.TipoConfiguracionId || !modalData.CorreosDestino) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Empresa, Tipo y Correos Destino son obligatorios.' });
            return;
        }

        const payload = { ...modalData, Usuario: usuarioActual() };

        try {
            if (currentRow) {
                await axios.put(`${APIURL}/api/configuracioncorreo/modificar`, payload);
                Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Configuración de correo actualizada exitosamente.' });
            } else {
                await axios.post(`${APIURL}/api/configuracioncorreo/crear`, payload);
                Swal.fire({ icon: 'success', title: 'Creado', text: 'Configuración de correo creada exitosamente.' });
            }

            setOpen(false);
            cargarConfiguraciones();
        } catch (err) {
            mostrarError('Hubo un problema al guardar la configuración de correo.')(err);
        }
    };

    const handleEstado = async (row) => {
        try {
            await axios.post(`${APIURL}/api/configuracioncorreo/estado/${row.Id}/${usuarioActual()}`);
            Swal.fire({ icon: 'success', title: 'Confirmado', text: 'Se ha cambiado el estado exitosamente.' });
            cargarConfiguraciones();
        } catch (err) {
            mostrarError('Hubo un problema al cambiar el estado.')(err);
        }
    };

    const columns = [
        { name: 'EmpresaId', label: 'Empresa ID' },
        { name: 'NombreEmpresa', label: 'Empresa' },
        { name: 'TipoDescripcion', label: 'Tipo de Correo' },
        { name: 'CorreosDestino', label: 'Correos Destino' },
        { name: 'Asunto', label: 'Asunto' },
        {
            name: 'Activo',
            label: 'Estado',
            options: {
                customBodyRender: (value) => (value ? 'Activo' : 'Inactivo'),
            },
        },
        {
            name: 'actions',
            label: 'Acciones',
            options: {
                customBodyRender: (value, tableMeta) => {
                    const row = data[tableMeta.rowIndex];
                    return (
                        <div style={{ display: 'flex' }}>
                            {puedeCrearEditar && (
                                <IconButton onClick={() => handleEdit(row)}>
                                    <Edit />
                                </IconButton>
                            )}
                            {puedeDesactivar && (
                                <IconButton onClick={() => handleEstado(row)}>
                                    {row.Activo ? <Block /> : <CheckCircle />}
                                </IconButton>
                            )}
                        </div>
                    );
                },
            },
        },
    ];

    const options = {
        filterType: 'checkbox',
        selectableRows: 'none',
        textLabels: {
            body: {
                noMatch: 'No se han encontrado configuraciones de correo.',
                toolTip: 'Ordenar',
            },
            pagination: {
                next: 'Siguiente',
                previous: 'Anterior',
                rowsPerPage: 'Filas por página:',
                displayRows: 'de',
            },
            toolbar: {
                search: 'Buscar',
                downloadCsv: 'Descargar CSV',
                print: 'Imprimir',
                viewColumns: 'Ver Columnas',
                filterTable: 'Filtrar Tabla',
            },
            filter: {
                all: 'Todos',
                title: 'Filtros',
                reset: 'Quitar',
            },
            viewColumns: {
                title: 'Mostrar Columnas',
                titleAria: 'Mostrar/Esconder Columnas',
            },
            selectedRows: {
                text: 'Fila(s) seleccionadas',
                delete: 'Borrar',
                deleteAria: 'Borrar Filas Seleccionadas',
            },
        },
    };

    return (
        <div>
            {puedeCrearEditar && (
                <Button variant="contained" color="primary" onClick={handleAdd} style={{ marginBottom: 20 }}>
                    Agregar Configuración de Correo
                </Button>
            )}

            <MUIDataTable title="Configuraciones de Correo" data={data} columns={columns} options={options} />

            <Modal open={open} onClose={handleClose}>
                <Paper style={{ padding: '20px', maxWidth: '600px', maxHeight: '80vh', margin: '5vh auto', overflowY: 'auto' }}>
                    <h2>{currentRow ? 'Editar Configuración de Correo' : 'Agregar Configuración de Correo'}</h2>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="EmpresaId">Empresa</InputLabel>
                                <Select
                                    labelId="EmpresaId"
                                    name="EmpresaId"
                                    value={modalData.EmpresaId}
                                    onChange={handleInputChange}
                                    disabled={!!currentRow}
                                >
                                    {empresas.map((empresa) => (
                                        <MenuItem key={empresa.COMPANY_CODE} value={empresa.COMPANY_CODE}>
                                            {empresa.COMPANY_CODE + ' - ' + empresa.NAME}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="TipoConfiguracionId">Tipo de Correo</InputLabel>
                                <Select
                                    labelId="TipoConfiguracionId"
                                    name="TipoConfiguracionId"
                                    value={modalData.TipoConfiguracionId}
                                    onChange={handleInputChange}
                                >
                                    {tipos.map((tipo) => (
                                        <MenuItem key={tipo.Id} value={tipo.Id}>
                                            {tipo.Codigo + ' - ' + tipo.Descripcion}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <EmailChipInput
                                label="Correos Destino"
                                name="CorreosDestino"
                                value={modalData.CorreosDestino}
                                onChange={handleCorreosChange}
                                helperText="Escriba un correo y presione Enter para agregarlo"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <EmailChipInput
                                label="Correos en Copia"
                                name="CorreosCopia"
                                value={modalData.CorreosCopia}
                                onChange={handleCorreosChange}
                                helperText="Escriba un correo y presione Enter para agregarlo"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Asunto"
                                name="Asunto"
                                value={modalData.Asunto}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Cuerpo de la Plantilla"
                                name="CuerpoPlantilla"
                                multiline
                                rows={5}
                                value={modalData.CuerpoPlantilla}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                    </Grid>
                    <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: 10 }}>
                        Guardar
                    </Button>
                </Paper>
            </Modal>
        </div>
    );
};
