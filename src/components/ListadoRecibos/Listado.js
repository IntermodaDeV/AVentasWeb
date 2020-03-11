import React from 'react'
import { Dialog } from "@material-ui/core";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { DatePicker } from "@material-ui/pickers";
import MUIDataTable from "mui-datatables";
import Recibo from "components/ListadoRecibos/Recibo";
import moment from "moment";
moment.locale('es');

const Listado = (props) => {
    const getMuiTheme = () => createMuiTheme({
        overrides: {
            MUIDataTable: {
                responsiveScrollMaxHeight: {
                    maxHeight: 'unset !important',
                }
            },
            MUIDataTableBodyRow: {
                root: {
                    '&:nth-child(odd)': {
                        backgroundColor: '#f8f8f8'
                    }
                }
            },
        }
    })

    return (
        <div className="px-3">
            <div className="row mb-3">
                <div className='col-lg-3 my-lg-0 col-6 my-1'>
                    <DatePicker
                        disableToolbar
                        autoOk
                        label={"Fecha Inicio"}
                        variant="inline"
                        format={"DD/MM/YYYY"}
                        value={props.startDate}
                        onChange={(date) => props.handleFechaInicio(date)}
                    />

                </div>
                <div className='col-lg-3 my-lg-0 col-6 my-1'>
                    <DatePicker
                        disableToolbar
                        autoOk
                        label={"Fecha Fin"}
                        variant="inline"
                        minDate={props.startDate}
                        format={"DD/MM/YYYY"}
                        value={props.endDate}
                        onChange={(date) => props.handleFechaFin(date)}
                    />
                </div>
            </div>
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Listado Recibos"}
                        data={props.DataRecibos()}
                        columns={props.HeadersListaRecibos}
                        options={props.DatatableOptions}
                    />
                </MuiThemeProvider>
            </div>

            <Dialog
                open={props.showDialog}
                onClose={() => props.hidePrint()}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
            >
                {
                    props.DialogRecibo &&
                    <Recibo
                        hidePrint={props.hidePrint}
                        recibo={props.DialogRecibo}
                    />
                }
            </Dialog >

        </div>
    );
}

export default Listado;