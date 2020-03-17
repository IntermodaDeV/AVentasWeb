import React,{useState}         from 'react';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

const LoadingModal =(props)=>{

    const [isLoading,setLoading] = useState(false);

    const nativeFetch = window.fetch;
    window.fetch = (...args)=>{
        
        if(args[0].includes("Geoposicion"))
        {
            return nativeFetch.apply(window,args);
        }

        setLoading(true);
        return nativeFetch.apply(window,args).then((e)=>{
            setLoading(false);
            return e;
        });
    }

    return (
    <>
        <Dialog
            disableBackdropClick 
            scroll={'paper'}
            open={isLoading}
            >
                <DialogTitle className="text-center" id="scroll-dialog-title">
                    <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        Cargando
                </div>
                </DialogTitle>
                <DialogContent>
                
                <div className="d-flex flex-grow-1 align-items-center justify-content-center">
                        <div className="row">
                            <div className="col-12 text-center">
                                <CircularProgress disableShrink/>
                            </div>
                        </div>
                    </div>
                
                    
                </DialogContent>
        </Dialog>
    </>)
}

export default LoadingModal;