
import React, { useEffect, useState, useRef } from 'react';
import MUIDataTable from 'mui-datatables';
import { TextField, IconButton, Button, Modal, Paper } from '@material-ui/core';
import { Save, Delete, Add, Cancel , Edit } from '@material-ui/icons';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import moment from "moment";
import { useHistory } from 'react-router-dom';
import {IsAllow} from 'components/Seguridad/Permisos';


export const CorreosMain = (props) => {

  useEffect(() => {
    if (!IsAllow("/CorreosMain")) {
      props.history.push('/home');
  }

    obtenermodulos();
  }, []);

  const context = useRef(null);
  const [estados, setEstados] = useState([]);
  const [open, setOpen] = useState(false);
  const [newRow, setNewRow] = useState({ ModuloId: '', Descripcion: '', FechaCreacion: moment().format('YYYY-MM-DD') });
  const [editRow, setEditRow] = useState(null);
  const history = useHistory();

  const handleRowEdit = (rowIndex) => {
    //console.log('Saved row:', data[rowIndex]);
  };

  const goToMailServicios = (moduloId) => {
   
    history.push(`/mailservicios?modulo=${moduloId}`);
  };

  const handleInputChange = (value, rowIndex, columnName) => {
    const updatedData = [...estados];
    updatedData[rowIndex][columnName] = value;
    setEstados(updatedData);
  };

  const handleAddRow = async() => {

    try {
        // Enviar datos a la API
        const response = await axios.post(`${APIURL}/api/mailmodulos/crear`, newRow);
        if (response.status === 200) {
          
          Swal.fire({
            title: 'Éxito',
            text: 'Módulo creado exitosamente',
            icon: 'success',
            confirmButtonText: 'Ok',
          });
          setOpen(false);
          setNewRow({ ModuloId: '', Descripcion: '', FechaCreacion: moment().format('YYYY-MM-DD') });

          obtenermodulos(); // Actualiza la lista después de agregar

        } else {
          Swal.fire({
            title: 'Error',
            text: 'Error al crear el módulo',
            icon: 'error',
            confirmButtonText: 'Ok',
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Error al crear el módulo',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
  };


  const handleUpdateRow = async () => {
    try 
    {
      const response = await axios.put(`${APIURL}/api/mailmodulos/actualizar/${editRow.ModuloId}`, editRow);
      if (response.status === 200) {
        const updatedData = estados.map(p => p.ModuloId === editRow.ModuloId ? editRow : p);
        setEstados(updatedData);
        Swal.fire({
          title: 'Éxito',
          text: 'Módulo actualizado exitosamente',
          icon: 'success',
          confirmButtonText: 'Ok',
        });
        setEditRow(null);
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Error al actualizar el módulo',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar el módulo',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };
  
 

  const confirmDeleteRow = (moduloId) => {
  
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
     
    }).then((result) => {
        if (result.isConfirmed || result.dismiss !== Swal.DismissReason.cancel) 
        {
            handleDeleteRow(moduloId);
        }
    });
  };

  const handleDeleteRow = async (moduloId) => {
    try 
    {
      const response = await axios.delete(`${APIURL}/api/mailmodulos/borrar/${moduloId}`);
      if (response.status === 200) {
        // Elimina la fila del estado local
        const updatedData = estados.filter(modulo => modulo.ModuloId !== moduloId);
        setEstados(updatedData);
        Swal.fire({
          title: 'Eliminado',
          text: 'Módulo eliminado exitosamente',
          icon: 'success',
          confirmButtonText: 'Ok',
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el módulo',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al intentar eliminar el módulo',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
    }
  };

  
  

  // MODULO -  APIS-AXIOS 
  const obtenermodulos = async () => {
    try {
      const request = await axios.get(`${APIURL}/api/mailmodulos/listar`); 
      setEstados(request.data.map(p => ({
        ...p,
        FechaCreacion: moment(p.FechaCreacion).format('YYYY-MM-DD')
      })));
      console.log(request.data);
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: "Error al obtener los estados: " + err,
        icon: 'error',
        confirmButtonText: 'Ok',
        target: context.current
      });
    }
  };

 

  const columns = [
    {
      name: 'ModuloId',
      label: 'Modulo ID',
      options: {
        customBodyRender: (value, tableMeta) => (
          <TextField
            value={value}
            disabled
            //onChange={(e) => handleInputChange(e.target.value, tableMeta.rowIndex, 'ModuloId')}
          />
        ),
      },
    },
    {
      name: 'Descripcion',
      label: 'Descripción',
      options: {
        customBodyRender: (value, tableMeta) => (
          <TextField
            value={value}
            disabled={!editRow || tableMeta.rowIndex !== estados.findIndex(e => e.ModuloId === editRow.ModuloId)}
            onChange={(e) => handleInputChange(e.target.value, tableMeta.rowIndex, 'Descripcion')}

          />
        ),
      },
    },
    {
      name: 'FechaCreacion',
      label: 'Fecha de Creación',
      options: {
        customBodyRender: (value, tableMeta) => (
          <TextField
            type="date"
            value={value}
            onChange={(e) => handleInputChange(e.target.value, tableMeta.rowIndex, 'FechaCreacion')}
          />
        ),
      },
    },
    {
        name: 'actions',
        label: 'Acciones',
        options: {
          customBodyRender: (value, tableMeta) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {editRow && tableMeta.rowIndex === estados.findIndex(e => e.ModuloId === editRow.ModuloId) ? (
                <>
                  <IconButton onClick={handleUpdateRow}>
                    <Save />
                  </IconButton>
                  <IconButton onClick={() => setEditRow(null)}>
                    <Cancel />
                  </IconButton>
                </>
              ) : (
                <>
                  <IconButton onClick={() => setEditRow(estados[tableMeta.rowIndex])}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => confirmDeleteRow(estados[tableMeta.rowIndex].ModuloId)}>
                    <Delete />
                  </IconButton>
                  <Button
        variant="contained"
        color="secondary"
        onClick={() => goToMailServicios(estados[tableMeta.rowIndex].ModuloId)} // Cambia 'some-modulo-id' por la lógica necesaria para obtener el ModuloId
      >
        Ir a MailServicios
      </Button>
                </>
              )}
            </div>
          ),
        },
      },
  ];

  const options = {
    selectableRows: 'none',
    filterType: "dropdown",
    responsive: "standard",
    download: false,
    print: false,
    viewColumns: false,
    filter: true,
    textLabels: {
        body: {
            noMatch: "No se han encontrado modulos activos",
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
        startIcon={<Add />}
        onClick={()=> { setOpen(true)}}
        style={{ marginBottom: '10px' }}
      >
        Agregar Nuevo Módulo
      </Button>

      <Modal open={open} onClose={ ()=> {setOpen(false)} }>
        <Paper style={{ padding: '20px', maxWidth: '400px', margin: '100px auto' }}>
          <h2>Agregar Nuevo Módulo</h2>
          <TextField
            label="Modulo ID"
            fullWidth
            value={newRow.ModuloId}
            onChange={(e) => setNewRow({ ...newRow, ModuloId: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Descripción"
            fullWidth
            value={newRow.Descripcion}
            onChange={(e) => setNewRow({ ...newRow, Descripcion: e.target.value })}
            style={{ marginBottom: '10px' }}
          />
          <TextField
            label="Fecha de Creación"
            type="date"
            fullWidth
            value={newRow.FechaCreacion}
            onChange={(e) => setNewRow({ ...newRow, FechaCreacion: e.target.value })}
            style={{ marginBottom: '20px' }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={()=> { handleAddRow(); setOpen(false) } }
            fullWidth
          >
            Guardar
          </Button>
        </Paper>
      </Modal>

      <MUIDataTable
        title={"Tabla de Módulos de Correo"}
        data={estados}
        columns={columns}
        options={options}
      />
    </div>
  );
};
