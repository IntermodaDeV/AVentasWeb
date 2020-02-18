import React, { useState } from "react";
import { ExpandMore, InfoOutlined } from '@material-ui/icons';
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary } from '@material-ui/core';
import styles from 'components/Pedidos/ProductoDetalle/VistaProducto.module.css';
import Base from "assets/img/Icon/Base.png";
import Brand from "assets/img/Icon/Brand.png";
import Category from "assets/img/Icon/Category.png";
import Fabric from "assets/img/Icon/Fabric.png";
import Type from "assets/img/Icon/Type.png";

const Expandable = (props) => {
    const [Expandido, setExpandido] = useState(false);

    const handleChange = panel => (event, isExpanded) => {
        setExpandido(isExpanded ? panel : false);
    };

    return (
        <ExpansionPanel className="border border-primary" expanded={Expandido} onChange={handleChange(props.producto.NombreProducto)}>
            <ExpansionPanelSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <h5 className="font-weight-light"><InfoOutlined></InfoOutlined> Información</h5>

            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                {
                    Expandido &&
                    <>
                        <div className="col-12 p-0">
                            <div className="row">
                                {props.producto.AtributosXProducto.map((element, index) => {
                                    let tipo = element.Tipo.toLowerCase();
                                    let icono = null;
                                    switch (tipo) {
                                        case 'base':
                                            icono = Base;
                                            break;
                                        case 'marca':
                                            icono = Brand;
                                            break;
                                        case 'categoria':
                                            icono = Category;
                                            break;
                                        case 'tejido':
                                            icono = Fabric;
                                            break;
                                        case 'tipo':
                                            icono = Type;
                                            break;
                                        default:
                                            icono = Brand;
                                            break;
                                    }
                                    return (
                                        <div key={index} className="col-md-6 my-3">

                                            <div className="row">
                                                <img alt={"Icono"} className={styles.Icon} src={icono} />
                                                <div className={"ml-2 " + styles.IconContainer}>
                                                    <h5 className={styles.IconTitle}>{element.Tipo}
                                                        <br></br>
                                                        <small className={styles.Subtitle}>
                                                            {element.Descripcion}
                                                        </small>
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                }

            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
}
export default Expandable;