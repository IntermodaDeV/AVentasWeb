import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
import FormikErrorFocus from 'formik-error-focus'
const Input = (props) => {
    const { label, Descripcion, name, ...rest } = props;
    return (
        <div classname='form-group'>
            <label htmlFor={name}>{label}</label>
            <p style={{ fontStyle: 'italic', fontSize:'13px' }} htmlFor={"Id" + name}>{Descripcion}</p>
            <Field
                autoFocus
                id={name}
                name={name} {...rest} 
                style={{  width: '700px'}}
                className="form-control"/>
            <FormikErrorFocus
                offset={0}
                align={'top'}
                focusDelay={300}
                ease={'linear'}
                duration={1000}
            />
            <ErrorMessage name={name} component={TextError} />
        </div>
    )
}
export default Input; 