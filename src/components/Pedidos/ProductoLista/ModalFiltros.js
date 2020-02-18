import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Checkbox } from 'element-react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    ExpansionPanel as MuiExpansionPanel,
    ExpansionPanelSummary as MuiExpansionPanelSummary,
    ExpansionPanelDetails as MuiExpansionPanelDetails,
} from '@material-ui/core';

const ModalFiltros = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Update the document title using the browser API
        let node = document.getElementById(props.IdNode);
        if (node !== null) {
            document.getElementById(props.IdNode).addEventListener("click", () => handleClickOpen());
        }
        setIsOpen(false);
        // eslint-disable-next-line
    }, []);

    const handleClickOpen = () => {
        setIsOpen(true);
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    const GetModal = (
        <Dialog
            open={isOpen}
            onClose={handleClose}
        >
            <DialogTitle>
                Filtros
                </DialogTitle>
            <DialogContent className="pt-0">
                <div className="row">
                    <div className={"col-12 px-0 mb-2 " + props.styles.SearchContainerDialog}>
                        <div className={props.styles.SearchFiltrosIcon}>
                            <div
                                className={props.buscadorFiltros !== "" ? props.styles.searchToggle + " " + props.styles.active : props.styles.searchToggle}
                                onClickCapture={() => props.OnClickSearch()} >
                            </div>
                        </div>
                        <input type="text" value={props.buscadorFiltros} onChange={event => props.SearchFiltros(event)} placeholder={"Buscar"} className={"pr-2 " + props.styles.SearchFiltros} />

                    </div>
                    {
                        props.Filtros.length !== 0 ?
                            props.Filtros.map((atributoXcoleccion, index) => {
                                return (
                                    <div className="col-12" key={index}>

                                        <ExpansionPanel square expanded={props.verificarExpandirFiltroAtributos("panel" + index.toString())} onChange={() => props.toggleExpandirFiltroAtributos("panel" + index.toString())}>
                                            <ExpansionPanelSummary className={props.styles.TitleExpansionContainerDialog} expandIcon={<ExpandMoreIcon />} aria-controls={"panel" + index.toString() + "d-content"} id={"panel" + index.toString() + "d-header"}>
                                                {atributoXcoleccion.Tipo}

                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                                <div style={{ overflow: 'auto' }}>

                                                    {atributoXcoleccion.Descripciones.map((Descripcion, index2) => {
                                                        var atrib = {
                                                            [atributoXcoleccion.Tipo]: Descripcion
                                                        };
                                                        return (
                                                            <p key={index2}>
                                                                <Checkbox
                                                                    checked={props.VerificarFiltro(atrib)}
                                                                    onChange={props.MarcarFiltro.bind(this, atrib)}
                                                                >
                                                                    {Descripcion}</Checkbox>
                                                                <br />
                                                            </p>

                                                        )
                                                    })}
                                                </div>

                                            </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                    </div>
                                )
                            })
                            :
                            <div className="text-center">
                                Sin Resultados
                                </div>
                    }
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    )

    return GetModal;
}

const ExpansionPanel = withStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
        },
    },
    expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
    root: {
        backgroundColor: 'rgba(255,255,255)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: 56,
        '&$expanded': {
            minHeight: 56,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiExpansionPanelDetails);

export default ModalFiltros;