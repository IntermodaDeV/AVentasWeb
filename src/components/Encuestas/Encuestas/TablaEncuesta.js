import React from 'react';
import MUIDataTable from "mui-datatables";
import  TableFooter from "@material-ui/core/TableFooter";
import  TableRow from "@material-ui/core/TableRow";
import  TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import Button from '@material-ui/core/Button';
import { FaEdit } from "react-icons/fa";
import BusinessIcon from '@material-ui/icons/Business';
import QueuePlayNextIcon from '@material-ui/icons/QueuePlayNext';
export const TablaEncuesta = props =>{
    const {titulo,cabeceras,valores} = props;

    const dataTabla = ()=>{
        return valores.map((valor)=>
        [valor.Nombre,
         valor.Descripcion,
        <Button class="btn btn-warning" onClick={() => { props.openEdit(valor) }} startIcon={<FaEdit />} >Editar</Button>,
        <Button class="btn btn-info" onClick={() => { props.cargarSecciones(valor.Id, valor.Nombre) }} startIcon={<QueuePlayNextIcon />} >Secciones</Button>,
        <Button class="btn btn-primary" onClick={() => { props.CargarEmpresasUsuario(valor.Id) }} startIcon={<BusinessIcon />}>Empresas</Button>]);
    }

    return (
        <MUIDataTable
            title={titulo}
            data={dataTabla()}
            columns={cabeceras}
            options={DatatableOptions}
        />
    )
}

const DatatableOptions = {
    filterType: "dropdown",
    responsive: "scrollMaxHeight",
    print: false,
    download: false,
    selectableRows: 'none',
    customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage) => (
        <TableFooter>
              <TableRow>
                <TablePagination
                  count={count}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={(_, page) => changePage(page)}
                  onChangeRowsPerPage={event => changeRowsPerPage(event.target.value)}
                  rowsPerPageOptions={[10, 15, 100]}
                  ActionsComponent={CustomFooter}
                  labelRowsPerPage="Filas por página:"
                />
              </TableRow>
            </TableFooter>
      ),
    textLabels: {
        body: {
            noMatch: "No se han encontrado registros",
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
    }
};