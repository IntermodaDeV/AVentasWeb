import React from 'react';
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import 'moment/locale/es';

const columns = [

    {
        name: 'Documento',
        label: 'Numero Documento',
    },
    {
        name: 'Valor',
        label: 'Valor Factura',
    },
    {
        name: 'FechaLiquidacion',
        label: 'Fecha Liquidacion',
    },
    {
        name: 'FechaDeposito',
        label: 'Fecha Deposito',
    },
]

const PagosDeAcuerdo = (props) => {
    const data = [];
    props.PagosEnFacturas.forEach((pago) => {
        data.push({
            Documento: pago.NumeroDocumento,
            Valor: Number(pago.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
            FechaLiquidacion: props.moment(pago.FechaLiquidacion).format("DD/MM/YYYY"),
            FechaDeposito: props.moment(pago.FechaDeposito).format("DD/MM/YYYY")
        });
        data.sort((a, b) => (a.FechaLiquidacion - b.FechaLiquidacion));

    });

    const options = {
        sort: false,
        pagination: false,
        responsive: "scrollMaxHeight",
        print: false,
        filter: false,
        viewColumns: false,
        download: false,
        selectableRows: 'none',
        expandableRows: false,
        expandableRowsOnClick: false,
        customFooter: () => { },
        customToolbar: () => { },
        customToolbarSelect: () => { },
        textLabels: {
            body: {
                noMatch: "No se han encontrado pagos",
                toolTip: "Ordenar",
            },
            pagination: {
                next: "Siguiente",
                previous: "Anterior",
                rowsPerPage: "Filas por página:",
                displayRows: "de",
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
        <TableRow>
            <TableCell colSpan={props.ColSpan} >
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={'Pagos de Facturas ' + props.Factura}
                        data={data}
                        columns={columns}
                        options={options}
                    />
                </MuiThemeProvider>

            </TableCell>
        </TableRow>
    );
}

const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScrollMaxHeight: {
                maxHeight: 'unset !important',
            }
        },
    }
});

export default PagosDeAcuerdo;