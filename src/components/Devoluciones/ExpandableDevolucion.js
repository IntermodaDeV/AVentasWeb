import React, { useState } from 'react';
import {
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Typography,
} from '@material-ui/core';
import { Dropdown } from "semantic-ui-react";
import { useSelector } from 'react-redux';
import styles from 'components/Pedidos/MatrizResumen/MatrizResumenExpandable.module.css';
import ProductoTableDevolucion from './ProductoTableDevolucion';

export const ExpandableDevolucion = ({ producto, codigoProducto, tallas, grupoTalla, eliminarProducto, eliminarColor, ingresoCantidad, totalCantidad }) => {
    const [expandir, setExpandir] = useState(false);
    const devolucionCompleta = useSelector(e => e.Devolucion.devolucionCompleta);

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
                        {!devolucionCompleta &&
                            <div className="col-xl-3 px-xl-3 col-6 px-0">
                                <Dropdown
                                    placeholder="Seleccione Factura"
                                    search
                                    selection
                                    options={[{ key: 1, value: 1, text: "uno" }]}
                                    noResultsMessage={"No hay resultados"}
                                    closeOnChange={true}
                                    style={{ zIndex: 999 }}
                                    multiple={false}
                                />
                            </div>
                        }
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
                                    <ProductoTableDevolucion
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
                                        devolucionCompleta={!devolucionCompleta}
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