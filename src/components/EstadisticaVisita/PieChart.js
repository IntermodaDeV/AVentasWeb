import React from "react";
import { Pie } from "react-chartjs-2"
import "chartjs-plugin-labels";

const PieChart = (props) => {
    if (props.Selected) {
        let Selected = JSON.parse(props.Selected);

        const data = {
            labels: [
                "Visitas", "Atendidas", "Canceladas", "Efectivas"
            ],
            datasets: [
                {
                    data: [
                        Selected.CantidadVisitas, Selected.Atendidas, Selected.ClienteCancelo, Selected.Efectivas
                    ],
                    backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"]
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
                "Visitas", "Atendidas", "Canceladas", "Efectivas"
            ],
            datasets: [
                {
                    data: [
                        2, 3, 4, 5
                    ],
                    backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1"]
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