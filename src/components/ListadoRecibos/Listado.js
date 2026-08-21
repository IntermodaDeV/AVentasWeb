import React, { useState } from 'react';
import { Button, Dialog,DialogContent,DialogActions} from "@material-ui/core";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { DatePicker } from "@material-ui/pickers";
import MUIDataTable from "mui-datatables";
import Recibo from "components/ListadoRecibos/Recibo";
import { Dropdown } from "semantic-ui-react";
import moment from "moment";
import ReactToPrint from 'react-to-print';
import {ReciboReporte} from './ReciboReporte';
import { PermisoUsuarioOficinaCreditos } from 'components/Seguridad/Permisos';
moment.locale('es');

const Listado = (props) => {
    const [openModal,setOpenModal] = useState(false);
    const componentRef = React.useRef();
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
            {(props.mostrarGenerarReporte && PermisoUsuarioOficinaCreditos()) && 
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                scroll={'paper'}
                aria-labelledby="scroll-dialog-title"
            >
                <DialogContent dividers={true} ref={componentRef} style={{ width: '100%' }}>
                    <h2 style={{ textAlign: "center", fontWeight: "bold" }}>{`${props.startDate.getDate()}/${props.startDate.getMonth() + 1}/${props.startDate.getFullYear()}`} - {`${props.endDate.getDate()}/${props.endDate.getMonth() + 1}/${props.endDate.getFullYear()} - ${props.nombreAsesor}`}</h2>
                    <hr/>
                    {props.recibos.map((x,i)=><ReciboReporte key={i} recibo={x}/>)}
                </DialogContent>
                <DialogActions>
                    <ReactToPrint
                        trigger={() =>
                            <Button color="primary">
                                Imprimir
                            </Button>
                        }
                        content={() => componentRef.current}
                    />
                    <Button onClick={() => setOpenModal(false)} color="primary">
                        Finalizar
                    </Button>
                </DialogActions>
            </Dialog >}
            <div className="row mb-3">
                <div className='col-lg-2 my-lg-0 col-6 my-1'>
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
                <div className='col-lg-2 my-lg-0 col-6 my-1'>
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
                <div className='col-lg-2 my-lg-0 col-6 my-1' style={{ paddingTop: 10 }}>
                    <Dropdown
                        placeholder="Asesor"
                        selection
                        style={{zIndex:999}}
                        onChange={(e, { value }) =>  props.handleOnChangeAsesor(value)}
                        options={props.Asesores}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        value={props.AsesorSelected}
                    />
                 </div>
                 <div className='col-lg-2 my-lg-0 col-6 my-1' style={{ paddingTop: 10 }}>
                    <Dropdown
                        placeholder="Creado por"
                        selection
                        style={{zIndex:999}}
                        onChange={(e, { value }) =>  props.handleOnChangeUsuarioCreador(value)}
                        options={props.UsuariosCreadores}
                        noResultsMessage={"No hay resultados"}
                        closeOnChange={true}
                        value={props.UsuarioCreadorSelected || ''}
                    />
                 </div>
                 <div className="col-lg-1 col-sm-2 col-4"  style={{ paddingTop: 10 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => props.cargarRecibos(props.startDate, props.endDate)}
                        >Obtener
                    </Button>
                 </div>
                 <div className="col-lg-1 col-sm-2 col-4"  style={{ paddingTop: 10 }}>
                 {(props.mostrarGenerarReporte && PermisoUsuarioOficinaCreditos()) && <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setOpenModal(true)}
                        >Generar reporte
                    </Button>}
                 </div>
            </div>
            <div>
                <MuiThemeProvider theme={getMuiTheme()}>
                    <MUIDataTable
                        title={"Listado de Recibos"}
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