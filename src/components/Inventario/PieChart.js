import React from "react";
import { Pie } from "react-chartjs-2"
import { numberWithCommasNoDec } from 'utils/common';
import "chartjs-plugin-labels";

const PieChart = (props) => {
    var inventario = props.data;
    const data = {
        labels: [
            inventario[0].IdLinea, inventario[1].IdLinea, inventario[2].IdLinea, inventario[3].IdLinea, inventario[4].IdLinea, "NO ENCONTRADOS"
        ],
        datasets: [
            {
                data: [
                    inventario[0].Cantidad, inventario[1].Cantidad, inventario[2].Cantidad, inventario[3].Cantidad, inventario[4].Cantidad, inventario.length > 5 ? inventario[5].Cantidad : 0
                ],
                backgroundColor: ["#04364A", "#64CCC5", "#184930", "#176B87", "#176B", "#48BF40"]
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
        <>
            <Pie data={data} options={options} />
            <div className="h3 mb-0 font-weight-bold text-center" style={{ marginTop: "15px", paddingLeft: "15PX" }}>Total unidades: {numberWithCommasNoDec(inventario.reduce((total, linea) => total + linea.Cantidad, 0))}</div>
        </>
    );
}

export default PieChart;//6ECF83,66CC8D