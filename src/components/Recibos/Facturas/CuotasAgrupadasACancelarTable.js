import React, {
  useEffect,
  useState
} from 'react'
import MUIDataTable from 'mui-datatables'
import moment from 'moment';
import 'moment/locale/es';
// import { Button } from '@material-ui/core';

moment.locale('es')

const columns = [

  {
    name: 'Tipo',
    label: 'Tipo',
  },

  {
    name: 'Saldo',
    label: 'Saldo',
  }
]

const CuotasAgrupadasACancelarTable = props => {
  const [selectedRowsIndex, setSelectedRowsIndex] = useState([])
  const [cuotasAgrupadas, setCuotasAgrupadas] = useState(new Map())
  useEffect(() => {
    let cuotasMap = new Map();
    props.Cuotas.forEach(cuota => {
      cuota.Acuerdos.forEach(acu => {
        acu.Facturas.forEach(fact => {
          fact.Cuotas.forEach(cuot => {
            if (props.CuotasAPagar.includes(cuot.IdSubFactura)) {
              if (cuotasMap.has(fact.LineaString)) {
                let agrupacionFactura = cuotasMap.get(fact.LineaString);
                agrupacionFactura.Saldo += Number(cuot.Saldo);
                agrupacionFactura.Cuotas.push(cuot);
                cuotasMap.set(fact.LineaString, agrupacionFactura)
              } else {
                let agrupacionFacturas = {
                  Tipo: cuot.TipoDocumento,
                  Saldo: Number(cuot.Saldo),
                  Cuotas: [cuot]
                }
                cuotasMap.set(fact.LineaString, agrupacionFacturas)
              }
            }
          });
        });
      });
    });
    setCuotasAgrupadas(cuotasMap);
    // eslint-disable-next-line
  }, [props.CuotasAPagar]);
  const data = []
  const options = {
    sort: false,
    filterType: 'false',
    responsive: "scrollFullHeight",
    print: false,
    download: false,
    pagination: false,
    sortFilterList: false,
    filter: false,
    search: false,
    viewColumns: false,
    selectableRows: 'none',
    selectableRowsOnClick: true,
    rowsSelected: selectedRowsIndex,
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
      let allRowsSelectedIndex = allRowsSelected.map(row => row.dataIndex);
      setSelectedRowsIndex(allRowsSelectedIndex)
      setLineasfiltradas(allRowsSelectedIndex);
      // setSelectedRowsIndex(currentRowsSelected);
    }
  }
  let saldoTotal = 0;
  for (let [key, value] of cuotasAgrupadas) {
    data.push([key, numberWithCommas(Number(value.Saldo))]);
    saldoTotal += Number(value.Saldo);
  }
  let faltante = Number(saldoTotal) - Number(props.Acumulado());
  localStorage.setItem('Faltante', faltante);
  localStorage.setItem('TotalRecibo', saldoTotal);
  data.push([(<h6 className="font-weight-bolder text-dark">Total</h6>), numberWithCommas(Number(saldoTotal))]);
  data.push([(<h6 className="font-weight-bolder text-dark">Acumulado</h6>), numberWithCommas(Number(props.Acumulado()))]);
  data.push([(<h6 className="font-weight-bolder text-dark">Faltante</h6>), numberWithCommas(Number(faltante))]);
  const setLineasfiltradas = (allRowsSelectedIndex) => {
    let lineasFiltradas = [];
    allRowsSelectedIndex.forEach(selRowsIndex => {
      lineasFiltradas.push(data[selRowsIndex][0]);
    })
    props.SetLineasfiltradas(lineasFiltradas)
  }
  return (
    <>
      <MUIDataTable
        title={''}
        data={data}
        columns={columns}
        options={options}
      />

    </>
  )
}

const numberWithCommas = (x) => {
  x = x.toFixed(2);
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
export default CuotasAgrupadasACancelarTable