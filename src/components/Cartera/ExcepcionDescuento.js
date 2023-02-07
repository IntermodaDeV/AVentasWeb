import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableFooter from "@material-ui/core/TableFooter";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import moment from 'moment';
import { numberWithCommas } from 'utils/common';
import { APIURL } from 'utils/Enviroment';

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

const HeaderDocumentoPendientes = [
    {
        name: "documento",
        label: "Documento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "numero",
        label: "Numero",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "fecha",
        label: "Fecha",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "vencimiento",
        label: "Vencimiento",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "valor",
        label: "Valor",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "saldo",
        label: "Saldo",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "excepcionDescuento",
        label: "Excepcion Descuento",
        options: {
            filter: true,
            sort: true,
        }
    }
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
            noMatch: "No se han encontrado recibos",
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

const styles = {
    center: {
        textAlign: 'center'
    }
}

export const ExcepcionDescuento = (props) => {
    const { cliente } = props;
    const [facturas, setFacturas] = useState([]);

    const obtenerFacturasDescuentoVencido = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/factura/descuentovencido/${cliente.Codigo}`);
            const data = request.data;
            const facturasDescuento = data.map(({ fecha, vencimiento, valor, saldo, excepcionDescuento, numero, ...rest }) => ({
                ...rest,
                numero,
                fecha: moment(fecha).format("DD/MM/YYYY"),
                vencimiento: moment(vencimiento).format("DD/MM/YYYY"),
                valor: numberWithCommas(valor),
                saldo: numberWithCommas(saldo),
                excepcionDescuento: <button onClick={() => actualizarExcepcionDescuento(cliente.Codigo, numero)} className={`btn ${excepcionDescuento ? 'btn-success' : 'btn-danger'}`}>{excepcionDescuento ? "activo" : "desactivado"}</button>
            }));

            setFacturas(facturasDescuento);
        } catch (err) {

        }
    }

    const actualizarExcepcionDescuento = async (cliente, factura) => {
        try {
            await axios.put(`${APIURL}/api/factura/excepciondescuento/${cliente}/${factura}`);
            await obtenerFacturasDescuentoVencido();
        } catch (err) {

        }
    }

    useEffect(() => {
        if (cliente !== undefined) {
            obtenerFacturasDescuentoVencido();
        }
    }, [cliente]);

    if (cliente === undefined) {
        return <h3 style={styles.center}>Seleccione un cliente.</h3>
    }

    return (
        <div>
            <MuiThemeProvider theme={getMuiTheme()}>
                <MUIDataTable
                    title={"Facturas descuento vencido"}
                    data={facturas}
                    columns={HeaderDocumentoPendientes}
                    options={DatatableOptions}
                />
            </MuiThemeProvider>
        </div>
    )
}