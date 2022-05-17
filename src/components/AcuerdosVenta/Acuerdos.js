import React, { useState } from 'react'
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CuotasDeAcuerdo from 'components/AcuerdosVenta/CuotasDeAcuerdo';
import moment from 'moment';
import 'moment/locale/es';
import CustomFooter from "components/Recibos/Facturas/CustomFooter";
import 'sweetalert2/src/sweetalert2.scss';

moment.locale('es')

const columns = [

    {
        name: 'Numero',
        label: 'Numero',

    },
    {
        name: 'Valor',
        label: 'Valor',

    },
    {
        name: 'Disponible',
        label: 'Disponible',

    },

    {
        name: 'Facturado',
        label: 'Facturado',

    },
    {
        name: 'Linea',
        label: 'Linea',

    },
    {
        name: 'Desde',
        label: 'Desde',

    },
    {
        name: 'Hasta',
        label: 'Hasta',

    },
]

const Acuerdos = props => {
    const [rowExpandidas, setRowExpandidas] = useState([]);
    const data = []
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
        customToolbar: () => { },
        customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => {
            return (
                <CustomFooter count={count}
                    page={page} rowsPerPage={rowsPerPage}
                    changeRowsPerPage={changeRowsPerPage}
                    changePage={changePage}
                    textLabels={textLabels}
                />
            )
        },
        textLabels: {
            body: {
                noMatch: "No se han encontrado Acuerdos de venta",
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
                <CuotasDeAcuerdo
                    moment={moment}
                    ColSpan={rowData.length + 1}
                    Cuotas={data[rowMeta.dataIndex].Cuotas}
                    NumeroAcuerdo={data[rowMeta.dataIndex].Numero}
                />
            );
        },
    }

    props.acuerdos.forEach(Acu => {
        data.push({
            Numero: Acu.IdAcuerdoxCliente,
            Valor: Acu.Total,
            Disponible: Acu.Saldo,
            Facturado: Acu.Facturado,
            Linea: Acu.Linea,
            Desde: moment(Acu.Desde).format("DD/MM/YYYY"),
            Hasta: moment(Acu.Hasta).format("DD/MM/YYYY"),
            Cuotas: Acu.CuotasDeAcuerdo
        }
        );
    });
    return (
        <>
            <MuiThemeProvider theme={getMuiTheme()}>
               
                <MUIDataTable
                    title={'Acuerdos de ventas disponibles'}
                    data={data}
                    columns={columns}
                    options={options}
                />
            </MuiThemeProvider>
        </>
    )
}

const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScrollMaxHeight: {
                maxHeight: 'unset !important',
            }
        }
    }
});

export default Acuerdos;

