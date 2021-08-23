import React from 'react';
import styles from 'components/Recibos/RecibosBreadCrumb/RecibosBreadCrumb.module.css';
import { Route, Switch } from 'react-router-dom';
import NavigationBreadcrumb from 'components/Pedidos/NavigationBreadcrumb/NavigationBreadcrumb';
import { FaSignOutAlt } from 'react-icons/fa';
import { Dropdown } from 'element-react';
import moment from "moment";
import 'moment/locale/es';
moment.locale('es');

const DevolucionesBreadCrumb = (props) => {
    return (
        <div>
            <div className="row">
                <div className="col" style={{ textAlign: 'left' }}>
                    <Switch>
                        <Route path={props.match.url + '/productos'} exact render={(routeProps) => (
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/devolucion") }, Titulo: "Cliente" },
                                    { Titulo: "Producto devolucion" }
                                ]}
                            />
                        )} />
                        <Route path={props.match.url} component={(routeProps) => (
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Titulo: 'Devolucion' }
                                ]}
                            />
                        )} />

                    </Switch>

                </div>
                {
                    <div className="col" style={{ textAlign: 'right' }}>
                        <Dropdown
                            onCommand={props.cancelarDevolucion}
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
                        {"Cliente: "}
                        {props.cliente.Nombre}
                    </div>
                }
            </div>
        </div>


    );
}

export default DevolucionesBreadCrumb;