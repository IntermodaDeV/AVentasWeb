import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
const TextArea = (props) => {
    const { label, name, ...rest } = props;
    return (
        <div classname='form-control'>
            <label htmlFor={name}>{label}</label>
            <Field
                style={{ width: '450px', marginRight: '20px' }}
                className="form-control"
                id={name}
                name={name} {...rest}
                as='textarea' />
            <ErrorMessage name={name} component={TextError} />
        </div>
    )
}
export default TextArea; 