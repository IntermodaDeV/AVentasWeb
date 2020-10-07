import React from 'react';
import Chart from 'chart.js';
import 'chartjs-funnel';

const FunnelChart = props => {
    const grafica = React.useRef(null);

    React.useEffect(()=>{
        const ctx = grafica.current.getContext('2d');
        let data = [];

        if(props.Selected){
            let Selected = JSON.parse(props.Selected);
            data = [Selected.CantidadVisitas,Selected.Atendidas, Selected.Efectivas, Selected.Productivas , Selected.ClienteCancelo, Selected.NoAtendidas]
        }else{
            data = [props.Users.reduce((acc, cur) => { return acc + cur.CantidadVisitas }, 0),props.Users.reduce((acc, cur) => { return acc + cur.Atendidas }, 0),props.Users.reduce((acc, cur) => { return acc + cur.Efectivas }, 0),props.Users.reduce((acc, cur) => { return acc + cur.Productivas }, 0), props.Users.reduce((acc, cur) => { return acc + cur.ClienteCancelo }, 0), props.Users.reduce((acc, cur) => { return acc + cur.NoAtendidas }, 0)]
        }
        
        var myChart = new Chart(ctx, {
            type: 'funnel', 
            data: {
                labels: ["Programadas","Atendidas", "Efectivas", "Productivas","Canceladas", "No Atendidas"],
                datasets: [{
                    data,
                    backgroundColor: [ "#73628a","#70d6ff", "#FDB45C", "#84dcc6","#efc3e6","#ff686b"],
                    borderWidth: 1
                }]
            },
            options: {
                sort:'desc',
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        })

        return ()=>{
            myChart.destroy();
        }

    },[props.Selected,props.Users]);

    return <canvas ref={grafica}></canvas>
}

export default FunnelChart;