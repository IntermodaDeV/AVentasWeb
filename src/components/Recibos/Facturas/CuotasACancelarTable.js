import React, {
  //  useEffect,
  useState
} from 'react'
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import 'moment/locale/es';
import {
  Button
} from '@material-ui/core';

moment.locale('es')

const columns = [

  {
    name: 'Tipo',
    label: 'Tipo',

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
    name: 'Valor',
    label: 'Valor',
  },
  {
    name: 'Saldo',
    label: 'Saldo',

  }
]

const CuotasACancelarTable = props => {
  const [selectedRowsIndex, setSelectedRowsIndex] = useState([])
  const data = []
  const options = {
    filterType: 'false',
    responsive: "scrollMaxHeight",
    print: false,
    download: false,
    pagination: false,
    sortFilterList: false,
    sort: false,
    filter: false,
    search: false,
    viewColumns: false,
    selectableRows: 'none',
    // rowsSelected: selectedRowsIndex,
    textLabels: {
      body: {
        noMatch: "No se han encontrado data",
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
    customToolbarSelect: () => { },
    onRowsSelect: (currentRowsSelected, allRowsSelected) => {
      setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
    }
  }
  props.Cuotas.forEach(fact => {
    fact.Acuerdos.forEach(acu => {
      acu.Facturas.forEach(fact => {
        if (true || props.Lineasfiltradas.includes(fact.LineaString)) {
          fact.Cuotas.forEach(cuot => {
            if (props.CuotasAPagar.includes(cuot.IdSubFactura)) {
              let dias = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days')
              let diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days')
              data.push({
                Dias: dias,
                DiasDescuento: diasDescuento,
                Tipo: cuot.TipoDocumento,
                Fecha: moment(fact.FechaFactura).format("DD/MM/YYYY"),
                FechaVencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),
                FechaDescuento: moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY"),
                Valor: cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                Saldo: cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                //   C15Dias: fact.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                Accion: (<Button
                  onClick={() => { }}
                  variant="contained"
                  color="primary">
                  Eliminar
            </Button>)
              })
            }
          });
        }
      });
    });
  })
  const setCuotasAPagar = () => {
    let cuotasAPagar = [];
    selectedRowsIndex.forEach(selRowsIndex => {
      cuotasAPagar.push(data[selRowsIndex]);
    })
    props.SetCuotasAPagar(cuotasAPagar)
  }
  return (
    <MuiThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={''}
        data={data}
        columns={columns}
        options={options}
      />
      {
        selectedRowsIndex.length > 0 &&
        <Button

          onClick={() => { setCuotasAPagar() }}
          variant="contained"
          color="primary">
          Eliminar
        </Button>
      }
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

export default CuotasACancelarTable