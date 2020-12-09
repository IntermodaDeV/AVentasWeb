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
  return ['Sincronizar configuraciones', 'Sincronizar Modulo de pedidos', 'Sincronizar Modulo Recibo'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return "Se sincronizará configuraciones necesarias en sistema";
    case 1:
      return 'Se sincronizara listado de clientes, paquetes, precios, stock';
    case 2:
      return " Se sincronizara listado de clientes, monedas, bancos, tipos de pagos";
    default:
      return 'Unknown step';
  }
}

const VerticalLinearStepper = (props) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    switch (activeStep) {
      case 0:
        props.CargarModuloConfiguraciones();
        if(!props.loading){
         return setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
        break;
      case 1:
        props.CargaModuloPedidos();
        if(!props.loading){
          return setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
        break;
      case 2:
        props.CargaModuloRecibo();
        if(!props.loading){
          return setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
        break;
      default:
        return setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel><h3>{label}</h3></StepLabel>
            <StepContent>
              <Typography>{getStepContent(index)}</Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Regresar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >

                      {props.loading ?
                            <ScaleLoader
                                css={{ height: '25px', bottom: '5px', position: 'relative', transform: 'scale(0.6)' }}
                                size={'20px'}
                                color={'#fff'}
                                loading={props.loadingRecibo} /> : 'Sincronizar'
                        }
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
        <Typography><h3 style={{color:'green'}}>Proceso de sincronizacion ejecutado correctamente<MdCheckCircle/></h3></Typography>
          <Button onClick={handleReset} className={classes.button}>
            Re-Sincronizar
          </Button>
        </Paper>
      )}
    </div>
  );
}

export default VerticalLinearStepper;