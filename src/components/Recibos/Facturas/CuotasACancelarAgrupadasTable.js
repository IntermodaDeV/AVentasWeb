import React, {
    //  useEffect, 
    // useState
} from 'react';
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const columns = [

    {
        name: 'Cuota',
        label: 'Cuota',
    },
    {
        name: 'Factura',
        label: 'Factura',
    },
    {
        name: 'Fecha',
        label: 'Fecha',
    },
    {
        name: 'FechaDescuento',
        label: 'Fecha Descuento',
    },
    {
        name: 'Moneda',
        label: 'Moneda',
    },
    {
        name: 'Valor',
        label: 'Valor',
    },
    {
        name: 'ValorDescuento',
        label: 'Valor Descuento',
    },

    {
        name: 'Saldo',
        label: 'Saldo',
    },
    {
        name: 'DescuentoAplicado',
        label: 'Descuento Aplicado',
    },
    {
        name: 'APagar',
        label: 'A Pagar',
    },
    {
        name: 'PagoAplicado',
        label: 'Aplicado',
    },
    {
        name: 'Acciones',
        label: 'Acciones',
    },
]

const CuotasACancelarAgrupadasTable = (props) => {
    let selectedRowsIndex = [];


    const getMuiTheme = () => createMuiTheme({
        overrides: {
            MUIDataTable: {
                responsiveScrollMaxHeight: {
                    maxHeight: 'unset !important',
                }
            },
        }
    });


    const options = {
        filterType: 'multiselect',
        selectableRowsOnClick: false,
        selectableRows: 'none',
        responsive: "scrollMaxHeight",
        print: false,
        selectableRowsHeader: false,
        download: false,
        sort: false,
        pagination: false,
        filter: false,
        disableToolbarSelect: true,
        rowsSelected: selectedRowsIndex,
        search: false,
        viewColumns: false,
        customFooter: () => { },
        customToolbar: () => { },
        customToolbarSelect: () => { },
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
            }
        },

    }
    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title={''}
                data={props.CuotasAgrupadas}
                columns={columns}
                options={options}
            />
        </MuiThemeProvider>
    );
}
export default CuotasACancelarAgrupadasTable;