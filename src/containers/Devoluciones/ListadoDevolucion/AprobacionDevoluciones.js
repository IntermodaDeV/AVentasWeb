import React, { useEffect, useState } from 'react';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import { Button } from "@material-ui/core";
import Swal from 'sweetalert2/dist/sweetalert2.js';
export const AprobacionDevolucion = (props) => {
    const [devoluciones, setDevoluciones] = useState([]);

    useEffect(() => {
        getDevoluciones();
        // eslint-disable-next-line
    }, [])

    const ObtenerlistadoDevoluciones = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/devolucion/listadoDevPendienteAprobar`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            return request.data;
        } catch (err) {
            console.log(err)
        }
    }

    const AprobarDevolucion = async (id) => {
        try {
            const request = await axios.post(`${APIURL}/api/devolucion/aprobarDevoluciones/${id}`);
            Swal.fire({
                title: 'Confirmado',
                text: "Se ha aprobado la encuesta exitosamente.",
                type: 'success',
                confirmButtonText: 'Ok',
            }).then(e => {
                getDevoluciones();
            });
            return request.data;
        } catch (err) {
            console.log(err)
        }
    }

    const getDevoluciones = async () => {
        let lista = await ObtenerlistadoDevoluciones();
        setDevoluciones(lista);
    }
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
    })
    const HeadersListaPedidos = [
        {
            label: "Codigo Interno",
            name: "NumExpediente",
            options: {
                filter: true,
            }
        },
        {
            label: "Codigo Cliente",
            name: "codigoCliente",
            options: {
                filter: true,
            }
        },
        {
            label: "Nombre Cliente",
            name: "nombreCliente",
            options: {
                filter: true,
            }
        },
        {
            label: "Motivo de Devolucion",
            name: "motivoDev",
            options: {
                filter: true,
            }
        },
        {
            label: "Linea",
            name: "Linea",
            options: {
                filter: true,
            }
        },
        {
            label: "Factura",
            name: "FacturaOrigen",
            options: {
                filter: true,
            }
        },
        {
            label: "Numero Pedido",
            name: "PedidoOrigen",
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
            label: "Acciones",
            name: "acciones",
            options: {
                filter: true,
            }
        }
    ]

    const Data = () => {
       return devoluciones.map(p => (
           [
                p.NumeroDevolucion,
                p.CodigoCliente,
                p.NombreCliente,
                p.MotivoDevolucion,
                p.Linea,
                p.FacturaOrigen,
                p.PedidoOrigen,
                p.Estado,
                <div>
                    <span className="mr-1">
                        <Button className='my-1' variant="outlined" onClick={() => AprobarDevolucion(p.IdDevAprobacion)} size="small" color={"primary"}>Aprobar</Button>
                    </span>
                </div>
            ]
       ));
        
    }

    const DatatableOptions = {
        filter: true,
        filterType: "dropdown",
        responsive: "standard",
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
                        rowsPerPageOptions={[5, 10, 15]}
                        labelRowsPerPage="Filas por página:"
                    />
                </TableRow>
            </TableFooter>
        ),
        textLabels: {
            body: {
                noMatch: "No se han encontrado Pacientes",
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
    return (
        <div className="px-3">
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Devoluciones pendientes por aprobar"}
                        data={Data()}
                        columns={HeadersListaPedidos}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>
        </div>
    );
}