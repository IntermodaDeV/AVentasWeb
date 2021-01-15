import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@material-ui/core';
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';


const FacturasModal = (props) => {

    const columns = [

        {
            name: 'Tipo',
            label: 'Tipo',
            options: {
                filter: true,
                sort: true
            }
        },
        {
            name: 'NumeroFactura',
            label: 'Numero Factura',
            options: {
                filter: true,
                sort: true
            }
        },
        {
            name: 'NumeroFEL',
            label: 'Numero FEL',
            options: {
                filter: true,
                sort: true,
                display: localStorage.getItem('EmpresaCliente')==='IMGT'
            }
        },
        {
            name: 'Fecha',
            label: 'Fecha',
            options: {
                filter: true,
                sort: true
            }
        },
        {
            name: 'Vencimiento',
            label: 'Vencimiento',
            options: {
                filter: true,
                sort: true
            }
        },

        {
            name: 'Dias',
            label: 'Dias',
            options: {
                filter: true,
                sort: true
            }
        },
        {
            name: 'FechaDescuento',
            label: 'Fecha Descuento',
            options: {
                filter: true,
                sort: true
            }
        },
        {
            name: 'DiasDescuento',
            label: 'Dias Descuento',
            options: {
                filter: true,
                sort: true
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
            options: {
                filter: true,
                sort: true
            }
        }
    ]


    const options = {
        filterType: 'false',
        responsive: "scrollMaxHeight",
        print: false,
        download: false,
        pagination: false,
        sortFilterList: false,
        filter: false,
        search: false,
        viewColumns: false,
        selectableRows: 'none',
        // rowsSelected: selectedRowsIndex,
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
        //     setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
        // }
    }

    return (
        <>
            <Dialog
                scroll={'paper'}
                open={props.Open}
                onClose={() => props.onClose(false)}>
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Facturas
                </div>
                </DialogTitle>
                <DialogContent>
                    <MuiThemeProvider theme={getMuiTheme()}>
                        <MUIDataTable
                            title={''}
                            data={props.Data}
                            columns={columns}
                            options={options}
                        />
                    </MuiThemeProvider>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => props.onClose(false)} color="primary">
                        Cancelar
                </Button>
                    {/* <Button
                    variant="outlined"
                    color="primary"
                    className={"py-1"}
                    style={{ height: '35px' }}
                    disabled={!this.state.razonSelected || (causaDisabled && tipoDisabled)}
                    onClick={() => this.guardarRazon()}>
                    {
                        this.state.guardandoRazon ?
                            <ScaleLoader
                                css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                                size={'20px'}
                                color={'#3f51b5'}
                                loading={this.state.GuardarAsignacion} /> : 'Guardar'
                    }
                </Button> */}
                </DialogActions>
            </Dialog>
        </>
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

export default FacturasModal;