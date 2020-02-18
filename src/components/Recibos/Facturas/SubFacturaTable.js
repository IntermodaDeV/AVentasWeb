import React, { useEffect, useState } from 'react'
 import MUIDataTable from "mui-datatables";
 import moment from "moment";
 import 'moment/locale/es';

 moment.locale('es');

const columns = [
   {
     name: 'factura',
     label: 'Factura',
     options: {
       filter: true,
       sort: true
     }
   },
  // {
  //   name: 'codigoCliente',
  //   label: 'Codigo Cliente',
  //   options: {
  //     filter: true,
  //     sort: true
  //   }
  // },
  // {
  //   name: 'empresa',
  //   label: 'Empresa',
  //   options: {
  //     filter: true,
  //     sort: true
  //   }
  // },
  {
    name: 'moneda',
    label: 'Moneda',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'tipo',
    label: 'Tipo',
    options: {
      filter: true,
      sort: true
    }
  },
  {
    name: 'fechaFactura',
    label: 'Fecha Factura',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'fechaVencimiento',
    label: 'Fecha Vencimiento',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'fechaMaxDescuento',
    label: 'Fecha Maxima Descuento',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'totalFactura',
    label: 'Total ',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'saldo',
    label: 'Saldo',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'Pendiente',
    label: 'Pendiente Factura',
    options: {
      filter: true,
      sort: false
    }
  },
  {
    name: 'descuento',
    label: 'Descuento',
    options: {
      filter: true,
      sort: false
    }
  },
  // {
  //   name: 'facturaStatus',
  //   label: 'Status',
  //   options: {
  //     filter: true,
  //     sort: false
  //   }
  // },
  {
    name: 'numeroPagos',
    label: 'Numero Pagos',
    options: {
      filter: true,
      sort: false
    }
  },
  // {
  //   name: 'referencia',
  //   label: 'Referencia',
  //   options: {
  //     filter: true,
  //     sort: false
  //   }
  // },
  {
    name: 'linea',
    label: 'Linea',
    options: {
      filter: true,
      sort: false
    }
  }
  ,
  {
    name: 'tipoPedido',
    label: 'Tipo Pedido',
    options: {
      filter: true,
      sort: false
    }
  }
]

const SubFacturaTable = props => {
  const data = []
  props.Facturas.forEach(fact => {
    data.push({
      factura: fact.Factura,
      codigoCliente: fact.CodigoCliente,
      empresa: fact.EmpresaId,
      moneda: fact.IdMoneda,
      tipo: fact.Tipo,
      fechaFactura: moment(fact.FechaFactura).format('DD/MM/YYYY'),
      fechaVencimiento: moment(fact.FechaVencimiento).format('DD/MM/YYYY'),
      fechaMaxDescuento: moment(fact.FechaMaxDescuento).format('DD/MM/YYYY'),
      totalFactura: fact.TotalFactura,
      saldo: fact.Saldo,
      Pendiente: fact.PendienteFactura,
      descuento: fact.Descuento,
      facturaStatus: fact.FacturaStatus,
      numeroPagos: fact.NumeroPagos,
      referencia: fact.Referencia,
      linea: fact.LineaString,
      tipoPedido: fact.TipoPedidoString
    })
  })
  return (
    <MUIDataTable
    title={"Cuenta Corriente"}
    data={data}
    columns={columns}
  />
  );
}
export default SubFacturaTable
