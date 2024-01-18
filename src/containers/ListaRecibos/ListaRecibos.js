import React, { useState, useEffect } from 'react';
import Loader from 'components/Global/Loader';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button } from "@material-ui/core";
import DetalleRecibo from 'components/ListadoRecibos/DetalleRecibo';
import { PrintOutlined,Image } from '@material-ui/icons';
import moment from "moment";
import 'moment/locale/es';
import { APIURL } from 'utils/Enviroment';
import Listado from 'components/ListadoRecibos/Listado';
import LoadingModal from './../../components/Global/LoadingModal';
import  TableFooter from "@material-ui/core/TableFooter";
import  TableRow from "@material-ui/core/TableRow";
import  TablePagination from "@material-ui/core/TablePagination";
import CustomFooter from 'components/Layout/CustomFooter';
import {IsAllow} from 'components/Seguridad/Permisos';
import { useSelector } from 'react-redux';
import { verificarConexion } from 'utils/http';
import axios from 'axios';
moment.locale('es');

const ListaRecibos = (props) => {
    const urlApi = APIURL;

    const [showModalUpload,setShowModalUpload] = useState(false);
    const [numeroRecibo,setNumeroRecibo] = useState("");
    const [imagenDepositos,setImagenDepositos] = useState();
    const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [startDate, setStartDate] =  useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-30));
    const [endDate, setEndDate] = useState( new Date(new Date().getFullYear(), new Date().getMonth(),  new Date().getDate()));
    const [recibos, setRecibos] = useState([]);
    const [recibo, setRecibo] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [DialogRecibo, setDialogRecibo] = useState(null);
    const [isLoading,setLoading] = useState(false);
    const [Asesores, setAsesores] = useState([]);
    const [AsesorSelected, setAsesorSelected] = useState(null);
    const [nombreAsesor, setNombreAsesor] = useState(null);
    const AsesoresUsuario = useSelector(e=>e.Permisos[0].AsesoresUsuario);

    useEffect(() => {
        if(!IsAllow("/lista-recibos"))
        {
            props.history.push('/home');
        }
            cargarRecibos("1900-01-01", "1900-01-01");
        let Asesores = [];
            AsesoresUsuario.map((Ase) => {
            let Valores = { key: Ase.Usuario, value: Ase.Usuario, text: Ase.Usuario }
            Asesores.push(Valores);
            return true;
        })
        setAsesores(Asesores)
        setAsesorSelected(AsesoresUsuario[0].Usuario)
        setNombreAsesor(AsesoresUsuario[0].Nombre);
        //cargarClientes();
        // eslint-disable-next-line
    }, []);
   
    const cambiarRecibo = (recibo) => {
         setRecibo(recibo);
     }

    const cargarRecibos = async (FechaInicio, FechaFin) => {
        const isOnline = await verificarConexion();
        if (!isOnline || localStorage.getItem("Conexion")==="offline") {
            Swal.fire({
                title: "Sin internet",
                text: "Necesita internet para poder visualizar esta pagina.",
                type: "warning",
                confirmButtonText: 'Ok',
            });
            setLoading(true);
        } else if(localStorage.getItem("Conexion")==="Online" && isOnline){
            setLoading(true);
            var Inicio = moment(FechaInicio).format("YYYY-MM-DD");
            var Fin = moment(FechaFin).format("YYYY-MM-DD");
            let Asesor = AsesorSelected == null ? AsesoresUsuario[0].Usuario : AsesorSelected;
            fetch(urlApi + "/api/Recibo/" + Asesor + "/" + Inicio + "/" + Fin, {
                headers: {
                    'Authorization':
                        'Bearer ' + localStorage.getItem('token')

                }
            }).then(res => {
                if (res.status === 401) {
                    localStorage.setItem('token', '');
                    window.location.reload();
                }
                if (res.status === 200) {
                    res.json()
                        .then(
                            (result) => {
                                setRecibos(result);
                                setIsLoaded(true);
                                setLoading(false);
                            },
                            // Note: it's important to handle errors here
                            // instead of a catch() block so that we don't swallow
                            // exceptions from actual bugs in components.
                            (error) => {
                                setError(error);
                                setIsLoaded(true);
                            }
                        )
                }
            })
        }
    }



    const handleFechaInicio = (fecha) => {

        var date = moment(fecha).toDate();

        var fech = moment(fecha).toDate();
        fech.setMonth(date.getMonth() + 1);

        setStartDate(date);
        setEndDate(fech);
    }

    const handleFechaFin = (fecha) => {
        var date = moment(fecha).toDate();

        const diffTime = new Date(date) - new Date(startDate);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
            setEndDate(date);
        }
        else {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
            });

            Toast.fire({
                type: 'error',
                title: 'Ingrese Fecha Válida',
            })
            var fech = new Date();
            fech.setDate(startDate.getDate() + 6);
            setEndDate(fech);
        }
    }

    const handleOnChangeAsesor = (value) => {
        setAsesorSelected(value);
        const asesorFiltadro = AsesoresUsuario.find(x => x.Usuario === value);
        if (asesorFiltadro) {
            setNombreAsesor(asesorFiltadro.Nombre);
        }
    }

    const handleOpenModal=(numeroRecibo)=>{
        setShowModalUpload(true);
        setNumeroRecibo(numeroRecibo);
    }

    const handleFilesChange=(e)=>{
        setImagenDepositos(e.target.files);
    }

    const uploadDepositos = async () => {
        try {
            if (numeroRecibo === "" || imagenDepositos === undefined) {
                alert("Seleccione uno o varios depositos para subir.");
                return;
            }

            let formData = new FormData();

            for (let i = 0; i < imagenDepositos.length; i++) {
                formData.append(`images`, imagenDepositos[i]);
            }

            await axios.post(`${APIURL}/api/recibo/comprobantes/${numeroRecibo}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Depositos subidos con exito.");
            setShowModalUpload(false);
            setNumeroRecibo("");
            setImagenDepositos(undefined);
        } catch (err) {
            alert("Ocurrio un error y no se pudieron subir los depositos");
        }
    }
     
    const DataRecibos = () => {
        let DataRecibos = [];

        if (recibos != null) {

        }

        recibos.map(recib => {

            let fechaIni = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            let fechaFin = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            fechaFin.setDate(fechaFin.getDate() + 1);

            if (moment(fechaIni) < moment(recib.Fecha) && moment(recib.Fecha) < moment(fechaFin)) {
                let data =
                [
                    [recib.NumeroRecibo,recib.Sincronizado],
                    [recib.CodigoCliente,recib.Sincronizado],
                    [recib.Cliente.Nombre,recib.Sincronizado],
                    [moment(recib.Fecha).format('DD/MM/YYYY'),recib.Sincronizado],
                    [recib.TipoPago.Descripcion,recib.Sincronizado],
                    [recib.Referencia,recib.Sincronizado],
                    [moment(recib.Fecha).format('DD/MM/YYYY'),recib.Sincronizado],
                    [recib.DescripcionBanco,recib.Sincronizado],
                    [recib.Valor,recib.Sincronizado],
                    [recib.IdMoneda,recib.Sincronizado],
                    [recib.Sincronizado],
                    [recib.CodigoAsesor,recib.Sincronizado],
                    [recib.DetalleRecibo[0].Factura,recib.Sincronizado],
                    [recib.Descuento,recib.Sincronizado],
                    <div>

                            <span className="mr-1">
                            <Button className='my-1' variant="outlined" onClick={() => cambiarRecibo(recib)} size="small" color={"primary"}>Detalle</Button>
                        </span> 

                        <span className="ml-1">
                            <Button className='my-1' variant="outlined" onClick={() => showPrint(recib)} size="small" color={"primary"}>
                                <PrintOutlined />
                            </Button>
                        </span >
                        <span className="ml-1">
                            <Button className='my-1' variant="outlined" onClick={() => handleOpenModal(recib.NumeroRecibo)} size="small" color={"primary"}>
                                <Image />
                            </Button>
                        </span >
                    </div>
                ]

                DataRecibos.push(data);
            }
            return false;

        });
        
        DataRecibos.sort((a,b) => (a[0][0] > b[0][0]) ? -1 : ((b[0][0] > a[0][0]) ? 1 : 0));
        return DataRecibos;
       
    }

    const showPrint = async (recibo) => {
        try {
            const request = await axios.get(`${APIURL}/api/Recibo/obtenerfirma/${recibo.NumeroRecibo}`);
            let copyRecibo = { ...recibo };
            copyRecibo.NombreAsesor = request.data.nombreAsesor;
            copyRecibo.firma = request.data.firma;
            setDialogRecibo(copyRecibo);
            setShowDialog(true);
        } catch (err) {
            setDialogRecibo(recibo);
            setShowDialog(true);
        }
    }

    const hidePrint = () => {
        setShowDialog(false);
        setDialogRecibo(null);
    }


    const RegresarListaRecibos = () => {
        setRecibo(null);
    }

    if (!isLoaded) {
        return <Loader interval={1800} />;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    if (recibo != null) {
        
        return (
            <DetalleRecibo
                recibo={recibo}
                RegresarListaRecibos={RegresarListaRecibos} />
        )
    } else {
        return (
            <>
                <Dialog
                    open={showModalUpload}
                    onClose={() => setShowModalUpload(false)}>
                    <DialogTitle id="scroll-dialog-title">
                        <h2>Cargar depositos</h2>
                    </DialogTitle>
                    <DialogContent>
                        <input
                            type='file'
                            accept="image/*"
                            multiple
                            onChange={handleFilesChange}
                        />
                        {imagenDepositos!==undefined && <Button
                            onClick={uploadDepositos}
                            color="primary"
                            variant="outlined"
                        >
                            Cargar depositos
                        </Button>}
                    </DialogContent>
                </Dialog>
                <Listado
                recibos={recibos}
                    startDate={startDate}
                    endDate={endDate}
                    handleFechaInicio={handleFechaInicio}
                    handleFechaFin={handleFechaFin}
                    DataRecibos={DataRecibos}
                    HeadersListaRecibos={HeadersListaRecibos}
                    DatatableOptions={DatatableOptions}
                    showDialog={showDialog}
                    hidePrint={hidePrint}
                    DialogRecibo={DialogRecibo}
                    Asesores={Asesores}
                    AsesorSelected={AsesorSelected}
                    nombreAsesor={nombreAsesor}
                    handleOnChangeAsesor={handleOnChangeAsesor}
                    cargarRecibos={cargarRecibos}
                    mostrarGenerarReporte={true}
                />
                <LoadingModal title={'recibos'} Open={isLoading} />
            </>
        );
    }

}


const HeadersListaRecibos = [
    {
        name: "NumeroRecibo",
        label: "Numero Recibo",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "CodigoCliente",
        label: "Codigo Cliente",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "NombreCliente",
        label: "Nombre Cliente",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "Fecha",
        label: "Fecha",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "IdTipoPago",
        label: "TipoPago",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "Referencia",
        label: "Referencia",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "FechaCheque",
        label: "Fecha Cheque",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "IdBanco",
        label: "Banco",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "Valor",
        label: "Valor",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "IdMoneda",
        label: "Moneda",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "Sincronizado",
        label: "Sincronizado",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[0])?'green':'orange',fontWeight:'bold'}}>{value[0]?"Si":"No"}</p>
                );
              }
        }
    },
    {
        name: "CodigoAsesor",
        label: "Codigo Asesor",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "IdFactura",
        label: "Factura",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "Descuento",
        label: "Descuento",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <p style={{color:(value[1])?'black':'orange',fontWeight:(value[1])?'normal':'bold'}}>{value[0]}</p>
                );
              }
        }
    },
    {
        name: "Acciones",
        label: "Acciones",
        options: {
            filter: false,
            sort: false,
        }
    },
];

const DatatableOptions = {
    filterType: "dropdown",
    responsive: "scrollMaxHeight",
    print: false,
    download: false,
    selectableRows: 'none',
    customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage) => (
        <TableFooter>
              <TableRow>
                <TablePagination
                  count={count}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={(_, page) => changePage(page)}
                  onChangeRowsPerPage={event => changeRowsPerPage(event.target.value)}
                  rowsPerPageOptions={[10, 15, 100]}
                  ActionsComponent={CustomFooter}
                  labelRowsPerPage="Filas por página:"
                />
              </TableRow>
            </TableFooter>
      ),
    textLabels: {
        body: {
            noMatch: "No se han encontrado recibos",
            toolTip: "Ordenar",
        },
        pagination: {
            next: "Siguiente",
            previous: "Anterior",
            rowsPerPage: "Filas por página:",
            displayRows: "de",
        },
        toolbar: {
            search: "Buscar",
            downloadCsv: "Descargar CSV",
            print: "Imprimir",
            viewColumns: "Ver Columnas",
            filterTable: "Filtrar Tabla",
        },
        filter: {
            all: "Todos",
            title: "Filtros",
            reset: "Quitar",
        },
        viewColumns: {
            title: "Mostrar Columnas",
            titleAria: "Mostrar/Esconder Columnas",
        },
        selectedRows: {
            text: "Fila(s) seleccionadas",
            delete: "Borrar",
            deleteAria: "Borrar Filas Seleccionadas",
        },
    }
};


export default ListaRecibos;
