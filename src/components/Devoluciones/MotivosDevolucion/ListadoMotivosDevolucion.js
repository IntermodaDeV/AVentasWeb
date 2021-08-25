import React from 'react';
import MUIDataTable from "mui-datatables";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import { MdCheckCircle, MdCancel, MdPerson } from "react-icons/md";

export const ListadoMotivosDevolucion = props => {
    const cabeceras = [
        {
            name: "codigo",
            label: "Codigo",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "descripcion",
            label: "Descripcion",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "empresa",
            label: "Empresa",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "estado",
            label: "Estado",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "Aprobacion",
            label: "¿Es Necesario aprobacion?",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "acciones",
            label: "Acciones",
            options: {
                filter: false,
                sort: false,
            }
        }
    ]
    const dataTabla = () => {
        return props.MotivosDevolucion.map((valor) =>
            [
                valor.CodigoMotivoDevolucion,
                valor.Descripcion,
                valor.EmpresaId,
                <span style={{color: valor.Estado ? "green":"red" }} >{valor.Estado ? "Activo" : "Inactivo"}{valor.Estado ? <MdCheckCircle /> : <MdCancel />}</span> ,
                <input type="checkbox" checked={valor.aprobacionObligatoria} style={{ height: 16, width: 16}} onChange={(e)=> props.ActualizarAprobacion(valor.IdMotivoDevolucion)}/>, 
                <button disabled={!valor.aprobacionObligatoria} onClick={() => { props.cargarUsuarios(valor.IdMotivoDevolucion) }} className={`btn btn-info`} >Usuarios {<MdPerson/>}</button>
            ]);
    }

    return (
        <MUIDataTable
            title={"Motivos de Devolucion"}
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