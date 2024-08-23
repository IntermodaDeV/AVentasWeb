import React from "react";
import { Pie } from "react-chartjs-2"
import "chartjs-plugin-labels";

const PieChart = (props) => {
    var inventario = props.data;
    const data = {
        labels: [
           "Denim", "Estampado", "Ropa", "Tejido de punto","No encontrados"
        ],
        datasets: [
            {
                data: [
                    inventario[0].Cantidad, inventario[1].Cantidad, inventario[3].Cantidad, inventario[4].Cantidad,inventario[2].Cantidad
                ],
                backgroundColor: ["#04364A", "#64CCC5", "#176B87", "#176B","#48BF40"]
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

export default PieChart;//6ECF83,66CC8D