import React from 'react'
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
                <Button className="mr-1" onClick={() => { props.SetEditPagoXRecibo(indexArray) }}><EditIcon /></Button>
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
                <Button className="mr-1" onClick={() => { props.ConfirmEditarPago(indexArray) }}><CheckIcon /></Button>
                <Button className="ml-1" onClick={() => { props.CancelEditarPago(indexArray) }}><CloseIcon /></Button>
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
                <Button
                    className="mr-1"
                    style={{ textAlign: 'center' }}
                    onClick={props.OnAddPagoXRecibo}
                >
                    <AddCircleOutlineIcon />
                </Button>

                <Button
                    className="ml-1"
                    onClick={() => { props.EnviarRecibo() }}
                    variant="contained"
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