import React, {
  //  useEffect, useState 
} from 'react'
import MUIDataTable from 'mui-datatables';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import 'moment/locale/es';
import {
  Button,
  // TablePagination, TableCell
} from '@material-ui/core';

moment.locale('es')

const columns = [
  {
    name: 'Tipo',
    label: 'Tipo Credito',
    options: {
      filter: true,
      sort: true
    }
  },
  {
    name: 'Disponible',
    label: 'Disponible',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'SaldoTotal',
    label: 'Saldo Total',
    options: {
      filter: true,
      sort: true
    }
  },
  {
    name: 'Vencido',
    label: 'Vencido',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'C15Dias',
    label: '15 Dias',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'Accion',
    label: 'Accion',
  }
]

const getOptions = (props) => {
  const options = {
    selectableRows: 'none',
    print: false,
    download: false,
    filter: false,
    viewColumns: false,
    responsive: "scrollMaxHeight",
    search: false,
    // customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => CustomFooter(count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels, props),
    customFooter: () => { },
    filterType: 'checkbox',
  }
  return options;
}


/* 
const CustomFooter = (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels, props) => {

  const Totales = {
    Disponible: 0,
    SaldoTotal: 0,
    C15Dias: 0,
  };

  props.Credito.forEach(fact => {
    Totales.Disponible += fact.Disponible;
    Totales.SaldoTotal += fact.SaldoTotal;
    Totales.C15Dias += fact.C15Dias;

  })


  const handleRowChange = event => {
    changeRowsPerPage(event.target.value);
  };

  const handlePageChange = (_, page) => {
    changePage(page);
  };

  return (
    <tfoot>
      <tr>
        <TableCell style={{ width: 'calc((1/5)*100%)' }}>
          <h6 className="font-weight-bolder text-dark">Totales</h6>
        </TableCell>
        <TableCell style={{ width: 'calc((1/5)*100%)', paddingLeft: '0.2%' }} className="font-weight-bolder text-dark">
          {Totales.Disponible.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
        </TableCell>
        <TableCell style={{ width: 'calc((1/5)*100%)', paddingLeft: '0.2%' }} className="font-weight-bolder text-dark">
          {Totales.SaldoTotal.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
        </TableCell>
        <TableCell style={{ width: 'calc((1/5)*100%)', paddingLeft: '0.2%' }} className="font-weight-bolder text-dark">
          {Totales.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
        </TableCell>
        <TableCell style={{ width: 'calc((1/5)*100%)' }}></TableCell>
      </tr>
      {false && <tr>
        <TableCell style={{ justifyContent: 'flex-end', padding: '0px 24px 0px 24px' }} colSpan={1000}>
          <TablePagination
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            labelRowsPerPage={textLabels.rowsPerPage}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${textLabels.displayRows} ${count}`}
            backIconButtonProps={{
              'aria-label': textLabels.previous,
            }}
            nextIconButtonProps={{
              'aria-label': textLabels.next,
            }}
            rowsPerPageOptions={[10, 20, 100]}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowChange}
          />
        </TableCell>
      </tr>}
    </tfoot>
  );
} */

const FacturaTable = props => {
  const setCuotas = (tipoPedido) => {
    const cuotas = props.AcuerdosXTipoPedido.filter(acu => acu.TipoPedido === tipoPedido);

    props.SetCuotas(cuotas)
  };
  const data = [];
  const Totales = {
    Disponible: 0,
    SaldoTotal: 0,
    C15Dias: 0,
    Vencido: 0
  };
  props.AcuerdosXTipoPedido.forEach(acuXTipPed => {
    let saldo = 0;
    let saldoVencido = 0;
    let saldo15DiasAvencer = 0;
    let disponible = 0;
    acuXTipPed.Acuerdos.forEach(acu => {
      if (acuXTipPed.AgrupaPorCuota) {
        disponible += Number(acu.Disponible);
      } else {
        disponible = (props.Cliente.CreditoDisponible ? props.Cliente.CreditoDisponible : 0);
      }
      acu.Facturas.forEach(fact => {
        fact.Cuotas.forEach(cuot => {

          if (cuot.Saldo > 0) {
            saldo += cuot.Saldo;
            if (moment(cuot.FechaVencimiento).isSameOrBefore(moment(new Date()), 'days')) {
              saldoVencido += cuot.Saldo;
            }
            if (moment(cuot.FechaVencimiento).isAfter(moment(new Date()), 'days') && moment(cuot.FechaVencimiento).isSameOrBefore(moment().add(15, 'day'), 'days')) {
              saldo15DiasAvencer += cuot.Saldo;
            }
          }
        });
      });
    });
    Totales.Disponible += Number(disponible);
    Totales.SaldoTotal += saldo;
    Totales.Vencido += saldoVencido;
    Totales.C15Dias += saldo15DiasAvencer;
    data.push({
      Tipo: acuXTipPed.TipoPedido,
      Disponible: Number(disponible).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
      SaldoTotal: saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
      C15Dias: saldo15DiasAvencer.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
      Vencido: saldoVencido.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
      Accion: (<Button
        onClick={() => { setCuotas(acuXTipPed.TipoPedido) }}
        variant="contained"
        color="primary">
        Pagar
    </Button>)
    })
  });
  data.push(
    {
      Tipo: (
        <h6 className="font-weight-bolder text-dark">Totales</h6>
      ),
      Disponible: (<label className="font-weight-bolder text-dark">
        {Totales.Disponible.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),
      SaldoTotal: (<label className="font-weight-bolder text-dark">
        {Totales.SaldoTotal.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),
      Vencido: (<label className="font-weight-bolder text-dark">
        {Totales.Vencido.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),
      C15Dias: (<label className="font-weight-bolder text-dark">
        {Totales.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
      </label>),
      Accion: (<label ></label>)
    }
  );
  return (

    <MuiThemeProvider theme={getMuiTheme()}>
      <MUIDataTable title={'Resumen Cartera'} data={data} columns={columns} options={getOptions(props)} />
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

export default FacturaTable
