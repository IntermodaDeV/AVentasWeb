import React, { useState } from 'react';
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import FacturasDeAcuerdo from 'components/AcuerdosVenta/FacturasDeAcuerdo';
import moment from 'moment';
import 'moment/locale/es';

const columns = [

    {
        name: 'Cuota',
        label: 'Numero Cuota',
    },
    {
        name: 'ValorCuota',
        label: 'Valor Cuota',
    },
    {
        name: 'Disponible',
        label: 'Saldo Disponible',
    },
    {
        name: 'Descuento',
        label: 'Descuento Cuota',
    },
    {
        name: 'FechaVencimiento',
        label: 'Fecha Vencimiento',
    },
]

const CuotasDeAcuerdos = (props) => {
    const [rowExpandidas, setRowExpandidas] = useState([]);
    const data = [];
    props.Cuotas.forEach((cuota) => {
        let Dias = moment(cuota.FechaVencimiento).diff(moment(new Date()), 'days')
        if(Dias < 0 ){
            data.push({
                IsVencida:true,
                Cuota:<span className="text-danger font-weight-bold">{cuota.NumCuota}</span>, 
                ValorCuota: <span className="text-danger font-weight-bold">{Number(cuota.ValorCuota).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,  
                Disponible: <span className="text-danger font-weight-bold">{Number(cuota.SaldoDisponible).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>, 
                Descuento: <span className="text-danger font-weight-bold">{Number(cuota.Descuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,
                FechaVencimiento: <span className="text-danger font-weight-bold">{props.moment(cuota.FechaVencimiento).format("DD/MM/YYYY")}</span>, 
                FacturasCuotas: cuota.FacturasCuotas,
            });
            data.sort((a,b)=>(a.Cuota - b.Cuota));
        }
        else
        {
            data.push({
                IsVencida:false,
                Cuota: cuota.NumCuota,
                ValorCuota: Number(cuota.ValorCuota).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), 
                Disponible: Number(cuota.SaldoDisponible).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                Descuento :Number(cuota.Descuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                FechaVencimiento: props.moment(cuota.FechaVencimiento).format("DD/MM/YYYY"),
                FacturasCuotas: cuota.FacturasCuotas,
            });
            data.sort((a,b)=>(a.Cuota - b.Cuota));
        } 
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
                noMatch: "No se han encontrado cuotas en el acuerdo",
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
               <FacturasDeAcuerdo
                    moment={moment}
                    ColSpan={rowData.length + 1}
                    FacturasCuotas={data[rowMeta.dataIndex].FacturasCuotas}
                    NumeroAcuerdo={data[rowMeta.dataIndex].IdAcuerdoxCliente}
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
                        title={'Cuotas en Acuerdo ' + props.NumeroAcuerdo}
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
                backgroundColor: "rgba(234, 240, 240, 0.5) !important"
            }
        },
    }
});

export default CuotasDeAcuerdos;