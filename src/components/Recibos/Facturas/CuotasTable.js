import React, {
  //  useEffect, 
  useState
} from 'react'
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import 'moment/locale/es';
import { Button } from '@material-ui/core';
import CustomFooter from "components/Recibos/Facturas/CustomFooter";
import styles from "components/Recibos/Facturas/CuotasTable.module.css";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';

moment.locale('es')
const columns = [

  {
    name: 'Tipo',
    label: 'Tipo',

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
    name: 'FechaVencimiento',
    label: 'Vencimiento',

  },

  {
    name: 'Dias',
    label: 'Dias',

  },
  {
    name: 'FechaDescuento',
    label: 'Fecha Descuento',

  },
  {
    name: 'DiasDescuento',
    label: 'Dias Descuento',

  },
  {
    name: 'ValorDescuento',
    label: 'Valor Descuento',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'APagar',
    label: 'A Pagar',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'Valor',
    label: 'Valor',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'Saldo',
    label: 'Saldo',

  }
];

const CuotasTable = props => {
  const [selectedRowsIndex, setSelectedRowsIndex] = useState([])
  const data = [];
  let foundExpired = false;
  let Expired = [];
  const options = {
    filterType: 'multiselect',
    isRowSelectable:(row)=>{
      const isVencido = localStorage.getItem('isVencido')
      if(isVencido==='true') return data[row].IsVencida;
      return true;
    },
    responsive: "scrollMaxHeight",
    print: false,
    pagination: false,
    sort: false,
    download: false,
    selectableRowsOnClick: true,
    rowsSelected: selectedRowsIndex,
    customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => {
      return (
        <CustomFooter count={count}
          page={page} rowsPerPage={rowsPerPage}
          changeRowsPerPage={changeRowsPerPage}
          changePage={changePage}
          textLabels={textLabels}
          //CustomButton
          CustomButtonComponent={
            getButtonPagar()
          }
        />
      )
    },
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
    customToolbarSelect: () => {
      return (
        <div className="row">
          <div className="col d-flex">

            <div className="pr-3 font-weight-bold  d-flex">
              <label className="m-auto">Total : </label>
              <label className="m-auto">{selectedRowsIndex.reduce((acc, curr) => {
                return acc + Number(data[curr].Cuota.Saldo);
              }, 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
              }</label>
            </div>
            <div>

            </div>
            {getButtonPagar()}
          </div>
        </div>
      )
    },
    onRowsSelect: (currentRowsSelected, allRowsSelected) => {
      setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
    }
  }
  props.Cuotas.forEach(fact => {
    fact.Acuerdos.forEach(acu => {
      acu.Facturas.forEach(fact => {
        fact.Cuotas.forEach(cuot => {
          let dias = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days')
          let diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days')

          let DiasVencido = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days')
          let ValorDescuento = cuot.Descuento;
          let isVencida = DiasVencido<0;

          if (DiasVencido < 0) {
            foundExpired = true;

            Expired.push({ IdSubFactura: cuot.IdSubFactura, Dias: dias });
            data.push({
              IdSubFactura: cuot.IdSubFactura,
              Dias: <span className="text-danger font-weight-bold">{DiasVencido}</span>,
              DiasDescuento: <span className="text-danger font-weight-bold"> {diasDescuento}</span>,
              ValorDescuento: <span className="text-danger font-weight-bold">{ValorDescuento}</span>,
              Tipo: <span className="text-danger font-weight-bold"> {cuot.TipoDocumento}</span>,
              Factura: <span className="text-danger font-weight-bold"> {fact.Factura}</span>,
              Fecha: <span className="text-danger font-weight-bold"> {moment(fact.FechaFactura).format("DD/MM/YYYY")}</span>,
              FechaVencimiento: <span className="text-danger font-weight-bold"> {moment(cuot.FechaVencimiento).format("DD/MM/YYYY")}</span>,
              FechaDescuento: <span className="text-danger font-weight-bold"> {moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY")}</span>,
              APagar: <span className="text-danger font-weight-bold">{(cuot.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,
              Valor: <span className="text-danger font-weight-bold">{cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,
              Saldo: <span className="text-danger font-weight-bold">{cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,
              Cuota: cuot,
              IsVencida:isVencida
            })
          }
          else if (DiasVencido >= 0 && DiasVencido <= 15) {
            data.push({
              IdSubFactura: cuot.IdSubFactura,
              Dias: <span className={"font-weight-bold " + styles.WarnRecibo}>{DiasVencido}</span>,
              DiasDescuento: <span className={"font-weight-bold " + styles.WarnRecibo}> {diasDescuento}</span>,
              ValorDescuento: <span className={"font-weight-bold " + styles.WarnRecibo}> {ValorDescuento}</span>,
              Tipo: <span className={"font-weight-bold " + styles.WarnRecibo}> {cuot.TipoDocumento}</span>,
              Factura: <span className={"font-weight-bold " + styles.WarnRecibo}> {fact.Factura}</span>,
              Fecha: <span className={"font-weight-bold " + styles.WarnRecibo}> {moment(fact.FechaFactura).format("DD/MM/YYYY")}</span>,
              FechaVencimiento: <span className={"font-weight-bold " + styles.WarnRecibo}> {moment(cuot.FechaVencimiento).format("DD/MM/YYYY")}</span>,
              FechaDescuento: <span className={"font-weight-bold " + styles.WarnRecibo}> {moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY")}</span>,
              APagar: <span className={"font-weight-bold " + styles.WarnRecibo}>{(cuot.Saldo - ValorDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,
              Valor: <span className={"font-weight-bold " + styles.WarnRecibo}>{cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,
              Saldo: <span className={"font-weight-bold " + styles.WarnRecibo}>{cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>,
              Cuota: cuot,
              IsVencida:isVencida
            })
          }
          else {
            data.push({
              IdSubFactura: cuot.IdSubFactura,
              Dias: DiasVencido,
              DiasDescuento: diasDescuento,
              ValorDescuento: ValorDescuento,
              Tipo: cuot.TipoDocumento,
              Factura: fact.Factura,
              Fecha: moment(fact.FechaFactura).format("DD/MM/YYYY"),
              FechaVencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),
              FechaDescuento: moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY"),
              APagar: (cuot.Saldo - ValorDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
              Valor: cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
              Saldo: cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
              Cuota: cuot,
              IsVencida:isVencida
              //   C15Dias: fact.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
              //   Accion : (<Button

              //     onClick={()=>{}}
              //     variant="contained"
              //     color="primary">
              //     Pagar
              // </Button>)
            })
          }
        });
      });
    });
  })

  const setCuotasAPagar = () => {
    let cuotasAPagar = [];

    let selectedExpired = [];


    selectedRowsIndex.forEach(selRowsIndex => {
      let select = Expired.find(element => element.IdSubFactura === data[selRowsIndex].IdSubFactura);

      if (select) {
        selectedExpired.push(select);
      }
      cuotasAPagar.push(data[selRowsIndex].IdSubFactura)
    })

    if (foundExpired) {

      if (selectedExpired.length === 0) {
        Swal.fire({
          title: 'Error',
          text: "Seleccionar Factura Vencidas",
          type: 'error',
          confirmButtonText: 'OK',
        });
      }
      else {
        let encontrado = false;

        let index = 0;

        selectedExpired.sort((a, b) => (a.Dias > b.Dias) ? 1 : (a.Dias === b.Dias) ? ((a.IdSubFactura > b.IdSubFactura) ? 1 : -1) : -1);
        Expired.sort((a, b) => (a.Dias > b.Dias) ? 1 : (a.Dias === b.Dias) ? ((a.IdSubFactura > b.IdSubFactura) ? 1 : -1) : -1);

        do {
          if (selectedExpired[index].Dias !== Expired[index].Dias) {
            encontrado = true;
          }
          index++;
        } while (encontrado === false && selectedExpired.length > index);

        if (selectedRowsIndex.length <= selectedExpired.length || Expired.length === selectedExpired.length) {
          if (encontrado) {
            Swal.fire({
              title: 'Error',
              text: "Facturas Seleccionadas Inválidas",
              type: 'error',
              confirmButtonText: 'OK',
            });
          }
          else {
            props.SetCuotasAPagar(cuotasAPagar);
          }
        }
        else {
          Swal.fire({
            title: 'Error',
            text: "Facturas Seleccionadas Inválidas",
            type: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    }
    else {
      props.SetCuotasAPagar(cuotasAPagar);
    }
  }
  const getButtonPagar = () => {
    if (selectedRowsIndex.length > 0) {
      return (
        <Button
          onClick={() => { setCuotasAPagar() }}
          variant="contained"
          color="primary">
          Pagar
        </Button>
      )
    }
    return null
  }
  return (
    <MuiThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={'Cuenta Cartera - ' + (props.Cuotas && props.Cuotas[0] ? props.Cuotas[0].TipoPedido : '')}
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
  }
});

export default CuotasTable
