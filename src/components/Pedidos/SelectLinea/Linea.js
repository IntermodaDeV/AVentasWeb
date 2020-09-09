import React from 'react';
import Img from 'react-image'
import { ScaleLoader } from 'react-spinners';
import {
    Card,
    CardHeader,
    CardMedia,
    CardActionArea,
    Typography
} from "@material-ui/core";
import nodisponible from 'assets/nodisponible.png';
import { APIURL } from 'utils/Enviroment';
import {useDispatch} from 'react-redux';

const Linea = (props) => {
    const [Raised, setRaised] = React.useState(false);
    const dispatch = useDispatch();
    let imagen = props.Linea.Imagen !== null ? props.Linea.Imagen : nodisponible;

    if (props.Linea.Imagen === null) {
        switch (props.Linea.Linea) {
            case 'Complementario':
                imagen = 'https://img1.theiconic.com.au/bU-XGvyk3KPm0oiRVkaYFIBjdAk=/634x811/filters:quality(95):fill(ffffff)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnique-5751-618679-1.jpg';
                break;
            case 'Denim':
                imagen = 'https://img1.theiconic.com.au/mPfUc-yG99_JGPGqOXSyOETirZs=/634x811/filters:quality(95):fill(ffffff)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Ftopshop-7099-995926-3.jpg';
                break;
            case 'Estampado':
                imagen = 'https://img1.theiconic.com.au/9A9b_POtDSWKwcKSPFBW3PeyhLA=/634x811/filters:quality(95):fill(ffffff)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fstaple-superior-3410-496245-1.jpg';
                break;
            case 'Tejido de punto':
                imagen = "https://img1.theiconic.com.au/1kLelXjR5ACyG3jzPO_pVIBIiM8=/634x811/filters:quality(95):fill(ffffff)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fbetty-basics-2335-305479-1.jpg";
                break;
            default:
                imagen = props.Linea.Imagen != null ? props.Linea.Imagen : nodisponible;
                break;
        }
    }

    const cargarColecciones = () => {
        props.setLinea(props.Linea);
        fetch(`${APIURL}/api/colecciones/${props.Linea.IdLinea}/${localStorage.getItem('empresa')}`)
        .then(res=>res.json())
        .then(data=>dispatch({ type: 'STORE_COLECCIONES', colecciones: data }));
    }

    return (
        <Card raised={Raised} onMouseEnter={() => setRaised(true)} onMouseLeave={() => setRaised(false)}>
            <CardActionArea onClick={cargarColecciones}>
                <CardHeader
                    title={
                        <Typography gutterBottom variant="h5" component="h2">
                            {props.Linea.Linea}
                        </Typography>}
                    style={{ borderBottom: '1px solid #ddd', padding: '10px 16px' }}
                />
                <CardMedia
                    component="div"
                    style={{ display: 'flex' }}
                    title={props.Linea.Linea}
                    children={
                        <Img
                            className="card-img-right"
                            src={imagen}
                            style={{ width: '100%', objectFit: 'contain' }}
                            loader={
                                <ScaleLoader
                                    css={{ margin: 'auto', position: 'relative', textAlign: 'center' }}
                                    size={'20px'}
                                    color={'#000'}
                                    loading={true} />
                            }
                        />
                    }
                />
            </CardActionArea>


        </Card>
    )
}

export default Linea;
