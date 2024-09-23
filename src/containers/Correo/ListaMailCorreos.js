import React, { useEffect, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { Button, IconButton, Modal, TextField,  Grid, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { Edit, Delete } from '@material-ui/icons';
import Swal from 'sweetalert2';
import {IsAllow} from 'components/Seguridad/Permisos';

export const MailCorreos = (props) => {
  const [data, setData] = useState([]);
  const [dataEmpresas, setDataEmpresas] = useState([]);
  const [open, setOpen] = useState(false);
  const [childModalOpen, setChildModalOpen] = useState(false); // Estado para el modal child
  const [currentRow, setCurrentRow] = useState(null);
  const [moduloId, setModuloId] = useState('');
  const [modalData, setModalData] = useState({
    ServicioID: '',
    EmpresaId: '',
    CorreoElectronico: '',
    FechaCreacion: '',
    UsuarioCreacion: '',
    Estado: '',
    FechaModifiacion: '',
  });

  useEffect(() => {

    if (!IsAllow("/MailCorreos")) 
      {
        props.history.push('/home');
      }

    obtenerEmpresas();
    obtenerCorreos();
  }, []);


  const obtenerEmpresas = async () => {

    try 
    {
        const response = await axios.get(`${APIURL}/api/empresa/Empresas`);
        setDataEmpresas(response.data);
        console.log(response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos. Por favor, inténtalo de nuevo más tarde.',
        });
      }
  };
  const obtenerCorreos = async () => {
   
    debugger
    const query = new URLSearchParams(window.location.search);
    const modulo = query.get('modulo');
    setModuloId(modulo);


    try {
      const url = `${APIURL}/api/mailreceptors/listar/${modulo}`;
        const response = await axios.get(url,{
          headers: 
          {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
           }
        });
        setData(response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se pudieron cargar los datos. Por favor, inténtalo de nuevo más tarde.',
        });
      }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEdit = (rowData, rowIndex) => {
    setModalData(rowData);
    setCurrentRow(rowIndex);
    setOpen(true);
  };

  const handleAdd = () => {
    setModalData({
      ServicioID: moduloId,
      EmpresaId: '',
      CorreoElectronico: '',
      FechaCreacion: '',
      UsuarioCreacion: '',
      Estado: '',
      FechaModifiacion: '',
    });

    setCurrentRow(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChildModalClose = () => {
    setChildModalOpen(false);
  };

  const handleSubmit = async () => 
    {
    
    try {
        debugger
        if (currentRow !== null)
        {
            await axios.put(`${APIURL}/api/mailreceptors/actualizar`, modalData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });

                
            Swal.fire({
                title: 'Actualizado',
                text: 'Receptor de correo guardado correctamente',
                icon: 'success',
                confirmButtonText: 'Ok',
            });
                    
        }
        else
        {

            await axios.post(`${APIURL}/api/mailreceptors/crear`, modalData ,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });

            Swal.fire({
                title: 'Servicio Creado',
                text: 'Servicio creado exitosamente',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

        }

        const query = new URLSearchParams(window.location.search);
        const modulo = query.get('modulo');
        setModuloId(modulo);
        setOpen(false);
        const response = await axios.get(`${APIURL}/api/mailreceptors/listar/${modulo}`);
        setData(response.data);
      
      
    } catch (error) { 
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema guardando los datos',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
      setChildModalOpen(true); // Mostrar modal child cuando hay un error
    }
  };

  const handleDelete  = async (rowData) => {
    debugger
    const { ServicioID, EmpresaId, CorreoElectronico } = rowData;
    try {

        await axios.delete(`${APIURL}/api/mailreceptors/eliminar`, {
            data: {
              ServicioID,
              EmpresaId,
              CorreoElectronico
            }
          });

        Swal.fire('Eliminado', 'Receptor de correo eliminado correctamente', 'success');

        setOpen(false);
        const response = await axios.get(`${APIURL}/api/mailreceptors/listar`);
        setData(response.data);
    }
    catch (error) {
            // Capturar el mensaje detallado del error
            let errorMessage = 'Hubo un problema guardando los datos';
            if (error.response) {
              // El servidor respondió con un código de error
              errorMessage = error.response.data.message || `Error ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
              // La solicitud fue hecha pero no hubo respuesta
              errorMessage = 'No se recibió respuesta del servidor';
            } else {
              // Algo más sucedió al configurar la solicitud
              errorMessage = error.message;
            }
        
            // Mostrar alerta de error con mensaje detallado
            Swal.fire({
              title: 'Error',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'Ok',
            });
        setChildModalOpen(true); // Mostrar modal child cuando hay un error
      }
    
  };

  const columns = [
    { name: 'ServicioID', label: 'Servicio ID' },
    { name: 'EmpresaId', label: 'Empresa ID' },
    { name: 'CorreoElectronico', label: 'Correo Electrónico' },
    { name: 'FechaCreacion', label: 'Fecha de Creación' },
    { name: 'UsuarioCreacion', label: 'Usuario de Creación' },
    { name: 'Estado', label: 'Estado' },
    { name: 'FechaModifiacion', label: 'Fecha de Modificación' },
    {
      name: 'Acciones',
      options: {
        customBodyRender: (value, tableMeta) => (
          <div>
            <IconButton onClick={() => handleEdit(data[tableMeta.rowIndex])}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(data[tableMeta.rowIndex])}>
              <Delete />
            </IconButton>
          </div>
        ),
      },
    },
  ];

  const options = {
    filter: true,
    responsive: "standard",
    filterType: 'checkbox',
    selectableRows: 'none',
        textLabels: {
            body: {
                noMatch: "No se han encontrado correos asociados a este servicio",
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
      <Button variant="contained" color="primary" onClick={handleAdd}>
        Agregar Receptor
      </Button>

      <MUIDataTable title={"Receptores de Correos"} data={data} columns={columns} options={options} />

      {/* Modal para agregar/editar receptor */}
      <Modal open={open} onClose={handleClose}>
        <div style={{ padding: '20px', backgroundColor: '#fff', margin: '100px auto', width: '500px' }}>
          <h2>{modalData.ServicioID ? 'Editar Correo' : 'Agregar Correo'}</h2>
          <form>
            <TextField label="Servicio ID" name="ServicioID" value={modalData.ServicioID} onChange={handleInputChange} fullWidth margin="normal" disabled/>
           
            <Select
              label="Empresa ID"
              name="EmpresaId"
              value={modalData.EmpresaId}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              disabled={currentRow !== null}
            >
              {dataEmpresas.map((empresa) => (
                <MenuItem key={empresa.COMPANY_CODE} value={empresa.COMPANY_CODE}>
                  {empresa.COMPANY_CODE + " - "+ empresa.NAME}
                </MenuItem>
              ))}
            </Select>
            
            <TextField label="Correo Electrónico" name="CorreoElectronico" value={modalData.CorreoElectronico} onChange={handleInputChange} fullWidth margin="normal"  disabled  = {currentRow !== null}/>
            {/*<TextField label="Estado" name="Estado" value={modalData.Estado} onChange={handleInputChange} fullWidth margin="normal" />*/}

            <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="Estado">Envia correo ?</InputLabel>
                            <Select
                            labelId="Estado"
                            name="Estado"
                            value={modalData.Estado}
                            onChange={handleInputChange}
                            label="Estado"
                            >
                            <MenuItem value="A">A - Activo para envio de correo</MenuItem>
                            <MenuItem value="I">I - Inactivo para envio de correo</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Guardar
            </Button>
          </form>
        </div>
      </Modal>

      {/* Modal child para advertencia cuando no se puede actualizar el registro */}
      <Modal open={childModalOpen} onClose={handleChildModalClose}>
        <div style={{ padding: '20px', backgroundColor: '#fff', margin: '100px auto', width: '400px' }}>
          <h2>Error</h2>
          <p>Hubo un problema al intentar actualizar el registro. Por favor, revisa los datos e inténtalo de nuevo.</p>
          <Button variant="contained" color="primary" onClick={handleChildModalClose}>
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};