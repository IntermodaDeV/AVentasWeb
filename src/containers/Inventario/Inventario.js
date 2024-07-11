
import React from 'react';
import { Route, Switch } from "react-router-dom";
import { useSelector } from 'react-redux';
import ClienteSelected from "components/Inventario/SelectCliente/SelectCliente";
import { ImprimirInventario } from 'components/Inventario/ImprimirInventario';
import { TomarInventario } from 'components/Inventario/Inventario';

export const Inventario = (props) => {
    const cliente = useSelector(e => e.ClienteInventario);
    const tableValue = useSelector(e => e.Inventario.TableValue);
    const finalizar = () => {
        props.history.push("/inventario");
    }
    return (
        <Switch>
            <Route exact path={props.match.url} component={ClienteSelected} />
            <Route exact path={props.match.url + "/inventario"} component={TomarInventario} />
            <Route exactpath={props.match.url + '/ImprimirInventario'}
                render={(routeProps) => {
                    return (
                        <ImprimirInventario
                            tableValue={tableValue}
                            Cliente={cliente}
                            ValoresPedido={JSON.parse(routeProps.location.state)}
                            Finalizar={finalizar}
                        />
                    )
                }}
            />
        </Switch>
    );
}