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

    const convertirFecha = readedData => {
        let data = readedData;
        Object.keys(data.Sheets.Hoja1).forEach((key)=>{
            if(key.includes("C") && key!=="C1"){
                data.Sheets.Hoja1[key].v = moment(new Date((data.Sheets.Hoja1[key].v - (25567 + 1)) * 86400 * 1000)).format("DD/MM/YYYY");
            }
        });
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
                  convertirFecha(readedData);
                  setInitialData(readedData)
                })
              .catch((error) => console.error(error));
        }
      };
    
      const save = () => {
        let result = generateObjects(currentSheet);
        result = result.filter(x=>(x.CodigoCliente!=="" && x.CodigoAsesor!=="" && x.FechaAsignacion!=="" && x.HoraInicio!=="" && x.HoraFinal!=="" && x.idPrioridad!==""));
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