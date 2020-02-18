import React from 'react'
import { FiTrash2 } from 'react-icons/fi';
import { ThemeProvider, Chip } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import { MdFilterList } from 'react-icons/md';

import styles from 'components/Pedidos/ProductoLista/FiltroChips.module.css'

const theme = createMuiTheme({
    palette: {
        secondary: { main: '#dc3545' },
    },
});

const FiltroChips = (props) => {

    let chips = null;

    if (props.filtroActivo) {
        chips = (
            <div className="row w-100">
                {/* <div className="col-lg-1 col-2 p-0 pt-1">
                    Filtros:
                </div> */}
                {/* {className="col-lg-11  col-10 p-0"} */}
                <div className="col-12 p-0">
                    <ThemeProvider theme={theme}>

                        {
                            Object.keys(props.filtroAtributos).map((categ, indCateg) => {

                                return props.filtroAtributos[categ].map((filtro, ind) => {
                                    return (
                                        <Chip
                                            key={"index" + ind}
                                            className={styles.Chips}
                                            variant="outlined" size="small"
                                            onDelete={() => props.handleDeleteFiltros(categ, filtro)}
                                            label={categ.charAt(0).toUpperCase() + categ.slice(1).toLowerCase() + " / " + filtro}
                                            icon={<MdFilterList />}
                                        />
                                    )
                                });
                            })
                        }
                        {
                            props.filtroEdad !== null &&
                            <Chip
                                className={styles.Chips} style={{ marginBottom: 5 }}
                                variant="outlined" color="secondary" size="small"
                                label={"Edades"}
                                onDelete={() => props.setFiltroEdad(null)}
                                icon={<FiTrash2 />}
                            />
                        }
                        {
                            props.filtroActivo &&
                            <Chip
                                className={styles.Chips} style={{ marginBottom: 5 }}
                                variant="outlined" color="secondary" size="small"
                                label={"Todos"}
                                onDelete={() => props.handleDeleteAllFiltros()}
                                icon={<FiTrash2 />}
                            />
                        }

                    </ThemeProvider>
                </div>
            </div>
        )
    }
    else if (props.filtroEdad !== null) {
        chips = (
            <div className="row w-100">
                {/* <div className="col-lg-1 col-2 p-0 pt-1">
                    Filtros:
                </div> */}
                {/* className="col-lg-11  col-10 p-0" */}
                <div className="col-12 p-0">
                    <ThemeProvider theme={theme}>
                        <Chip
                            className={styles.Chips} style={{ marginBottom: 5 }}
                            variant="outlined" color="secondary" size="small"
                            label={"Edades"}
                            onDelete={() => props.setFiltroEdad(null)}
                            icon={<FiTrash2 />}
                        />
                    </ThemeProvider>
                </div>
            </div>
        )
    }

    return chips;
}


export default FiltroChips;