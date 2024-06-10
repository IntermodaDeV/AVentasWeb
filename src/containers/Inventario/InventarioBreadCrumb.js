import React from 'react';
import styles from 'components/Recibos/RecibosBreadCrumb/RecibosBreadCrumb.module.css';
import { Route, Switch } from 'react-router-dom';
import NavigationBreadcrumb from 'components/Pedidos/NavigationBreadcrumb/NavigationBreadcrumb';
import moment from "moment";
import 'moment/locale/es';
moment.locale('es');

const InventarioBreadCrumb = (props) => {
    return (
        <div>
            <div className="row">
                <div className="col" style={{ textAlign: 'left' }}>
                    <Switch>
                        <Route path={props.match.url + '/Inventario/Inventario'} exact render={(routeProps) => (
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Click: () => { props.clickBreadCrumb("/Inventario/Inventario") }, Titulo: "Tomar Inventario" },
                                    { Titulo: "Tomar Inventario" }
                                ]}
                            />
                        )} />
                        <Route path={props.match.url} component={(routeProps) => (
                            <NavigationBreadcrumb
                                BreadcrumbItems={[
                                    { Titulo: 'Inventario' }
                                ]}
                            />
                        )} />
                    </Switch>

                </div>
            </div>
            <br />
        </div>


    );
}

export default InventarioBreadCrumb;