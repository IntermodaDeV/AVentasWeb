import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Divider,
  IconButton,
  Card,
  CardContent,
} from "@material-ui/core";
import Swal from "sweetalert2/dist/sweetalert2.js";
import * as Yup from "yup";
import "react-dropzone-uploader/dist/styles.css";
import { Loading } from "components/Global/Loading";
import { AttachFile, DeleteOutline, InfoOutlined, InsertDriveFile } from "@material-ui/icons";
import axios from 'axios';
import { APIURL } from "utils/Enviroment";

const validationSchema = Yup.object({
  pedidoOrigen: Yup.string().required("Este campo es obligatorio"),
});

const Traslado = () => {
  const apiUrl = APIURL;

  const [procesandoArchivo, setProcesandoArchivo] = useState(false);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [correoUsuario, setCorreoUsuario] = useState('');

  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  const handleEnviarCorreo = (pedidoOrigen) => {
    getEmail(pedidoOrigen);
  };

  const handleUploadSubmit = async (pedidoOrigen) => {

    setProcesandoArchivo(true);
    
    let correo = correoUsuario;
    if (!correo) {
      correo = await fetchCorreoUsuario();
      if (correo) {
        setCorreoUsuario(correo)
      }else{
        setProcesandoArchivo(false);
        return;
      };
    }

    
    let data = new FormData();
    data.append('archivo', archivoSeleccionado);
    data.append('codigoDelVendedor', localStorage.getItem('codigo') || '');
    data.append('nombreDelVendedor', localStorage.getItem('asesor') || '');
    data.append('company', localStorage.getItem('empresa') || '');
    data.append('correoUsuario', correo || '');

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${APIURL}/api/traslado/postSincronizarPlantillaAX`,
        headers: {},
        data: data
    };

   await postSincronizarPlantillaAX(config);


  };

  const fetchCorreoUsuario = async () => {
    try {
      const asesor = localStorage.getItem('codigo');
      const response = await axios.get(`${APIURL}/api/asesor/byCodigo/${asesor}`);
      if (response.data && response.data.CorreoUsuario) {
        return response.data.CorreoUsuario;
      } else {
        Swal.fire({
          title: "Correo no encontrado",
          text: "No se pudo obtener el correo del usuario.",
        });
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el correo:", error);
      Swal.fire({
        title: "Error",
        text: "No fue posible obtener el correo del usuario.",
      });
      return null;
    }
  };


  const getEmail = async  (pedidoOrigen) => {
    setEnviandoCorreo(true);
    const correo = await fetchCorreoUsuario();
    if (correo) {
      setCorreoUsuario(correo);
      await postSendEmailConPedidoDeVenta(pedidoOrigen, correo);
    }else{

      setEnviandoCorreo(false);
    }
  };

  const postSincronizarPlantillaAX = async (config) => {
    axios.request(config)
      .then((response) => {
            setProcesandoArchivo(false);
            const mensaje = response.data.message;
            const contieneSaltos = mensaje.includes('\n');

            const html = contieneSaltos
            ? `<ul>${mensaje
                    .split('\n')
                    .map(linea => `<li style="text-align: left;">${linea}</li>`)
                    .join('')}</ul>`
            : mensaje;

            if (response.data.isComplete) {

                Swal.fire({
                    title: "Completado",
                    html: html,
                    type: "success",
                    confirmButtonText: "Ok",
                });
            } else {
                Swal.fire({
                    title: "No se completo el traslado",
                    html: html,
                    type: "warning",
                    confirmButtonText: "Ok",
                });
            }
      })
      .catch((error) => {
        setArchivoSeleccionado(null);
        document.getElementById("file-input").value = "";
        setProcesandoArchivo(false);
        console.error("Error al procesar el archivo:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo procesar el archivo. Inténtalo de nuevo.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      })
  }

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "xls" && ext !== "xlsx") {
      Swal.fire({
        title: "Error",
        text: "Solo se permiten archivos Excel (.xls o .xlsx)",
        icon: "error",
        confirmButtonText: "Ok",
      });
      e.target.value = "";
      setArchivoSeleccionado(null);
      return;
    }

    setArchivoSeleccionado(file);
  };




const postSendEmailConPedidoDeVenta = (pedidoOrigen, email) => {
    setEnviandoCorreo(true);

    const body = {
        "pedido": pedidoOrigen,
        "emailDestino": email,
        "dataAreaId": localStorage.getItem("empresa") || "",
    }

    axios.post(`${apiUrl}/api/traslado/postEnviarExcelCorreo`, body, {
        headers: {
            'Content-Type': 'application/json'
        },
        maxBodyLength: Infinity
    })
    .then(response => {

        setEnviandoCorreo(false);

        if(response.data.isComplete){
            Swal.fire({
                title: "Enviado",
                text: `${response.data.message}`,
                type: "success",
                confirmButtonText: "Ok",
            });
        }else{
            Swal.fire({
                title: "No Enviado",
                text: `${response.data.message}`,
                type: "error",
                confirmButtonText: "Ok",
            });
        }
    })
    .catch(error => {
      setEnviandoCorreo(false);
      console.error('Error al enviar el correo:', error);
    });
}


  return (
    <div>
      {/* Banner dinámico */}
      <Loading
        open={procesandoArchivo || enviandoCorreo}
        title={
          enviandoCorreo
            ? "Enviando plantilla por correo..."
            : "Procesando archivo..."
        }
      />

      <div
        style={{
          padding: "100px 20px 20px 20px",
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        

        <Formik
          type="multipart/form-data"
          initialValues={{ pedidoOrigen: "" }}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          {({ values, errors, touched }) => (
            <Form>
                {/* Paso 1: Digitar Pedido */}
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Pedido Origen de Traslado
                        </Typography>

                        <div className="mb-4 rounded border p-1" style={{display:'flex',  fontSize: '12px', gap: '4px'}} >
                            <InfoOutlined style={{opacity: '0.6'}} />
                            <span style={{opacity: '0.6'}}>Completa la información del pedido origen. Una vez creado, se generará y enviará automáticamente la plantilla por correo.</span>
                        </div>
                
                        <Field name="pedidoOrigen">
                            {({ field }) => (
                            <TextField
                                {...field}
                                label="Digite Pedido Origen (PV)"
                                variant="outlined"
                                fullWidth
                                error={Boolean(touched.pedidoOrigen && errors.pedidoOrigen)}
                                helperText={touched.pedidoOrigen && errors.pedidoOrigen}
                                style={{ marginBottom: 20 }}
                            />
                            )}
                        </Field>

                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!values.pedidoOrigen || enviandoCorreo}
                            onClick={() => handleEnviarCorreo(values.pedidoOrigen)}
                        >
                            {enviandoCorreo ? (
                            <CircularProgress size={20} color="inherit" />
                            ) : (
                            "Enviar Plantilla al Correo"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Divider visual */}
                <Divider style={{ margin: "30px 0" }} />

                {/* Paso 2: Cargar Plantilla */}
                <Card>
                    <CardContent>

                        <Typography variant="h6" gutterBottom>
                            Subir Plantilla Completada
                        </Typography>

                        <div className="mb-4 rounded border p-1" style={{display:'flex',  fontSize: '12px', gap: '4px'}} >
                            <InfoOutlined style={{opacity: '0.6'}} />
                            <span style={{opacity: '0.6'}}>Sube la plantilla completada. El sistema la procesará automáticamente y creará los pedidos de traslado.</span>
                        </div>

                        <div
                            style={{
                            border: archivoSeleccionado
                                ? "2px solid #274c77"
                                : "2px solid #e5e5e5",
                            boxShadow: archivoSeleccionado
                                ? "0 2px 5px rgba(0,0,0,0.1)"
                                : "none",
                            borderRadius: 8,
                            padding: 24,
                            textAlign: "center",
                            backgroundColor: "#f5f5f5",
                            cursor: "pointer",
                            marginBottom: 10,
                            position: "relative",
                            }}
                            onClick={() => document.getElementById("file-input").click()}
                        >
                            {archivoSeleccionado && (
                            <IconButton
                                size="small"
                                variant="text"
                                type="button"
                                style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setArchivoSeleccionado(null);
                                    document.getElementById("file-input").value = "";
                                }}
                            >
                                <DeleteOutline />
                            </IconButton>
                            )}
                            <div
                            style={{
                                marginBottom: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                            }}
                            >
                            {archivoSeleccionado ? (
                                <>
                                <InsertDriveFile />
                                {archivoSeleccionado.name}
                                </>
                            ) : (
                                <>
                                <AttachFile />
                                Haz clic para subir un archivo
                                </>
                            )}
                            </div>
                            <input
                            id="file-input"
                            type="file"
                            accept=".xls,.xlsx"
                            style={{ display: "none" }}
                            onChange={handleArchivoChange}
                            />
                        </div>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={!archivoSeleccionado || procesandoArchivo}
                            onClick={() => handleUploadSubmit(values.pedidoOrigen)}
                        >
                            {procesandoArchivo ? (
                            <CircularProgress size={20} color="inherit" />
                            ) : (
                            "Cargar Plantilla"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Traslado;
