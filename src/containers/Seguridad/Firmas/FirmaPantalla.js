import axios from "axios";
import React, { useState } from "react"
import { APIURL } from "utils/Enviroment";
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { useEffect } from "react";
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const createBase64Image = (fileObject) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject()
        };
        reader.readAsDataURL(fileObject);
    })
}

const FirmaAsesores = () => {
    const [asesores, setAsesores] = useState([]);

    const obtenerAsesoresActivos = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/asesor/activos`);
            setAsesores(request.data);
        } catch (e) { }
    }

    const onFileChange = async (id, e) => {
        try {
            const IMG_EXTENSION = ["jpg", "png", "jpeg", "gif"];
            const extension = e.target.files[0].name.split('.').pop();

            if (!IMG_EXTENSION.includes(extension.toLowerCase())) {
                alert("El archivo seleccionado no es imagen.");
                return
            }

            const fileBase = await createBase64Image(e.target.files[0]);
            await axios.post(`${APIURL}/api/asesor/firma`, { id: id, firma: fileBase });
            obtenerAsesoresActivos();
        } catch (e) {
            alert("Ocurrio un error y no se pudo actualizar la fotografia.");
        }
    }

    useEffect(() => {
        obtenerAsesoresActivos();
    }, [])

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title={"Listado Firmas de Asesores"}
                data={asesores.map(asesor => [asesor.id, asesor.codigo, asesor.nombre, asesor.empresa, asesor.firma === null ? "Sin Firma" : <img alt="Firma asesor" style={{ height: 150 }} src={`data:image/png;base64,${asesor.firma}`} />, <input type="file" accept="image/*" onChange={(e) => onFileChange(asesor.id, e)} />])}
                columns={HeadersListaPedidos}
                options={DatatableOptions}
            />
        </MuiThemeProvider>
    )
}

const FirmaUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);

    const obtenerUsuariosActivos = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/usuario/activosconfirma`);
            setUsuarios(request.data);
        } catch (e) { }
    }

    const onFileChange = async (id, e) => {
        try {
            const IMG_EXTENSION = ["jpg", "png", "jpeg", "gif"];
            const extension = e.target.files[0].name.split('.').pop();

            if (!IMG_EXTENSION.includes(extension.toLowerCase())) {
                alert("El archivo seleccionado no es imagen.");
                return
            }

            const fileBase = await createBase64Image(e.target.files[0]);
            await axios.post(`${APIURL}/api/usuario/firma`, { id: id, firma: fileBase });
            obtenerUsuariosActivos();
        } catch (e) {
            alert("Ocurrio un error y no se pudo actualizar la fotografia.");
        }
    }

    useEffect(() => {
        obtenerUsuariosActivos();
    }, [])

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title={"Listado Firmas de Usuarios"}
                data={usuarios.map(usuario => [usuario.id, usuario.codigo, usuario.nombre, usuario.firma === null ? "Sin Firma" : <img alt="Firma usuario" style={{ height: 150 }} src={`data:image/png;base64,${usuario.firma}`} />, <input type="file" accept="image/*" onChange={(e) => onFileChange(usuario.id, e)} />])}
                columns={HeadersListaUsuarios}
                options={DatatableOptions}
            />
        </MuiThemeProvider>
    )
}

export const FirmaPantalla = () => {
    const [tab, setTab] = useState(0);

    return (
        <div>
            <Paper square>
                <Tabs value={tab} indicatorColor="primary" textColor="primary" onChange={(e, value) => setTab(value)}>
                    <Tab label="Asesores" />
                    <Tab label="Usuarios" />
                </Tabs>
            </Paper>
            {tab === 0 ? <FirmaAsesores /> : <FirmaUsuarios />}
        </div>
    )
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
    "Id",
    "Codigo",
    "Nombre",
    "Empresa",
    "Firma",
    {
        label: "Acciones",
        options: {
            filter: false,
            sort: false,
        }
    },
];

const HeadersListaUsuarios = [
    "Id",
    "Usuario",
    "Nombre",
    "Firma",
    {
        label: "Acciones",
        options: {
            filter: false,
            sort: false,
        }
    },
];

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