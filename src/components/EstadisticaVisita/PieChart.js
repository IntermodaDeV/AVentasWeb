import React from "react";
import { Pie } from "react-chartjs-2"
import "chartjs-plugin-labels";

const PieChart = (props) => {
    if (props.Selected) {
        let Selected = JSON.parse(props.Selected);

        const data = {
            labels: [
                "Atendidas", /*"Efectivas", "Productivas",*/"Canceladas", "No Atendidas"
            ],
            datasets: [
                {
                    data: [
                        Selected.Atendidas, /*Selected.Efectivas, Selected.Productivas ,*/ Selected.ClienteCancelo, Selected.NoAtendidas
                    ],
                    backgroundColor: [ "#0899ba", /*"#FDB45C", "#95d5b2",*/"#f08080","#9e2a2b"]
                }
            ]
        }

        const options = {
            responsive: true
        }

        return (
            <Pie data={data} options={options} />
        );
    }

    else {
        const data = {
            labels: [
                "Atendidas", /*"Efectivas", "Productivas",*/"Canceladas", "No Atendidas"
            ],
            datasets: [
                {
                    data: [
                        props.Users.reduce((acc, cur) => { return acc + cur.Atendidas }, 0)/*,props.Users.reduce((acc, cur) => { return acc + cur.Efectivas }, 0),props.Users.reduce((acc, cur) => { return acc + cur.Productivas }, 0)*/, props.Users.reduce((acc, cur) => { return acc + cur.ClienteCancelo }, 0), props.Users.reduce((acc, cur) => { return acc + cur.NoAtendidas }, 0)
                    ],
                    backgroundColor: [ "#70d6ff", "#FDB45C", "#84dcc6","#efc3e6","#ff686b"]
                }
            ]
        }

        const options = {
            responsive: true
        }

        return (
            <Pie data={data} options={options} />
        );
    }


}

export default PieChart;