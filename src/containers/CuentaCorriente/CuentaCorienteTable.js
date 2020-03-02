import React, {
    //  useEffect, 

} from 'react'
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import 'moment/locale/es';


moment.locale('es')

const columnRender = (columnMeta, updateDirection) => {
    return <th key={2}
        className={"MuiTableCell-root MuiTableCell-head MUIDataTableHeadCell-root-433 MUIDataTableHeadCell-fixedHeaderCommon-435 MUIDataTableHeadCell-fixedHeaderXAxis-436 MUIDataTableHeadCell-fixedHeaderYAxis-437"}
    >{columnMeta.name}</th>;
}
const columns = [

    { name: 'Tipo', label: 'Tipo', options: { customHeadRender: columnRender } },
    { name: 'TipoPedido', label: 'TipoPedido', options: { customHeadRender: columnRender } },
    { name: 'Factura', label: 'Factura', options: { customHeadRender: columnRender } },
    { name: 'IdAcuerdoxCliente', label: 'AcuerdoxCliente', options: { customHeadRender: columnRender } },
    { name: 'NumeroCuota', label: 'Numero Cuota', options: { customHeadRender: columnRender } },
    { name: 'FechaFactura', label: 'Fecha Factura', options: { customHeadRender: columnRender } },
    { name: 'FechaVencimiento', label: 'Fecha Vencimiento', options: { customHeadRender: columnRender } },
    { name: 'Dias', label: 'Dias', options: { customHeadRender: columnRender } },
    { name: 'Valor', label: 'Valor', options: { customHeadRender: columnRender } },
    { name: 'Saldo', label: 'Saldo', options: { customHeadRender: columnRender } },
    { name: 'FechaMaxDescuento', label: 'Fecha Maxima Descuento', options: { customHeadRender: columnRender } },
    { name: 'DiasV', label: 'Dias Vencidos', options: { customHeadRender: columnRender } },
    { name: 'Descuento', label: 'Descuento', options: { customHeadRender: columnRender } },
    { name: 'APagar', label: 'A Pagar', options: { customHeadRender: columnRender } },
    { name: 'idmoneda', label: 'moneda', options: { customHeadRender: columnRender } },
]

const CuentaCorrienteTable = props => {
    // let selectedRowsIndexXAcuerdo = null;
    
    /*
    useEffect(() => {
        fetch(urlApi + '/api/Cliente/CuentaCorriente/' + props.clienteSelected.Codigo, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            if (res.status === 401) {
                localStorage.setItem('token', '')
                window.location.reload()
            }
            if (res.status === 200) {
                res.json().then(
                    result => {
                        setCuentaCorriente(result)
                    },
                    error => {

                    }
                )
            }
        });
        // eslint-disable-next-line
    }, [props.clienteSelected]);
    */
    let data = []
    const options = {
        filterType: 'none',
        sort: false,
        pagination: false,
        responsive: "scrollMaxHeight",
        print: false,
        filter: false,
        viewColumns: false,
        download: false,
        selectableRows: 'none',

        expandableRowsOnClick: false,
        textLabels: {
            body: {
                noMatch: "Nada que mostrar.",
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
        // onRowsSelect: (currentRowsSelected, allRowsSelected) => {
        //   setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
        // },


    }
    data = props.CuotasCuentaCorriente.map(cuenCorr => {
        return Object.values(cuenCorr)
    })
    // console.log('props.CuotasCuentaCorriente', props.CuotasCuentaCorriente)

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                title={''}
                data={data}
                columns={columns}
                options={options}
            />
        </MuiThemeProvider>
    )
}

const getMuiTheme = () => createMuiTheme({
    overrides: {
        MUIDataTable: {
            responsiveScrollMaxHeight: {
                maxHeight: 'unset !important',
            }
        },
        MuiToolbar: {
            root: {
                display: 'flex !important',
            }
        },
        MUIDataTableToolbar: {
            actions: {
                textAlign: 'end !important',
            }
        }
    }
})

export default CuentaCorrienteTable;



