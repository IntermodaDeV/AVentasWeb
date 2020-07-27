import React, { useEffect, useState } from 'react';
//import { Dropdown } from "semantic-ui-react";
import CuotasACancelarTable from 'components/Recibos/Facturas/CuotasACancelarTable';
import CuotasAgrupadasACancelarTable from 'components/Recibos/Facturas/CuotasAgrupadasACancelarTable';
import CuotasACancelarAgrupadasTable from 'components/Recibos/Facturas/CuotasACancelarAgrupadasTable';
import PagoReciboTable from 'components/Recibos/Recibo/PagoReciboTable';
import FacturasModal from "components/Recibos/FacturasModal/FacturasModal";
import PedidosModal from "components/Recibos/Recibo/PedidosModal";
import Recibo from 'components/Recibos/Recibo/Recibo'
import { Card } from '@material-ui/core';
import moment from 'moment';
import 'moment/locale/es';
import { Button } from '@material-ui/core';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import { APIURL } from 'utils/Enviroment';
import { FaEye } from "react-icons/fa";
import MySnackbarContentWrapper from 'components/Global/snackbar';
import Snackbar from '@material-ui/core/Snackbar';
import {useSelector,useDispatch} from 'react-redux';
moment.locale('es');

const urlApi = APIURL



const DetalleRecibo = (props) => {
    // const [totalAPagar, setTotalAPagar] = useState(0.00);
    const [bancos, setBancos] = useState([]);
    const [ModalRecibo, setModalRecibo] = useState(false);
    const [recibosAplicados, setRecibosAplicados] = useState([]);
    const [tipoPagoEditando, setTipoPagoEditando] = useState(null);
    const [addedNewPayment, setAddedNewPayment] = useState(false);
    const [InfoModal, setInfoModal] = useState([]);
    const [openPedidoModal, setOpenPedidoModal] = useState(false);
    //const [bancoSeleccionado, setBancoSeleccionado] = useState(null);
    const [cuotasYDescuentoAplicado, setCuotasYDescuentoAplicado] = useState({
        Cuotas: [],
        DescuentoAplicado: 0,
        TotalPorPagar: 0
    });
    const [opens,setOpen] = useState(false);
    const [mensaje,setMensaje] = useState('');
    const [monedas, setMonedas] = useState([]);
    const [
        //monedaSeleccionada, 
        setMonedaSeleccionada
    ] = useState(null);
    const [tiposPago, setTiposPago] = useState([])
    const pedidoSelected = useSelector(e=>e.pedidoSelected);
    const dispatch = useDispatch();
    
    const [pagosXRecibo, setPagosXRecibo] = useState([
        {
            Editar: true,
            indexTiposPago: 2,
            indexTiposdePagoDetalle: 0,
            fecha: new Date(),
            valor: 1,//totalAPagar - cuotasYDescuentoAplicado.DescuentoAplicado,
            indexMoneda: 2,
            indexBanco: null,
            referencia: ''
        }
    ])
    // const [lineasfiltradas, setLineasfiltradas] = useState([])
    const [openModal, setOpenModal] = useState(false);
    const [DataModal, setDataModal] = useState([]);

    useEffect(() => {
        let cuotasYDescuentoCalculado = {
            Cuotas: [],
            DescuentoAplicado: 0,
            TotalPorPagar: 0
        };
        if (props.Cuotas[0].AgrupaPorCuota) {
            cuotasYDescuentoCalculado = CalculoCuotasAgrupadasYDescuento();//CalculoCuotasAgrupadasYDescuento()
        } else {
            cuotasYDescuentoCalculado = CalculoCuotasSingAgruparYDescuento();
        }
        setCuotasYDescuentoAplicado(cuotasYDescuentoCalculado);
        console.log("cuotasYDescuentoCalculado",cuotasYDescuentoCalculado)
        // eslint-disable-next-line
    }, [pagosXRecibo]);
    useEffect(() => {
        CargarDatos()
        let pago = { ...pagosXRecibo[0], valor: 1 };
        setPagosXRecibo([
            pago    //.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        ]);
        return () => {
            localStorage.removeItem("Faltante");
            localStorage.removeItem("TotalRecibo");
        }
        // eslint-disable-next-line
    }, []);

    const CuotasAgrupadas = () => {
        let cuotasSinAgrupar = [];
        let cuotasAgrupadas = [];
        props.Cuotas.forEach(fact => {
            fact.Acuerdos.forEach(acu => {
                //let facturas = [];
                acu.Facturas.forEach(fact => {
                    fact.Cuotas.forEach(cuot => {
                        if (props.CuotasAPagar.includes(cuot.IdSubFactura)) {
                            cuotasSinAgrupar.push(cuot)
                            let cuotaAgrupada = cuotasAgrupadas.find(cuotAgr => cuotAgr.NumeroCuota === cuot.NumeroCuota && cuot.FechaVencimiento === cuotAgr.FechaVencimiento && cuot.FechaMaxDescuento === cuotAgr.FechaMaxDescuento)
                            if (cuotaAgrupada) {
                                cuotaAgrupada.Valor += cuot.ValorCuota;
                                cuotaAgrupada.Saldo += cuot.Saldo;
                                cuotaAgrupada.APagar += cuot.Saldo;
                                cuotaAgrupada.ValorDescuento += cuot.Descuento;
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
                                    Cuotas: [{ ...cuot, Factura: fact }],

                                    FechaDescuento: cuot.FechaMaxDescuento,
                                    ValorDescuento: cuot.Descuento,
                                    DescuentoAplicado: 0,
                                    APagar: cuot.Saldo,
                                    PagoAplicado: 0,
                                    Moneda: cuot.IdMoneda,
                                });
                            }
                            // let dias = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days');
                            // let diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days');
                        }
                    });

                });
            });
        });

        return cuotasAgrupadas;

    }
    const CalculoCuotasAgrupadasYDescuento = () => {
        let descuentoAcumulado = 0;
        let cuotasAProcesar = CuotasAgrupadas().sort((a, b) => {
            if (a.NumeroCuota > b.NumeroCuota) {
                return 1;
            }
            if (a.NumeroCuota < b.NumeroCuota) {
                return -1;
            }
            return 0;
        });
        pagosXRecibo.forEach(pago => {
            let PagoAcumulado = Number(pago.valor);
            let fechaPago = pago.fecha;
            if (PagoAcumulado > 0) {
                cuotasAProcesar.forEach(cuotProc => {
                    let aplicaADescuento = moment(fechaPago).isSameOrBefore(cuotProc.FechaDescuento, 'days');
                    let montoAPagar = aplicaADescuento ? (cuotProc.Saldo - cuotProc.PagoAplicado - cuotProc.ValorDescuento) : (cuotProc.Saldo - cuotProc.PagoAplicado);
                    if (montoAPagar > 0) {
                        if (montoAPagar > PagoAcumulado) {
                            cuotProc.PagoAplicado += PagoAcumulado;
                            PagoAcumulado = 0;
                        }
                        if (montoAPagar <= PagoAcumulado) {
                            cuotProc.PagoAplicado += montoAPagar;
                            PagoAcumulado -= montoAPagar;
                            if (aplicaADescuento) {
                                cuotProc.DescuentoAplicado = cuotProc.ValorDescuento;
                                descuentoAcumulado += cuotProc.ValorDescuento;
                                // cuotProc.APagar = montoAPagar;
                            }
                        }
                        if (aplicaADescuento) {
                            cuotProc.APagar = montoAPagar;
                        }
                    }
                });
            }
        });
        const cuotas = cuotasAProcesar.map(cuotAgru => {
            return [
                cuotAgru.NumeroCuota, //Cuota:
                cuotAgru.NumeroFactura, //Factura:
                moment(cuotAgru.FechaVencimiento).format("DD/MM/YYYY"), //Fecha:
                moment(cuotAgru.FechaDescuento).format("DD/MM/YYYY"), //FechaDescuento:
                cuotAgru.Moneda, //DiasDescuento  
                Number(cuotAgru.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Valor:
                Number(cuotAgru.ValorDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //ValorDescuento:
                Number(cuotAgru.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Saldo:
                Number(cuotAgru.DescuentoAplicado).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //DescuentoAplicado:
                Number(cuotAgru.APagar).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //APagar:
                Number(cuotAgru.PagoAplicado).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //PagoAplicado:
                <FaEye onClick={(event) => { OpenModal(event, cuotAgru.Cuotas) }} size={"20px"} />, //Acciones:
            ]
        });
        return {
            Cuotas: cuotas,
            DescuentoAplicado: descuentoAcumulado
        }
    }
    const CalculoCuotasSingAgruparYDescuento = () => {
        let descuentoAcumulado = 0;
        let cuotasAProcesar = CuotasSinAgrupar();
        let valorPagos = 0;
        let Descuento = 0;
        pagosXRecibo.forEach(pago => {
            let PagoAcumulado = Number(pago.valor);
            let fechaPago = pago.fecha;
            if (PagoAcumulado > 0) {
                cuotasAProcesar.forEach(cuotProc => {
                    let aplicaADescuento = moment(fechaPago).isSameOrBefore(cuotProc.FechaDescuento, 'days');
                    let montoAPagar = aplicaADescuento ? (cuotProc.Saldo - cuotProc.PagoAplicado - cuotProc.ValorDescuento) : (cuotProc.Saldo - cuotProc.PagoAplicado);
                    valorPagos += montoAPagar;
                    Descuento += aplicaADescuento ? cuotProc.ValorDescuento : 0;
                    if (montoAPagar > 0) {
                        if (montoAPagar > PagoAcumulado) {
                            cuotProc.PagoAplicado += PagoAcumulado;
                            PagoAcumulado = 0;
                        }
                        if (montoAPagar <= PagoAcumulado) {
                            cuotProc.PagoAplicado += montoAPagar;
                            PagoAcumulado -= montoAPagar;
                            if (aplicaADescuento) {
                                cuotProc.DescuentoAplicado = cuotProc.ValorDescuento;
                                descuentoAcumulado += cuotProc.ValorDescuento;
                                // cuotProc.APagar = montoAPagar;
                            }
                        }
                        if (aplicaADescuento) {
                            cuotProc.APagar = montoAPagar;
                        }
                    }
                });
            }
        });
        const cuotasProcesadas = cuotasAProcesar.map(cuotProc => {
            return [
                cuotProc.Tipo, //Tipo  
                cuotProc.NumeroFactura, //Numero Factura  
                cuotProc.NumeroFEL, //Numero Factura  
                moment(cuotProc.Fecha).format("DD/MM/YYYY"), //Fecha  
                moment(cuotProc.FechaVencimiento).format("DD/MM/YYYY"), //FechaVencimiento  
                cuotProc.Dias, //Dias  
                moment(cuotProc.FechaDescuento).format("DD/MM/YYYY") !== "Invalid date" ? moment(cuotProc.FechaDescuento).format("DD/MM/YYYY") : "", //FechaDescuento  
                isNaN(cuotProc.DiasDescuento) ? "": cuotProc.DiasDescuento, //DiasDescuento  
                cuotProc.Valor.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Valor  
                cuotProc.ValorDescuento.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),//Valor Descuento
                cuotProc.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Saldo 
                cuotProc.DescuentoAplicado.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),//Descuento
                (cuotProc.APagar).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),//APagar
                cuotProc.PagoAplicado.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),//Aplicado 
                cuotProc.Moneda, //DiasDescuento  
            ]
        });
        return {
            Cuotas: cuotasProcesadas,
            DescuentoAplicado: descuentoAcumulado,
            ValorAPagar : valorPagos,
            DescuentoTotal: Descuento
        };
    }
    const CuotasSinAgrupar = () => {
        let data = [];
        props.Cuotas.forEach(fact => {
            fact.Acuerdos.forEach(acu => {
                acu.Facturas.forEach(fact => {
                    fact.Cuotas.forEach(cuot => {
                        if (props.CuotasAPagar.includes(cuot.IdSubFactura)) {
                            let dias = moment(cuot.FechaVencimiento).diff(moment(new Date()), 'days');
                            let diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days');
                            // data.push([
                            //     cuot.TipoDocumento, //Tipo  
                            //     moment(fact.FechaFactura).format("DD/MM/YYYY"), //Fecha  
                            //     moment(cuot.FechaVencimiento).format("DD/MM/YYYY"), //FechaVencimiento  
                            //     dias, //Dias  
                            //     moment(cuot.FechaMaxDescuento).format("DD/MM/YYYY"), //FechaDescuento  
                            //     diasDescuento, //DiasDescuento  
                            //     cuot.ValorCuota.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Valor  
                            //     cuot.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Saldo  
                            // ]);
                            data.push({
                                Tipo: cuot.TipoDocumento, //Tipo  
                                NumeroFactura: cuot.Factura, //Numero Factura 
                                NumeroFEL: cuot.NumeroFEL, //NumeroFEL 
                                Fecha: fact.FechaFactura, //Fecha  
                                FechaVencimiento: cuot.FechaVencimiento, //FechaVencimiento  
                                Dias: dias, //Dias  
                                FechaDescuento: cuot.FechaMaxDescuento, //FechaDescuento  
                                DiasDescuento: diasDescuento, //DiasDescuento  
                                Moneda: cuot.IdMoneda, //Moneda  
                                Valor: cuot.ValorCuota, //Valor  
                                ValorDescuento: cuot.Descuento, //Valor Decuento 
                                PagoAplicado: 0,
                                DescuentoAplicado: 0,
                                Saldo: cuot.Saldo, //Saldo  
                                APagar: cuot.Saldo, //APagar  
                            });
                        }
                    });

                });
            });
        });
        return data.sort(CuotasSinAgruparSort);
    }
    const CuotasSinAgruparSort = (a, b) => {
        if (moment(a.FechaVencimiento).isBefore(b.FechaVencimiento, 'days')) {
            return -1;
        }
        if (moment(a.FechaVencimiento).isAfter(b.FechaVencimiento, 'days')) {
            return 1;
        }
        if (moment(a.FechaVencimiento).isSame(b.FechaVencimiento, 'days')) {
            return 0;
        }
    }
    useEffect(() => {
        const monedaDefault = monedas.find(mon => mon.key === 'HNL');
        if (monedaDefault) {
            monedaOnchange(monedas.find(mon => mon.key === 'HNL').value);
        }
        // eslint-disable-next-line
    }, [monedas]);


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
            let restante = 0;//totalAPagar - (Acumulado() + cuotasYDescuentoAplicado.DescuentoAplicado);
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
 
    const monedaOnchange = (moneda) => {
        // var val = JSON.parse(especificacionPago);
        setMonedaSeleccionada(moneda);
    }

    const cargarClientes = () => {
        fetch(urlApi + '/api/cliente', {
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
                dispatch({type:'STORE_RECIBO_CLIENTES',clientes:result})
              },
              // Note: it's important to handle errors here
              // instead of a catch() block so that we don't swallow
              // exceptions from actual bugs in components.
              error => {
    
              }
            )
          }
        })
      }

    const Finalizar = () => {
        setModalRecibo(false);
        cargarClientes();
        dispatch({type:'delete_pedidoselected'})
        props.history.push(`/recibos`);
    }

    const EnviarRecibo = () => {

        const saldoAFavor = parseFloat(localStorage.getItem('saldoFavor'));
        let apiURL     = urlApi + "/api/Recibo";
        let parametros = {
            Fecha: pagosXRecibo[0].fecha,
            FechaPago: pagosXRecibo[0].fecha,
            SaldoFavor:saldoAFavor,
            Pagos: pagosXRecibo.map(pagXRecib => {
                return {
                    "CodigoTipoPago": tiposPago[pagXRecib.indexTiposPago].IdTipoPago,//"EFECTIVO",
                    "IdBanco": pagXRecib.indexBanco ? bancos[pagXRecib.indexBanco].IdBanco : null,//"",
                    "Orden": 1,
                    "Valor": pagXRecib.valor-saldoAFavor,//104613.1000,
                    "IdMoneda": monedas[pagXRecib.indexMoneda].IdMoneda,//"HNL",
                    "Referencia": pagXRecib.referencia,//"",
                    "ReferenciaTransaccionAbierta": ""
                }
            })
            ,
            Descripcion: '',
            SubFacturas: props.CuotasAPagar,
            NumPedido:(pedidoSelected!==null) ? pedidoSelected.NumeroPedido : null,
            EsContado : props.Cliente.Nombre.includes("CONSUMIDOR FINAL")? "1" : "0",
        }

        if(localStorage.getItem('isAnticipo') === 'true'){
                apiURL = urlApi + "/api/Recibo/Anticipo";
    
                parametros = {
                    Fecha: pagosXRecibo[0].fecha,
                    CodigoCliente:props.Cliente.Codigo,
                    Tipo:(pedidoSelected!==null) ? "Anticipo [B-C]" : "Anticipo [T-O]",
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
                    NumPedido:(pedidoSelected!==null) ? pedidoSelected.NumeroPedido : null,
                    EsContado : props.Cliente.Nombre.includes("CONSUMIDOR FINAL")? "1" : "0",
                }
        }

        let loading = Swal.fire({
            title: 'Enviando',
            allowOutsideClick: false,
            onBeforeOpen: () => {
                Swal.showLoading()
            },
        });

        fetch(apiURL, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization':
                    'Bearer ' + localStorage.getItem('token')
            },
            method: 'POST',
            body: JSON.stringify(parametros)  
        })
            .then(res => {
                loading.close();
                if (res.status === 200) {
                    localStorage.setItem('isAnticipo',false);
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
            DataModal.push({
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
        setDataModal(DataModal);
    }

    const OpenPedidosModal = () => {
        //event.stopPropagation();
        setOpenPedidoModal(true);
        let InfoModal = [];
        
        props.Cliente.Pedido.forEach(ped => {
            InfoModal.push({
                PedidoId : ped.PedidoId,
                NumeroPedido: ped.NumeroPedido,
                CodigoPaquete: ped.CodigoColeccion,
                Paquete: ped.NombreColeccion,
                FechaEntrega: moment(ped.FechaEntrega).format("DD/MM/YYYY"), 
                Fecha: moment(ped.FechaActual).format("DD/MM/YYYY"),
                TotalPedido: Number(ped.TotalXPedido),
                ClienteContado: ped.ClienteContadoId,
            }
            )
        });
        setInfoModal(InfoModal);
    }

    const showAlert = (abrir,mensaje)=>{
            setOpen(abrir);
            setMensaje(mensaje); 
    }

    const handleClose=()=>{        
        setOpen(false);
    }

    return (
        <div>
            {props.Cliente.Pedido.length !== 0? <h3>Pago Recibido <Button color="primary" onClick={() => { OpenPedidosModal() }} variant="contained" className="float-right" style={{marginRight: '110px'}}>Asociar Pedido</Button></h3> : <h3>Pago Recibido</h3>}
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
                        Pedido = {pedidoSelected}
                        showAlert={showAlert}
                    ></PagoReciboTable>
                </Card>

            </div>
            <h3>Detalle Facturas a Cancelar</h3>
            <div className="row">
                <div className="col-lg-3 col-md-4 col-sm-5 col-12 my-2">
                    <CuotasAgrupadasACancelarTable
                        Cuotas={props.Cuotas}
                        CuotasAPagar={props.CuotasAPagar}
                        SetLineasfiltradas={() => { }}
                        Acumulado={Acumulado}
                        PedidoSelected = {pedidoSelected}
                        DescuentoAplicado={cuotasYDescuentoAplicado.DescuentoAplicado}
                        ValorPagos = {cuotasYDescuentoAplicado.ValorAPagar}
                        Descuento = {cuotasYDescuentoAplicado.DescuentoTotal}
                    />
                </div>
                <div className="col-lg-9 col-md-8 col-sm-7 col-12 my-2">

                    {
                        props.Cuotas[0].AgrupaPorCuota ?
                            <CuotasACancelarAgrupadasTable
                                moment={moment}
                                CuotasAgrupadas={cuotasYDescuentoAplicado.Cuotas}


                            // ColSpan={rowData.length + 1}
                            // NumeroAcuerdo={data[rowMeta.dataIndex].Numero}
                            // SelectedRowsIndexXAcuerdo={selectedRowsIndexXAcuerdo}
                            // SetCuotasAPagar={(newArray) => { setCuotasSeleccionadas(data[rowMeta.dataIndex].Numero, newArray) }}
                            />
                            :
                            <CuotasACancelarTable
                                CuotasSinAgruparACancelar={cuotasYDescuentoAplicado.Cuotas}
                            />
                    }

                    <FacturasModal Data={DataModal} Open={openModal} onClose={setOpenModal}></FacturasModal>
                    <PedidosModal Data={InfoModal} Open={openPedidoModal} onClose={setOpenPedidoModal}></PedidosModal>
                </div>

            </div>
            {
                ModalRecibo &&
                <Recibo
                    Finalizar={Finalizar}
                    Cliente={props.Cliente}
                    Open={ModalRecibo}
                    RecibosAplicados={recibosAplicados}/>
            }

            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} style={{ zIndex: 10 }} open={opens} onClose={handleClose} autoHideDuration={6000}>
                <MySnackbarContentWrapper
                    variant="error"
                    message={mensaje}
                    onClose={handleClose}
                />
            </Snackbar>
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
    let empresa = localStorage.getItem('empresa');
    fetch(urlApi + "/api/Moneda/" + empresa, {
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