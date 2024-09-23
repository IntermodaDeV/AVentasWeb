import React, { useEffect, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { Button, IconButton, Modal, TextField, Paper, Stepper, Step, StepLabel, Grid, Select, MenuItem,FormControl,InputLabel  } from '@material-ui/core';
import { Edit, Delete, Settings, Alarm } from '@material-ui/icons';
import Swal from 'sweetalert2';
import { useHistory } from 'react-router-dom';
import {IsAllow} from 'components/Seguridad/Permisos';


export const MailServicios = (props) => {
  const history = useHistory();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [moduloId, setmoduloId] = useState('');
  const [modalData, setModalData] = useState({
    Modulo : '',
    ServicioID: '',
    Descripcion: '',
    FechaCreacion: '',
    UsuarioCreacion: '',
    Header: '',
    ValidaType: '',
    Consulta: '',
    Footer: '',
    Estado: '',
    valida_empresaid: '',
  });

  const steps = ['Información Básica', 'Configuraciones', 'Detalles Finales'];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {

    if (!IsAllow("/MailServicios")) 
    {
      props.history.push('/home');
    }
   
    // Obtener el ModuloId desde la URL
    const query = new URLSearchParams(window.location.search);
    const modulo = query.get('modulo');
    setmoduloId(modulo);
  
    // Llamar a la API para obtener los datos basados en el ModuloId
    const fetchData = async () => {
      try 
      {
        const response = await axios.get(`${APIURL}/api/mailservicios/obtener/${modulo}`);
      
        setData(response.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se pudieron cargar los datos. Por favor, inténtalo de nuevo más tarde.',
        });
      }
    };
  
    fetchData();
  }, [moduloId]);


  const goToMailCorreos = (moduloId) => {
    history.push(`/mailcorreos?modulo=${moduloId}`);
  };

  
  const goToMailEjecucion = (moduloId) => {
    history.push(`/mailejecucion?modulo=${moduloId}`);
  };

  const handleOpenModal = (row = null) => {

    if (row) 
    {

        let formattedDate = '';
        if (row[2]) 
        {
        const date = new Date(row[2]);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
        }


      setModalData({
        Modulo : '',
        ServicioID: row[0] || '',
        Descripcion: row[1] || '',
        FechaCreacion: formattedDate || '',
        UsuarioCreacion: row[3] || '',
        Header: row[4] || '',
        ValidaType: row[5] || '',
        Consulta: row[6] || '',
        Footer: row[7] || '',
        Estado: row[8] || '',
        valida_empresaid: row[9] || '',
      });
    } else 
    {
      setModalData({
        Modulo : moduloId,
        ServicioID: '',
        Descripcion: '',
        FechaCreacion: '',
        UsuarioCreacion: '',
        Header: '',
        ValidaType: '',
        Consulta: '',
        Footer: '',
        Estado: '',
        valida_empresaid: '',
      });
    }
    setCurrentRow(row);
    setActiveStep(0);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setModalData({ ...modalData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
     
    if (!modalData.ServicioID || !modalData.Descripcion) 
    {
        setWarningMessage('Por favor, complete todos los campos requeridos.');
         return;
    }

    setWarningMessage('');  // Limpiar mensajes de advertencia

    try {
    debugger
      if (currentRow) {
        // Actualizar Servicio
        await axios.put(`${APIURL}/api/mailservicios/actualizar`, modalData);

        Swal.fire({
            title: 'Actualizado',
            text: 'Servicio actualizado exitosamente',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
       
      } else {
        // Crear nuevo Servicio
        await axios.post(`${APIURL}/api/mailservicios/crear`, modalData);

        Swal.fire({
            title: 'Servicio Creado',
            text: 'Servicio creado exitosamente',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
        
      }
      setOpen(false);
      const query = new URLSearchParams(window.location.search);
      const moduloId = query.get('modulo');
      const response = await axios.get(`${APIURL}/api/mailservicios/obtener/${moduloId}`);
      setData(response.data);
    } catch (error) {
        setWarningMessage('Hubo un problema al guardar el servicio.');
    }
  };

  const handleDelete = async (ServicioID) => {
    try 
    {
    const query = new URLSearchParams(window.location.search);
    const modulo = query.get('modulo');

    const respo = await axios.delete(`${APIURL}/api/mailservicios/eliminar/${modulo}/${ServicioID}`);
      
     Swal.fire('Eliminado', 'Servicio eliminado exitosamente', 'success');


     const response = await axios.get(`${APIURL}/api/mailservicios/obtener/${modulo}`);
     setData(response.data);


    } catch (error) {

        console.log(error);
      Swal.fire('Error', 'Hubo un problema al eliminar el servicio', 'error');
    }
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };


  const columns = [
    { name: 'ServicioID', label: 'Servicio ID' },
    { name: 'Descripcion', label: 'Descripción' },
    { name: 'FechaCreacion', label: 'Fecha de Creación' },
    { name: 'UsuarioCreacion', label: 'Usuario Creación' },
    { name: 'Header', label: 'Encabezado' },
    { name: 'ValidaType', label: 'Tipo de Validación' },
    { name: 'Consulta', label: 'Consulta' },
    { name: 'Footer', label: 'Pie de Página' },
    { name: 'Estado', label: 'Estado' },
    { name: 'valida_empresaid', label: 'Valida Empresa ID' },
    {
      name: 'actions',
      label: 'Acciones',
      options: {
        customBodyRender: (value, tableMeta) => {
          const row = tableMeta.rowData;
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit />}
                onClick={() => handleOpenModal(row)}
                style={{ marginBottom: 10 }}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Delete />}
                onClick={() => handleDelete(row[0])}
                style={{ marginBottom: 10 }}
              >
                Borrar
              </Button>
              <Button
                variant="contained"
                color="default"
                startIcon={<Settings />}
                onClick={() =>  goToMailCorreos(row[0])} 
                style={{ marginBottom: 10 }}
              >
                Configurar Correos
              </Button>
              <Button
                variant="contained"
                color="default"
                startIcon={<Alarm />}
                onClick={() => goToMailEjecucion(row[0])}
              >
                Configurar Horas de Ejecución
              </Button>
            </div>
          );
        }
      }
    }
  ];

  const options = {
    filterType: 'checkbox',
        textLabels: {
            body: {
                noMatch: "No se han encontrado servicios configurados para el modulo " + moduloId,
                toolTip: "Ordenar",
            },
            pagination: {
                next: "Siguiente",
                previous: "Anterior",
                rowsPerPage: "Filas por página:",
                displayRows: "de",
            },
            toolbar: {
                search: "Buscar",
                downloadCsv: "Descargar CSV",
                print: "Imprimir",
                viewColumns: "Ver Columnas",
                filterTable: "Filtrar Tabla",
            },
            filter: {
                all: "Todos",
                title: "Filtros",
                reset: "Quitar",
            },
            viewColumns: {
                title: "Mostrar Columnas",
                titleAria: "Mostrar/Esconder Columnas",
            },
            selectedRows: {
                text: "Fila(s) seleccionadas",
                delete: "Borrar",
                deleteAria: "Borrar Filas Seleccionadas",
            },
        },
  };

  return (
    <div>

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenModal()}
        style={{ marginBottom: 20 }}
      >
        Agregar Nuevo Servicio
      </Button>


      <MUIDataTable
        title={"Sevicios de correo configurados para el modulo de " + moduloId}
        data={data}
        columns={columns}
        options={options}
      />
      <Modal
        open={open}
        onClose={handleCloseModal}
      >
        <Paper style={{ padding: '20px', maxWidth: '600px', margin: '100px auto', overflowY: 'auto' }}>
        <h2>{currentRow ? 'Editar Servicio' : `Agregar Nuevo Servicio ${moduloId}`}</h2>
          {warningMessage && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              {warningMessage}
            </div>
          )}
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <div>
            {activeStep === steps.length ? (
              <div>
                <p>Todos los pasos están completados</p>
                <Button onClick={handleReset}>Resetear</Button>
              </div>
            ) : (
              <div>
                <Grid container spacing={3}>
                  {activeStep === 0 && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Servicio ID"
                          name="ServicioID"
                          value={modalData.ServicioID}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          disabled={currentRow}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Descripción"
                          name="Descripcion"
                          value={modalData.Descripcion}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Fecha de Creación"
                          name="FechaCreacion"
                          value={modalData.FechaCreacion}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Usuario Creación"
                          name="UsuarioCreacion"
                          value={modalData.UsuarioCreacion}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                        />
                      </Grid>
                    </>
                  )}
                  {activeStep === 1 && (
                    <>

                     <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="ValidaType">Tipo de Validación</InputLabel>
                            <Select
                            labelId="ValidaType"
                            name="ValidaType"
                            value={modalData.ValidaType}
                            onChange={handleInputChange}
                            label="Tipo de Validación"
                            >
                            <MenuItem value="C">C - Consulta</MenuItem>
                            <MenuItem value="P">P - Procedimiento Almacenado</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Correo : Encabezado"
                          name="Header"
                          multiline rows={4}
                          value={modalData.Header}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Correo : Pie de Página"
                          name="Footer"
                          multiline rows={4}
                          value={modalData.Footer}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                        />
                      </Grid>
                     
                      
                    </>
                  )}
                  {activeStep === 2 && (
                    <>

                    <Grid item xs={12}>
                        <TextField
                          label="Consulta"
                          name="Consulta"
                          multiline rows={5}
                          value={modalData.Consulta}
                          onChange={handleInputChange}
                          fullWidth
                          margin="normal"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="Estado">Estado</InputLabel>
                            <Select
                            labelId="Estado"
                            name="Estado"
                            value={modalData.Estado}
                            onChange={handleInputChange}
                            label="Estado"
                            >
                            <MenuItem value="A">A - Activo</MenuItem>
                            <MenuItem value="I">I - Inactivo</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    

                     <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="valida_empresaid">Valida Empresa</InputLabel>
                            <Select
                            labelId="valida_empresaid"
                            name="valida_empresaid"
                            value={modalData.valida_empresaid}
                            onChange={handleInputChange}
                            label="valida_empresaid"
                            >
                            <MenuItem value="S">S - SI</MenuItem>
                            <MenuItem value="N">N - NO</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    </>
                  )}
                </Grid>
                <div style={{ marginTop: '20px' }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    style={{ marginRight: '10px' }}
                  >
                    Volver
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={activeStep === steps.length - 1 ? handleSave : handleNext}
                  >
                    {activeStep === steps.length - 1 ? 'Guardar' : 'Siguiente'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Paper>
      </Modal>
    </div>
  );
};