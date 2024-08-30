import React, { useEffect, useState } from 'react';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import axios from 'axios';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import PrintOutlined from '@material-ui/icons/PrintOutlined';
import { Dropdown } from "semantic-ui-react";
import { useSelector } from 'react-redux';
import { APIURL } from 'utils/Enviroment';
import store from 'store/store';
import { ImprimirInventarioDetalle } from 'components/Inventario/ImprimirInventarioDetalle';
import moment from 'moment';

export const ListadoInventario = (props) => {
    const [inventarios, setInventarios] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [inventario, setInventario] = useState(null);
    const [detalleInventario, setDetalleInventario] = useState([]);
    const [asesores, setAsesores] = useState([]);
    const AsesoresUsuario = useSelector(e => e.Permisos[0].AsesoresUsuario);
    const asesor = AsesoresUsuario.find(a => a.Usuario === localStorage.getItem('codigo'));
    const [AsesorSelected, setAsesorSelected] = useState(asesor ? asesor.Usuario : AsesoresUsuario[0].Usuario);

    useEffect(() => {
        ObtenerListadoInventarios();
        let asesoresMap = AsesoresUsuario.map((Ase) => ({ key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }));
        asesoresMap.unshift({ key: "Todo", value: "Todo", text: "Todo" });
        setAsesores(asesoresMap);
    }, [])


    const ObtenerListadoInventarios = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Inventario/${AsesorSelected}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            console.log(request.data)
            setInventarios(request.data);
        } catch (err) {
            console.log(err)
        }
    }

    const eliminarInventario = async (value) => {
        try {

            await axios.get(`${APIURL}/api/eliminarInventario/${value}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            ObtenerListadoInventarios();
        } catch (err) {
            console.log(err)
        }
    }

    const handleOnChangeAsesor = (value) => {
        setAsesorSelected(value);
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
            label: "Núm. Inventario",
            name: "numInventario",
            options: {
                filter: true,
            }
        },
        {
            label: "Cliente",
            name: "cliente",
            options: {
                filter: true,
            }
        },
        {
            label: "Empresa",
            name: "empresa",
            options: {
                filter: true,
            }
        },
        {
            label: "Creado",
            name: "creado",
            options: {
                filter: true,
            }
        },
        {
            label: "Modificado",
            name: "modificado",
            options: {
                filter: true,
            }
        },
        {
            label: "Completo",
            name: "completado",
            options: {
                filter: true,
            }
        },
        {
            label: "Unidades",
            name: "unidades",
            options: {
                filter: true,
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

    const hidePrint = () => {
        setShowDialog(false);
    }

    const permisoEliminarInventario = () => {
        const globalState = store.getState();
        const Permisos = globalState["Permisos"];

        for (const Permiso of Permisos) {
            for (const Roles of Permiso.RolesUsuarios) {
                if (Roles.Nombre === "Eliminar inventario") {
                    return true;
                }
            }
        }

        return false;
    }

    const obtenerDetalleInventario = async (inventario) => {
        try {
            const request = await axios.get(`${APIURL}/api/detalleInventario/${inventario.numInventario}`);
            setInventario(inventario);
            setDetalleInventario(request.data);
            setShowDialog(true);
        } catch (err) {

        }
    }

    const Data = () => {
        return inventarios.map(p => (
            [
                p.numInventario,
                p.cliente,
                p.empresa,
                moment(p.creado).format('DD/MM/YYYY'),
                moment(p.modificado).format('DD/MM/YYYY'),
                p.completado == 1 ? "Sí" : "No",
                p.unidades,
                <div>
                    <span className="ml-1">
                        <Button className='my-1' variant="outlined" size="small" onClick={() => { obtenerDetalleInventario(p) }} color={"primary"}>
                            <PrintOutlined />
                        </Button>
                        {permisoEliminarInventario() > 0 &&
                            <>
                                <Button size="small" variant="outlined" style={{ color: 'red', borderColor: 'red' }} onClick={() => eliminarInventario(p.numInventario)}>Eliminar</Button>
                            </>
                        }
                    </span >
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
                noMatch: "No se han encontrado inventarios",
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
            <div className="row mb-3">
                <div className='col-lg-2 col-sm-4 col-6' style={{ paddingTop: 10 }}>
                    <Dropdown
                        placeholder="Asesor"
                        selection
                        style={{ zIndex: 999 }}
                        onChange={(e, { value }) => handleOnChangeAsesor(value)}
                        options={asesores}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        value={AsesorSelected}
                    />
                </div>
                <div className="col-lg-2 col-sm-4 col-6" style={{ paddingTop: 10 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => ObtenerListadoInventarios()}>Obtener
                    </Button>
                </div>
            </div>
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Listado de Inventarios"}
                        data={Data()}
                        columns={HeadersListaPedidos}
                        options={DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>

            <Dialog
                open={showDialog}
                onClose={() => hidePrint()}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
            >
                {
                    inventario && detalleInventario &&
                    <ImprimirInventarioDetalle
                        hidePrint={hidePrint}
                        Pedido={inventario}
                        gruposXDetPed={detalleInventario}
                    />
                }
            </Dialog >

        </div>
    );
}