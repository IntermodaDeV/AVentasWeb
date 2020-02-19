import React, {
    //  useEffect, 
    // useState
} from 'react';
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { FaEye } from "react-icons/fa";

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
        name: 'Valor',
        label: 'Valor',
    },

    {
        name: 'Saldo',
        label: 'Saldo',
    },
    {
        name: 'Acciones',
        label: 'Acciones',
    },
]

const CuotasAgrupadasExpandableRow = (props) => {
    let selectedRowsIndex = [];

    const data = [];
    let IdsSubFactura = [];
    if (props.SelectedRowsIndexXAcuerdo) {
        if (props.SelectedRowsIndexXAcuerdo[props.NumeroAcuerdo]) {
            IdsSubFactura = props.SelectedRowsIndexXAcuerdo[props.NumeroAcuerdo];
        }
    }
    props.CuotasAgrupadas.forEach((cuotAgru, index) => {
        let seleccionado = false;
        seleccionado = cuotAgru.IdsSubFactura.some(idsub => {
            return IdsSubFactura.includes(idsub);
        });

        if (seleccionado) {
            selectedRowsIndex.push(index);
        }
        data.push({
            Cuota: cuotAgru.NumeroCuota,
            Factura: cuotAgru.NumeroFactura,
            Fecha: props.moment(cuotAgru.FechaVencimiento).format("DD/MM/YYYY"),
            Valor: Number(cuotAgru.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
            Saldo: Number(cuotAgru.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
            Acciones: <FaEye onClick={(event) => { props.onClick(event, cuotAgru.Cuotas) }} size={"20px"} />,
        });
    });

    const options = {
        filterType: 'multiselect',
        selectableRowsOnClick: true,
        selectableRows: 'multiple',
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
        onRowsSelect: (currentRowsSelected, allRowsSelected) => {
            let rowSeleccionada = currentRowsSelected[0];
            let seleccionadasActuales = allRowsSelected.map(allRowSel => allRowSel.dataIndex);
            let seleccionando = seleccionadasActuales.some(selRowInd => {
                return selRowInd === rowSeleccionada.dataIndex
            });
            if (seleccionando) {
                if (currentRowsSelected[0].dataIndex !== seleccionadasActuales.length - 1) {
                    seleccionadasActuales.pop();
                } else {
                }
            } else {
                if (currentRowsSelected[0].dataIndex !== (seleccionadasActuales.length)) {
                    // seleccionadasActuales.pop();
                    props.SetCuotasAPagar(props.SelectedRowsIndexXAcuerdo[props.NumeroAcuerdo]);
                    return;
                    // seleccionadasActuales = props.SelectedRowsIndexXAcuerdo;
                } else {

                }
            }
            props.SetCuotasAPagar(seleccionadasActuales.reduce((acc, curr) => { return [...acc, ...props.CuotasAgrupadas[curr].IdsSubFactura] }, []));
            // props.SetCuotasAPagar(allRowsSelected.reduce((acc, curr) => { return [...acc, ...props.CuotasAgrupadas[curr.dataIndex].IdsSubFactura] }, []))

        },
    }
    return (
        <TableRow>
            <TableCell colSpan={props.ColSpan} >
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={''}
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

export default CuotasAgrupadasExpandableRow;