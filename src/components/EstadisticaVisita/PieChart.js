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
                    backgroundColor: [ "#2AD549", /*"#FDB45C", "#95d5b2",*/"#FF4A4A","#1EA4B7"]
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
                "Atendidas", /*"Efectivas", "Productivas",*/"Canceladas", "Por Realizar"
            ],
            datasets: [
                {
                    data: [
                        props.Users.reduce((acc, cur) => { return acc + cur.Atendidas }, 0)/*,props.Users.reduce((acc, cur) => { return acc + cur.Efectivas }, 0),props.Users.reduce((acc, cur) => { return acc + cur.Productivas }, 0)*/, props.Users.reduce((acc, cur) => { return acc + cur.ClienteCancelo }, 0), props.Users.reduce((acc, cur) => { return acc + cur.NoAtendidas }, 0)
                    ],
                    backgroundColor: [ "#2AD549", /*"#FDB45C", "#84dcc6",*/"#FF4A4A","#1EA4B7"]
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