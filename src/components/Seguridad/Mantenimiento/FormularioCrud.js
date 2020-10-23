import React,{useRef} from 'react';
import {Formik,Form,Field} from 'formik';
import * as yup from 'yup';
import TextField from '@material-ui/core/TextField';
import  CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const validationSchema = yup.object().shape(
{
    Nombre: yup.string().required('El nombre es obligatorio'),
    Status: yup.boolean()
});

export const FormularioCrud = props => {
    const {Valores,Crear,OcultarModal,Modificar} = props;

    const context = useRef();

    let initialValues,edit;

    if(Valores)
    {
        initialValues={
            Id: Valores.Id,
            Nombre: Valores.Nombre,
            Status: Valores.Status
        }
        edit=true;
    }
    else
    {
        initialValues={
            Nombre: '',
            Status: true
        }
        edit=false;
    }

    const handleSubmit = (values)=>{
        Crear(values);
        OcultarModal();
    }

    const handleEdit = (values) =>{
        Modificar(values);
        OcultarModal();
    }

    return (
        <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={(values)=>{
                handleSubmit(values)
            }}>
            {({errors,resetForm,values,setValues})=>(
                <div ref={context}>
                    <Form>
                        <div className="form-group">
                            <Field
                                label="Nombre"
                                name="Nombre"
                                error={!!errors.Nombre}
                                helperText={errors.Nombre}
                                style={{fontSize:'40px',width: '450px'}}
                                as={TextField}
                                className ="form-control"/>
                        </div>
                        <FormControlLabel
                                control={
                                <Field
                                    type="checkbox"
                                    name="Status"
                                    checked={values.Status}
                                    as={CheckBox}
                                />
                                }
                                label={"Activar"}/>
                        <DialogActions>
                        <Button onClick={OcultarModal} color="primary">
                            Cancelar
                        </Button>
                       {edit && <Button type="button" onClick={()=>{handleEdit(values)}} color="sucess"> Guardar</Button>} 
                       {!edit && <Button type="submit" color="sucess">Guardar</Button>}
                    </DialogActions>
                    </Form>

                   
                </div>
            )}
        </Formik>
    )
}