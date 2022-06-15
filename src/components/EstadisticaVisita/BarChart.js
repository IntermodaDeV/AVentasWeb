import React,{useState,useEffect} from 'react';
import { Bar } from "react-chartjs-2";
import {APIURL} from 'utils/Enviroment';
import moment from 'moment';
import 'moment/locale/es';
import { verificarConexion } from 'utils/http';
import Swal from 'sweetalert2/dist/sweetalert2.js';
moment.locale('es');

const BarChart = props => {
    const [visitas,setVisitas] = useState([]);

    const cargarVisitasPorMes = async () =>{
        const isOnline = await verificarConexion();
        if (!isOnline || localStorage.getItem("Conexion")==="offline") {
            Swal.fire({
                title: "Sin internet",
                text: "Necesita internet para poder visualizar esta pagina.",
                type: "warning",
                confirmButtonText: 'Ok',
            });

        } else if(localStorage.getItem("Conexion")==="Online" && isOnline){

            fetch(`${APIURL}/api/estadisticavisita/mes`, {
                headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token')

                }
            })
                .then(res => res.json())
                .then(data => setVisitas(data));
        }
    }

    const obtenerCabeceras = () =>{
        return visitas.filter(x=>x.EMPRESA==='IMHN').map((visita)=>visita.MES);
    }

    const obtenerValores = () =>{
        if(props.empresa===null){
            let totales = [];
            const imhn = visitas.filter(x=>x.EMPRESA==="IMHN").map((visita)=>visita.VISITAS);
            const imcr = visitas.filter(x=>x.EMPRESA==="IMCR").map((visita)=>visita.VISITAS);
            const imgt = visitas.filter(x=>x.EMPRESA==="IMGT").map((visita)=>visita.VISITAS);
            const imsl = visitas.filter(x=>x.EMPRESA==="IMSL").map((visita)=>visita.VISITAS);

            for(let i=0;i<imhn.length;i++){
                let total = imhn[i]+imcr[i]+imgt[i]+imsl[i];
                totales.push(total);
            }

            return totales;
        }

        return visitas.filter(x=>x.EMPRESA===props.empresa).map((visita)=>visita.VISITAS);
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
            {visitas.length===0
            ?<h4>No hay registros</h4>
            :<Bar data={obtenerData} options={options}/>
            }
        </div>
    )
}

export default BarChart;