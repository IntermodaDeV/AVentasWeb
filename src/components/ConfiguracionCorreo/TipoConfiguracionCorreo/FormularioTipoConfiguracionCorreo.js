import React,{useRef} from 'react';
import {Formik,Form,Field} from 'formik';
import * as yup from 'yup';
import TextField from '@material-ui/core/TextField';
import  CheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';

const validationSchema = yup.object().shape(
{
    Codigo: yup.string().required('El código es obligatorio'),
    Descripcion: yup.string().required('La descripción es obligatoria'),
    Activo: yup.boolean()
});

export const FormularioTipoConfiguracionCorreo = props => {
    const {Valores,Crear,OcultarModal,Modificar,rolesDisponibles} = props;

    const context = useRef();

    let initialValues,edit;

    if(Valores)
    {
        initialValues={
            Id: Valores.Id,
            Codigo: Valores.Codigo,
            Descripcion: Valores.Descripcion,
            Activo: Valores.Activo,
            Roles: Valores.RolesAsignados || [],
            Usuario: localStorage.getItem('codigo')
        }
        edit=true;
    }
    else
    {
        initialValues={
            Codigo: '',
            Descripcion: '',
            Activo: true,
            Roles: [],
            Usuario: localStorage.getItem('codigo')
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
            {({errors,values,setFieldValue})=>(
                <div ref={context}>
                    <Form>
                        <div className="form-group">
                            <Field
                                label="Código"
                                name="Codigo"
                                error={!!errors.Codigo}
                                helperText={errors.Codigo}
                                disabled={edit}
                                style={{fontSize:'40px',width: '450px'}}
                                as={TextField}
                                className ="form-control"/>
                        </div>
                        <div className="form-group">
                            <Field
                                label="Descripción"
                                name="Descripcion"
                                error={!!errors.Descripcion}
                                helperText={errors.Descripcion}
                                style={{fontSize:'40px',width: '450px'}}
                                as={TextField}
                                className ="form-control"/>
                        </div>
                        <FormControlLabel
                                control={
                                <Field
                                    type="checkbox"
                                    name="Activo"
                                    checked={values.Activo}
                                    as={CheckBox}
                                />
                                }
                                label={"Activo"}/>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="roles-tipo-correo-label">Roles con acceso a este tipo</InputLabel>
                            <Select
                                labelId="roles-tipo-correo-label"
                                multiple
                                value={values.Roles}
                                onChange={(e)=>{setFieldValue('Roles', e.target.value)}}
                                renderValue={(seleccionados)=>rolesDisponibles
                                    .filter(rol=>seleccionados.includes(rol.Id))
                                    .map(rol=>rol.Nombre)
                                    .join(', ')}
                                style={{width:'450px'}}
                            >
                                {rolesDisponibles.map(rol=>(
                                    <MenuItem key={rol.Id} value={rol.Id}>
                                        <CheckBox checked={values.Roles.includes(rol.Id)}/>
                                        <ListItemText primary={rol.Nombre}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <DialogActions>
                        <Button onClick={OcultarModal} color="primary">
                            Cancelar
                        </Button>
                       {edit && <Button type="button" onClick={()=>{handleEdit(values)}} color="sucess"> Editar</Button>}
                       {!edit && <Button type="submit" color="sucess">Guardar</Button>}
                    </DialogActions>
                    </Form>
                </div>
            )}
        </Formik>
    )
}
