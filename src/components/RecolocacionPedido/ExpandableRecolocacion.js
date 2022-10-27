import React, { useState } from 'react';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Typography,
} from '@material-ui/core';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumenExpandable.module.css';
import ProductoTableRecolocacion from './ProductoTableRecolocacion';

export const ExpandableRecolocacion = ({ producto, codigoProducto, tallas, grupoTalla, eliminarProducto, totalCantidad, actualizarProducto }) => {
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
                            <Typography>{codigoProducto}</Typography>
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
                                        <th className={styles.ThTest} >Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ProductoTableRecolocacion
                                        codigoProducto={codigoProducto}
                                        futuro={false}
                                        producto={producto}
                                        onfocus={() => { }}
                                        grupoTalla={grupoTalla}
                                        tallas={tallas}
                                        index={1}
                                        index1={2}
                                        productoConCantindad={false}
                                        mostrarVacios={false}
                                        Eliminar={eliminarProducto}
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