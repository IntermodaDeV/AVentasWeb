import React from 'react';
import styles from 'components/Recibos/RecibosBreadCrumb/RecibosBreadCrumb.module.css';
import { Route, Switch } from 'react-router-dom';
import NavigationBreadcrumb from 'components/Pedidos/NavigationBreadcrumb/NavigationBreadcrumb';
import { FaSignOutAlt } from 'react-icons/fa';
import { Dropdown } from 'element-react';
import moment from "moment";
import 'moment/locale/es';
moment.locale('es');

const EncuestaBreadCrumb = (props) => {

    return (
        <div>
            <div className="row">
                <div className="col" style={{ textAlign: 'left' }}>
                    <Switch>
                        <Route path={props.match.url + '/Seccion'} exact render={(routeProps) => (
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Encuesta") }, Titulo: "Encuesta" },
                                    { Titulo: "Seccion" }
                                ]}
                            />
                        )} />
                         <Route path={props.match.url} component={(routeProps) => (
                             <NavigationBreadcrumb
                             BreadcrumbItems={[
                                 { Titulo: 'Encuesta' }
                             ]}
                         />
                        )} />

                    </Switch>

                </div>
                {
                    props.cliente &&
                    <div className="col" style={{ textAlign: 'right' }}>
                        <Dropdown
                            onCommand={props.cancelarEncuesta}
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

export default EncuestaBreadCrumb;