import React,{useState} from 'react'
import MUIDataTable from 'mui-datatables'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import moment from 'moment';
import 'moment/locale/es';
import { Button } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { DatePicker } from "@material-ui/pickers";
import TextField from '@material-ui/core/TextField';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import InputPago from './InputPagoReciboTable';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {useSelector,useDispatch} from 'react-redux';

moment.locale('es')

const columns = [
    {
        name: 'TipoPago',
        label: 'Tipo Pago',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'EspecificacionPago',
        label: 'EspecificacionPago',
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
        name: 'Valor',
        label: 'Valor',
        options: {
            filter: true,
            sort: false
        }
    },
    {
        name: 'Moneda',
        label: 'Moneda',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'Banco',
        label: 'Banco',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        name: 'Referencia',
        label: 'Referencia',
        options: {
            filter: true,
            sort: true
        }
    },
    {
        // name: 'TipoPago',
        label: 'Acciones',
        options: {
            filter: false,
            sort: false
        }
    },
];


const PagoReciboTable = (props) => {
    const pedidoSelected = useSelector(e=>e.pedidoSelected);
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
        //   setSelectedRowsIndex(allRowsSelected.map(row => row.dataIndex))
        // }
    }
    const Validaciones = () => {
        if(props.Pedido !== null && localStorage.getItem('Faltante') !== '0'){
            props.showAlert(true,'El valor de pago tiene que ser igual al valor del pedido seleccionado');
            return;
        }
        else{
            props.EnviarRecibo()
        }
      };
    const [habilitado,setHabilitado] = useState(true);
    const validacionFechaPago = (indexTiposPago, indexTiposdePagoDetalle,fecha,indexArray)=>{
        /*
            0 Cheque             [0=Cheque al dia,1=Cheque posfechado]
            1 Deposito           [0=Cheque al dia,1=Deduccion,2=Deposito con efectivo,3=Transferencia]
            2 Efectivo           [0=Efectivo]
            3 Letra Cambio       [0=Efectivo,1=Transferencia]
            4 Tarjeta de credito [0=Tarjeta de credito]
        */
        if(fecha!==undefined)
        {
            const isCheque      = indexTiposPago === 0;
            const isDeposito    = indexTiposPago === 1;
            const isEfectivo    = indexTiposPago === 2;
            const isLetraCambio = indexTiposPago === 3;
            const isTarjeta     = indexTiposPago === 4;

            const fechaActual   = new Date().setHours(0,0,0,0);
            const fechaRecibida = new Date(fecha).setHours(0,0,0,0);
            
            if(isEfectivo)
            {
                if(fechaRecibida>fechaActual)
                {
                    props.showAlert(true,'Efectivo: La fecha de pago no puede ser mayor que la fecha actual');
                    return;
                }

                if(fechaRecibida<fechaActual)
                {
                    props.showAlert(true,'Efectivo: La fecha de pago no puede ser menor que la fecha actual');
                    return;
                }

                props.ConfirmEditarPago(indexArray);
                setHabilitado(false);
            }
            if(isTarjeta)
            {
                if(fechaRecibida>fechaActual)
                {
                    props.showAlert(true,'Tarjeta: La fecha de pago no puede ser mayor que la fecha actual');
                    return;
                }

                if(fechaRecibida<fechaActual)
                {
                    props.showAlert(true,'Tarjeta: La fecha de pago no puede ser menor que la fecha actual');
                    return;
                }

                props.ConfirmEditarPago(indexArray);
                setHabilitado(false);
            }
            if(isCheque)
            {
                const isPosfechado = indexTiposdePagoDetalle===1;
                const isAlDia = indexTiposdePagoDetalle ===0;
                if(isPosfechado)
                {
                    if(fechaActual>fechaRecibida || fechaActual===fechaRecibida){                        
                        props.showAlert(true,'Posfechado: La fecha de pago debe ser mayor que la fecha actual');
                        return;
                    }
                }

                if(isAlDia)
                {
                    if(fechaRecibida>fechaActual)
                    {
                        props.showAlert(true,'Cheque al dia: La fecha de pago no puede ser mayor que la fecha actual');
                        return;
                    }
                }
                props.ConfirmEditarPago(indexArray);
                setHabilitado(false);
            }
            if(isDeposito)
            {
                const isChequeDia     = indexTiposdePagoDetalle === 0;
                const isDepositoe     = indexTiposdePagoDetalle === 2;
                const isTransferencia = indexTiposdePagoDetalle === 3;

                if(isChequeDia || isDepositoe || isTransferencia)
                {
                    if(fechaRecibida>fechaActual){
                        props.showAlert(true,'Deposito: La fecha de pago no debe ser mayor que la fecha actual');
                        return;
                    }
                    props.ConfirmEditarPago(indexArray);
                    setHabilitado(false);
                }
                props.ConfirmEditarPago(indexArray);
                setHabilitado(false);
            }
            if(isLetraCambio){
                props.ConfirmEditarPago(indexArray);
                setHabilitado(false);
            }
        }
    }

    const validacionDatosRecibo = (indexTiposPago, indexTiposdePagoDetalle,fecha,indexArray,valor)=>{

        
            const TotalRecibo = parseFloat(localStorage.getItem('TotalRecibo'));
            const TotalCredito = parseFloat(localStorage.getItem('totalCredito')).toFixed(2);
            const notTotal = TotalRecibo.toFixed(2)!==TotalCredito;
            const isNotAnticipo = localStorage.getItem('isAnticipo') === 'false';

            localStorage.setItem("saldoFavor",0);

            if(valor>TotalRecibo && notTotal && isNotAnticipo)
            {
                const diferencia = (valor-TotalRecibo).toFixed(2);
                Swal.fire({
                    title: 'Error',
                    text: `El valor ingresado excede el total de factura.
                            Por favor seleccione otra factura para abonar la diferencia de ${diferencia}`,
                    type: 'error',
                });
                return;
            }

            const diferencia = (valor-TotalRecibo).toFixed(2);
            const difTotal = diferencia>0?diferencia:0;
            localStorage.setItem("saldoFavor",difTotal);

        if(isNaN(valor) || valor === "")
        {
            props.showAlert(true,'El valor de pago tiene que ser un numero y no contener espacios');
            return;
        }

        if(valor==="0" || valor===0)
        {
            props.showAlert(true,'El valor de pago no puede ser igual a cero');
            return;
        }

        validacionFechaPago(indexTiposPago, indexTiposdePagoDetalle,fecha,indexArray);
    }

    const arrayPagoRecibo = (indexTiposPago, indexTiposdePagoDetalle, fecha, valor, indexMoneda, indexBanco, referencia, indexArray) => {

        return [
            props.TiposPago[indexTiposPago] ? props.TiposPago[indexTiposPago].Descripcion : '',
            props.TiposPago[indexTiposPago] ? (props.TiposPago[indexTiposPago].TiposdePagoDetalle[indexTiposdePagoDetalle] ? props.TiposPago[indexTiposPago].TiposdePagoDetalle[indexTiposdePagoDetalle].Descripcion : '') : '',
            moment(fecha).format('DD/MM/YYYY') !== "Invalid date" ? moment(fecha).format('DD/MM/YYYY') : "",
            Number(valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
            props.Monedas[indexMoneda] ? props.Monedas[indexMoneda].Moneda : '',
            props.Bancos[indexBanco] ? props.Bancos[indexBanco].NombreBanco : '',
            referencia,
            (<div className="d-flex">
                <Button className="mr-1" onClick={() => { props.SetEditPagoXRecibo(indexArray); setHabilitado(true); }}><EditIcon /></Button>
                <Button className="ml-1" onClick={() => { props.DeletePago(indexArray) }}><DeleteForeverIcon /></Button>
            </div>),
        ]
    };
    const editarArrayPagoRecibo = (indexTiposPago, indexTiposdePagoDetalle, fecha, valor, indexMoneda, indexBanco, referencia, indexArray) => {     

        return [
            // pagXRec.TipoPago,
            // pagXRec.Fecha,
            // pagXRec.Referencia,
            // pagXRec.Banco,
            // pagXRec.Valor,
            // TipoPago : '',
            // Fecha : '',
            // Referencia : '',
            // Banco : '',
            // Valor : '',

            (<Select
                value={indexTiposPago}
                onChange={(event) => {
                    props.OnpagosXReciboChange(
                        indexArray,
                        {
                            indexTiposPago: event.target.value,
                            indexTiposdePagoDetalle: indexTiposdePagoDetalle,
                            fecha: fecha,
                            valor: valor,
                            indexMoneda: indexMoneda,
                            indexBanco: indexBanco,
                            referencia: referencia
                        }
                    );
                }}
            // onChange={handleChange}
            >
                {
                    props.TiposPago.map((tipPag, index) => {
                        return (
                            <MenuItem key={index} value={index}>{tipPag.Descripcion}</MenuItem>
                        )
                    })
                }
                {/* <MenuItem value={20}>Twenty</MenuItem> */}
                {/* <MenuItem value={30}>Thirty</MenuItem> */}
            </Select>),
            (<Select
                value={indexTiposdePagoDetalle}
                onChange={(event) => {           
                    props.OnpagosXReciboChange(
                        indexArray,
                        {
                            indexTiposPago: indexTiposPago,
                            indexTiposdePagoDetalle: event.target.value,
                            fecha: fecha,
                            valor: valor,
                            indexMoneda: indexMoneda,
                            indexBanco: indexBanco,
                            referencia: referencia
                        }
                    );
                }}
            // onChange={handleChange}
            >
                {
                    !props.TiposPago[indexTiposPago] ? [] : props.TiposPago[indexTiposPago].TiposdePagoDetalle.map((tipPagDet, index) => {
                        return (
                            <MenuItem key={index} value={index}>{tipPagDet.Descripcion}</MenuItem>
                        )
                    })
                }
                {/* <MenuItem value={20}>Twenty</MenuItem> */}
                {/* <MenuItem value={30}>Thirty</MenuItem> */}
            </Select>),
            (<DatePicker
                autoOk
                variant="inline"
                format={"DD/MM/YYYY"}
                value={fecha}
                invalidDateMessage={"Fecha no es válida"}
                onChange={(date) => {

                    props.OnpagosXReciboChange(
                        indexArray,
                        {
                            indexTiposPago: indexTiposPago,
                            indexTiposdePagoDetalle: indexTiposdePagoDetalle,
                            fecha: moment(date).toDate(),
                            valor: valor,
                            indexMoneda: indexMoneda,
                            indexBanco: indexBanco,
                            referencia: referencia
                        })
                }}
            // onError={(error) => onErrorDate(error)}
            // onAccept={(date) => onAcceptDate(date)}
            // maxDateMessage={(props.coleccion.ColeccionTipo === "F") ? "La fecha es menor que la fecha final de entrega" : "Fecha no es válida"}
            // minDateMessage={(props.coleccion.ColeccionTipo === "F") ? "La fecha es menor que la fecha inicial de entrega" : "Fecha no es válida"}
            // value={fechaRecibo}
            // minDate={(props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaInicio).toDate() : moment().toDate()}
            // maxDate={(props.coleccion.ColeccionTipo === "F") ? moment(props.coleccion.EntregaFinal).toDate() : moment('2100-01-01').toDate()}
            // onChange={(date) => setFechaRecibo(date)}
            />),
            (
                <InputPago
                    valor={valor}
                    indexArray={indexArray}
                    indexTiposPago={indexTiposPago}
                    indexTiposdePagoDetalle={indexTiposdePagoDetalle}
                    fecha={fecha}
                    indexMoneda={indexMoneda}
                    indexBanco={indexBanco}
                    referencia={referencia}
                    OnpagosXReciboChange={props.OnpagosXReciboChange}
                ></InputPago >
            ),
            (<Select
                value={indexMoneda}
                onChange={(event) => {
                    props.OnpagosXReciboChange(
                        indexArray,
                        {
                            indexTiposPago: indexTiposPago,
                            indexTiposdePagoDetalle: indexTiposdePagoDetalle,
                            fecha: fecha,
                            valor: valor,
                            indexMoneda: event.target.value,
                            indexBanco: indexBanco,
                            referencia: referencia
                        }
                    );
                }}
            // onChange={handleChange}
            >
                {
                    props.Monedas.map((mon, index) => {
                        return (
                            <MenuItem key={index} value={index}>{mon.Moneda}</MenuItem>
                        )
                    })
                }
                {/* <MenuItem value={20}>Twenty</MenuItem> */}
                {/* <MenuItem value={30}>Thirty</MenuItem> */}
            </Select>),
            (<Select
                value={indexBanco}
                onChange={(event) => {
                    props.OnpagosXReciboChange(
                        indexArray,
                        {
                            indexTiposPago: indexTiposPago,
                            indexTiposdePagoDetalle: indexTiposdePagoDetalle,
                            fecha: fecha,
                            valor: valor,
                            indexMoneda: indexMoneda,
                            indexBanco: event.target.value,
                            referencia: referencia
                        }
                    );
                }}
            // onChange={handleChange}
            >
                {
                    props.Bancos.map((ban, index) => {
                        return (
                            <MenuItem key={index} value={index}>{ban.NombreBanco}</MenuItem>
                        )
                    })
                }
                {/* <MenuItem value={20}>Twenty</MenuItem> */}
                {/* <MenuItem value={30}>Thirty</MenuItem> */}
            </Select>),
            (<TextField
                value={referencia}
                onChange={(event) => {
                    props.OnpagosXReciboChange(
                        indexArray,
                        {
                            indexTiposPago: indexTiposPago,
                            indexTiposdePagoDetalle: indexTiposdePagoDetalle,
                            fecha: fecha,
                            valor: valor,
                            indexMoneda: indexMoneda,
                            indexBanco: indexBanco,
                            referencia: event.target.value
                        }
                    );
                }}
            />),

            (<div className="d-flex">
                <Button className="mr-1" onClick={() => { /*props.ConfirmEditarPago(indexArray)*/ validacionDatosRecibo(indexTiposPago, indexTiposdePagoDetalle,fecha,indexArray,valor) }}><CheckIcon /></Button>
                <Button className="ml-1" onClick={() => { props.CancelEditarPago(indexArray); setHabilitado(false)}}><CloseIcon /></Button>
            </div>),

        ];
    }
    const data = [];
    // data.push(editarArrayPagoRecibo(2, 0, null, null, 2, null, null));
    props.PagosXRecibo.forEach((pagXRec, index) => {
        if (pagXRec.Editar) {
            data.push(
                editarArrayPagoRecibo(pagXRec.indexTiposPago, pagXRec.indexTiposdePagoDetalle, pagXRec.fecha, pagXRec.valor, pagXRec.indexMoneda, pagXRec.indexBanco, pagXRec.referencia, index)
            );
        } else {
            data.push(arrayPagoRecibo(pagXRec.indexTiposPago, pagXRec.indexTiposdePagoDetalle, pagXRec.fecha, pagXRec.valor, pagXRec.indexMoneda, pagXRec.indexBanco, pagXRec.referencia, index));
        }

    });
    data.push([
        null, null, null, null, null, null, null,
        (
            <div className="d-flex">
                { (localStorage.getItem('isAnticipo')==='false' || props.Pedido !== null) &&
                <Button
                    className="mr-1"
                    style={{ textAlign: 'center' }}
                    onClick={()=>{props.OnAddPagoXRecibo(); setHabilitado(true);}}
                >
                    <AddCircleOutlineIcon />
                </Button>
                }
                <Button
                    className="ml-1"
                    onClick={() => { Validaciones() }}
                    variant="contained"
                    disabled={habilitado}
                    color="primary">
                    Pagar
                </Button>
            </div>

        )
    ]);

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                // title={'Detalle de Pagos'}
                title={''}
                data={data}
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

export default PagoReciboTable;