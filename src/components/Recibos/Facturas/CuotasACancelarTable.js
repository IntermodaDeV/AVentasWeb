import React, {
  //  useEffect,
  // useStates
} from 'react'
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import 'moment/locale/es';
// import {
//   Button
// } from '@material-ui/core';

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
  }


  return (
    <MuiThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title={''}
        data={props.CuotasSinAgruparACancelar}
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

export default CuotasACancelarTable