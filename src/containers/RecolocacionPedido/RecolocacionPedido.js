import React from 'react';
import { Route, Switch } from "react-router-dom";
import ClienteSelected from "components/RecolocacionPedido/SelectCliente/SelectCliente";
import { Recolocacion } from 'components/RecolocacionPedido/Recolocacion';

export const RecolocacionPedido = (props) => {
    return (
        <Switch>
            <Route exact path={props.match.url} component={ClienteSelected} />
            <Route exact path={props.match.url+"/recolocacion"} component={Recolocacion} />
        </Switch>
    );
}