import React, { useEffect, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { Button, IconButton, Modal, TextField,  Grid, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { Edit, Delete } from '@material-ui/icons';
import Swal from 'sweetalert2';
import {IsAllow} from 'components/Seguridad/Permisos';


export const MailEjecucion = (props) => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [moduloId, setmoduloId] = useState('');
  const [currentRow, setCurrentRow] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [modalData, setModalData] = useState({
    Id : '',
    ServicioID: '',
    ProximaEjecucion: '',
    FechaCreacion: '',
    UsuarioCreacion: '',
    IntervalType: '',
    IntervalValue: '',
  }) ;

  useEffect(() => { 

    if (!IsAllow("/MailEjecucion")) 
      {
        props.history.push('/home');
      }
   
    obtenerRegistros();
  }, []);

  const obtenerRegistros = async () => {

    try 
    {
      
        const query = new URLSearchParams(window.location.search);
        const modulo = query.get('modulo');
        setmoduloId(modulo);

        const url = `${APIURL}/api/mailproexe/listar/${modulo}`;
        const response = await axios.get(url, {
          headers: 
          {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
           }
        });

        console.log(response.data);

        setData(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos.',
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

  const handleEdit = (rowData) => {
 
    setModalData(rowData);
    setOpen(true);
  };


  const handleOpenModal = (row = null) => {
    
    if (row) 
    {
      setModalData({
        Id : row[0] || '',
        ServicioID: row[1] || '',
        ProximaEjecucion: row[2] || '',
        FechaCreacion: row[3] || '',
        UsuarioCreacion: row[4] || '',
        IntervalType: row[5] || '',
        IntervalValue: row[6] || '',
      });
    } else 
    {
        setModalData({
            Id : '',
            ServicioID: moduloId,
            ProximaEjecucion: '',
            FechaCreacion: '',
            UsuarioCreacion: localStorage.getItem('codigo'),
            IntervalType: '',
            IntervalValue: '',
          });
    }
    setCurrentRow(row);
    setOpen(true);
  };

  

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
     
   
    if (!modalData.ServicioID || !modalData.ProximaEjecucion) 
    {
        setWarningMessage('Por favor, complete todos los campos requeridos.');
         return;
    }

    setWarningMessage('');  // Limpiar mensajes de advertencia

    try 
    {
      debugger
      if (currentRow) {
        // Actualizar Servicio
        await axios.put(`${APIURL}/api/mailproexe/actualizar`, modalData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

        Swal.fire({
            title: 'Actualizado',
            text: 'Servicio actualizado exitosamente',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
       
      } else {
        // Crear nuevo Servicio
        await axios.post(`${APIURL}/api/mailproexe/crear`, modalData,
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

      
      setOpen(false);
      const query = new URLSearchParams(window.location.search);
      const modulo = query.get('modulo');
      setmoduloId(modulo);

      const url = `${APIURL}/api/mailproexe/listar/${modulo}`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
      setData(response.data);

    } 
    catch (error) 
    {
        setWarningMessage('Hubo un problema al guardar el servicio.');
    }
  };

  const handleDelete = async (rowData) => {
    const { Id, ServicioID } = rowData;

    debugger

    try 
    {
  
      const url = `${APIURL}/api/mailproexe/eliminar`;

      await axios.delete(url,  {
        data: { Id: Id, ServicioID: ServicioID }
      });
      Swal.fire('Eliminado', 'Registro eliminado correctamente', 'success');
      obtenerRegistros();
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
    }
  };

  const columns = [
    { name: 'Id', label: 'ID', options: { display: 'excluded' } },  // Columna oculta
    { name: 'ServicioID', label: 'Servicio ID' },
    { name: 'ProximaEjecucion', label: 'Próxima Ejecución' },
    { name: 'FechaCreacion', label: 'Fecha de Creación' },
    { name: 'UsuarioCreacion', label: 'Usuario de Creación' },
    { name: 'IntervalType', label: 'Tipo de Intervalo' },
    { name: 'IntervalValue', label: 'Valor de Intervalo' },
    {
      name: 'Acciones',
      options: {
        customBodyRender: (value, tableMeta) => {
        
            const row = tableMeta.rowData;
            return(
          <div>
            <IconButton onClick={() => handleOpenModal(row) }>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(data[tableMeta.rowIndex])}>
              <Delete />
            </IconButton>
          </div>
        )},
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
                noMatch: "No se han encontrado horarios de ejecucion para este servicio",
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
               Agregar Registro
      </Button>


      <MUIDataTable title={"Ejecuciones de Correo"} data={data} columns={columns} options={options} />

      {/* Modal para agregar/editar registro */}
      <Modal open={open} onClose={handleClose}>
        <div style={{ padding: '20px', backgroundColor: '#fff', margin: '100px auto', width: '500px' }}>
          <h2>{currentRow ? 'Editar ejecucion' : `Agregar Ejecucion de tarea ${moduloId}`}</h2>
          <form>
            <TextField 
              label="Servicio ID" 
              name="ServicioID" 
              value={modalData.ServicioID} 
              onChange={handleInputChange} 
              fullWidth margin="normal" 
              disabled 
            />
            
            <TextField label="Próxima Ejecución"
                        name="ProximaEjecucion" 
                        type="datetime-local" 
                        min={new Date().toISOString().slice(0, 16)}
                        value={modalData.ProximaEjecucion} 
                        onChange={handleInputChange} 
                        fullWidth margin="normal" 
            />
            <TextField 
            label="Usuario Creación" 
            name="UsuarioCreacion" 
            value={modalData.UsuarioCreacion} 
            onChange={handleInputChange} 
            fullWidth margin="normal" 
            disabled

            />
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="IntervalType">Tipo de Intervalo</InputLabel>
                <Select labelId="IntervalType" name="IntervalType" value={modalData.IntervalType} onChange={handleInputChange}>
                  <MenuItem value="DAY">Días</MenuItem>
                  <MenuItem value="WEEK">Semanas</MenuItem>
                  <MenuItem value="MONTH">Mensual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
                            <TextField
                label="Valor de Intervalo"
                name="IntervalValue"
                value={modalData.IntervalValue}
                onChange={handleInputChange}
                type="number"
                inputProps={{ min: "1", step: "1" }}  // Establece que el valor mínimo es 1 y el incremento es de 1
                fullWidth
                margin="normal"
                />

            <Button variant="contained" color="primary" onClick={handleSave}>
              Guardar
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};