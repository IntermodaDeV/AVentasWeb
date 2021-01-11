import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { ScaleLoader } from 'react-spinners';
import { MdCheckCircle } from "react-icons/md";
import { verificarConexion } from 'utils/http';
import Swal from 'sweetalert2/dist/sweetalert2.js';
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

function getSteps() {
  return ['Sincronizar configuraciones','Modulo Cartera de Clientes', 'Sincronizar Modulo Recibo', 'Sincronizar Modulo de pedidos'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return "Se sincronizará configuraciones necesarias en sistema";
    case 1:
      return "Se carga la cartera de clientes y su informacion general";
    case 2:
      return "Se sincronizara listado de clientes, monedas, bancos, tipos de pagos";
    case 3:
      return "Se sincronizara listado de clientes, paquetes, precios, stock";
    default:
      return 'Unknown step';
  }
}

const VerticalLinearStepper = (props) => {
  const classes = useStyles();
  const steps = getSteps();

  const mostrarAdvertencia = (title,text,type)=>{
    Swal.fire({
        title: title,
        text: text,
        type: type,
        confirmButtonText: 'Ok',
    })
}

  const SyncDiaria = async () => {
    let isOnline = await verificarConexion();
    if (localStorage.getItem("Conexion") === "offline") {
      mostrarAdvertencia("Modo Offline", "Se encuentra en modo offline, no puede realizar sincronización diaria.", "warning");
    }
    else {
      if (!isOnline) {
        mostrarAdvertencia('Sin internet', 'Necesita internet para poder realizar sincronización diaria.', 'warning');
      }
      else {
        props.CargarModuloConfiguraciones();
      }
    }
  };
  return (
    <div className={classes.root}>
      <div className={classes.actionsContainer}>
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={SyncDiaria}
            className={classes.button}
          >
            {props.loading ?
              <ScaleLoader
                css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                size={'20px'}
                color={'#fff'}

                loading={props.loadingRecibo} /> : "Sincronización Diaria"
            }
          </Button>

        </div>
      </div>
     
      <Stepper activeStep={props.activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel><h3>{label}</h3></StepLabel>
            <StepContent>
              <Typography>{getStepContent(index)}</Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {props.activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography><h3 style={{ color: localStorage.getItem("OcurrioError") === "false" ? 'green' :'red' }}>{localStorage.getItem("OcurrioError") === "false" ?"Proceso de sincronizacion ejecutado correctamente" : "Proceso de sincronizacion ejecutado con errores"}<MdCheckCircle /></h3></Typography> 
          <Typography><h3 style={{ color: localStorage.getItem("ErrorDocumentos") === "false" ? 'green' :'red' }}>{localStorage.getItem("ErrorDocumentos") === "false" ?"Sincronización de pedidos y recibos ejecutado correctamente." : "Sincronización de pedidos y recibos ejecutado con errores."}<MdCheckCircle /></h3></Typography>    
        </Paper>
      )}
    </div>
  );
}

export default VerticalLinearStepper;