import React from 'react';
import Dialog        from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle   from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

export const Loading = props =>{
    return (
        <>
            <Dialog
                disableBackdropClick 
                scroll={'paper'}
                open={props.open}
                >
                    <DialogTitle className="text-center" id="scroll-dialog-title">
                        <div style={{ fontWeight: 300, fontSize: '24px', fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                            {props.title}
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