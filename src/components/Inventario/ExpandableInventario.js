import React, { useState, useEffect } from 'react';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Typography,
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumenExpandable.module.css';
import ProductoTableInventario from './ProductoTableInventario';
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';

export const ExpandableInventario = ({ producto, codigoProducto, tallas, grupoTalla, eliminarProducto, eliminarColor, ingresoCantidad, totalCantidad, actualizarProducto }) => {
    const [expandir, setExpandir] = useState(false);

    return (
        <div className="w-100 my-2 rounded">
            <ExpansionPanel expanded={expandir} onChange={() => { setExpandir(!expandir) }}>
                <ExpansionPanelSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <div className="row w-100">
                        <div className="col-xl-3 pb-xl-0 pb-2 col-6 pl-0">
                            <Typography>{producto.NombreProducto}</Typography>
                        </div>
                        <div className="col-xl-3 px-xl-3 pb-xl-0 pb-2 col-6 px-0">
                            <Typography>{codigoProducto.split('-')[0]}</Typography>
                        </div>
                        <div className="col-xl-3 px-xl-3 col-6 px-0">
                            <Typography className={styles.BorderHeader}>
                                Unidades:
                                <span>
                                    {totalCantidad}
                                </span>
                            </Typography>
                        </div>
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    {expandir &&
                        <div className={styles.HeaderTest}>
                            <table className={'table table-bordered'} style={{ borderColor: '#aaa', overflow: "auto" }}>
                                <thead>
                                    <tr className={styles.TrTest}>
                                        <th className={styles.ThTest}>
                                            Color
                                        </th>
                                        {tallas.map((talla, index) => {
                                            return (
                                                <th className={styles.ThTest} key={index}>

                                                    <div className="text-center">
                                                        <div>{talla.Talla}</div>
                                                    </div>
                                                </th>
                                            )
                                        })}
                                        <th className={styles.ThTest} >Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ProductoTableInventario
                                        codigoProducto={codigoProducto}
                                        futuro={false}
                                        producto={producto}
                                        onfocus={() => { }}
                                        onValueChange={ingresoCantidad}
                                        grupoTalla={grupoTalla}
                                        tallas={tallas}
                                        index={1}
                                        index1={2}
                                        productoConCantindad={false}
                                        mostrarVacios={false}
                                        Eliminar={eliminarProducto}
                                        eliminarColor={eliminarColor}
                                    />
                                </tbody>
                            </table>
                        </div>
                    }
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </div>
    )
}