import React from 'react';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { MdCheckCircle, MdCancel } from "react-icons/md";
import { MdPlaylistAdd } from "react-icons/md";

export const TablaUsuario = props => {
    const { roles, modificarEstado, modificarBloqueoCredito, modificarTodosAsesores, UpdateUsuarioOficina, modificarAdministradorProducto, modificarManejaBodegaEspecifico,seleccionarUsuario } = props;

    const getMuiTheme = () => createMuiTheme({
        overrides: {
            MUIDataTable: {
                responsiveScrollMaxHeight: {
                    maxHeight: 'unset !important',
                }
            },
            MUIDataTableBodyRow: {
                root: {
                    '&:nth-child(odd)': {
                        backgroundColor: '#f8f8f8'
                    }
                }
            },
        }
    });

    const HeadersListaPedidos = [
        {
            label: "Usuario",
            name: "Usuario",
            options: {
                filter: true,
            }
        },
        {
            label: "Estado",
            name: "Estado",
            options: {
                filter: true,
            }
        },
        {
            label: "Bloqueo información sensible",
            name: "Bloqueo información sensible",
            options: {
                filter: false,
            }
        },
        {
            label: "Maneja todos los asesores",
            name: "Maneja todos los asesores",
            options: {
                filter: false,
            }
        },
        {
            label: "Usuario Oficina",
            name: "Usuario Oficina",
            options: {
                filter: false,
            }
        },
        {
            label: "Administrador Productos",
            name: "Administrador Productos",
            options: {
                filter: false,
            }
        },
        {
            label: "Maneja Bodega Especifico",
            name: "Maneja Bodega Especifico",
            options: {
                filter: false,
            }
        },
        {
            label: "Acciones",
            name: "acciones",
            options: {
                filter: false,
            }
        }
    ]

    const obtenerData = () => {
        return roles.map(rol => ([
            rol.Nombre,
            rol.Status ? "Activo" : "Inactivo",
            <div style={{ textAlign: 'center' }}><input type="checkbox" checked={rol.BloqueoCredito} onChange={(e) => modificarBloqueoCredito(rol.Id)} style={{ height: 20, width: 20 }} /></div>,
            <div style={{ textAlign: 'center' }}><input type="checkbox" checked={rol.BloqueoAsesores} onChange={(e) => modificarTodosAsesores(rol.Id)} style={{ height: 20, width: 20 }} /></div>,
            <div style={{ textAlign: 'center' }}><input type="checkbox" checked={rol.UsuarioOficina} onChange={(e) => UpdateUsuarioOficina(rol.Id, e.target.checked)} style={{ height: 20, width: 20 }} /></div>,
            <div style={{ textAlign: 'center' }}><input type="checkbox" checked={rol.AdministradorProductos} onChange={(e) => modificarAdministradorProducto(rol.Id)} style={{ height: 20, width: 20 }} /></div>,
            <div style={{ textAlign: 'center' }}><input type="checkbox" checked={rol.ManejaBodegaEspecifico} onChange={(e) => modificarManejaBodegaEspecifico(rol.Id)} style={{ height: 20, width: 20 }} /></div>,
            <div>
                <button style={{ marginLeft: '10px' }}
                    className="btn btn-info"
                    onClick={() => { modificarEstado(rol.Id) }}>{rol.Status ? <span>Inactivar <MdCancel /></span> : <span>Activar <MdCheckCircle /></span>}</button>
                <button style={{ marginLeft: '10px' }}
                    className="btn btn-info" onClick={()=>{seleccionarUsuario(rol)}}>Correo</button>
            </div>
        ]));
    }

    return (
        <div>
            {roles.length === 0
                ? <div className="card-body text-center">
                    <h3 class="card-title">No hay usuarios</h3>
                    <div class="text-center">
                        <button className="btn btn-primary" onClick={() => { props.setMostar(true) }}>Crear nuevo usuario <MdPlaylistAdd /></button>
                    </div>
                </div>
                : (
                    <div className="col">
                        <div className="card-body text-center">
                            <h3 class="card-title">Usuarios</h3>
                            <div class="text-right">
                                <button className="btn btn-primary" onClick={() => { props.setMostar(true) }}>Crear nuevo usuario <MdPlaylistAdd /></button>
                            </div>
                        </div>
                        <div className="container-fluid">
                            <MuiThemeProvider theme={getMuiTheme()}>
                                <MUIDataTable
                                    title={"Listado Usuarios"}
                                    columns={HeadersListaPedidos}
                                    data={obtenerData()}
                                    options={DatatableOptions}
                                />
                            </MuiThemeProvider>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

const DatatableOptions = {
    filter: true,
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
            noMatch: "No se han encontrado pedidos",
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