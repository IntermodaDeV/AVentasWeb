import React, {
    useState
  } from 'react'
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@material-ui/core';
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {useDispatch} from 'react-redux';


const PedidosModal = (props) => {
    const dispatch = useDispatch();
    const [selectedRowsIndex, setSelectedRowsIndex] = useState([])
    const columns = [

        {
            name: 'NumeroPedido',
            label: 'Numero Pedido',
            options: {
                filter: true,
                sort: true
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
            name: 'FechaEntrega',
            label: 'Fecha Entrega',
            options: {
                filter: true,
                sort: true
            }
        },
        {
            name: 'CodigoPaquete',
            label: 'Codigo Paquete',
            options: {
                filter: true,
                sort: true
            }
        },
        {
            name: 'Paquete',
            label: 'Paquete',
            options: {
                filter: true,
                sort: true
            }
        },
        {
            name: 'TotalPedido',
            label: 'Total Pedido',
            options: {
                filter: true,
                sort: true
            }
        }
    ]


    const options = {
        selection: true,
        //filterType: 'multiselect',
        responsive: "scrollMaxHeight",
        print: false,
        download: false,
        pagination: false,
        sortFilterList: false,
        filter: false,
        search: false,
        viewColumns: false,
        selectableRows:'single',
        //selectableRows: 'none',
        selectableRowsOnClick: true,
        rowSelection : 'single',
        rowsSelected: selectedRowsIndex,
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
                      return acc + Number(props.Data[curr].TotalPedido);
                    }, 0).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                    }</label>
                  </div>
                  <div>
      
                  </div>
                  {}
                </div>
              </div>
            )
          },
          onRowsSelect: (currentRowsSelected, allRowsSelected) => {
            setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
          }
    }

const ValorApagar = () => {
    let ValoresAPagar = [];  
    selectedRowsIndex.forEach(selRowsIndex => {
      let select = props.Data.find(element => element.NumeroPedido === props.Data[selRowsIndex].NumeroPedido);
      console.log('select',select)
      if (select) {
        dispatch({type:'store_pedidoselected',payload:select})  
        ValoresAPagar.push(select);
      }
    })
    props.onClose(false)
  }
    let Disable = selectedRowsIndex.length > 0 ? false : true;
    return (
        <>
            <Dialog
                scroll={'paper'}
                selectableRows ={true}
                open={props.Open}
                onClose={() => props.onClose(false)}>
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Pedidos
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
                   
                    <Button variant="outlined" disabled={Disable} onClick={() => { ValorApagar() }} color="primary">
                        Aceptar
                    </Button>
                    <Button variant="outlined" onClick={() => props.onClose(false)} color="primary">
                        Cancelar
                    </Button>
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

export default PedidosModal;