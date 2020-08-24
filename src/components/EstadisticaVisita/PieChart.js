import React from "react";
import { Pie } from "react-chartjs-2"
import "chartjs-plugin-labels";

const PieChart = (props) => {
    if (props.Selected) {
        let Selected = JSON.parse(props.Selected);

        const data = {
            labels: [
                "Visitas", "Atendidas", "Canceladas", "Efectivas","Productivas"
            ],
            datasets: [
                {
                    data: [
                        Selected.CantidadVisitas, Selected.Atendidas, Selected.ClienteCancelo, Selected.Efectivas, Selected.Atendidas
                    ],
                    backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1","#C4FF33"]
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
                "Visitas", "Atendidas", "Canceladas", "Efectivas","Productivas"
            ],
            datasets: [
                {
                    data: [
                        props.Users.reduce((acc, cur) => { return acc + cur.CantidadVisitas }, 0), props.Users.reduce((acc, cur) => { return acc + cur.Atendidas }, 0), props.Users.reduce((acc, cur) => { return acc + cur.ClienteCancelo }, 0),props.Users.reduce((acc, cur) => { return acc + cur.Efectivas }, 0),props.Users.reduce((acc, cur) => { return acc + cur.Atendidas }, 0)
                    ],
                    backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1","#C4FF33"]
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