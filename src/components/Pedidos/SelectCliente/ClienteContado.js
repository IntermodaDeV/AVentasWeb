import React,{useState,useEffect,useRef} from 'react';
import {Formik,Form,Field} from 'formik';
import * as yup from 'yup';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import  CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import axios from 'axios';
import {APIURL} from 'utils/Enviroment';
import {useDispatch,useSelector} from 'react-redux';
import { Dropdown } from "semantic-ui-react/";
import Swal from 'sweetalert2/dist/sweetalert2.js';

function equalTo(ref, msg) {
    return yup.mixed().test({
      name: 'equalTo',
      exclusive: false,
      message: msg,
      params: {
        reference: ref.path,
      },
      test: function(value) {
        return value === this.resolve(ref);
      },
    });
  }
  yup.addMethod(yup.string, 'equalTo', equalTo);

const validationSchema = yup.object().shape(
{
    Nombre: yup.string().required('El nombre es obligatorio'),
    Direccion: yup.string().required('La direcciòn es obligatoria'),
    RTN:yup.string(),
    RTN2:yup.string().equalTo(yup.ref('RTN'),'El rtn debe coincidir'),
    Telefono:yup.string().required('El telefono es obligatorio'),
});

const ClienteContado = React.memo((props)=>{

    const [enableEdit,setEnableEdit] = useState(true);
    const [enableSave,setEnableSave] = useState(false);
    const [enableNew,setEnableNew]   = useState(true);
    const dispatch = useDispatch();
    const clientes = useSelector(e=>e.clientesContado);
    const requiereEntrega = useSelector(e=>e.requiereEntrega);
    const context = useRef();

    const initialValues = 
    {
        id:0,
        Nombre:'',
        Direccion:'',
        FlagClientePotencial:false,
        RTN:'',
        RTN2:'',
        Telefono:'',
        ComunidadAutonoma:'',
        Ruta:props.ruta
    }


    const handleSubmit = (values)=>
    {
        axios({
            url:`${APIURL}/api/clientecontado`,
            method:'POST',
            data:values
        }).then(e=>{
            if(e.status===200){
                dispatch({type:'SET_CLIENTECONTADO',payload:e.data});
                setEnableSave(true);
                setEnableNew(false);
                cargarClientes();
                Swal.fire({
                    title: 'Confirmado',
                    text: 'Cliente creado con exito',
                    type: 'success',
                    confirmButtonText: 'Ok',
                    target:context.current
                  })
            }
        })
        .catch(err=>{
            Swal.fire({
                title: 'Error',
                text: 'No se pudo crear el cliente',
                type: 'error',
                confirmButtonText: 'Ok',
                target:context.current
              })
        })
    }


    const handleEdit=(values)=>
    {
        axios({
            url:`${APIURL}/api/clientecontado/edit`,
            method:'POST',
            data:values
        }).then(e=>{
            if(e.status===200){
                dispatch({type:'SET_CLIENTECONTADO',payload:e.data});
                setEnableNew(false);
                setEnableEdit(true);
                cargarClientes();
                Swal.fire({
                    title: 'Confirmado',
                    text: 'Cliente modificado con exito',
                    type: 'success',
                    confirmButtonText: 'Ok',
                    target:context.current
                  })
            }
        })
        .catch(err=>{
            Swal.fire({
                title: 'Error',
                text: 'No se pudo modificar el cliente',
                type: 'error',
                confirmButtonText: 'Ok',
                target:context.current
              })
        })
    }

    const handleRequiereEntrega = (value)=>
    {
        dispatch({type:'SET_REQUIEREENTREGA',payload:value});
    }

    const cargarClientes = ()=>
    {
        axios({
            url:`${APIURL}/api/clientecontado/${props.ruta}`,
            method:'GET',
        }).then(e=>{
            if(e.status===200){
               dispatch({type:'SET_CLIENTESCONTADO',payload:e.data});
            }
        })
        .catch(err=>console.warn(err))
    }

    useEffect(()=>{
        dispatch({type:'SET_REQUIEREENTREGA',payload:true});
        cargarClientes();
        // eslint-disable-next-line
    },[])
   
    return (
        <>
            <Formik
                initialValues={initialValues}
                onSubmit={(value)=>{
                    setEnableSave(true);
                    handleSubmit(value);
                    setEnableSave(false);
                }}
                validationSchema={validationSchema}
            >
                {({errors,resetForm,values,setValues})=>(
                    <Form>
                        <div ref={context}>
                        <div>
                            <Dropdown
                                placeholder="Seleccione cliente contado"
                                fluid
                                search
                                selection
                                onChange={(e, { value }) =>{
                                    let cliente = clientes.find(x=>x.id===value);
                                    const cliente2 = 
                                    {
                                        id:cliente.id,
                                        Nombre:cliente.Nombre,
                                        Direccion:cliente.Direccion,
                                        FlagClientePotencial:cliente.FlagClientePotencial,
                                        requiereEntrega:true,
                                        RTN:cliente.RTN,
                                        RTN2:cliente.RTN,
                                        Telefono:cliente.Telefono,
                                        ComunidadAutonoma:cliente.ComunidadAutonoma,
                                        Ruta:cliente.Ruta
                                    }
                                    dispatch({type:'SET_CLIENTECONTADO',payload:cliente});
                                    setValues(cliente2);
                                    setEnableNew(false);
                                    setEnableEdit(false);
                                    setEnableSave(true);
                                }}
                                options={clientes.map(cliente => {
                                    return {key:cliente.id, value:cliente.id,text:cliente.Nombre}
                                })}
                                noResultsMessage={"No hay resultados"}
                                closeOnChange={true}
                            />
                        </div>
                        <div>
                                <FormControlLabel
                                        control={
                                        <Field
                                            type="checkbox"
                                            name="FlagClientePotencial"
                                            as={CheckBox}
                                        />
                                        }
                                        label="Cliente Potencial"
                                        style={{marginRight:'80px'}}
                                />
                                <FormControlLabel
                                        control={
                                        <Field
                                            type="checkbox"
                                            name="requiereEntrega"
                                            checked={requiereEntrega}
                                            onChange={(e)=>handleRequiereEntrega(e.target.checked)}
                                            as={CheckBox}
                                        />
                                        }
                                        label="Requiere Entrega"
                                />
                            </div>
                            <div>
                                <Field
                                    label="Nombre"
                                    name="Nombre"
                                    error={!!errors.Nombre}
                                    helperText={errors.Nombre}
                                    style={{marginRight:'80px'}}
                                    as={TextField}
                                />
                                <Field
                                    label="Telefono"
                                    error={!!errors.Telefono}
                                    name="Telefono"
                                    helperText={errors.Telefono}
                                    as={TextField}
                                />
                            </div>
                                <Field
                                    label="RTN"
                                    error={!!errors.RTN}
                                    name="RTN"
                                    helperText={errors.RTN}
                                    style={{marginRight:'80px'}}
                                    as={TextField}
                                />
                                <Field
                                    label="Confirme RTN"
                                    error={!!errors.RTN2}
                                    name="RTN2"
                                    helperText={errors.RTN2}
                                    as={TextField}
                                />
                        </div>
                        <div>
                            <Field
                                name="Direccion"
                                label="Direccion"
                                style={{width:'100%'}}
                                error={!!errors.Direccion}
                                helperText={errors.Direccion}
                                as={TextField}
                            />
                        </div>
                        
                        <div style={{marginTop:'20px'}}>
                        <ButtonGroup size="large" color="primary" aria-label="large outlined primary button group">
                            <Button disabled={enableSave} type="submit">Guardar</Button>
                            <Button  disabled={enableEdit} onClick={()=>{handleEdit(values)}}>Modificar</Button>
                            <Button 
                                disabled={enableNew} 
                                onClick={()=>{

                                    resetForm();
                                    setEnableSave(false);
                                    setEnableEdit(true);
                                    setEnableNew(true);
                                    dispatch({type:'DELETE_CLIENTECONTADO'});
                                }
                                }>Nuevo</Button>
                        </ButtonGroup>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    )
});

export default ClienteContado;