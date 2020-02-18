import React, {
    //  useEffect, 
    // useState
} from 'react';
import MUIDataTable from 'mui-datatables';
import { FaEye } from "react-icons/fa";

const columns = [

    {
        name: 'Cuota',
        label: 'Cuota',
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
        name: 'Valor',
        label: 'Valor',
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

const CuotasACancelarAgrupadasTable = (props) => {
    let selectedRowsIndex = [];

    let cuotasAgrupadas = [];
    let cuotasSinAgrupar = [];
    props.Cuotas.forEach(fact => {
        fact.Acuerdos.forEach(acu => {
            //let facturas = [];
            acu.Facturas.forEach(fact => {
                fact.Cuotas.forEach(cuot => {
                    if (props.CuotasAPagar.includes(cuot.IdSubFactura)) {
                        cuotasSinAgrupar.push(cuot)
                        let cuotaAgrupada = cuotasAgrupadas.find(cuotAgr => cuotAgr.NumeroCuota === cuot.NumeroCuota);
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
                                Saldo: cuot.Saldo,
                                IdsSubFactura: [cuot.IdSubFactura],
                                Cuotas: [{ ...cuot, Factura: fact }]

                            })
                        }
                        // let dias = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days');
                        // let diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days');
                    }
                });

            });
        });
    });
    const data = cuotasAgrupadas.map(cuotAgru => {
        return {
            Cuota: cuotAgru.NumeroCuota,
            Factura: cuotAgru.NumeroFactura,
            Fecha: props.moment(cuotAgru.FechaVencimiento).format("DD/MM/YYYY"),
            Valor: Number(cuotAgru.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
            Saldo: Number(cuotAgru.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
            Acciones: <FaEye onClick={(event) => { props.onClick(event, cuotAgru.Cuotas) }} size={"20px"} />,
        }
    });







    const options = {
        filterType: 'multiselect',
        selectableRowsOnClick: false,
        selectableRows: 'none',
        responsive: "scrollFullHeight",
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

    }
    return (
        <MUIDataTable
            title={''}
            data={data}
            columns={columns}
            options={options}
        />

    );
}
export default CuotasACancelarAgrupadasTable;