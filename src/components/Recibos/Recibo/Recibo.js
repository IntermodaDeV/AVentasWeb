import React, { useState } from 'react';
import {Button } from '@material-ui/core';
import ReactToPrint from 'react-to-print';
import Logo from 'assets/img/logo/LogoSinLetrasB.png';
import styles from "components/Recibos/Recibo/Recibo.module.css";
import moment from "moment";
import 'moment/locale/es';
import {useSelector,useDispatch} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {FiArrowRightCircle} from "react-icons/fi";
import { FaPrint } from "react-icons/fa";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ObtenerCoordenadas } from 'utils/common';
import { APIURL } from 'utils/Enviroment';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const Recibo = (props) => {
    const [showModalUpload,setShowModalUpload] = useState(true);
    const [numeroImpresion,setNumeroImpresion] = useState(0);
    const [imagenDepositos,setImagenDepositos] = useState();
    const clientesContado = useSelector(e=>e.clientesContado);
    const Monedas = useSelector(e=>e.AbreviacionMonedas);
    const pedidoSelected = useSelector(k => k.pedidoSelected);
    const empresas = useSelector(e=>e.Empresas);
    const empresaCliente = props.Cliente.Codigo.split("-")[0];
    const empresa = empresas.find(x=>x.COMPANY_CODE === empresaCliente.toUpperCase());
    let NombreCliente = props.Cliente.Nombre;
    let DireccionCliente = props.Cliente.Direccion;
    const clienteContado = pedidoSelected !== null && pedidoSelected !== undefined ? clientesContado.find(x=>x.id=== pedidoSelected.ClienteContado) : null;
    let Total = props.RecibosAplicados.Total;
    const moneda = Monedas.find(e=>e.IdMoneda===props.Cliente.Moneda).Abreviacion;
    const RecibosEnCache = useSelector(e=>e.RecibosEnCache);
    const dispatch = useDispatch();
    if(clienteContado!==null && clienteContado!==undefined)
    {
        if(Total < 10000)
        {
            NombreCliente = 'CONSUMIDOR FINAL';
        }else{
            NombreCliente = clienteContado.Nombre;
        }

        DireccionCliente = clienteContado.Direccion;
    }

    if(props.RecibosAplicados.Mensaje.includes("flotante")){
        Swal.fire({
            type: 'warning',
            title: 'Advertencia',
            text: props.RecibosAplicados.Mensaje,
        })
    }
    //const FechaEntrega = new Date();
    const componentRef = React.useRef();
    const useStyles = makeStyles((theme) => ({
        button: {
          marginLeft: theme.spacing(2),
          marginRight: theme.spacing(2),
        },
      }));
    const classes = useStyles();

    const RegistrarLogs = async () => {
        let logRecibo = {};
            ObtenerCoordenadas((position) => {
                logRecibo = {
                    numRecibo: props.RecibosAplicados.CodigoUltimoRecibo,
                    Usuario: localStorage.getItem("codigo"),
                    Fecha: new Date(),
                    Latitude: position.coords.latitude,
                    Longitude: position.coords.longitude
                };
                postLogRecibos(logRecibo);
            }, (error) => {
                logRecibo = {
                    numRecibo: props.RecibosAplicados.CodigoUltimoRecibo,
                    Usuario: localStorage.getItem("codigo"),
                    Fecha: new Date(),
                    Latitude: null,
                    Longitude: null
                };
                postLogRecibos(logRecibo);
            });
    }

    const postLogRecibos = async (data) => {
        if (localStorage.getItem("Conexion") === "offline") {
            let copiaEstado = RecibosEnCache;
            let indice = copiaEstado.map(x => x.CodigoUltimoRecibo).indexOf(data.numRecibo);
            copiaEstado[indice].LogImpresion = [...copiaEstado[indice].LogImpresion, data];
            dispatch({ type: "SET_RECIBOSENCACHELOG", payload: copiaEstado });
            setNumeroImpresion((prev) => (prev + 1));
            return;
        }

        try {
            const request = await axios.post(`${APIURL}/api/logImpresionRecibo`, data);
            setNumeroImpresion((prev) => (prev + 1));
            return request.data;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    const handleFilesChange=(e)=>{
        setImagenDepositos(e.target.files);
    }

    const uploadDepositos = async () => {
        try {
            if ( imagenDepositos === undefined) {
                alert("Seleccione uno o varios depositos para subir.");
                return;
            }

            let formData = new FormData();

            for (let i = 0; i < imagenDepositos.length; i++) {
                formData.append(`images`, imagenDepositos[i]);
            }

            await axios.post(`${APIURL}/api/recibo/comprobantes/${props.RecibosAplicados.CodigoUltimoRecibo}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Depositos subidos con exito.");
            setShowModalUpload(false);
            setImagenDepositos(undefined);
        } catch (err) {
            alert("Ocurrio un error y no se pudieron subir los depositos");
        }
    }

   return (
        <div className="col">
            {
                props.Cliente &&
                <div>
                       <Dialog
                           open={showModalUpload}
                           onClose={() => setShowModalUpload(false)}>
                           <DialogTitle id="scroll-dialog-title">
                               <h2>Cargar depositos</h2>
                           </DialogTitle>
                           <DialogContent>
                               <input
                                   type='file'
                                   accept="image/*"
                                   multiple
                                   onChange={handleFilesChange}
                               />
                               {imagenDepositos !== undefined && <Button
                                   onClick={uploadDepositos}
                                   color="primary"
                                   variant="outlined"
                               >
                                   Cargar depositos
                               </Button>}
                           </DialogContent>
                       </Dialog>
                        <div className="text-right">
                            <div className="col">
                                    <ReactToPrint
                                        trigger={() =>
                                        <Button variant="contained" size="large" color="primary" endIcon = {<FaPrint/>}>
                                            Imprimir
                                        </Button>
                                        }
                                        content={() => componentRef.current}
                                        onAfterPrint={() => RegistrarLogs()}
                                    />

                                <Button onClick={() => props.Finalizar()} className = {classes.button} variant="contained" size="large" color="primary" endIcon ={<FiArrowRightCircle/>}>
                                        Finalizar
                                </Button>
                            </div>
                            <hr />
                        </div>
                
                   <div id={"invoice-POS"} ref={componentRef} style={{ boxShadow: 'unset' }}>
                       <div id="top">
                           <div className="row">
                               <img className="pr-3" alt={"Logo"} width={180} style={{ objectFit: 'contain' }} src={Logo} ></img>

                               <div className="col text-left m-auto">
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <h2 className={"m-0 " + styles.Title}>
                                           {empresa.NAME}
                                       </h2>
                                       <h4 style={{ fontWeight: 'bolder' }}>{(numeroImpresion <= 4 ? "Original" : "Copia")}</h4>
                                   </div>
                                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <h3 className={"font-weight-normal " + styles.LineHeight_Normal}>
                                           {empresa.FISCAL_DOCUMENT}: {empresa.NIFCIF}
                                       </h3>
                                       <h5 style={{ fontWeight: 'bolder' }}> Impresión No. {numeroImpresion + 1}</h5>
                                   </div>
                               </div>
                           </div>
                           <div className="row">
                                    <div className="col p-0 text-left">
                                        <h3 className={"font-weight-normal  m-auto " + styles.LineHeight_Normal}>
                                            {props.Cliente.Codigo}
                                        </h3>
                                    </div>
                                    <div className="col p-0 text-center">
                                        <h2 className={"font-weight-bold " + styles.Title + styles.LineHeight_1_5}>
                                            {'No. ' + props.RecibosAplicados.CodigoUltimoRecibo}
                                        </h2>
                                    </div>
                                </div>
                           <div className="row">
                               <div className="col p-0 text-left">
                                   <h3 className={"font-weight-bold " + styles.LineHeight_1_5}>
                                       {NombreCliente}
                                   </h3>
                               </div>
                           </div>
                                <div className="col-12 p-0 text-left">
                                    <p>
                                        {DireccionCliente}
                                    </p>
                                </div>
                            </div>

                            <div id="mid">
                                <div className="row py-2">
                                    <div className="col-12 py-2 p-0">
                                        <p>

                                            Fecha: {moment().format('DD/MM/YYYY hh:mm a')}
                                        </p>
                                    </div>
                                    <div className="col-12 p-0">
                                        <table className="table table-striped table-xl-responsive">

                                            <thead>
                                                <tr>
                                                    <th>
                                                        Tipo Pago
                                                    </th>
                                                    <th>
                                                        Esp. Pago
                                                    </th>
                                                    <th>
                                                        Fecha
                                                    </th>
                                                    <th>
                                                        Referencia
                                                    </th>
                                                    <th>
                                                        Banco
                                                    </th>
                                                    <th>
                                                        Monto
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {props.RecibosAplicados.Pagos.map((pag, index) => (

                                                    <tr key={index} className={styles.TableRow}>
                                                        <td>
                                                            {pag.TipoPago}
                                                        </td>
                                                        <td>
                                                            {pag.EspecificacionPago}
                                                        </td>
                                                        <td>
                                                            {moment(pag.Fecha).format("DD/MM/YYYY")}
                                                        </td>
                                                        <td>
                                                            {pag.Referencia}
                                                        </td>
                                                        <td>
                                                            {pag.Banco}
                                                        </td>
                                                        <td className={styles.TableCellAmmount}>
                                                            {numberWithCommas(pag.Monto)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-12 p-0">
                                        <table className="table table-striped table-xl-responsive">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        Documento
                                                    </th>
                                                    <th>
                                                        Fecha
                                                    </th>
                                                    <th>

                                                    </th>
                                                    <th>

                                                    </th>
                                                    <th>
                                                        Parcial
                                                    </th>
                                                    <th>
                                                        Aplicado
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {props.RecibosAplicados.Facturas.map((factu, index) => (
                                                    <React.Fragment key={index}>
                                                        <tr className={styles.TableRow + " " + styles.TableRowNoBorder}>
                                                            <td>
                                                                {factu.TipoDocumento}
                                                            </td>
                                                            <td>
                                                                {moment(factu.Fecha).format("DD/MM/YYYY")}
                                                            </td>
                                                            <td>
                                                             {factu.EsAbono === true && "Abono"}
                                                             {factu.EsAbono === false && "Cancelado"}
                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {numberWithCommas(Number(factu.Parcial))}
                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {/*Numero de cuota en acuerdo */}
                                                                {factu.cuota ? "Cuota: " + factu.cuota : ""}
                                                            </td>
                                                        </tr>
                                                        <tr className={styles.TableRow + " " + styles.TableRowNoBorder}>
                                                            <td>
                                                                {factu.IdFactura}
                                                                { factu.NumeroFEL !== "" && factu.NumeroFEL !== null  && 
                                                                " - FEL:" + factu.NumeroFEL                                                    
                                                                } 
                                                            </td>
                                                            <td>
                                                                {"Dias: " + factu.Dias}
                                                            </td>
                                                            <td>
                                                                {/* D */}
                                                                Desc
                                                                {/* {factu.Parcial2 !=='0' ? 'D':'' } */}
                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {/* -618.24 */}
                                                                {numberWithCommas(Number(factu.Parcial2))}
                                                                {/* {factu.Parcial2} */}
                                                            </td>
                                                            <td className={styles.TableCellAmmount}>
                                                                {numberWithCommas(factu.Aplicado)}
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-12 p-0">
                                        <h3 className={"font-weight-bold text-right " + styles.LineHeight_Normal}>
                                            Total Recibo: {moneda} {numberWithCommas(props.RecibosAplicados.Total)}
                                        </h3>
                                    </div>

                                    <div className="col-6 p-0 m-auto" style={{ display: "flex", flexDirection: "column" }}>
                                    {( localStorage.getItem("firmarecibo") !== null && localStorage.getItem("firmarecibo") !== "" )&& <img alt="Firma asesor" src={localStorage.getItem("firmarecibo")} style={{ height: 150, alignSelf: "center" }} />}
                                        <div className={styles.FirmaContainer} style={{ marginTop: (localStorage.getItem("firmarecibo") !== null && localStorage.getItem("firmarecibo") !== "" ) ? 16 : 160 }}>
                                            <h4 className={"font-weight-bold text-center " + styles.LineHeight_Normal}>
                                                {localStorage.getItem('asesor')}
                                            </h4>
                                            <br/>
                                            {props.RecibosAplicados.ReciboProforma && <h4 style={{textAlign:'center',fontWeight:'bolder'}}>Proforma Provisional</h4>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                 }
        </div >
     
    )
}

const numberWithCommas = (x) => {
    x = x.toFixed(2);
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export default Recibo;