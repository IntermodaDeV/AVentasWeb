import React from 'react'
const TextError = (props) => {
    return(
    <div style={{color:'red', marginBottom: '10px'}} >
       {props.children}
    </div>
)}
export default TextError; 