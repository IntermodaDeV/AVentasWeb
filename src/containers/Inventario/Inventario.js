import React from 'react';
import InventarioBreadCrumb from './InventarioBreadCrumb'
import { Route, Switch } from "react-router-dom";
import ClienteSelected from "components/Inventario/SelectCliente/SelectCliente";
import { TomarInventario } from 'components/Inventario/Inventario';

export const Inventario = (props) => {
    return (
        <Switch>
            <Route exact path={props.match.url} component={ClienteSelected} />
            <Route exact path={props.match.url + "/inventario"} component={TomarInventario} />
        </Switch>
    );
}