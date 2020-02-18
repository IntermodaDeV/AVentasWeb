import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
} from '@material-ui/core';
import styles from "components/Recibos/SelectCliente/TableClienteSelected.module.css";
import { SyncLoader } from "react-spinners";



const TableCliente = (props) => {
    const [LoadingCliente, setLoadingCliente] = useState(true);
    const [CuentaCorriente, setCuentaCorriente] = useState(null);

    const urlApi = 'https://aventas.devcit.com:3044';

    useEffect(() => {
        // if(props.location.state&&props.location.state.Cliente) {
        //   ? props.location.state.CodigoCliente : null
        // }
        cargarCuentaCorriente()
        // eslint-disable-next-line
    }, [props.clienteSelected.Codigo]);
    console.log('props :', props);

    const cargarCuentaCorriente = () => {
        setLoadingCliente(true);
        setCuentaCorriente(null);
        fetch(urlApi + `/api/Cliente/CuentaCorriente/?codigoCliente=${props.clienteSelected.Codigo}`, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        }).then(res => {
            if (res.status === 401) {
                localStorage.setItem('token', '')
            }
            if (res.status === 200) {
                res.json().then(
                    result => {
                        setLoadingCliente(false);
                        setCuentaCorriente(result)
                    },
                    // Note: it's important to handle errors here
                    // instead of a catch() block so that we don't swallow
                    // exceptions from actual bugs in components.
                    error => {
                        this.setState({
                            error
                        })
                    }
                )
            }
        })
    }

    return (
        <>

            {
                LoadingCliente &&

                <div style={{ textAlign: "center", marginTop: '25px' }}>
                    <SyncLoader
                        size={20}
                        color={'#31547C'}
                        loading={LoadingCliente} />
                </div>
            }

            {
                (CuentaCorriente !== null) &&
                <div className="row mt-3">
                    <div className="col-12 p-0">

                        <Card>
                            <CardContent>
                                <div className="row">
                                    <div className="col-md-6">
                                        <span className={styles["TCenterContainer"]}>
                                            <h5 className={styles["TCenter"]}>Información General</h5>
                                        </span>
                                        <table className='table' style={{ border: "none" }}>
                                            <tbody>
                                                <tr>
                                                    <td className={styles.InfoLabel}>
                                                        {'Codigo: '}
                                                    </td>
                                                    <td className={styles.InfoLabelDetail}>
                                                        {props.autocompleteValue}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={styles.InfoLabel} >
                                                        {'Departamento: '}
                                                    </td>
                                                    <td className={styles.InfoLabelDetail}>
                                                        {props.autocompleteValue}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className={styles.InfoLabel}>
                                                        {'Nombre:'}
                                                    </td>
                                                    <td className={styles.InfoLabelDetail}>
                                                        {props.autocompleteValue}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={styles.InfoLabel}>
                                                        {'Estado Crediticio: '}
                                                    </td>
                                                    <td className={styles.InfoLabelDetail}>
                                                        {props.autocompleteValue}</td>
                                                </tr>
                                                <tr>
                                                    <td className={styles.InfoLabel}>
                                                        {'Direccion: '}
                                                    </td>
                                                    <td className={styles.InfoLabelDetail}>
                                                        {props.autocompleteValue}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-md-6">
                                        <span className={styles["TCenterContainer"]}>
                                            <h5 className={styles["TCenter"]}>Información Crediticia</h5>
                                        </span>
                                        <table className="table">

                                            <thead>
                                                <tr>
                                                    <th>
                                                        Tipo
                                    </th>
                                                    <th>
                                                        Disponible
                                    </th>
                                                    <th>
                                                        SaldoTotal
                                    </th>
                                                    <th>
                                                        -15 Dias
                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                <tr>

                                                    <td>{<b>Total</b>}</td>
                                                    <td></td>
                                                    <td>{props.autocompleteValue} </td>
                                                    <td>{props.autocompleteValue} </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>

                            </CardContent>
                        </Card>
                    </div>
                </div>
            }


        </>
    )
}

export default TableCliente;