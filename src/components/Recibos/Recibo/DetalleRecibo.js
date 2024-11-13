import React, { useEffect, useState } from 'react';
//import { Dropdown } from "semantic-ui-react";
import CuotasACancelarTable from 'components/Recibos/Facturas/CuotasACancelarTable';
import CuotasAgrupadasACancelarTable from 'components/Recibos/Facturas/CuotasAgrupadasACancelarTable';
import CuotasACancelarAgrupadasTable from 'components/Recibos/Facturas/CuotasACancelarAgrupadasTable';
import PagoReciboTable from 'components/Recibos/Recibo/PagoReciboTable';
import FacturasModal from "components/Recibos/FacturasModal/FacturasModal";
import PedidosModal from "components/Recibos/Recibo/PedidosModal";
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
import {useSelector, useDispatch} from 'react-redux';
import { verificarConexion } from 'utils/http';
import { Loading } from 'components/Global/Loading';
import axios from 'axios';
import { ObtenerCoordenadas } from 'utils/common';
moment.locale('es');

const urlApi = APIURL



const DetalleRecibo = (props) => {
    // const [totalAPagar, setTotalAPagar] = useState(0.00);
    const correlativoReciboDiario = useSelector(e=>e.CorrelativoReciboDiario);
    const correlativoRecibo = useSelector(e=>e.CorrelativoRecibo);
    const clientesCartera = useSelector(e=>e.Cartera);
    const clientes = useSelector(e=>e.Recibo.clientes);
    const Monedas = useSelector(e=>e.Monedas);
    const BancosGlobal = useSelector(e=>e.BancosGlobal);
    const TipoPagoGlobal = useSelector(e=>e.TipoPagoGlobal);
    const [bancos, setBancos] = useState([]);
    const [ModalRecibo, setModalRecibo] = useState(false);
    const [recibosAplicados, setRecibosAplicados] = useState([]);
    const [tipoPagoEditando, setTipoPagoEditando] = useState(null);
    const [addedNewPayment, setAddedNewPayment] = useState(false);
    const [InfoModal, setInfoModal] = useState([]);
    const [openPedidoModal, setOpenPedidoModal] = useState(false);
    const [loading,setLoading] = useState(false);
    const [correrValidacionAcuerdos,setCorrerValidacionAcuerdos] = useState(false);
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
    let calculo =React.useRef(1);
    let arregloModificado = [];
    const [habilitado,setHabilitado] = useState(true);
    
    const [pagosXRecibo, setPagosXRecibo] = useState([
        {
            Editar: true,
            indexTiposPago: 2,
            indexTiposdePagoDetalle: 0,
            fecha: new Date(),
            valor: '',//totalAPagar - cuotasYDescuentoAplicado.DescuentoAplicado,
            indexMoneda: 0,
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
        calculo.current+=1;
        // eslint-disable-next-line
    }, [pagosXRecibo]);

    useEffect(() => {
        
        if (props.Cuotas[0].AgrupaPorCuota) {
            let cuotasYDescuentoCalculado = {
                Cuotas: [],
                DescuentoAplicado: 0,
                TotalPorPagar: 0
            };
            cuotasYDescuentoCalculado = CalculoCuotasAgrupadasYDescuentoValidacion();
            setCuotasYDescuentoAplicado(cuotasYDescuentoCalculado);
            calculo.current += 1;
        } 
        // eslint-disable-next-line
    }, [correrValidacionAcuerdos]);

    useEffect(() => {
        validacionCorrelativoRecibo();
        CargarDatos()
        let pago = { ...pagosXRecibo[0], valor: 0 };
        setPagosXRecibo([
            pago    //.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        ]);
        return () => {
            localStorage.removeItem("Faltante");
            localStorage.removeItem("TotalRecibo");
        }
        // eslint-disable-next-line
    }, []);

    const validacionCorrelativoRecibo = async () => {
        const { correlativo } = await props.obtenerCorrelativo();
        if (correlativo === "") {
            if (!correlativoRecibo) {
                localStorage.setItem("CorrelativoRecibo", localStorage.getItem("CorrelativoReciboDiario"));
                dispatch({ type: "SET_CORRELATIVORECIBO", payload: correlativoReciboDiario });
            }
        }
        else {
            localStorage.setItem("CorrelativoRecibo", correlativo)
            dispatch({ type: "SET_CORRELATIVORECIBO", payload: correlativo });
        }
    }

    const rebajarSaldoFactura = (numFactura, numCuota, valorPago, Descuento) => {
        let arreglocopia = [];
        if(arregloModificado.length === 0)
        {
            arregloModificado = props.Clientes;
        }

        arregloModificado.filter(a => a.Codigo === props.Cliente.Codigo).forEach(function(entry) {
            
            entry.AcuerdosXTipoPedido.forEach(function(AcuerdosXTipoPedido) {

                AcuerdosXTipoPedido.Acuerdos.forEach(function(Acuerdos) {

                    Acuerdos.Facturas.filter(f => f.Factura === numFactura).forEach(function(Facturas) {
                        Facturas.Cuotas.filter(c => c.NumeroCuota === numCuota).forEach(function(Cuotas) {
                            Facturas.Saldo = Facturas.Saldo - valorPago - Descuento;
                            Cuotas.Saldo = Cuotas.Saldo - valorPago - Descuento;
                        })
                    });
                } );
            });
        });
        arreglocopia = arregloModificado;
        dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: arreglocopia });
    }

    const rebajarSaldoFacturaCartera = (numFactura, numCuota, valorPago, Descuento) => {
        let clientesCarteraCopia = clientesCartera;
        
        clientesCarteraCopia.filter(a => a.Codigo === props.Cliente.Codigo).forEach(function (entry) {

            entry.AcuerdosXTipoPedido.forEach(function (AcuerdosXTipoPedido) {

                AcuerdosXTipoPedido.Acuerdos.forEach(function (Acuerdos) {

                    Acuerdos.Facturas.filter(f => f.Factura === numFactura).forEach(function (Facturas) {
                        Facturas.Cuotas.filter(c => c.NumeroCuota === numCuota).forEach(function (Cuotas) {
                            Facturas.Saldo = Facturas.Saldo - valorPago - Descuento;
                            Cuotas.Saldo = Cuotas.Saldo - valorPago - Descuento;
                        })
                    });
                });
            });
        });

        dispatch({ type: 'SET_CARTERA', payload: clientesCarteraCopia })
    }

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
                                    Tipo : fact.Tipo,
                                    FechaFactura : cuot.FechaFactura,
                                    NumeroCuota: cuot.NumeroCuota,
                                    NumeroFactura: fact.Factura,
                                    Valor: cuot.ValorCuota,
                                    FechaVencimiento: cuot.FechaVencimiento,
                                    Saldo: cuot.Saldo,
                                    IdsSubFactura: [cuot.IdSubFactura],
                                    Cuotas: [{ ...cuot, Factura: fact }],

                                    FechaDescuento: cuot.FechaMaxDescuento,
                                    ValorDescuento: cuot.Descuento,
                                    ValorDescuentoBack:cuot.DescuentoBack,
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

    const esFacturaConMayorSaldoCuota = (facturas, factura) => {
        const nuevasFacturas = facturas.filter(x => x.NumeroCuota === factura.NumeroCuota);
        nuevasFacturas.sort((a, b) => (a.Saldo > b.Saldo) ? -1 : 1);
        return nuevasFacturas[0].Saldo === factura.Saldo;
    }

    const existeFacturaCubreDescuento = (facturas, numeroCuota, descuentoCuota) => {
        const nuevasFacturas = facturas.filter(x => x.NumeroCuota === numeroCuota);

        for (let factura of nuevasFacturas) {
            if (factura.Saldo >= descuentoCuota) {
                return true;
            }
        }

        return false;
    }

    const calcularDescuentoAplicar = (facturas, factura, descuentoCuota) => {
        const saldoMayorADescuento = factura.Saldo >= descuentoCuota;
        if (esFacturaConMayorSaldoCuota(facturas, factura) && saldoMayorADescuento) {
            return descuentoCuota;
        }

        if (existeFacturaCubreDescuento(facturas, factura.NumeroCuota, descuentoCuota)) {
            return 0;
        }

        const facturasCuota = facturas.filter(x => x.NumeroCuota === factura.NumeroCuota);
        let copiaDescuento = descuentoCuota;

        for (let facturaCuota of facturasCuota) {
            //Si es la ultima factura de la cuota devolvemos el descuento sobrante
            if (facturaCuota.NumeroFactura === facturasCuota[facturasCuota.length - 1].NumeroFactura) {
                return copiaDescuento;
            }

            if (facturaCuota.NumeroFactura === factura.NumeroFactura) {
                return copiaDescuento > facturaCuota.Saldo ? facturaCuota.Saldo : copiaDescuento;
            }

            copiaDescuento -= facturaCuota.Saldo;
        }

        return 0;
    }
    
    const CalculoCuotasAgrupadasYDescuentoValidacion = () => {
        let valorPagos = 0;
        let Descuento = 0;
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
            if (PagoAcumulado >= 0) {
                const saldoCuota = cuotasAProcesar.reduce((prev, curr) => {
                    const { NumeroCuota, Saldo } = curr;
                    if (NumeroCuota in prev) {
                        prev[NumeroCuota] = prev[NumeroCuota] + Saldo;
                        return prev;
                    }

                    prev[NumeroCuota] = Saldo;
                    return prev;
                }, {});

                const descuentoCuota = cuotasAProcesar.reduce((prev, curr) => {
                    const { NumeroCuota, ValorDescuentoBack } = curr;
                    if (!(NumeroCuota in prev)) {
                        prev[NumeroCuota] = ValorDescuentoBack;
                        return prev;
                    }

                    return prev;
                }, {});

                let pagadoCuota = {};

                for (let cuotProc of cuotasAProcesar) {
                    PagoAcumulado = Number(parseFloat(PagoAcumulado).toFixed(2));
                    const saldoTotalCuota = saldoCuota[cuotProc.NumeroCuota];
                    const descuentoTotalCuota = Number(parseFloat(descuentoCuota[cuotProc.NumeroCuota]).toFixed(2));

                    if (!(cuotProc.NumeroCuota in pagadoCuota)) {
                        pagadoCuota[cuotProc.NumeroCuota] = 0;
                    }

                    let isChequePosFechado = pago.indexTiposPago === 0 && pago.indexTiposdePagoDetalle === 1;
                    let aplicaADescuento = false;
                    let aplicaDescuentoFechaPosfechado = moment(fechaPago).isSameOrBefore(cuotProc.FechaDescuento, 'days') && !isChequePosFechado;
                    let montoAPagar = 0;
                    let descuentoAplicar = calcularDescuentoAplicar(cuotasAProcesar, cuotProc, descuentoTotalCuota);

                    if (aplicaDescuentoFechaPosfechado) {
                        let saldoRestante = Number((saldoTotalCuota - descuentoTotalCuota - pagadoCuota[cuotProc.NumeroCuota]).toFixed(2));
                        aplicaADescuento = /*PagoAcumulado === 0 ||*/ PagoAcumulado >= saldoRestante;
                        montoAPagar = aplicaADescuento ? cuotProc.Saldo - cuotProc.PagoAplicado - descuentoAplicar : cuotProc.Saldo - cuotProc.PagoAplicado;
                    } else {
                        montoAPagar = cuotProc.Saldo - cuotProc.PagoAplicado;
                    }

                    valorPagos += montoAPagar;
                    Descuento += aplicaADescuento ? Number(descuentoAplicar) : 0;
                    localStorage.setItem('valorPagos', valorPagos.toFixed(2));
                    localStorage.setItem('DescuentoFacturas', Descuento);
                    cuotProc.ValorDescuento = descuentoAplicar;

                    if (montoAPagar > 0) {
                        if (montoAPagar > PagoAcumulado) {
                            cuotProc.PagoAplicado += PagoAcumulado;
                            PagoAcumulado = 0;

                            if (aplicaADescuento) {
                                cuotProc.DescuentoAplicado = descuentoAplicar;
                                descuentoAcumulado += Number(descuentoAplicar);
                            }
                        }
                        if (montoAPagar <= PagoAcumulado) {
                            cuotProc.PagoAplicado += montoAPagar;
                            PagoAcumulado -= montoAPagar;
                            if (aplicaADescuento) {
                                cuotProc.DescuentoAplicado = descuentoAplicar;
                                descuentoAcumulado += Number(descuentoAplicar);
                            }
                        }
                        if (aplicaADescuento) {
                            cuotProc.APagar = montoAPagar;
                        }
                    } else {
                        if (aplicaADescuento) {
                            cuotProc.DescuentoAplicado = descuentoAplicar;
                            descuentoAcumulado += Number(descuentoAplicar);
                            cuotProc.APagar = montoAPagar;
                        }
                    }

                    pagadoCuota[cuotProc.NumeroCuota] = pagadoCuota[cuotProc.NumeroCuota] + montoAPagar;
                };
            }
        });
        const cuotas = cuotasAProcesar.map(cuotAgru => {
            let NumeroFel = "";
            cuotAgru.Cuotas.forEach(cuo =>{
                NumeroFel = cuo.NumeroFEL;
            })
            return [
                cuotAgru.NumeroCuota, //Cuota:
                cuotAgru.NumeroFactura, //Factura:
                NumeroFel, //NumeroFel
                moment(cuotAgru.FechaFactura).format("DD/MM/YYYY"), //Fecha:
                moment(cuotAgru.FechaDescuento).format("DD/MM/YYYY"), //FechaDescuento:
                cuotAgru.Moneda, //DiasDescuento  
                Number(cuotAgru.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Valor:
                Number(cuotAgru.ValorDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //ValorDescuento:
                Number(cuotAgru.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Saldo:
                Number(cuotAgru.DescuentoAplicado).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //DescuentoAplicado:
                Number(cuotAgru.APagar).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //APagar:
                Number(cuotAgru.PagoAplicado).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //PagoAplicado:
                <FaEye onClick={(event) => { OpenModal(event, cuotAgru.Cuotas) }} size={"20px"} />, //Acciones:
                cuotAgru.FechaFactura, // Fecha Factura
                cuotAgru.Tipo, //tipo de Documento
                
            ]
        });
        return {
            Cuotas: cuotas,
            DescuentoAplicado: descuentoAcumulado,
            ValorAPagar : Number(localStorage.getItem('valorPagos')),
            DescuentoTotal: Number(localStorage.getItem('DescuentoFacturas')),
            agrupadas: true
        }
    }
    const CalculoCuotasAgrupadasYDescuento = () => {
        let valorPagos = 0;
        let Descuento = 0;
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
            if (PagoAcumulado >= 0) {
                const saldoCuota = cuotasAProcesar.reduce((prev, curr) => {
                    const { NumeroCuota, Saldo } = curr;
                    if (NumeroCuota in prev) {
                        prev[NumeroCuota] = prev[NumeroCuota] + Saldo;
                        return prev;
                    }

                    prev[NumeroCuota] = Saldo;
                    return prev;
                }, {});

                const descuentoCuota = cuotasAProcesar.reduce((prev, curr) => {
                    const { NumeroCuota, ValorDescuentoBack } = curr;
                    if (!(NumeroCuota in prev)) {
                        prev[NumeroCuota] = ValorDescuentoBack;
                        return prev;
                    }

                    return prev;
                }, {});

                let pagadoCuota = {};

                for (let cuotProc of cuotasAProcesar) {
                    PagoAcumulado = Number(parseFloat(PagoAcumulado).toFixed(2));
                    const saldoTotalCuota = saldoCuota[cuotProc.NumeroCuota];
                    const descuentoTotalCuota = Number(parseFloat(descuentoCuota[cuotProc.NumeroCuota]).toFixed(2));

                    if (!(cuotProc.NumeroCuota in pagadoCuota)) {
                        pagadoCuota[cuotProc.NumeroCuota] = 0;
                    }

                    let isChequePosFechado = pago.indexTiposPago === 0 && pago.indexTiposdePagoDetalle === 1;
                    let aplicaADescuento = false;
                    let aplicaDescuentoFechaPosfechado = moment(fechaPago).isSameOrBefore(cuotProc.FechaDescuento, 'days') && !isChequePosFechado;
                    let montoAPagar = 0;
                    let descuentoAplicar = calcularDescuentoAplicar(cuotasAProcesar, cuotProc, descuentoTotalCuota);

                    if (aplicaDescuentoFechaPosfechado) {
                        aplicaADescuento = true;
                        montoAPagar = cuotProc.Saldo - cuotProc.PagoAplicado - descuentoAplicar;
                    } else {
                        montoAPagar = cuotProc.Saldo - cuotProc.PagoAplicado;
                    }

                    valorPagos += montoAPagar;
                    Descuento += aplicaADescuento ? Number(descuentoAplicar) : 0;
                    localStorage.setItem('valorPagos', valorPagos.toFixed(2));
                    localStorage.setItem('DescuentoFacturas', Descuento);
                    cuotProc.ValorDescuento = descuentoAplicar;

                    if (montoAPagar > 0) {
                        if (montoAPagar > PagoAcumulado) {
                            cuotProc.PagoAplicado += PagoAcumulado;
                            PagoAcumulado = 0;

                            if (aplicaADescuento) {
                                cuotProc.DescuentoAplicado = descuentoAplicar;
                                descuentoAcumulado += Number(descuentoAplicar);
                            }
                        }
                        if (montoAPagar <= PagoAcumulado) {
                            cuotProc.PagoAplicado += montoAPagar;
                            PagoAcumulado -= montoAPagar;
                            if (aplicaADescuento) {
                                cuotProc.DescuentoAplicado = descuentoAplicar;
                                descuentoAcumulado += Number(descuentoAplicar);
                            }
                        }
                        if (aplicaADescuento) {
                            cuotProc.APagar = montoAPagar;
                        }
                    } else {
                        if (aplicaADescuento) {
                            cuotProc.DescuentoAplicado = descuentoAplicar;
                            descuentoAcumulado += Number(descuentoAplicar);
                            cuotProc.APagar = montoAPagar;
                        }
                    }

                    pagadoCuota[cuotProc.NumeroCuota] = pagadoCuota[cuotProc.NumeroCuota] + montoAPagar;
                };
            }
        });
        const cuotas = cuotasAProcesar.map(cuotAgru => {
            let NumeroFel = "";
            cuotAgru.Cuotas.forEach(cuo =>{
                NumeroFel = cuo.NumeroFEL;
            })
            return [
                cuotAgru.NumeroCuota, //Cuota:
                cuotAgru.NumeroFactura, //Factura:
                NumeroFel, //NumeroFel
                moment(cuotAgru.FechaFactura).format("DD/MM/YYYY"), //Fecha:
                moment(cuotAgru.FechaDescuento).format("DD/MM/YYYY"), //FechaDescuento:
                cuotAgru.Moneda, //DiasDescuento  
                Number(cuotAgru.Valor).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Valor:
                Number(cuotAgru.ValorDescuento).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //ValorDescuento:
                Number(cuotAgru.Saldo).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Saldo:
                Number(cuotAgru.DescuentoAplicado).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //DescuentoAplicado:
                Number(cuotAgru.APagar).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //APagar:
                Number(cuotAgru.PagoAplicado).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //PagoAplicado:
                <FaEye onClick={(event) => { OpenModal(event, cuotAgru.Cuotas) }} size={"20px"} />, //Acciones:
                cuotAgru.FechaFactura, // Fecha Factura
                cuotAgru.Tipo, //tipo de Documento
                
            ]
        });
        return {
            Cuotas: cuotas,
            DescuentoAplicado: descuentoAcumulado,
            ValorAPagar : Number(localStorage.getItem('valorPagos')),
            DescuentoTotal: Number(localStorage.getItem('DescuentoFacturas')),
            agrupadas: true
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
            if (PagoAcumulado >= 0) {
                cuotasAProcesar.sort( (a,b)=> a.Fecha).forEach(cuotProc => {
                    const excepcionDescuento = cuotProc.ExcepcionDescuento;
                    let isChequePosFechado = pago.indexTiposPago === 0 && pago.indexTiposdePagoDetalle === 1;
                    let aplicaADescuento = (moment(fechaPago).isSameOrBefore(cuotProc.FechaDescuento, 'days') || excepcionDescuento) && !isChequePosFechado;
                    let montoAPagar = aplicaADescuento ? (cuotProc.Saldo - cuotProc.PagoAplicado - cuotProc.ValorDescuento) : (cuotProc.Saldo - cuotProc.PagoAplicado);
                    
                    //if(calculo.current===2){
                        valorPagos += montoAPagar;  
                        Descuento += aplicaADescuento ? Number(cuotProc.ValorDescuento) : 0; 
                        localStorage.setItem('valorPagos',valorPagos.toFixed(2));
                        localStorage.setItem('DescuentoFacturas',Descuento);                
                    //}
                    if (montoAPagar > 0) {
                        if (montoAPagar > PagoAcumulado.toFixed(2)) {
                            cuotProc.PagoAplicado += PagoAcumulado;
                            PagoAcumulado = 0;
                        }
                        if (montoAPagar <= PagoAcumulado.toFixed(2)) {
                            cuotProc.PagoAplicado += montoAPagar;
                            PagoAcumulado -= montoAPagar;
                            if (aplicaADescuento) {
                                cuotProc.DescuentoAplicado = cuotProc.ValorDescuento;
                                descuentoAcumulado += Number(cuotProc.ValorDescuento);
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
                cuotProc.Fecha, //Fecha  
                moment(cuotProc.FechaVencimiento).format("DD/MM/YYYY"), //FechaVencimiento  
                cuotProc.Dias, //Dias  
                moment(cuotProc.FechaDescuento).format("DD/MM/YYYY") !== "Invalid date" ? moment(cuotProc.FechaDescuento).format("DD/MM/YYYY") : "", //FechaDescuento  
                isNaN(cuotProc.DiasDescuento) ? "": cuotProc.DiasDescuento, //DiasDescuento  
                cuotProc.Valor.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Valor  
                cuotProc.ValorDescuento.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),//Valor Descuento
                cuotProc.Saldo.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'), //Saldo 
                cuotProc.DescuentoAplicado.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),//Descuento
                (cuotProc.APagar).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),//APagar
                cuotProc.PagoAplicado.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'),//Aplicado 
                cuotProc.Moneda, //DiasDescuento  
            ]
        });
        return {
            Cuotas: cuotasProcesadas,
            DescuentoAplicado: descuentoAcumulado,
            ValorAPagar : Number(localStorage.getItem('valorPagos')),
            DescuentoTotal: Number(localStorage.getItem('DescuentoFacturas')),
            agrupadas: false
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
                            let diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days') + 1;
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
                                ExcepcionDescuento: cuot.ExcepcionDescuento  
                            });
                        }
                    });

                });
            });
        });
        
        data.sort(CuotasSinAgruparSort);
        return data.sort((a,b)=>{
            if (a.NumeroFactura < b.NumeroFactura) {
                return -1;
              }
              if (a.NumeroFactura > b.NumeroFactura) {
        
                return 1;
              }
        
              return 0;
        })

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
        setCorrerValidacionAcuerdos(prev=>!correrValidacionAcuerdos);
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
    const cargarBancos = () => {
        let empresa = localStorage.getItem('EmpresaCliente') !== null ? localStorage.getItem('EmpresaCliente') : localStorage.getItem('empresa')
        const bancosEmpresa = BancosGlobal.filter(x=>x.EmpresaId===empresa);
        setBancos(bancosEmpresa)
        /*fetch(urlApi + "/api/banco/" + empresa, {
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
                        setBancos(result)
                    },
    
                    error => {
                        console.log(error);
                    }
                )
            }
        })*/
    };

    const cargarTiposPago = () => {
        let empresa = localStorage.getItem('EmpresaCliente') !== null ? localStorage.getItem('EmpresaCliente') : localStorage.getItem('empresa');
        const tipoPagoEmpresa = TipoPagoGlobal.filter(x=>x.EmpresaId===empresa);
        setTiposPago(tipoPagoEmpresa);
        /*fetch(urlApi + '/api/TipoPago/'+empresa, {
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
                        setTiposPago(result)
                    },
    
                    error => {
                        console.log(error);
                    }
                )
            }
        })*/
    };

    const CargarDatos = () => {
        /*Promise.all([cargarBancos, cargarTiposPago]).then(values => {
            let banks = values[0].map(el => {
                return el//{ key: el.IdBanco, value: JSON.stringify(el), text: el.Descripcion }
            });
            let tiposPago = values[1].map(el => {
                return el//{ key: el.IdTipoPago, value: JSON.stringify(el), text: el.Descripcion }
            });
            /*let monedasArray = values[2].map(el => {
                return el // { key: el.IdMoneda, value: JSON.stringify(el), text: el.Moneda }
            });
            setBancos(banks);
            setMonedas(Monedas);
            setTiposPago(tiposPago);
        });*/
        cargarBancos();
        cargarTiposPago();
        setMonedas(Monedas);
    }
 
    const monedaOnchange = (moneda) => {
        // var val = JSON.parse(especificacionPago);
        setMonedaSeleccionada(moneda);
    }

    const EnviarRecibo = async () =>{               
        ObtenerCoordenadas((position) => {
            EnviarReciboApi({
                longitude: position.coords.longitude,
                latitude: position.coords.latitude
            })
        }, (error) => {
            EnviarReciboApi(null);
        });
    }

    const cargarCliente = async () => {
        if (localStorage.getItem("Conexion") === "Online") {
          let isOnline = await verificarConexion();
          if (isOnline) {
            try {
              let request = await axios.get(`${urlApi}/api/cliente/cuenta/${props.Cliente.Codigo}`, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
              let clientesStorage = clientes;
              let index = clientesStorage.map(e => e.Codigo).indexOf(props.Cliente.Codigo);
              clientesStorage[index] = request.data;
              dispatch({ type: 'STORE_RECIBO_CLIENTES', clientes: clientesStorage });
            } catch (err) {
              console.log(err);
            }
          }
        }
      }

    const EnviarReciboApi = async (location) => {
        setLoading(true);
        const saldoAFavor = parseFloat(localStorage.getItem('saldoFavor'));
        let isOnline = await verificarConexion();
        if(!isOnline || localStorage.getItem("Conexion")==="offline")
        {
            let ValorPago = Number(pagosXRecibo.reduce((acc, curr) => { return acc + Number(curr.valor) }, 0));
            let ReciboCache = {
                ReciboId :  100 + (Math.random() * (10000 - 100)),
                NumeroRecibo : 'PR'+correlativoRecibo,
                EmpresaUsuario: localStorage.getItem('empresa'),
                ReciboProforma:true,
                LogImpresion:[],
                Mensaje:"",
                Fecha: pagosXRecibo[0].fecha,
                FechaPago: new Date(pagosXRecibo[0].fecha.setHours(0,0,0,0)),
                SaldoFavor:saldoAFavor,
                CodigoCliente: props.Cliente.Codigo,
                NombreCliente : props.Cliente.Nombre,
                Direccion : props.Cliente.Direccion,
                Asesor: localStorage.getItem('codigo'),
                Tipo: localStorage.getItem('isAnticipo') === 'true' ? "Anticipo [D-O]" : "",
                EsAnticipo : localStorage.getItem('isAnticipo') === 'true'? true : false,
                Pagos: pagosXRecibo.map(pagXRecib => {
                    return {
                        "CodigoTipoPago": tiposPago[pagXRecib.indexTiposPago].IdTipoPago,
                        "TipoPago" : tiposPago[pagXRecib.indexTiposPago].Descripcion,
                        "EspecificacionPago" : tiposPago[pagXRecib.indexTiposPago].TiposdePagoDetalle[pagXRecib.indexTiposdePagoDetalle].Descripcion,
                        "TipoPagoDetalle": tiposPago[pagXRecib.indexTiposPago].TiposdePagoDetalle[pagXRecib.indexTiposdePagoDetalle].CodigoDetalle ,
                        "IdBanco": pagXRecib.indexBanco !== null ? bancos[pagXRecib.indexBanco].IdBanco : null,
                        "Banco": pagXRecib.indexBanco!==null ? bancos[pagXRecib.indexBanco].NombreBanco : "",
                        "Orden": 1,
                        "Valor":Number(pagXRecib.valor),
                        "IdMoneda": monedas[pagXRecib.indexMoneda].IdMoneda,
                        "Referencia": pagXRecib.referencia,
                        "ReferenciaTransaccionAbierta": "",
                        "Monto": Number(pagXRecib.valor),
                    }
                }),
                Descripcion: '',
                location:location,
                SubFacturas: props.CuotasAPagar,
                NumPedido:(pedidoSelected!==null) ? pedidoSelected.NumeroPedido : null,
                EsContado : props.Cliente.Nombre.includes("CONSUMIDOR FINAL")? "1" : "0",
                CodigoUltimoRecibo : 'PR'+correlativoRecibo,
                Total :  ValorPago,
                Facturas : cuotasYDescuentoAplicado.Cuotas.map(fact => {              
                    let NumeroCuota = cuotasYDescuentoAplicado.agrupadas ? fact[0] : 0;
                    let descuento = cuotasYDescuentoAplicado.agrupadas ? fact[9].replace(',', '') :  fact[11].replace(',', '');
                    let Aplicado = localStorage.getItem('isAnticipo') === 'true' ? ValorPago : cuotasYDescuentoAplicado.agrupadas ?  Number(fact[11].replace(',', '')) : Number(fact[13].replace(',', ''));
                    rebajarSaldoFactura(fact[1], NumeroCuota,Aplicado,descuento);
                    rebajarSaldoFacturaCartera(fact[1], NumeroCuota,Aplicado,descuento);
                    return {
                        "Aplicado" : Aplicado,
                        "Dias" :cuotasYDescuentoAplicado.agrupadas ? "" : fact[5],
                        "EsAbono" :cuotasYDescuentoAplicado.agrupadas ? fact[11] !== fact[10] ? true : false : fact[12] !== fact[13] ? true : false,
                        "Fecha" :cuotasYDescuentoAplicado.agrupadas ?  fact[13] : fact[3],
                        "IdFactura" : fact[1],
                        "NumeroFEL" : "",
                        "Parcial" :localStorage.getItem('isAnticipo') === 'true' ? ValorPago : cuotasYDescuentoAplicado.agrupadas ? fact[8].replace(',', '') : fact[12].replace(',', ''),
                        "Parcial2" : descuento,
                        "TipoDocumento" : cuotasYDescuentoAplicado.agrupadas ? fact[14] : fact[0]
                    }
                }),
            }
            Swal.fire({
                type: 'warning',
                title: 'Advertencia',
                text: "Actualmente no dispone de internet el recibo se guardara en cache.",
            });
            setRecibosAplicados(ReciboCache);
            dispatch({ type: "SET_RECIBOSENCACHE", payload: ReciboCache });

            //Incremento
            let CorrelativoActual = correlativoRecibo;
            let Iniciales = CorrelativoActual.substring(0, CorrelativoActual.lastIndexOf('-') + 1);
            let NumeroActual = CorrelativoActual.substring(CorrelativoActual.lastIndexOf('-') + 1);
            let NumeroSiguiente = Number(NumeroActual) + 1;
            localStorage.setItem("CorrelativoRecibo", Iniciales + NumeroSiguiente);
            const nuevoCorrelativo = Iniciales + NumeroSiguiente;
            dispatch({ type: "SET_CORRELATIVORECIBO", payload: nuevoCorrelativo });
            
            setModalRecibo(true);
            setLoading(false);
            setHabilitado(false);
        }
        else
        {
    
        let apiURL     = urlApi + "/api/Recibo";
        let parametros = {
            CodigoCliente: props.Cliente.Codigo,
            Fecha: pagosXRecibo[0].fecha,
            FechaPago: new Date(pagosXRecibo[0].fecha.setHours(0,0,0,0)),
            SaldoFavor:saldoAFavor,
            Pagos: pagosXRecibo.map(pagXRecib => {
                return {
                    "CodigoTipoPago": tiposPago[pagXRecib.indexTiposPago].IdTipoPago,
                    "TipoPagoDetalle": tiposPago[pagXRecib.indexTiposPago].TiposdePagoDetalle[pagXRecib.indexTiposdePagoDetalle].CodigoDetalle ,
                    "IdBanco": pagXRecib.indexBanco!==null ? bancos[pagXRecib.indexBanco].IdBanco : null,
                    "Orden": 1,
                    "Valor": pagXRecib.valor,
                    "IdMoneda": monedas[pagXRecib.indexMoneda].IdMoneda,
                    "Referencia": pagXRecib.referencia,
                    "ReferenciaTransaccionAbierta": ""
                }
            })
            ,
            NumeroRecibo : correlativoRecibo,
            EmpresaUsuario: localStorage.getItem('empresa'),
            Descripcion: '',
            location:location,
            SubFacturas: props.CuotasAPagar,
            NumPedido:(pedidoSelected!==null) ? pedidoSelected.NumeroPedido : null,
            EsContado : props.Cliente.Nombre.includes("CONSUMIDOR FINAL")? "1" : "0",
        }

        if(localStorage.getItem('isAnticipo') === 'true'){
                apiURL = urlApi + "/api/Recibo/Anticipo";
    
                parametros = {
                    Fecha: pagosXRecibo[0].fecha,
                    EmpresaUsuario: localStorage.getItem('empresa'),
                    NumeroRecibo : correlativoRecibo,
                    CodigoCliente:props.Cliente.Codigo,
                    Tipo:(pedidoSelected!==null) ? "Anticipo [B-C]" : "Anticipo [T-O]",
                    FechaPago: new Date(pagosXRecibo[0].fecha.setHours(0,0,0,0)),
                    Pagos: pagosXRecibo.map(pagXRecib => {
                        return {
                            "CodigoTipoPago": tiposPago[pagXRecib.indexTiposPago].IdTipoPago,//"EFECTIVO",
                            "TipoPagoDetalle": tiposPago[pagXRecib.indexTiposPago].TiposdePagoDetalle[pagXRecib.indexTiposdePagoDetalle].CodigoDetalle ,
                            "IdBanco": pagXRecib.indexBanco!=null ? bancos[pagXRecib.indexBanco].IdBanco : null,//"",
                            "Orden": 1,
                            "Valor": pagXRecib.valor,//104613.1000,
                            "IdMoneda": monedas[pagXRecib.indexMoneda].IdMoneda,//"HNL",
                            "Referencia": pagXRecib.referencia,//"",
                            "ReferenciaTransaccionAbierta": ""
                        }
                    })
                    ,
                    Descripcion: '',
                    location:location,
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
                                setLoading(false);
                                setHabilitado(false);

                                //Incremento
                                let CorrelativoActual = correlativoRecibo;
                                let Iniciales = CorrelativoActual.substring(0, CorrelativoActual.lastIndexOf('-') + 1);
                                let NumeroActual = CorrelativoActual.substring(CorrelativoActual.lastIndexOf('-') + 1);
                                let NumeroSiguiente = Number(NumeroActual) + 1;
                                localStorage.setItem("CorrelativoRecibo", Iniciales + NumeroSiguiente);
                                const nuevoCorrelativo = Iniciales + NumeroSiguiente;
                                dispatch({ type: "SET_CORRELATIVORECIBO", payload: nuevoCorrelativo });

                                cargarCliente();
                                dispatch({type:'DELETE_RECIBO_CUOTASCUENTACORRIENTE'})
                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                setLoading(true);
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
                                    title: 'Error ' + result.ErrorCode,
                                    text: result.Message,
                                })
                                setLoading(false);
                                setHabilitado(false);
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
                diasDescuento = moment(cuot.FechaMaxDescuento).diff(moment(new Date()), 'days') + 1;
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
            <Loading open={loading} title="Cargando"/>
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
                        setHabilitado={setHabilitado}
                        habilitado={habilitado}
                        facturas={cuotasYDescuentoAplicado.Cuotas}
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
                props.CargarImpresion(recibosAplicados)
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

/*const cargarMonedas = new Promise((resolve, reject) => {
    let empresa = localStorage.getItem('EmpresaCliente');
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
});*/
export default DetalleRecibo;