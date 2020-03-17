import React, {
    //  useEffect, 
    // useState
} from 'react';
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { FaEye } from "react-icons/fa";
import moment from 'moment';
import 'moment/locale/es';

const columns = [

    {
        name: 'Cuota',
        label: 'Cuota',
    },
    {
        name: 'Valor',
        label: 'Valor Cuota',
    },
    {
        name: 'Factura',
        label: 'Factura',
    },
    /*{
        name: 'ValorFactura',
        label: 'Valor Factura',
    },*/
    {
        name: 'FechaCreacion',
        label: 'Fecha',
    },
    {
        name: 'Fecha',
        label: 'Vencimiento',
    },
    {
        name: 'DiasVencido',
        label: 'Dias',
    },
    {
        name: 'FechaDescuento',
        label: 'Fecha Descuento',
    },
    {
        name: 'ValorDescuento',
        label: 'Descuento',
    },
    {
        name: 'DiasDescuento',
        label: 'Dias Descuento',
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
        let Fecha = new Date();
        let ValorDescuento = 0;
        let Dias = moment(cuotAgru.FechaVencimiento).diff(moment(new Date()), 'days')
        let DiasDescuento = moment(cuotAgru.FechaMaxDescuento).diff(moment(new Date()), 'days')
        cuotAgru.Cuotas.forEach(factura=>{
             Fecha = factura.FechaFactura;
             ValorDescuento = factura.Descuento;
        });
        seleccionado = cuotAgru.IdsSubFactura.some(idsub => {
            return IdsSubFactura.includes(idsub);
        });

        if (seleccionado) {
            selectedRowsIndex.push(index);
        } 
        
        if(Dias < 0 ){
            data.push({
                IsVencida:true,
                FechaDes: cuotAgru.FechaMaxDescuento,
                Cuota:<span className="text-danger font-weight-bold">{cuotAgru.NumeroCuota}</span>, 
                Valor: <span className="text-danger font-weight-bold">{Number(cuotAgru.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,  
                Factura: <span className="text-danger font-weight-bold">{cuotAgru.NumeroFactura}</span>,  
                FechaCreacion: <span className="text-danger font-weight-bold">{props.moment(Fecha).format("DD/MM/YYYY")}</span>,   
                Fecha: <span className="text-danger font-weight-bold">{props.moment(cuotAgru.FechaVencimiento).format("DD/MM/YYYY")}</span>,  
                DiasVencido: <span className="text-danger font-weight-bold">{Dias}</span>,   
                FechaDescuento: <span className="text-danger font-weight-bold">{props.moment(cuotAgru.FechaMaxDescuento).format("DD/MM/YYYY")}</span>,
                ValorDescuento: <span className="text-danger font-weight-bold">{0}</span>,      
                DiasDescuento: <span className="text-danger font-weight-bold">{DiasDescuento}</span>,    
                Saldo: <span className="text-danger font-weight-bold">{Number(cuotAgru.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>, 
                Acciones: <FaEye onClick={(event) => { props.onClick(event, cuotAgru.Cuotas) }} size={"20px"} />,
            });
            data.sort((a,b)=>(new Date(a.FechaDes) -new Date(b.FechaDes)));
        }
        else if(Dias >= 0 && Dias <=15)
        {
            data.push({
                IsVencida:false,
                FechaDes: cuotAgru.FechaMaxDescuento,
                Cuota:<span className={"text-warning font-weight-bold "}>{cuotAgru.NumeroCuota}</span>, 
                Valor: <span className={"text-warning font-weight-bold "}>{Number(cuotAgru.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>, 
                Factura: <span className={"text-warning font-weight-bold "}>{cuotAgru.NumeroFactura}</span>, 
                FechaCreacion: <span className={"text-warning font-weight-bold "}>{props.moment(Fecha).format("DD/MM/YYYY")}</span>, 
                Fecha: <span className={"text-warning font-weight-bold "}>{props.moment(cuotAgru.FechaVencimiento).format("DD/MM/YYYY")}</span>, 
                DiasVencido: <span className={"text-warning font-weight-bold "}>{Dias}</span>, 
                FechaDescuento:<span className={"text-warning font-weight-bold "}>{props.moment(cuotAgru.FechaMaxDescuento).format("DD/MM/YYYY")}</span>,   
                ValorDescuento: <span className={"text-warning font-weight-bold "}>{Number(ValorDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>, 
                DiasDescuento: <span className={"text-warning font-weight-bold "}>{Number(DiasDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>, 
                Saldo: <span className={"text-warning font-weight-bold "}>{Number(cuotAgru.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>, 
                Acciones: <FaEye onClick={(event) => { props.onClick(event, cuotAgru.Cuotas) }} size={"20px"} />,
            });
            data.sort((a,b)=>(new Date(a.FechaDes) -new Date(b.FechaDes)));
        }
        else
        {
            data.push({
                IsVencida:false,
                FechaDes: cuotAgru.FechaMaxDescuento,
                Cuota: cuotAgru.NumeroCuota,
                Valor: Number(cuotAgru.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), 
                Factura: cuotAgru.NumeroFactura,
                FechaCreacion: props.moment(Fecha).format("DD/MM/YYYY"),
                Fecha: props.moment(cuotAgru.FechaVencimiento).format("DD/MM/YYYY"),
                DiasVencido: Dias,
                FechaDescuento: props.moment(cuotAgru.FechaMaxDescuento).format("DD/MM/YYYY"), 
                ValorDescuento: Number(ValorDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                DiasDescuento: Number(DiasDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                Saldo: Number(cuotAgru.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                Acciones: <FaEye onClick={(event) => { props.onClick(event, cuotAgru.Cuotas) }} size={"20px"} />,
            });
            data.sort((a,b)=>(new Date(a.FechaDes) -new Date(b.FechaDes)));
        } 
    });

    const options = {
        filterType: 'multiselect',
        isRowSelectable:(row)=>{
            const isVencido = localStorage.getItem('isVencido')
            if(isVencido==='true') return data[row].IsVencida;
            return true;
          },
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