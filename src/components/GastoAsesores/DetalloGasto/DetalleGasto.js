import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { Fab } from "@material-ui/core";
import styles from 'components/ListadoPedidos/DetallePedido.module.css';
import moment from "moment";
import 'moment/locale/es';
import { APIURL } from 'utils/Enviroment';
import { Button } from "@material-ui/core";
import axios from 'axios';

moment.locale('es');
const DetalleGasto = (props) => {
    const [imagen, setImagen] = useState('');

    const getImagen = async () => {
        try {
            const request = await axios.get(`${APIURL}/api/Gira/GastoFotografia/${props.id}`);
            setImagen('data:image/png;base64,' + request.data)
        } catch (err) {
            console.log('error IMG: ' + err)
        }
    }

    useEffect(() => {
        getImagen()
        // eslint-disable-next-line
    }, [])
    
    return (
        <div className="px-3">
            <div>
                <Fab size="small" color="default" onClick={() => props.RegresarGastosPendientes()} className={"mx-1"} style={{ transform: 'scale(0.8)' }}>
                    <FaArrowLeft size={"15px"} />
                </Fab>
                <h3 className="m-auto" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    Detalle Gasto
                </h3>
                <hr />
            </div>
            <div className="px-3">
                <div className="row">
                    <div className="col-md-6 col-12 my-md-0 mb-3 p-0 pr-md-2">
                        <h5 className={"font-weight-light"}>
                            Imagen:
                        </h5>
                        {
                            imagen ?
                                <div style={{ height: '300px', width: '80%', alignItems: "center" }} >
                                    <p style={{ textAlign: 'center' }}>
                                        <img src={imagen} width="50%" height="auto" />
                                        <br />
                                        <span className="mr-1">
                                            <a href={imagen} download="factura.png" style={{ textDecoration: 'none' }}>
                                                <Button className='my-1' variant="outlined" size="small" color={"primary"}>Descargar Imagen</Button>
                                            </a>
                                        </span>
                                    </p>
                                </div>

                                :
                                <div>
                                    Imagen no disponible
                                </div>
                        }
                    </div>
                    <div className="col-md-6 col-12 p-0 pl-md-2">
                        <h5 className={"font-weight-light"}>
                            Información:
                        </h5>
                        <table className="table table-xl-responsive table-striped" style={{ border: 'none' }}>
                            <tbody>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Tipo: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.detalle.tipo}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Categoria: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.detalle.categoria}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Asesor: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.detalle.UsuarioAsesor}
                                    </td>
                                </tr>
                                {
                                    props.detalle.serie &&
                                    <tr>
                                        <td className={styles.InfoLabel}>
                                            {'No Serie: '}
                                        </td>
                                        <td className={styles.InfoLabelDetail}>
                                            {props.detalle.serie}
                                        </td>
                                    </tr>
                                }
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'No Factura: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.detalle.NoFactura}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Descripcion: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.detalle.Descripcion}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Importe Exento: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.detalle.importeExento}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Importe Gravado: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.detalle.importeGravado}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Total: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {props.detalle.ValorFactura}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Fecha Factura: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {moment(props.detalle.FechaFactura).format("DD/MM/YYYY")}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.InfoLabel}>
                                        {'Fecha Creacion: '}
                                    </td>
                                    <td className={styles.InfoLabelDetail}>
                                        {moment(props.detalle.FechaCreacion).format("DD/MM/YYYY HH:MM")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetalleGasto;