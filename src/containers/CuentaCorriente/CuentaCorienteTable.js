import React from 'react'
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import {useSelector} from 'react-redux';
import Button from '@material-ui/core/Button';
import jsPDF from "jspdf";
import Logo from './LogoSinLetrasInv.png';
import "jspdf-autotable";
import 'moment/locale/es';


moment.locale('es')

const columnRender = (columnMeta, updateDirection) => {
    return <th key={2}
        className={"MuiTableCell-root MuiTableCell-head MUIDataTableHeadCell-root-433 MUIDataTableHeadCell-fixedHeaderCommon-435 MUIDataTableHeadCell-fixedHeaderXAxis-436 MUIDataTableHeadCell-fixedHeaderYAxis-437"}
    >{columnMeta.name}</th>;
}
const columns = [

    { name: 'Documento', label: 'Documento', options: { customHeadRender: columnRender } },
    { name: 'Tipo', label: 'Tipo', options: { customHeadRender: columnRender } },
    { name: 'Numero', label: 'Numero', options: { customHeadRender: columnRender } },
    { name: 'Acuerdo No.', label: 'Acuerdo No.', options: { customHeadRender: columnRender } },
    { name: 'Numero Cuota', label: 'Numero Cuota', options: { customHeadRender: columnRender } },
    { name: 'Fecha', label: 'Fecha', options: { customHeadRender: columnRender } },
    { name: 'Vencimiento', label: 'Vencimiento', options: { customHeadRender: columnRender } },
    { name: 'Dias', label: 'Dias', options: { customHeadRender: columnRender } },
    { name: 'Valor', label: 'Valor', options: { customHeadRender: columnRender } },
    { name: 'Saldo', label: 'Saldo', options: { customHeadRender: columnRender } },
    { name: 'Fecha Descuento', label: 'Fecha Descuento', options: { customHeadRender: columnRender } },
    { name: 'Dias', label: 'Dias', options: { customHeadRender: columnRender } },
    { name: 'Descuento', label: 'Descuento', options: { customHeadRender: columnRender } },
    { name: 'A Pagar', label: 'A Pagar', options: { customHeadRender: columnRender } },
    { name: 'Moneda', label: 'Moneda', options: { customHeadRender: columnRender } },
]

if(localStorage.getItem('empresa')==='imgt')
{
    columns.splice(3,0,{ name: 'Numero FEL', label: 'Numero FEL', options: { customHeadRender: columnRender } })
}

const numberWithCommas = (numero)=>(numero.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));

const CuentaCorrienteTable = props => {
    const cuentaCorriente = useSelector(e=>e.CuentaImprimir);
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

    
    const generatePDF = () =>{
        const unit = "pt";
        const size = "A4"; 
        const orientation = "portrait";

        const doc = new jsPDF(orientation, unit, size);
        doc.setFontSize(7);

        const title = `
                                                ESTADO DE CUENTA PROVISIONAL

            Codigo:    ${props.clienteSelected.Codigo}              Fecha: ${moment(new Date()).format("DD/MM/YYYY")}
            Nombre:    ${props.clienteSelected.Nombre}
            Direcciòn: ${props.clienteSelected.Direccion}
        `;

        const headers = [['Documento','Numero','Fecha','Vencimiento','Dias','Valor','Saldo','Descuento','Dias','Descuento','A Pagar']];
        const data = cuentaCorriente.map(e=>[e.Tipo,
            e.Factura,
            e.FechaFactura,
            e.FechaVencimiento,
            e.Dias,
            numberWithCommas(e.Valor),
            numberWithCommas(e.Saldo),
            e.FechaMaxDescuento,
            e.DiasV,
            numberWithCommas(e.Descuento),
            numberWithCommas(e.APagar)
        ]);
        const cantidadFacturas = data.length;
        const totalValor = cuentaCorriente.reduce((pre,curr)=>(pre+curr.Valor),0);
        const totalSaldo = cuentaCorriente.reduce((pre,curr)=>(pre+curr.Saldo),0);
        const totalDescuento = cuentaCorriente.reduce((pre,curr)=>(pre+curr.Descuento),0);
        const totalPagar = cuentaCorriente.reduce((pre,curr)=>(pre+curr.APagar),0);

        let content = {
            styles:{fontSize:8},
            startY: 50,
            head: headers,
            body: data,
            didDrawPage:function (data) {
                if (Logo) {
                    doc.addImage(Logo, 'PNG', 40, 15, 33, 33);
                }
        }}

        const footer = `Facturas: ${cantidadFacturas}                                                                                                       ${numberWithCommas(totalValor)}       ${numberWithCommas(totalSaldo)}                                                ${numberWithCommas(totalDescuento)}         ${numberWithCommas(totalPagar)}`;

        doc.text(title, 180, 0);
        doc.autoTable(content);
        let finalY = doc.lastAutoTable.finalY; // The y position on the page
        doc.text(50, finalY+10, footer)
        doc.save(`Reporte-${props.clienteSelected.Codigo}.pdf`)
    }

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            {(cuentaCorriente.length>0)&&<Button onClick={generatePDF} style={{marginBottom:'10px'}} variant="contained" color="primary">Generar Reporte</Button>}
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



