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

export const ExpandableNoEncontrados = ({ totalCantidad, productos }) => {
    const [expandir, setExpandir] = useState(false);

    return (
        <div className="w-100 my-2 rounded">
            <ExpansionPanel expanded={expandir} onChange={() => { setExpandir(!expandir) }}>
                <ExpansionPanelSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    style={{ backgroundColor: 'rgba(255, 0, 0, 0.29)' }}
                >
                    <div className="row w-100">
                        <div className="col-xl-3 px-xl-3 pb-xl-0 pb-2 col-6 px-0">
                            <Typography style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'center' }}>PRODUCTOS NO ENCONTRADOS</Typography>
                        </div>
                        <div className="col-xl-3 px-xl-3 col-6 px-0">
                            <Typography style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'center' }}>
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
                                            Cod.Barra
                                        </th>
                                        <th className={styles.ThTest}>
                                            Unidades
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map((prod, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    {prod.codigoBarra}
                                                </td>
                                                <td>
                                                    {prod.cantidad}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    }
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </div>
    )
}