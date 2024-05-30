import React, { useEffect, useState } from 'react';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';

export const InventarioEspecifico = () => {
    const [colecciones, setColecciones] = useState([]);

    const obtenerColeccionesInventarioEspecifico = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/colecciones/inventarioespecifico`);
            setColecciones(request.data)
        } catch (err) {
            alert("Ocurrio un error y no se pudo obtener los paquetes.");
        }
    }

    const cambiarEstadoPaquete = async (paquete, estado) => {
        try {
            let url = `${APIURL}/api/colecciones/inventarioespecifico/activar/${paquete}`;
            if (estado) {
                url = `${APIURL}/api/colecciones/inventarioespecifico/desactivar/${paquete}`;
            }

            await axios.patch(url);
            await obtenerColeccionesInventarioEspecifico();
        } catch (err) {
            alert("Ocurrio un error y no se pudo cambiar la configuracón.");
        }
    }

    const transformarDatos = () => {
        return colecciones.map(x => ({
            codigo: x.codigo,
            nombre: x.nombre,
            estado: <p style={{ fontWeight: 'bolder', color: x.inventarioEspecifico ? 'green' : 'red' }}>{x.inventarioEspecifico ? "Activo" : "Inactivo"}</p>,
            Acciones: (<button onClick={() => { cambiarEstadoPaquete(x.codigo, x.inventarioEspecifico) }} className="btn btn-primary" >{x.inventarioEspecifico ? "Desactivar" : "Activar"}</button>
            )
        }));
    }

    useEffect(() => { obtenerColeccionesInventarioEspecifico() }, [])

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title={"Paquetes"}
                data={transformarDatos()}
                columns={HeaderDocumentoPendientes}
                options={DatatableOptions}
            />
        </MuiThemeProvider>
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

let HeaderDocumentoPendientes = [
    {
        name: "codigo",
        label: "Codigo Paquete",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "nombre",
        label: "Nombre Paquete",
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
        name: "Acciones",
        label: "Acciones",
        options: {
            filter: false,
            sort: true,
        }
    }
];

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