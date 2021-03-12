import React,{useState,useRef} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { ReactExcel, readFile, generateObjects } from '@ramonak/react-excel';
import {APIURL} from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import moment from "moment";

const CargarAsignaciones = (props)=>{
    const {showDialog,setDialog} = props;
    const [initialData, setInitialData] = useState(undefined);
    const [currentSheet, setCurrentSheet] = useState({});
    const context = useRef();

    const convertirHora = hora => {
        let separador = hora.split(":");

        if (separador[0].length === 2) {
            return hora;
        }

        return `0${separador[0]}:${separador[1]}`;
    }

    const convertirFecha = readedData => {

        if (Object.keys(readedData.Sheets).length > 0) {
            let data = readedData;
            let ocurrioError = false;
            let pagina = Object.keys(readedData.Sheets)[0];

            const filtro = Object.keys(data.Sheets[pagina]).filter((x) => (x.includes("C") && x !== "C1"));
            const filtroHoraInicio = Object.keys(data.Sheets[pagina]).filter((x) => (x.includes("D") && x !== "D1"));
            const filtroHoraFinal = Object.keys(data.Sheets[pagina]).filter((x) => (x.includes("E") && x !== "E1"));

            for(let key of filtro){
                if (typeof data.Sheets[pagina][key].v !== "number") {
                    ocurrioError = true;
                    break;
                } else {
                    data.Sheets[pagina][key].v = moment(new Date((data.Sheets[pagina][key].v - (25567 + 1)) * 86400 * 1000)).format("DD/MM/YYYY");
                }
            }

            for(let key of filtroHoraInicio){
                if (typeof data.Sheets[pagina][key].v !== "number") {
                    ocurrioError = true;
                    break;
                } else {
                    data.Sheets[pagina][key].v = convertirHora(data.Sheets[pagina][key].w);
                }
            }

            for(let key of filtroHoraFinal){
                if (typeof data.Sheets[pagina][key].v !== "number") {
                    ocurrioError = true;
                    break;
                } else {
                    data.Sheets[pagina][key].v = convertirHora(data.Sheets[pagina][key].w);
                }
            }

            return ocurrioError;
        }
    }

    const handleUpload = (event) => {
        let file = event.target.files[0];

        if(file!==undefined && file!==null){

            const extension = file.name.split('.')[1];

            if(extension!=="xlsx" && extension!=="xls"){
                Swal.fire({
                    title: 'Error',
                    text: "El formato del archivo no es permitido",
                    type: 'error',
                    confirmButtonText: 'Ok',
                    target:context.current
                  });
                  setInitialData(undefined);
                  return;
            }

            readFile(file)
              .then((readedData) => {
                  let ocurrioError = convertirFecha(readedData);
                  if(ocurrioError){
                    alert("Formato de fecha no soportado.");
                  }else{
                    setInitialData(readedData);
                  }
                })
              .catch((error) => console.error(error));
        }
      };
    
    const save = () => {
        let result = generateObjects(currentSheet);
        let existenVacios = result.some(x => (x.CodigoCliente === "" && x.CodigoAsesor === "" && x.FechaAsignacion === "" && x.HoraInicio === "" && x.HoraFinal === "" && x.idPrioridad === ""));
        if (existenVacios) {
            Swal.fire({
                title: 'Advertencia',
                text: "Se encontraron asignaciones con campos vacios.",
                type: 'warning',
                confirmButtonText: 'Ok',
                target: context.current
            });

            return;
        }

        fetch(`${APIURL}/api/asignaciones/cargar`,{
            headers:{
                "Content-type":"application/json",
                'Authorization':'Bearer ' + localStorage.getItem('token')
            },
            method:"POST",
            body:JSON.stringify(result)
        }).then(res=>{
            if(res.status===200){
                res.json()
                .then(resultado=>{
                    Swal.fire({
                        title: 'Confirmado',
                        text: resultado.Message,
                        type: 'success',
                        confirmButtonText: 'Ok',
                        target:context.current
                      }).then(e=>{
                        closeDialog();
                      })
                });

                
            }

            if(res.status===400){
                res.json()
                .then(resultado=>{
                    Swal.fire({
                        title: 'Error',
                        text: resultado.Message,
                        type: 'error',
                        confirmButtonText: 'Ok',
                        target:context.current
                      })
                });
            }
        })

      };

      const closeDialog = ()=>{
        setInitialData(undefined);
        setCurrentSheet({});
        setDialog(false)
      }

    return (
        <Dialog
            open={showDialog}
            onClose={closeDialog}
        >
            <DialogTitle id="scroll-dialog-title">
                <h2>Cargar asignaciones</h2>
            </DialogTitle>
            <DialogContent>
            <div ref={context}></div>
                <input
                    type='file'
                    accept='.xlsx,.xls'
                    onChange={handleUpload}
            
                />
                {(initialData===undefined)
                ?<div style={{width:"100%",height:"400px"}}></div>
                :<div>
                    <ReactExcel
                        reactExcelClassName="table table-bordered"
                        initialData={initialData}
                        onSheetUpdate={(currentSheet) => setCurrentSheet(currentSheet)}
                        activeSheetClassName='active-sheet'
                    />
                    <br/>
                    <Button 
                        onClick={save}
                        color="primary"
                        variant="outlined"   
                    >
                        Cargar agenda
                    </Button>
                </div>
                }
                
            </DialogContent>
        </Dialog>
    )
}

export default CargarAsignaciones;