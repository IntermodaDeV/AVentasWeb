import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography
} from '@material-ui/core';
import 'sweetalert2/src/sweetalert2.scss';

export const ProductosDevolucion = (props) => {
    return (
        <Card style={{ margin: '15px' }}>
            <CardHeader
                title={
                    <Typography gutterBottom variant="h5" component="h2">
                        <h3>Productos a Devolver</h3>
                    </Typography>}
                style={{ borderBottom: '1px solid #ddd', padding: '10px 16px' }}
            />
            <CardContent>

            </CardContent>
        </Card>
    );
}



