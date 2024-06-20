import React from "react";
import { Pie } from "react-chartjs-2"
import "chartjs-plugin-labels";

const PieChart = (props) => {
    var inventario = props.data;
    const data = {
        labels: [
           "Denim", "Estampado", "Ropa", "Tejido de punto"
        ],
        datasets: [
            {
                data: [
                    inventario[0].Cantidad, inventario[1].Cantidad, inventario[2].Cantidad, inventario[3].Cantidad
                ],
                backgroundColor: ["#04364A", "#64CCC5", "#176B87", "#176B"]
            }
        ]
    }
    const options = {
        responsive: true,
        plugins: {
            labels: {
                render: "percentage",
                fontColor: "white",
            },
        },
    };
    return (
        <Pie data={data} options={options} />
    );
}

export default PieChart;