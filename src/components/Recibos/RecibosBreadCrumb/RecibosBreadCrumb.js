import React from 'react';
import styles from 'components/Recibos/RecibosBreadCrumb/RecibosBreadCrumb.module.css';
import { Route, Switch } from 'react-router-dom';
import NavigationBreadcrumb from 'components/Pedidos/NavigationBreadcrumb/NavigationBreadcrumb';
import { FaSignOutAlt } from 'react-icons/fa';
import { Dropdown } from 'element-react';
import moment from "moment";
import 'moment/locale/es';
moment.locale('es');

const RecibosBreadCrumb = (props) => {
    return (
        <Switch>
            <Route path={props.match.ur} component={(routeProps) => (
                <div>
                    <div className="row">
                        <div className="col" style={{ textAlign: 'left' }}>
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Titulo: 'Cliente' }
                                ]}
                            />
                        </div>
                        {
                            props.cliente &&
                            <div className="col" style={{ textAlign: 'right' }}>
                                <Dropdown
                                    onCommand={props.cancelarRecibo}
                                    menu={(
                                        <Dropdown.Menu>
                                            <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                        </Dropdown.Menu>
                                    )}
                                >
                                    <span >
                                        <FaSignOutAlt className={styles.FaSignOutAlt} />
                                    </span>
                                </Dropdown>
                            </div>
                        }
                    </div>
                </div>
            )} />
            <Route path={props.match.url + '/:'} component={(routeProps) => (
                <div>
                    <div className="row">
                        <div className="col" style={{ textAlign: 'left' }}>
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Linea") }, Titulo: props.LineaSeleccionada.Linea },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/TipoPedido") }, Titulo: props.TipoPedido.TipoPedido },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones") }, Titulo: 'Colecciones' },
                                    { Click: () => { props.clickBreadCrumb("/Pedidos/Colecciones/" + props.coleccion.ColeccionTipo + "/" + props.coleccion.CodigoColeccion) }, Titulo: props.coleccion.Nombre },
                                    { Titulo: props.cliente.Nombre }
                                ]}
                            />
                        </div>
                        {
                            props.cliente &&
                            <div className="col" style={{ textAlign: 'right' }}>
                                <Dropdown
                                    onCommand={props.cancelarRecibo}
                                    menu={(
                                        <Dropdown.Menu>
                                            <Dropdown.Item command="">Cancelar</Dropdown.Item>
                                        </Dropdown.Menu>
                                    )}
                                >
                                    <span >
                                        <FaSignOutAlt className={styles.FaSignOutAlt} />
                                    </span>
                                </Dropdown>
                            </div>
                        }
                    </div>
                </div>
            )} />
        </Switch>
    );
}

export default RecibosBreadCrumb;