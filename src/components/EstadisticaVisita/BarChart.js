import React,{useState,useEffect} from 'react';
import { Bar } from "react-chartjs-2";
import {APIURL} from 'utils/Enviroment';
import moment from 'moment';
import 'moment/locale/es';
moment.locale('es');

const BarChart = props => {
    //const [fecha,setFecha]     = useState(moment().subtract(6,'month'));
    const [visitas,setVisitas] = useState([]);

    const cargarVisitasPorMes = () =>{
        //let fechaInicio = moment(fecha).format();

        fetch(`${APIURL}/api/estadisticavisita/mes`)
        .then(res=>res.json())
        .then(data=>setVisitas(data));
    }

    const obtenerCabeceras = () =>{
        return visitas.map((visita)=>visita.MES);
    }

    const obtenerValores = () =>{
        return visitas.map((visita)=>visita.VISITAS);
    }

    const obtenerData = ()=>{
        return {
            labels: obtenerCabeceras(),
            datasets: [
                {
                    data: obtenerValores(),
                    backgroundColor:'rgb(212, 87, 78)',
                    strokeColor: "red",
                }
            ]
        }
    }

    const options = {
        legend:{
            display:false
        },
        title:{
            display:true,text:'Visitas Realizadas'
        },
        responsive: true,
        tooltips:{
            enabled:false
        },
        plugins:{
            labels:{
                render:()=>{}
            }
        }
    }

    useEffect(() => {
        cargarVisitasPorMes();
    }, []);

    return (
        <div className="card" style={{padding:'20px',marginBottom:'20px'}}>
            {/*<div style={{display:'flex'}}>
                    <DatePicker
                        disableToolbar
                        autoOk
                        minDateMessage={"Fecha Inválida"}
                        label={"Fecha"}
                        variant="inline"
                        // minDate={this.state.startDate}
                        format={"DD/MM/YYYY"}
                        value={fecha}
                        onChange={(date) => setFecha(date)}
                    />
                    <Button
                        style={{marginLeft:'50px'}}
                        variant="outlined"
                        color="primary"
                        onClick={() => cargarVisitasPorMes()}>Obtener
                    </Button>
            </div>*/}
            {visitas.length===0
            ?<h4>No hay registros</h4>
            :<Bar data={obtenerData} options={options}/>
            }
        </div>
    )
}

export default BarChart;