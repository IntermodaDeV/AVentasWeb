import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
const Input = (props) => {
    const { label, name, ...rest } = props;
    return (
        <div classname='form-group'>
            <label htmlFor={name}>{label}</label>
            <Field
                id={name}
                name={name} {...rest} 
                style={{  width: '700px'}}
                className="form-control"/>
            <ErrorMessage name={name} component={TextError} />
        </div>
    )
}
export default Input; 