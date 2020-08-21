import React, {
  //  useEffect, 
  useState
} from 'react'
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CuotasAgrupadasExpandableRow from './CuotasAgrupadasExpandableRow';
import moment from 'moment';
import 'moment/locale/es';
import { Button } from '@material-ui/core';
import FacturasModal from "components/Recibos/FacturasModal/FacturasModal";
import CustomFooter from "components/Recibos/Facturas/CustomFooter";
import Swal from 'sweetalert2/dist/sweetalert2.js'
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
    name: 'SaldoTotal',
    label: 'Saldo Total',

  },
  {
    name: 'ValorVencido',
    label: 'Vencido',

  },
  {
    name: 'Moneda',
    label: 'Moneda',

  },
  {
    name: '15Dias',
    label: 'Por Vencer(15Dias)',

  },
]

const CuotasAgrupadasTable = props => {
  // let selectedRowsIndexXAcuerdo = null;
  const [openModal, setOpenModal] = useState(false);
  const [rowExpandidas, setRowExpandidas] = useState([]);
  const [DataModal, setDataModal] = useState([]);
  const [selectedRowsIndexXAcuerdo, setSelectedRowsIndexXAcuerdo] = useState(null)
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
          CustomButton
          CustomButtonComponent={
            <BotonPagar
              // SelectedRowsIndexXAcuerdo={selectedRowsIndexXAcuerdo}
              onClick={setCuotasAPagar}
              // Mostrar={idsSubFacturaArray.length > 0}
              Mostrar={true}>
            </BotonPagar>}
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
    // onRowsSelect: (currentRowsSelected, allRowsSelected) => {
    //   setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
    // },
    onRowsExpand: (currentRowsExpanded, allRowsExpanded) => {
      setRowExpandidas(allRowsExpanded.map(expRow => expRow.dataIndex));
    },
    renderExpandableRow: (rowData, rowMeta) => {
      return (
        <CuotasAgrupadasExpandableRow
          onClick={OpenModal}
          moment={moment}
          setOpenModal={setOpenModal}
          ColSpan={rowData.length + 1}
          CuotasAgrupadas={data[rowMeta.dataIndex].CuotasAgrupadas}
          NumeroAcuerdo={data[rowMeta.dataIndex].Numero}
          SelectedRowsIndexXAcuerdo={selectedRowsIndexXAcuerdo}
          isVencidos={props.isVencidos}
          SetCuotasAPagar={(newArray) => { setCuotasSeleccionadas(data[rowMeta.dataIndex].Numero, newArray) }}
        />
      );
    },
  }
  props.Cuotas.forEach(fact => {
    fact.Acuerdos.forEach(acu => {
      let cuotasAgrupadas = [];
      let cuotasSinAgrupar = [];
      let SaldoTotal = 0;
      let ValorVencido= 0;
      let ValorMoneda = "";
      //let facturas = [];
      acu.Facturas.forEach(fact => {
        fact.Cuotas.forEach(cuot => {
          cuotasSinAgrupar.push(cuot)
          let cuotaAgrupada = cuotasAgrupadas.find(cuotAgr => cuotAgr.NumeroCuota === cuot.NumeroCuota && cuot.FechaVencimiento === cuotAgr.FechaVencimiento && cuot.FechaMaxDescuento === cuotAgr.FechaMaxDescuento);
          
          if (cuotaAgrupada) {
            cuotaAgrupada.Valor += cuot.ValorCuota;
            cuotaAgrupada.Saldo += cuot.Saldo;
            cuotaAgrupada.IdsSubFactura.push(cuot.IdSubFactura);
            cuotaAgrupada.Cuotas.push({ ...cuot, Factura: fact });
            if (cuotaAgrupada.NumeroFactura !== fact.Factura) {
              cuotaAgrupada.NumeroFactura = 'Varias';
            }
          } else {
            cuotasAgrupadas.push({
              NumeroCuota: cuot.NumeroCuota,
              NumeroFactura: fact.Factura,
              Valor: cuot.ValorCuota,
              FechaVencimiento: cuot.FechaVencimiento,
              FechaMaxDescuento: cuot.FechaMaxDescuento,
              Saldo: cuot.Saldo,
              IdsSubFactura: [cuot.IdSubFactura],
              Cuotas: [{ ...cuot, Factura: fact }]
            })
          }
          SaldoTotal += cuot.Saldo;
          ValorMoneda = cuot.IdMoneda;
          if (SaldoTotal > 0) {
            if (moment(cuot.FechaVencimiento).isBefore(moment(new Date()), 'days')) {
              ValorVencido += cuot.Saldo;
            }
          }
          // let dias = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days');
          // let diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days');
        });

      });
      // acu.CuotasAgrupadas = cuotasAgrupadas;
      cuotasAgrupadas.sort((a, b) => {
        if (a.NumeroCuota > b.NumeroCuota) {
          return 1;
        } 
        if (a.NumeroCuota < b.NumeroCuota){
          return -1;
        }
        return 0;
      });
    
      const Vencido = ValorVencido > 0? "text-danger font-weight-bold":"inline-block";
      //if (SaldoTotal > 0) {
        
   
        data.push({
          Numero: acu.Acuerdo,
          Valor: Number(acu.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
          Disponible: Number(acu.Disponible).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
          SaldoTotal: Number(SaldoTotal).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
          '15Dias': 0,
          CuotasAgrupadas: cuotasAgrupadas,
          ValorVencido: <span className={Vencido}>{(ValorVencido).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span>, 
          Moneda: ValorMoneda,
          // CuotasSinAgrupar :cuotasSinAgrupar,

        }
          //0 IdSubFactura: cuot.IdSubFactura,
          // Dias: dias,
          // DiasDescuento: diasDescuento,
          // Tipo: cuot.TipoDocumento,
          // Fecha: moment(fact.FechaFactura).format("DD/MM/YYYY"),
          // FechaVencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),
          // FechaDescuento: moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY"),
          // Valor: cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
          // Saldo: cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),



          //   C15Dias: fact.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
          //   Accion : (<Button

          //     onClick={()=>{}}
          //     variant="contained"
          //     color="primary">
          //     Pagar
          // </Button>)
        );
      //}
    });
  });

  const OpenModal = (event, cuotas) => {
    event.stopPropagation();
    setOpenModal(true);
    let DataModal = [];

    cuotas.forEach(cuot => {
      let dias = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days')
      let diasDescuento = 0;
      let fechaDescuento = moment(cuot.FechaMaxDescuento);
      if (fechaDescuento.isValid()) {
        diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days');
      }
      DataModal.push({
        NumeroFactura: cuot.Factura.Factura,
        Dias: dias,
        DiasDescuento: diasDescuento,
        Tipo: cuot.TipoDocumento,
        Fecha: moment(cuot.Factura.FechaFactura).format("DD/MM/YYYY"),
        Vencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),
        FechaDescuento: fechaDescuento.isValid() ? fechaDescuento.format("DD/MM/YYYY") : "",
        Valor: cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
        Saldo: cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
        //   C15Dias: fact.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),

      }
      )
    });


    /* DataModal.push({
      Tipo: 'Factura [D-P]',
      NumeroFactura: '2',
      Fecha: '18/10/2019',
      Vencimiento: '31/12/2019',
      Dias: '-13',
      FechaDescuento: '16/12/2019',
      DiasDescuento: '-28',
      Valor: '696,969.00',
      Saldo: '323,886.00',

    });
 */
    setDataModal(DataModal);
  }

  const IdsSubFacturaArray = () => {
    if (!selectedRowsIndexXAcuerdo) {
      return [];
    }
    let array = [];
    Object.values(selectedRowsIndexXAcuerdo).forEach(val => {
      if (array.length === 0) {
        array = [...array.concat(val)];
      }
      else {
        if (val.length !== 0) {
          array = null;
        }
      }
    });
    return array;
  }
  const setCuotasAPagar = () => {

    let array = IdsSubFacturaArray();

    if (array) {
      if (array.length !== 0) {
        props.SetCuotasAPagar(array);
      }
      else {
        Swal.fire({
          title: 'Error',
          text: "Seleccione 1 acuerdo",
          type: 'error',
          confirmButtonText: 'ok',
        })
      }
    }
    else {
      Swal.fire({
        title: 'Error',
        text: "Solo puede pagar 1 acuerdo a la vez",
        type: 'error',
        confirmButtonText: 'ok',
      })
    }

  }
  const setCuotasSeleccionadas = (idAcuerdo, newArray) => {
    let newSelectedRowsIndexXAcuerdo = {};
    if (selectedRowsIndexXAcuerdo) {
      newSelectedRowsIndexXAcuerdo = { ...selectedRowsIndexXAcuerdo };
    }
    newSelectedRowsIndexXAcuerdo[idAcuerdo] = newArray;
    setSelectedRowsIndexXAcuerdo(newSelectedRowsIndexXAcuerdo);
    // selectedRowsIndexXAcuerdo = newSelectedRowsIndexXAcuerdo;
    
    // IdsSubFacturaArray().length > 0)
    // let cuotasAPagar = [];
    // selectedRowsIndex.forEach(selRowsIndex => {
    // cuotasAPagar.push(data[selRowsIndex].IdSubFactura)
    //  //cuotasAPagar.push(cuotas[selRowsIndex])
    // })
  }
  return (
    <>
      <MuiThemeProvider theme={getMuiTheme()}>
        <MUIDataTable
          title={'Cuenta Carteras - ' + (props.Cuotas && props.Cuotas[0] ? props.Cuotas[0].TipoPedido : '')}
          data={data}
          columns={columns}
          options={options}
        />
      </MuiThemeProvider>
      <FacturasModal Data={DataModal} Open={openModal} onClose={setOpenModal}></FacturasModal>
    </>
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

export default CuotasAgrupadasTable;



const BotonPagar = (props) => {
  // let mostrar = props.SelectedRowsIndexXAcuerdo && (Object.values(props.SelectedRowsIndexXAcuerdo).some(val => val.length > 0));
  if (true) {

    return (<Button
      onClick={props.onClick}
      variant="contained"
      color="primary">
      Pagar
</Button>)
  }
  return null;
}