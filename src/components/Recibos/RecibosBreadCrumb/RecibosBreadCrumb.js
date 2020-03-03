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
        <div>
            <div className="row">
                <div className="col" style={{ textAlign: 'left' }}>
                    <Switch>
                        <Route path={props.match.url + '/TipoCredito'} exact render={(routeProps) => (
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Recibos") }, Titulo: props.cliente.Codigo },
                                    { Titulo: "Tipo Credito" }
                                ]}
                            />
                        )} />
                        <Route path={props.match.url + '/Detalle'} exact render={(routeProps) => (
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Recibos") }, Titulo: props.cliente.Codigo },
                                    { Click: () => { props.clickBreadCrumb("/Recibos/TipoCredito") }, Titulo: props.cuotas[0].TipoPedido },
                                    { Click: () => { props.clickBreadCrumb(`/Recibos/${props.cuotas[0].TipoPedido}/Facturas`) }, Titulo: 'Facturas'},
                                    { Titulo: "Detalle" }
                                ]}
                            />
                        )} />
                        <Route path={props.match.url + '/:TipoCredito/Facturas'} exact render={(routeProps) => (
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Recibos") }, Titulo: props.cliente.Codigo },
                                    { Click: () => { props.clickBreadCrumb("/Recibos/TipoCredito") }, Titulo: props.cuotas[0].TipoPedido },
                                    { Titulo: "Facturas" }
                                ]}
                            />
                        )} />
                         <Route path={props.match.url} component={(routeProps) => (
                             <NavigationBreadcrumb
                             BreadcrumbItems={[
                                 { Titulo: 'Cliente' }
                             ]}
                         />
                        )} />

                    </Switch>

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

           
    );
}

export default RecibosBreadCrumb;