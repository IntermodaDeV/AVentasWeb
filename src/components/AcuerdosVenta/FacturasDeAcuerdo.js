import React, { useState } from 'react';
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import PagosDeAcuerdo from 'components/AcuerdosVenta/PagosDeAcuerdos';
import 'moment/locale/es';
import moment from 'moment';

const columns = [

    {
        name: 'Factura',
        label: 'Numero Factura',
    },
    {
        name: 'Valor',
        label: 'Valor Factura',
    },
    {
        name: 'FechaFactura',
        label: 'Fecha Factura',
    },
    {
        name: 'FechaVencimiento',
        label: 'Fecha Vencimiento',
    },
]

const FacturasDeAcuerdo = (props) => {
    const [rowExpandidas, setRowExpandidas] = useState([]);
    const data = [];
    props.FacturasCuotas.forEach((cuota) => {
        data.push({
            IsVencida: false,
            Factura: cuota.Factura,
            Valor: Number(cuota.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
            FechaFactura: props.moment(cuota.FechaFactura).format("DD/MM/YYYY"),
            FechaVencimiento: props.moment(cuota.FechaVencimiento).format("DD/MM/YYYY"),
            PagosEnFacturas: cuota.PagosEnFacturas
        });
        data.sort((a, b) => (a.Cuota - b.Cuota));

    });

    const options = {
        filterType: 'multiselect',
        sort: false,
        pagination: false,
        responsive: "scrollMaxHeight",
        print: false,
        filter: false,
        viewColumns: false,
        download: false,
        selectableRows: 'none',
        expandableRows: true,
        rowsExpanded: rowExpandidas,
        expandableRowsOnClick: false,
        customFooter: () => { },
        customToolbar: () => { },
        customToolbarSelect: () => { },
        textLabels: {
            body: {
                noMatch: "No se han encontrado Facturas",
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
        onRowsExpand: (currentRowsExpanded, allRowsExpanded) => {
            setRowExpandidas(allRowsExpanded.map(expRow => expRow.dataIndex));
        },
        renderExpandableRow: (rowData, rowMeta) => {
            return (
                <PagosDeAcuerdo
                    moment={moment}
                    ColSpan={rowData.length + 1}
                    PagosEnFacturas={data[rowMeta.dataIndex].PagosEnFacturas}
                    NumeroAcuerdo={data[rowMeta.dataIndex].IdAcuerdoxCliente}
                    Factura = {data[rowMeta.dataIndex].Factura}
                    isVencidos={props.isVencidos}
                />
            );
        },
    }

    return (
        <TableRow>
            <TableCell colSpan={props.ColSpan} >
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={'Facturas de Acuerdo'}
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
        MuiTableCell: {
            body : {
                backgroundColor: "rgba(238, 241, 243, 0.5) !important"
            }
        },
    }
});


export default FacturasDeAcuerdo;