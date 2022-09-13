import React, { useEffect } from 'react';
import {Route,Switch} from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { TipoGasto } from 'components/GastoAsesores/TipoGasto/TipoGasto';
import { CategoriaGasto } from 'components/GastoAsesores/CategoriaGasto/CategoriaGasto';

export const MantenimientoGastosAsesores = props => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const redirectTipoGasto = () =>{
        props.history.push('/GiraAsesores/Mantenimiento');
    }

    const redirectCategoriaGasto = () =>{
        props.history.push('/GiraAsesores/Mantenimiento/Categoria');
    }
    useEffect(()=>{
      
    },[])

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
                    <Tab onClick={redirectTipoGasto} icon={<RecentActorsIcon/>} label="Tipo Gasto" />
                    <Tab onClick={redirectCategoriaGasto} icon = {<SupervisorAccountIcon/>} label ="Categoria Gasto"/>
                    
                </Tabs>
            </Paper>
            <div className="card" style={{height:'85%'}}>
                <Switch>
                    <Route exact path={`${props.match.url}`} render={(props)=><TipoGasto/>}/>
                    <Route exact path={`${props.match.url}/Categoria`} render={(props)=><CategoriaGasto/>}/>
                </Switch>
            </div>
        </div>
    )
}