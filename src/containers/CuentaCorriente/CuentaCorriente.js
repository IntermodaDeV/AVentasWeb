// import React, { useEffect, useState } from 'react'

// import SelectCliente from 'components/Recibos/SelectCliente/SelectCliente'
// import { CuentaCorrienteTable } from './CuentaCorrienteTable';
// const Cuenta = (props) => {
//   const [clientes, setClientes] = useState([])
//   // const [clientePreSelected, setClientePreSelected] = useState(null)
//   const [clienteSelected, setClienteSelected] = useState(null)
//   // const [facturasXCliente, setFacturasXCliente] = useState(null)
//   const urlApi = 'https://aventas.devcit.com:3044'

//   useEffect(() => {
//     CargarDatos()
//     // eslint-disable-next-line
//   }, [])
//   const CargarDatos = () => {
//     cargarClientes()
//   }

//   const cargarClientes = () => {
//     fetch(urlApi + '/api/cliente', {
//       headers: {
//         Authorization: 'Bearer ' + localStorage.getItem('token')
//       }
//     }).then(res => {
//       if (res.status === 401) {
//         localStorage.setItem('token', '')
//         window.location.reload()
//       }
//       if (res.status === 200) {
//         res.json().then(
//           result => {
//             setClientes(result)
//           },
//           // Note: it's important to handle errors here
//           // instead of a catch() block so that we don't swallow
//           // exceptions from actual bugs in components.
//           error => {
//             this.setState({
//               error
//             })
//           }
//         )
//       }
//     })
//   }
//   const SelectedCliente = cliente => {
//     setClienteSelected(cliente)
//   }
//   if (clienteSelected) {
//     return (<div>
//       <CuentaCorrienteTable 
      
//       />
//     </div>);
//   }
//   return (
//     <div>
//       <SelectCliente
//         clientes={clientes}
//         clienteSelected={clienteSelected}
//         onSelect={setClienteSelected}
//         setCliente={SelectedCliente}
//         codigoClientePreseleccionado={
//           props.location.state ? props.location.state.CodigoCliente : null
//         }
//       />
//     </div>
//   )
// }



// export default Cuenta
