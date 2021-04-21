import React from 'react';
import MUIDataTable from "mui-datatables";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import PostAddIcon from '@material-ui/icons/PostAdd';
import EditIcon from '@material-ui/icons/Edit';
import BusinessIcon from '@material-ui/icons/Business';
import QueuePlayNextIcon from '@material-ui/icons/QueuePlayNext';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import GridOnIcon from '@material-ui/icons/GridOn';

export const TablaEncuesta = props => {
    const { titulo, cabeceras, valores,abrirRango } = props;

    const dataTabla = () => {
        return valores.map((valor) =>
            [valor.Nombre,
            valor.Descripcion,
            <Tooltip title="Editar Encuesta">
                <IconButton color="secondary" onClick={() => { props.openEdit(valor) }}>
                    <EditIcon fontSize="large"/>
                </IconButton>
            </Tooltip>,
            <Tooltip title="Empresas permitidas para encuesta">
                <IconButton color="primary" onClick={() => { props.CargarEmpresasUsuario(valor.Id) }}>
                    <BusinessIcon fontSize="large"/>
                </IconButton>
            </Tooltip>,
            <Tooltip title="Añadir Seccion">
                <IconButton color="primary" onClick={() => { props.AgregarSeccion(valor.Id, valor.Nombre) }}>
                    <PostAddIcon fontSize="large"/>
                </IconButton>
            </Tooltip>,
            <Tooltip title="Ver Secciones">
                <IconButton onClick={() => { props.cargarSecciones(valor.Id, valor.Nombre) }}>
                    <QueuePlayNextIcon fontSize="large"/>
                </IconButton>
            </Tooltip>,
            <Tooltip title="Exportar Excel">
            <IconButton onClick={() => { abrirRango(valor.Id) }}>
                <GridOnIcon fontSize="large"/>
            </IconButton>
        </Tooltip>
            ]);
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