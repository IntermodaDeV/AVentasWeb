import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
const CheckBox = (props) => {
    const { label, name, options, ...rest } = props;
    return (
        <div classname='form-control'>
            <label>{label}</label>
            <div className="form-group">
                <Field name={name} {...rest} >
                    {
                        ({ field }) => {
                            return options.map(option => {
                                return (
                                    <React.Fragment key={option.key}>
                                        <input
                                            type='checkbox'
                                            id={option.value}
                                            {...field}
                                            value={option.value}
                                            checked={field.value !== undefined ? field.value.includes(String(option.value)) : false}
                                        />
                                        <label htmlFor={option.value} style={{ marginRight: '10px' }}>{option.key}</label>
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
export default CheckBox; 