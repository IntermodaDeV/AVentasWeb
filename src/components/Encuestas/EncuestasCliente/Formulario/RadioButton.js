import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
const RadioButton = (props) => {
    const { label, name, options, ...rest } = props;
    return (
        <div classname='form-control'>
            <label>{label}</label>
            <div className="form-group">
                <Field name={name} {...rest}>
                    {
                        ({ field }) => {
                            return options.map(option => {
                                return (
                                    <React.Fragment key={option.key}>
                                        <label htmlFor={option.value} style={{ marginRight: '5px', marginLeft:'10px' }}>{option.key}</label>
                                        <input
                                            type='radio'
                                            id={option.value}
                                            {...field}
                                            value={option.value}
                                            checked={field.value === String(option.value)}
                                        />
                                        
                                    </React.Fragment>
                                )
                            })
                        }

                    }
                </Field>
            </div>
            <ErrorMessage name={name} component={TextError} />
        </div>
    )
}
export default RadioButton; 