import React, { useState, useEffect } from 'react';
import Acuerdos from "components/AcuerdosVenta/Acuerdos";
import { useDispatch, useSelector } from 'react-redux';
import ClienteSelected from 'components/AcuerdosVenta/ClienteSelected'
import axios from 'axios';
import { APIURL } from 'utils/Enviroment';
import {IsAllow} from 'components/Seguridad/Permisos';
export const AcuerdosVenta = (props) => {
    const dispatch = useDispatch();
    const ClienteSelecte = useSelector(e => e.cliente);
    const [Clientes, setClientes] = useState([]);
    const [AcuerdosXCliente, setAcuerdosXCliente] = useState([]);

    useEffect(() => {
      if (!IsAllow("/acuerdosVenta")) {
          props.history.push('/home');
      }
      // eslint-disable-next-line
  })
    const cargarAcuerdosActivos = async (cliente) => {
        console.log("lcient", cliente)
        try {
          const request = await axios.get(`${APIURL}/api/acuerdo/cuotas/${cliente.Codigo}`);
          dispatch({ type: 'SET_CLIENTE', cliente: cliente })
          setAcuerdosXCliente(request.data)
        } catch (err) {
          console.log("Ha ocurrido un error", err.response)
        }
      }

      const cargarClientes = async () => {
        try {
          const request = await axios.get(`${APIURL}/api/cliente/sincronizacion`, {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('token'),
              'Content-Type': 'application/json'
            }
          });
          setClientes(request.data)
        } catch (err) {
          console.log("Ha ocurrido un error", err.response)
        }
      }
      console.log("AcuerdosXCliente",AcuerdosXCliente)
    return (
        <div className="row">
        <div className="col-12">
          <ClienteSelected
            clientes={Clientes}
            cargarAcuerdosActivos={cargarAcuerdosActivos}
            cargarClientes={cargarClientes} />
          {
            ClienteSelecte &&
            <Acuerdos acuerdos={AcuerdosXCliente} />
          }
        </div>
      </div>
    );
}