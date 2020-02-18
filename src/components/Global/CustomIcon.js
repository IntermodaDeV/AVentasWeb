import React from 'react';
import { FaWarehouse, FaRegClock } from "react-icons/fa";
import { ViewComfy } from '@material-ui/icons';
const CustomIcon = (props) => {
    switch (props.IconName) {
        case 'FaWarehouse':
            return <FaWarehouse size={props.size} />
        case 'FaRegClock':
            return <FaRegClock size={props.size} />
        default:
            return <ViewComfy size={props.size} />
    }
}
export default CustomIcon