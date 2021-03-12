import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
import FormikErrorFocus from 'formik-error-focus'
const CheckBox = (props) => {
    const { label, Descripcion, name, options, ...rest } = props;
    return (
        <div classname='form-control' hidden={props.hidden}>
            <label>{label}</label>
            <p style={{ fontStyle: 'italic', fontSize:'13px' }} htmlFor={"Id" + name}>{Descripcion}</p>
            <div className="form-group">
                <Field name={name} {...rest} >
                    {
                        ({ field }) => {
                            return options.map(option => {
                                let valores = props.respuestaCheckBox !== undefined && props.respuestaCheckBox.length > 0 ? String(props.respuestaCheckBox) : field.value;
                                let isDisable = props.respuestaCheckBox !== undefined ? true : false;
                                return (
                                    <React.Fragment key={option.key}>
                                        <label htmlFor={option.value} style={{ marginRight: '5px', marginLeft:'10px' }}>{option.key}</label>
                                        <input
                                            type='checkbox'
                                            id={option.value}
                                            disabled = {isDisable}
                                            {...field}
                                            value={option.value}
                                            checked={valores !== undefined ? valores.includes(String(option.value)) : false}
                                        />
                                    </React.Fragment>
                                )
                            })
                        }

                    }
                </Field>
                <FormikErrorFocus
                    offset={0}
                    align={'top'}
                    focusDelay={200}
                    ease={'linear'}
                    duration={1000}
                />
            </div>
            <ErrorMessage name={name} component={TextError} />
            <br></br>
        </div>
    )
}
export default CheckBox; 