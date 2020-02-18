import React from 'react';
import Coleccion from './Coleccion'
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { blue } from '@material-ui/core/colors';
import { AppBar, Tabs, Tab } from '@material-ui/core';
// import { FaSearch, FaTimes } from "react-icons/fa";
import CustomIcon from 'components/Global/CustomIcon';
import SearchButton from 'components/Pedidos/ProductoLista/SearchButton'
import styles from 'components/Pedidos/Colecciones/ColeccionesList.module.css'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#F8F9FA",
    },
    secondary: blue,
  },
});

const changeTab = (props, value) => {
  var pathArray = props.match.url.split("/");
  pathArray.pop();
  props.history.replace(pathArray.join("/") + '/' + value);
}

const Colecciones = (props) => {
  const [TextboxValue, setTextboxValue] = React.useState("");

  var value = props.match.params.TipoColeccion;
  // if (!(value === "B" || value === "F")) {
  //   changeTab(props, "B")
  // }

  // const onClickIcon = () => {
  //   if (Active) {
  //     setTextboxValue("");
  //     setActive(false);
  //   }
  // }

  const onChangeSearch = (text) => {
    setTextboxValue(text);
  }
  const onSearchClear = (text) => {
    setTextboxValue("");
  }

  const getValidCollections = () => {
    let array = [];
    props.TiposColeccion.map((tipCol) => {
      let found = false;
      props.colecciones.map((coleccion) => {
        if (coleccion.ColeccionTipo === tipCol.ColeccionTipo && coleccion.Lineas.includes(props.LineaSeleccionada.IdLinea)) {
          found = true;
        }
        return false;
      });

      if (found) {
        array.push(tipCol);
      }
      return false;
    });
    return array;
  }
  return (

    <div >
      <div className="col-12 mb-3">
        <ThemeProvider theme={theme}>
          <AppBar position="static" color="primary">
            <Tabs value={value} indicatorColor="secondary" textColor="secondary" onChange={(event, value) => { changeTab(props, value) }}>
              {getValidCollections().map((tipCol, index) => {
                return <Tab key={index} icon={<CustomIcon IconName={tipCol.Icono} size={"20px"} />} label={tipCol.Descripcion} value={tipCol.ColeccionTipo} />
              })}
            </Tabs>
          </AppBar>
        </ThemeProvider>


        <div className={styles.SearchColeccionContainer} style={{
          position: 'relative',
          display: 'flex',
          float: 'right',
          top: '-53px',
          padding: '0 20px 0 0',
          height: '0',
        }}>
          {/* <input
            type="text"
            className={"form-control " + styles.SearchColeccion}
            value={TextboxValue}
            onChange={(event) => onChangeSearch(event.target.value)}
          /> */}

          {/* <button
            className={Active ? styles.SearchIcon + " text-danger" : styles.SearchIcon}
            onClickCapture={() => onClickIcon()}
          >
            {
              Active ? <FaTimes /> : <FaSearch />
            }
          </button> */}
        </div>
      </div>

      <div className="row">

        <div className="col-12 pb-3 text-right">
          <SearchButton onSearch={onChangeSearch} clear={onSearchClear} backgroundColor="unset" />
        </div>
        {
          props.colecciones.map((coleccion, index) => {
            if (coleccion.ColeccionTipo === value && coleccion.Lineas.includes(props.LineaSeleccionada.IdLinea)) {
              let encontrado = coleccion.Nombre.toLowerCase().includes(TextboxValue.toLowerCase().trim());
              if (encontrado) {
                return (
                  <Coleccion coleccion={coleccion} key={index} Click={props.Click.bind(this, coleccion)} />
                )
              }
              return false;
            }
            return false;
          }
          )
        }
      </div>
    </div>

  );


}

export default Colecciones;