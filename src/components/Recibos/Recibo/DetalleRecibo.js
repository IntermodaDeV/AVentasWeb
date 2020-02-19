import React, { useEffect, useState } from 'react';
//import { Dropdown } from "semantic-ui-react";
import CuotasACancelarTable from 'components/Recibos/Facturas/CuotasACancelarTable';
import CuotasAgrupadasACancelarTable from 'components/Recibos/Facturas/CuotasAgrupadasACancelarTable';
import CuotasACancelarAgrupadasTable from 'components/Recibos/Facturas/CuotasACancelarAgrupadasTable';
import PagoReciboTable from 'components/Recibos/Recibo/PagoReciboTable';
import FacturasModal from "components/Recibos/FacturasModal/FacturasModal";
import Recibo from 'components/Recibos/Recibo/Recibo'
import { Card } from '@material-ui/core';
import moment from 'moment';
import 'moment/locale/es';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
moment.locale('es')

const urlApi = 'https://aventas.devcit.com:3044'



const DetalleRecibo = (props) => {
    const [totalAPagar, setTotalAPagar] = useState(0.00);
    const [bancos, setBancos] = useState([]);
    const [ModalRecibo, setModalRecibo] = useState(false);
    const [recibosAplicados, setRecibosAplicados] = useState([]);
    const [tipoPagoEditando, setTipoPagoEditando] = useState(null);
    const [addedNewPayment, setAddedNewPayment] = useState(false);
    //const [bancoSeleccionado, setBancoSeleccionado] = useState(null);
    const [monedas, setMonedas] = useState([]);
    const [
        //monedaSeleccionada, 
        setMonedaSeleccionada
    ] = useState(null);
    const [tiposPago, setTiposPago] = useState([])
    //const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState(null)
    //const [especificacionesPago, setEspecificacionesPago] = useState([])
    //const [especificacionPagoSeleccionada, setEspecificacionPagoSeleccionada] = useState(null)
    //const [fechaRecibo, setFechaRecibo] = useState(moment().toDate())
    //const [valor, setValor] = useState(0)
    //const [referencia, setReferencia] = useState('')
    const [pagosXRecibo, setPagosXRecibo] = useState([
        {
            Editar: false,
            indexTiposPago: 2,
            indexTiposdePagoDetalle: 0,
            fecha: new Date(),
            valor: totalAPagar,
            indexMoneda: 2,
            indexBanco: null,
            referencia: ''
        }
    ])
    const [lineasfiltradas, setLineasfiltradas] = useState([])
    const [openModal, setOpenModal] = useState(false);
    const [DataModal, setDataModal] = useState([]);

    useEffect(() => {
        CargarDatos()
        let totalPorPagar = 0.00;
        props.Cuotas.forEach(fact => {
            fact.Acuerdos.forEach(acu => {
                acu.Facturas.forEach(fact => {
                    fact.Cuotas.forEach(cuot => {
                        if (props.CuotasAPagar.includes(cuot.IdSubFactura)) {
                            totalPorPagar += cuot.Saldo;
                        }
                    });

                });
            });
        });
        setTotalAPagar(totalPorPagar);
        setPagosXRecibo([{
            ...pagosXRecibo[0], valor: totalPorPagar //.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        }])
        // const [pagosXRecibo, setPagosXRecibo] = useState([
        //     {
        //         indexTiposPago: 2,
        //         indexTiposdePagoDetalle: 0,
        //         fecha: new Date(),
        //         valor: totalAPagar,
        //         indexMoneda: 2,
        //         indexBanco: null,
        //         referencia: ''
        //     }
        // ])

        return () => {
            localStorage.removeItem("Faltante");
            localStorage.removeItem("TotalRecibo");
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const monedaDefault = monedas.find(mon => mon.key === 'HNL');
        if (monedaDefault) {
            monedaOnchange(monedas.find(mon => mon.key === 'HNL').value);
        }
        // eslint-disable-next-line
    }, [monedas]);

    const CloseModal = (state) => {
        setModalRecibo(state)
    }

    const onPagosXReciboChange = (index, newPago) => {
        let pagos = [...pagosXRecibo];
        let pago = { ...newPago };
        pago.Editar = true;
        pagos[index] = pago;
        setPagosXRecibo(pagos);
    }
    const Acumulado = () => {
        return Number(pagosXRecibo.reduce((acc, curr) => { return acc + Number(curr.valor) }, 0))
    }
    const onAddPagoXRecibo = () => {
        if (!tipoPagoEditando) {
            let pagos = [...pagosXRecibo];
            let restante = totalAPagar - Acumulado();
            let valor = restante > 0 ? restante : 0
            let pago = {
                Editar: true,
                indexTiposPago: 2,
                indexTiposdePagoDetalle: 0,
                fecha: new Date(),
                valor: valor,
                indexMoneda: 2,
                indexBanco: null,
                referencia: ''
            };
            pagos.push(pago);
            setAddedNewPayment(true);
            setPagosXRecibo(pagos);
            setTipoPagoEditando(pago);
        }

    }
    const confirmEditarPago = (index) => {
        let pagos = [...pagosXRecibo];
        let pago = { ...pagos[index] };
        pago.Editar = false;
        pagos[index] = pago;
        setPagosXRecibo(pagos);
        setTipoPagoEditando(null);
        setAddedNewPayment(false);
    }
    const deletePago = (index) => {
        if (!tipoPagoEditando && pagosXRecibo.length > 1) {

            let pagos = [...pagosXRecibo];
            if (pagos.length > 0) {
                pagos.splice(index, 1)

                setPagosXRecibo(pagos);
            }
        }
    }
    const cancelEditarPago = (index) => {
        let pagos = [...pagosXRecibo];

        if (addedNewPayment) {
            pagos.splice(index, 1)
            setPagosXRecibo(pagos);
        }
        else {
            let pago = { ...tipoPagoEditando };
            pago.Editar = false;
            pagos[index] = pago;
        }
        setPagosXRecibo(pagos);
        setTipoPagoEditando(null);
        setAddedNewPayment(false);
    }
    const setEditPagoXRecibo = (index) => {
        if (!tipoPagoEditando) {
            let pagos = [...pagosXRecibo];
            let pago = pagos[index];
            pago.Editar = true;
            pagos[index] = pago;
            setPagosXRecibo(pagos);
            setTipoPagoEditando(pago);
        }
    }
    const CargarDatos = () => {
        Promise.all([cargarBancos, cargarTiposPago, cargarMonedas]).then(values => {
            let banks = values[0].map(el => {
                return el//{ key: el.IdBanco, value: JSON.stringify(el), text: el.Descripcion }
            });
            let tiposPago = values[1].map(el => {
                return el//{ key: el.IdTipoPago, value: JSON.stringify(el), text: el.Descripcion }
            });
            let monedasArray = values[2].map(el => {
                return el // { key: el.IdMoneda, value: JSON.stringify(el), text: el.Moneda }
            });
            setBancos(banks);
            setMonedas(monedasArray);
            setTiposPago(tiposPago);
        });
    }
    // const tipoPagoSeleccionadoOnChange = (tipoPago) => {
    //     var val = JSON.parse(tipoPago);
    //     setEspecificacionesPago(val.TiposdePagoDetalle.map(el => {
    //         return { key: el.IdTipoPagoDetalle, value: JSON.stringify(el), text: el.Descripcion }
    //     }));
    //     setTipoPagoSeleccionado(tipoPago);
    // }
    // const especificacionPagoSeleccionadaoOnChange = (especificacionPago) => {
    //     // var val = JSON.parse(especificacionPago);
    //     setEspecificacionPagoSeleccionada(especificacionPago);
    // }
    const monedaOnchange = (moneda) => {
        // var val = JSON.parse(especificacionPago);
        setMonedaSeleccionada(moneda);
    }
    const EnviarRecibo = () => {

        let loading = Swal.fire({
            title: 'Enviando',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            },
        });

        fetch(urlApi + "/api/Recibo", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization':
                    'Bearer ' + localStorage.getItem('token')
            },
            method: 'POST',
            body: JSON.stringify({
                Fecha: pagosXRecibo[0].fecha,
                FechaPago: pagosXRecibo[0].fecha,
                Pagos: pagosXRecibo.map(pagXRecib => {
                    return {
                        "CodigoTipoPago": tiposPago[pagXRecib.indexTiposPago].IdTipoPago,//"EFECTIVO",
                        "IdBanco": pagXRecib.indexBanco ? bancos[pagXRecib.indexBanco].IdBanco : null,//"",
                        "Orden": 1,
                        "Valor": pagXRecib.valor,//104613.1000,
                        "IdMoneda": monedas[pagXRecib.indexMoneda].IdMoneda,//"HNL",
                        "Referencia": pagXRecib.referencia,//"",
                        "ReferenciaTransaccionAbierta": ""
                    }
                })
                ,
                Descripcion: '',
                SubFacturas: props.CuotasAPagar,
            })
        })
            .then(res => {
                loading.close();
                if (res.status === 200) {
                    res.json()
                        .then(
                            (result) => {
                                setRecibosAplicados(result);
                                setModalRecibo(true);
                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                Swal.fire({
                                    type: 'error',
                                    title: 'Error',
                                    text: error.Message,
                                })
                            }
                        )
                }
                else {
                    res.json()
                        .then(
                            (result) => {
                                Swal.fire({
                                    type: 'error',
                                    title: 'Error',
                                    text: result.Message,
                                })

                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {

                            }
                        )
                }
            });
    }
    const OpenModal = (event, cuotas) => {
        event.stopPropagation();
        setOpenModal(true);
        let DataModal = [];

        cuotas.forEach(cuot => {
            let dias = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days')
            let diasDescuento = 0;
            let fechaDescuento = moment(cuot.FechaMaxDescuento);
            if (fechaDescuento.isValid()) {
                diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days');
            }
            DataModal.push(
                {
                    NumeroFactura: cuot.Factura.Factura,
                    Dias: dias,
                    DiasDescuento: diasDescuento,
                    Tipo: cuot.TipoDocumento,
                    Fecha: moment(cuot.Factura.FechaFactura).format("DD/MM/YYYY"),
                    Vencimiento: moment(cuot.FechaVencimiento).format("DD/MM/YYYY"),
                    FechaDescuento: fechaDescuento.isValid() ? fechaDescuento.format("DD/MM/YYYY") : "",
                    Valor: cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                    Saldo: cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),
                    //   C15Dias: fact.C15Dias.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),

                }
            )
        });


        /* DataModal.push({
          Tipo: 'Factura [D-P]',
          NumeroFactura: '2',
          Fecha: '18/10/2019',
          Vencimiento: '31/12/2019',
          Dias: '-13',
          FechaDescuento: '16/12/2019',
          DiasDescuento: '-28',
          Valor: '696,969.00',
          Saldo: '323,886.00',
    
        });
     */
        setDataModal(DataModal);
    }
    return (
        <div>
            <h3>Detalle Recibo</h3>
            <div className="row">
                <Card style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <PagoReciboTable
                        Bancos={bancos}
                        EnviarRecibo={EnviarRecibo}
                        Monedas={monedas}
                        TiposPago={tiposPago}
                        EspecificacionesPago
                        PagosXRecibo={pagosXRecibo}
                        OnpagosXReciboChange={onPagosXReciboChange}
                        OnAddPagoXRecibo={onAddPagoXRecibo}
                        SetEditPagoXRecibo={setEditPagoXRecibo}
                        ConfirmEditarPago={confirmEditarPago}
                        CancelEditarPago={cancelEditarPago}
                        DeletePago={deletePago}
                    ></PagoReciboTable>
                </Card>

            </div>
            <h3>Detalle Facturas a Cancelar</h3>
            <div className="row">
                <div className="col-lg-3 col-md-4 col-sm-5 col-12 my-2">
                    <CuotasAgrupadasACancelarTable
                        Cuotas={props.Cuotas}
                        CuotasAPagar={props.CuotasAPagar}
                        SetLineasfiltradas={setLineasfiltradas}
                        Acumulado={Acumulado}
                    />
                </div>
                <div className="col-lg-9 col-md-8 col-sm-7 col-12 my-2">

                    {
                        props.Cuotas[0].AgrupaPorCuota ?
                            <CuotasACancelarAgrupadasTable
                                onClick={OpenModal}
                                moment={moment}

                                // ColSpan={rowData.length + 1}
                                Cuotas={props.Cuotas}
                                CuotasAPagar={props.CuotasAPagar}
                            // NumeroAcuerdo={data[rowMeta.dataIndex].Numero}
                            // SelectedRowsIndexXAcuerdo={selectedRowsIndexXAcuerdo}
                            // SetCuotasAPagar={(newArray) => { setCuotasSeleccionadas(data[rowMeta.dataIndex].Numero, newArray) }}
                            />
                            :
                            <CuotasACancelarTable
                                Cuotas={props.Cuotas}
                                CuotasAPagar={props.CuotasAPagar}
                                EliminarCuota={props.EliminarCuota}
                                Lineasfiltradas={lineasfiltradas}
                            />

                    }
                    <FacturasModal Data={DataModal} Open={openModal} onClose={setOpenModal}></FacturasModal>
                </div>

            </div>
            {
                ModalRecibo &&
                <Recibo
                    Cliente={props.Cliente}
                    Open={ModalRecibo}
                    RecibosAplicados={recibosAplicados}
                    Close={CloseModal} />
            }
        </div>);
}
const cargarTiposPago = new Promise((resolve, reject) => {
    fetch(urlApi + '/api/TipoPago', {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        if (res.status === 401) {
            localStorage.setItem('token', '')
            window.location.reload()
        }
        if (res.status === 200) {
            res.json().then(
                result => {
                    resolve(result)
                },

                error => {
                    reject({
                        error
                    })
                }
            )
        }
    })
});
const cargarBancos = new Promise((resolve, reject) => {
    fetch(urlApi + '/api/banco', {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        if (res.status === 401) {
            localStorage.setItem('token', '')
            window.location.reload()
        }
        if (res.status === 200) {
            res.json().then(
                result => {
                    resolve(result)
                },

                error => {
                    reject({
                        error
                    })
                }
            )
        }
    })
});
const cargarMonedas = new Promise((resolve, reject) => {
    fetch(urlApi + '/api/Moneda', {
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        }
    }).then(res => {
        if (res.status === 401) {
            localStorage.setItem('token', '')
            window.location.reload()
        }
        if (res.status === 200) {
            res.json().then(
                result => {
                    resolve(result)
                },

                error => {
                    reject({
                        error
                    })
                }
            )
        }
    })
});
export default DetalleRecibo;