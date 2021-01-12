import React from 'react';
import {Route,Switch} from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import {Encuesta} from 'components/Encuestas/Encuestas/Encuestas'
import {SeccionesEncuesta} from 'components/Encuestas/Secciones/Secciones'
export const TabEncuestas = props => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const redirectEncuesta = () =>{
        props.history.push('/Encuestas');
    }

    const redirectSeccionesEncuesta = () =>{
        props.history.push('/Encuestas/secciones');
    }

    return (
        <div style={{height:'100%'}} className="container-fluid">
            <Paper square>
                <Tabs
                    value={value}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChange}
                    aria-label="disabled tabs example"
                >
                    <Tab onClick={redirectEncuesta} icon={<SupervisorAccountIcon/>} label="Encuestas" />
                    <Tab onClick={redirectSeccionesEncuesta} icon={<RecentActorsIcon/>} label="secciones" />
                </Tabs>
            </Paper>
            <div className="card" style={{height:'85%'}}>
                <Switch>
                    <Route exact path={`${props.match.url}`} render={(props)=><Encuesta/>}/>
                    <Route exact path={`${props.match.url}/secciones`} render={(props)=><SeccionesEncuesta/>}/>
                </Switch>
            </div>
        </div>
    )
}