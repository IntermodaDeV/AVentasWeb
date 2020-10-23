import React from 'react';
import {Route,Switch} from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import AirplayIcon from '@material-ui/icons/Airplay';
import LanguageIcon from '@material-ui/icons/Language';

import { Roles }   from './Roles';
import {Pantallas} from './Pantallas'
import Funciones   from './Funciones';


export const Mantenimiento = props => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const redirectRoles = ()=>{
        props.history.push('/mantenimiento');
    }

    const redirectFunciones = () =>{
        props.history.push('/mantenimiento/funciones');
    }

    const redirectAsignacion = () => {
        props.history.push('/mantenimiento/pantallas')
    }
    
    return (
        <div style={{height:'100%'}} className="container-fluid">
            <h2 className="text-center">Mantenimiento</h2>
            <Paper square>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="disabled tabs example"
      >
        <Tab onClick={redirectRoles} icon={<ContactMailIcon/>} label="Roles" />
        <Tab onClick={redirectFunciones} icon={<LanguageIcon/>} label="Funciones" />
        <Tab onClick={redirectAsignacion} icon={<AirplayIcon/>} label="Pantallas" />
      </Tabs>
    </Paper>
            <div className="card" style={{height:'85%'}}>
                <Switch>
                    <Route exact path={props.match.url} render={(props)=><Roles/>}/>
                    <Route exact path={`${props.match.url}/funciones`} render={(props)=><Funciones/>}/>
                    <Route exact path={`${props.match.url}/pantallas`} render={(props)=><Pantallas/>}/>
                </Switch>
            </div>
        </div>
    )
}