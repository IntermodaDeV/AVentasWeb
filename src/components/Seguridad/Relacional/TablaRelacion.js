import React from 'react';
import MUIDataTable from "mui-datatables";
import  TableFooter from "@material-ui/core/TableFooter";
import  TableRow from "@material-ui/core/TableRow";
import  TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { MdCheckCircle,MdCancel } from "react-icons/md";

export const TablaRelacion = props =>{
    const {titulo,cabeceras,valores,accion,funcion} = props;

    const dataTabla = ()=>{
        const estilo = accion==="agregar"?"success":"danger";
        const icono  = accion==="agregar"?<MdCheckCircle/>:<MdCancel/>
        return valores.map((valor)=>[valor.Nombre,<button onClick={()=>{funcion(valor.Id)}} className={`btn btn-${estilo}`} >{accion} {icono}</button>]);

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
    }
};