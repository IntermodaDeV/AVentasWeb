import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import XLSX from 'xlsx';
import FileSaver from 'file-saver';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import GetAppIcon from '@material-ui/icons/GetApp';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { APIURL } from 'utils/Enviroment';

const COLOR_OK = '#2e7d32';
const COLOR_OK_BG = '#e8f5e9';
const COLOR_ERROR = '#c62828';
const COLOR_ERROR_BG = '#fdecea';
const COLOR_PRIMARY = '#1a6ba0';

const CONCURRENCIA_ENVIO = 4;

// --- Lectura y normalización del Excel -------------------------------------
// La plantilla es una sola hoja plana: cada fila trae cliente + tienda + acuerdo
// junto con UNA línea de detalle (artículo, color, talla, cantidad). Un mismo
// cliente+paquete+tienda+acuerdo puede repetirse en varias filas (una por línea).

const leerArchivo = file => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = e => {
            const contenido = e.target.result;
            const leido = XLSX.read(contenido, { type: 'binary', cellDates: true });
            leido ? resolve({ workbook: leido, hash: hashContenido(contenido) }) : reject('No se pudo leer el archivo');
        };
        reader.readAsBinaryString(file);
    });
};

// Huella del contenido del archivo (cyrb53), para detectar si se sube el mismo Excel dos veces.
// No es criptográfico, pero es más que suficiente para comparar archivos por contenido exacto.
const hashContenido = str => {
    let h1 = 0xdeadbeef ^ str.length;
    let h2 = 0x41c6ce57 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
};

// Normaliza texto para comparar códigos/colores/tallas: recorta espacios, colapsa espacios
// internos, pasa a mayúsculas y unifica variantes de guion (en-dash, em-dash, etc. que Excel
// suele autocorregir) a un guion normal ("-"), para que "PRE-PACK1" siempre matchee "Pre-pack1".
const GUIONES_UNICODE = new RegExp('[‐‑‒–—―−]', 'g');
const normalizarTexto = valor => String(valor || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(GUIONES_UNICODE, '-')
    .toUpperCase();

const buscarCampo = (fila, alias) => {
    const claves = Object.keys(fila);
    for (const nombre of alias) {
        const encontrada = claves.find(k => k.trim().toUpperCase() === nombre);
        if (encontrada !== undefined) {
            return fila[encontrada];
        }
    }
    return undefined;
};

const convertirFila = fila => ({
    paquete: String(buscarCampo(fila, ['PAQUETE']) || '').trim(),
    tienda: String(buscarCampo(fila, ['TIENDA']) || '').trim(),
    codigoCliente: String(buscarCampo(fila, ['CÓDIGO CLIENTE', 'CODIGO CLIENTE', 'CODIGOCLIENTE']) || '').trim(),
    tipoCredito: String(buscarCampo(fila, ['TIPO CREDITO', 'TIPO CRÉDITO']) || '').trim(),
    numAcuerdo: String(buscarCampo(fila, ['NUM ACUERDO', 'NUMERO ACUERDO', 'NÚMERO ACUERDO']) || '').trim(),
    codigoArticulo: String(buscarCampo(fila, ['CODIGOARTICULO', 'CÓDIGO ARTICULO', 'CODIGO ARTICULO']) || '').trim(),
    categoria: String(buscarCampo(fila, ['CATEGORIA', 'CATEGORÍA']) || '').trim(),
    color: String(buscarCampo(fila, ['COLOR']) || '').trim(),
    talla: String(buscarCampo(fila, ['TALLA']) || '').trim(),
    cantidad: buscarCampo(fila, ['CANTIDAD']),
});

const agruparFilas = filas => {
    const grupos = new Map();
    filas.forEach(fila => {
        const claveHeader = `${fila.codigoCliente}|${fila.paquete}|${fila.tienda}|${fila.numAcuerdo}`;
        if (!grupos.has(claveHeader)) {
            grupos.set(claveHeader, {
                paquete: fila.paquete,
                tienda: fila.tienda,
                codigoCliente: fila.codigoCliente,
                tipoCredito: fila.tipoCredito,
                numAcuerdo: fila.numAcuerdo,
                lineas: [],
            });
        }
        grupos.get(claveHeader).lineas.push({
            codigoArticulo: fila.codigoArticulo,
            categoria: fila.categoria,
            paquete: fila.paquete,
            color: fila.color,
            talla: fila.talla,
            cantidad: fila.cantidad,
        });
    });

    // La clave de "ya creado" incluye el contenido real del pedido (artículo/color/talla/cantidad),
    // no solo cliente+paquete+tienda+acuerdo: así, si cambian las cantidades o los artículos, se
    // trata como un pedido distinto y no se omite por error.
    return Array.from(grupos.values()).map(grupo => {
        const firmaLineas = grupo.lineas
            .map(l => `${l.codigoArticulo}#${l.color}#${l.talla}#${l.cantidad}`)
            .sort()
            .join(';');
        const clave = `${grupo.codigoCliente}|${grupo.paquete}|${grupo.tienda}|${grupo.numAcuerdo}|${hashContenido(firmaLineas)}`;
        return { ...grupo, clave };
    });
};

// --- Resolución de negocio ---------------------------------------------------

const calcularTipoVenta = (cliente, infoPaquete) => {
    const facturacion = (cliente.FacturacionEntrega || '').toUpperCase();
    const isMora = !(facturacion === 'NO' || facturacion === 'NUNCA');
    if (isMora) {
        return 0;
    }
    if (infoPaquete && infoPaquete.ColeccionTipo === 'B') {
        if (!cliente.CuentaCorriente || cliente.CuentaCorriente.length === 0) {
            return 0;
        }
    }
    return 3;
};

const resolverLinea = (detalleFila, productosEdades, grupoPrecio, productoImpuestos, tasaImpuestoCliente) => {
    const productos = (productosEdades || []).flatMap(e => e.ProductosXEdad || []);
    const codigoBuscado = normalizarTexto(detalleFila.codigoArticulo);
    const producto = productos.find(p => normalizarTexto(p.ProductoId) === codigoBuscado);

    if (!producto) {
        // eslint-disable-next-line no-console
        console.warn('[PedidosExcel] producto no encontrado en el paquete', {
            codigoArticuloExcel: detalleFila.codigoArticulo,
            codigoBuscadoNormalizado: codigoBuscado,
            paquete: detalleFila.paquete,
            totalProductosEnPaquete: productos.length,
            productosDisponibles: productos.map(p => ({ raw: p.ProductoId, normalizado: normalizarTexto(p.ProductoId) })),
        });
        return { ok: false, error: `El producto ${detalleFila.codigoArticulo} no pertenece al paquete ${detalleFila.paquete}.` };
    }

    const color = (producto.ListaColores || []).find(c => normalizarTexto(c.NombreColor) === normalizarTexto(detalleFila.color));
    if (!color || color.Deshabilitado) {
        return { ok: false, error: `El color ${detalleFila.color} no existe para el producto ${detalleFila.codigoArticulo}.` };
    }

    const tallaBuscada = normalizarTexto(detalleFila.talla);
    const talla = (producto.ListaTalla || []).find(t => normalizarTexto(t.Talla) === tallaBuscada);
    if (!talla) {
        // eslint-disable-next-line no-console
        console.warn('[PedidosExcel] talla no encontrada', {
            codigoArticulo: detalleFila.codigoArticulo,
            tallaExcel: detalleFila.talla,
            tallaBuscadaNormalizada: tallaBuscada,
            tallasDisponiblesEnProducto: (producto.ListaTalla || []).map(t => ({ raw: t.Talla, normalizada: normalizarTexto(t.Talla) })),
        });
        return { ok: false, error: `La talla ${detalleFila.talla} no existe para el producto ${detalleFila.codigoArticulo}.` };
    }

    const cantidad = parseInt(detalleFila.cantidad, 10);
    if (!cantidad || cantidad <= 0) {
        return { ok: false, error: `Cantidad inválida (${detalleFila.cantidad}) para ${detalleFila.codigoArticulo} color ${detalleFila.color} talla ${detalleFila.talla}.` };
    }

    const precioBase = (producto.Precio || []).find(p => p.GrupoPrecio === grupoPrecio);
    let precio = precioBase ? precioBase.Precio : 0;
    const fisico = (producto.fisicaDisponible || []).find(f => f.CodigoColor === color.CodigoColor && f.IdTalla === talla.Talla);
    if (fisico && fisico.PreciosEspecificos && fisico.PreciosEspecificos.length > 0) {
        const especifico = fisico.PreciosEspecificos.find(p => p.GrupoPrecio === grupoPrecio);
        if (especifico) {
            precio = especifico.Precio;
        }
    }
    if (talla.Distribucion && talla.Distribucion.length !== 0) {
        precio = 0;
    }

    // Impuesto de la línea: precio × cantidad × tasa del grupo de impuesto del producto,
    // igual que hace la matriz del flujo manual — solo se aplica si el grupo de impuesto
    // del cliente tiene una tasa distinta de cero.
    let impuestoLinea = 0;
    if (tasaImpuestoCliente) {
        const impuestoProducto = (productoImpuestos || []).find(p => p.GRUPO === (producto.GrupoImpuesto || '').toUpperCase());
        const tasaProducto = impuestoProducto ? impuestoProducto.IMPUESTO : 0;
        impuestoLinea = precio * cantidad * tasaProducto;
    }

    return {
        ok: true,
        impuestoLinea,
        linea: {
            IdProducto: producto.CodigoProducto,
            CodigoProducto: producto.ProductoId,
            NombreProducto: producto.NombreProducto,
            CodigoColor: color.CodigoColor,
            NombreColor: color.NombreColor,
            Cantidad: String(cantidad),
            Unidad: 'Und',
            PrecioUnitario: String(precio || 0),
            Talla: talla.Talla,
            CodigoColeccion: detalleFila.paquete,
            PorcentajeDescuento: '',
            CodigoImpuesto: '',
        }
    };
};

const construirPedido = (grupo, contexto, indice, numeroReferencia) => {
    const {
        clientesPorCodigo, infoPorPaquete, productosPorCombo, bodegaMaestro,
        tiposPedidoPorId, empresaUsuarioAsesor, clienteImpuestos, productoImpuestos
    } = contexto;

    const id = `${indice}-${grupo.codigoCliente}-${grupo.paquete}-${grupo.tienda}`;
    const errores = [];
    const cliente = clientesPorCodigo.get(grupo.codigoCliente.toUpperCase());

    if (!cliente) {
        errores.push(`El cliente ${grupo.codigoCliente} no existe o no está asignado en tu cartera.`);
        return {
            id, clave: grupo.clave, codigoCliente: grupo.codigoCliente, nombreCliente: '', paquete: grupo.paquete,
            tienda: grupo.tienda, tiendaUsada: '-', numAcuerdo: grupo.numAcuerdo,
            tipoCredito: grupo.tipoCredito, lineas: 0, valido: false, errores,
            pedidoPost: null, estado: 'pendiente', mensaje: ''
        };
    }

    // NUM ACUERDO es opcional en general (igual que el flujo manual, que ya tolera esto y usa
    // un Tipo de Pedido por defecto), EXCEPTO cuando TIPO CREDITO es "Credito": ahí sí es obligatorio.
    if (!grupo.numAcuerdo && grupo.tipoCredito.trim().toUpperCase() === 'CREDITO') {
        errores.push(`El tipo de crédito es "Credito" pero no se indicó NUM ACUERDO para el cliente ${grupo.codigoCliente}.`);
    }

    let acuerdo = null;
    if (grupo.numAcuerdo) {
        acuerdo = (cliente.AcuerdosVenta || []).find(a => String(a.IdAcuerdoxCliente).trim() === grupo.numAcuerdo);
        if (!acuerdo) {
            errores.push(`El acuerdo ${grupo.numAcuerdo} no existe o no está vigente para el cliente ${grupo.codigoCliente}.`);
        } else if (grupo.tipoCredito && acuerdo.Tipo && acuerdo.Tipo.trim().toUpperCase() !== grupo.tipoCredito.toUpperCase()) {
            errores.push(`El tipo de crédito "${grupo.tipoCredito}" no coincide con el del acuerdo ${grupo.numAcuerdo} (${acuerdo.Tipo}).`);
        }
    }

    const infoPaquete = infoPorPaquete.get(`${grupo.paquete}|${cliente.EmpresaId}`);
    if (!infoPaquete) {
        errores.push(`El paquete ${grupo.paquete} no existe para la empresa ${cliente.EmpresaId}.`);
    }

    // Tienda: TIENDA en el Excel es el postalAddress de una dirección del cliente.
    // - Si la fila NO trae tienda, se usa la dirección principal del cliente (sin error).
    // - Si SÍ trae una tienda pero no le corresponde a ese cliente, es un error: no se
    //   rellena en silencio con la principal, porque eso podría mandar el pedido a la
    //   tienda equivocada sin que nadie lo note.
    const direcciones = cliente.Direcciones || [];
    let direccionResuelta = null;
    let tiendaUsada;

    if (!grupo.tienda) {
        direccionResuelta = direcciones.find(d => d.principal);
        tiendaUsada = direccionResuelta ? `${direccionResuelta.nombreDireccion} (principal, sin tienda especificada)` : 'Sin dirección (cliente sin dirección principal)';
    } else {
        const postalAddressBuscado = parseInt(grupo.tienda, 10) || 0;
        direccionResuelta = direcciones.find(d => String(d.postalAddress) === String(postalAddressBuscado));
        if (direccionResuelta) {
            tiendaUsada = direccionResuelta.nombreDireccion || String(postalAddressBuscado);
        } else {
            errores.push(`La tienda ${grupo.tienda} no corresponde al cliente ${grupo.codigoCliente}.`);
            tiendaUsada = '-';
        }
    }

    const postalAddress = direccionResuelta ? direccionResuelta.postalAddress : 0;

    // Coordenadas: se usa la de la dirección/tienda resuelta; si esa dirección no tiene
    // coordenadas cargadas, se cae a la coordenada del cliente.
    const latitude = (direccionResuelta && direccionResuelta.latitud != null) ? direccionResuelta.latitud : (cliente.Latitud != null ? cliente.Latitud : null);
    const longitude = (direccionResuelta && direccionResuelta.longitud != null) ? direccionResuelta.longitud : (cliente.Longitud != null ? cliente.Longitud : null);

    // Detalle: cada grupo trae sus propias líneas (artículo/color/talla/cantidad)
    if (grupo.lineas.length === 0) {
        errores.push(`No se encontraron líneas de detalle para el cliente ${grupo.codigoCliente} / paquete ${grupo.paquete}.`);
    }

    const productosEdades = productosPorCombo.get(`${grupo.paquete}|${cliente.GrupoPrecio}|${cliente.EmpresaId}`) || [];
    // Las tasas de impuesto (cliente y producto) se filtran por empresa: el mismo código de grupo
    // puede tener una tasa distinta en cada empresa.
    const empresaUpper = (cliente.EmpresaId || '').toUpperCase();
    const impuestoCliente = (clienteImpuestos || []).find(x => x.GRUPO === (cliente.GrupoImpuesto || '').toUpperCase() && x.EMPRESA === empresaUpper);
    const tasaImpuestoCliente = impuestoCliente ? impuestoCliente.IMPUESTO : 0;
    const productoImpuestosEmpresa = (productoImpuestos || []).filter(x => x.EMPRESA === empresaUpper);
    const detalle = [];
    let impuestoTotal = 0;
    for (const lineaExcel of grupo.lineas) {
        const resuelto = resolverLinea(lineaExcel, productosEdades, cliente.GrupoPrecio, productoImpuestosEmpresa, tasaImpuestoCliente);
        if (!resuelto.ok) {
            errores.push(resuelto.error);
        } else {
            detalle.push(resuelto.linea);
            impuestoTotal += resuelto.impuestoLinea;
        }
    }

    // Bodega: preferir la específica de la empresa del cliente, si no la principal del sistema
    let bodega = (bodegaMaestro || []).find(b => b.EmpresaId === cliente.EmpresaId && b.Estatus === true && !b.BodegaPrincipal);
    let bodegaEspecifica = true;
    if (!bodega) {
        bodega = (bodegaMaestro || []).find(b => b.BodegaPrincipal === true && b.Estatus === true);
        bodegaEspecifica = false;
    }
    if (!bodega) {
        errores.push('No hay bodega configurada para procesar el pedido.');
    }

    const tipoPedidoNombre = acuerdo ? (tiposPedidoPorId.get(acuerdo.IdTipoPedido) || '') : '';
    const modoVenta = tipoPedidoNombre === 'Contado' ? 'Contado' : 'Credito';
    const subtotal = detalle.reduce((acc, d) => acc + (parseFloat(d.PrecioUnitario) * parseInt(d.Cantidad, 10)), 0);
    const valido = errores.length === 0;

    const pedidoPost = valido ? {
        NumeroReferencia: numeroReferencia,
        CodigoCliente: cliente.Codigo,
        Nombre: cliente.Nombre,
        Firma: '',
        FechaEntrega: null,
        AcuerdoVenta: acuerdo ? acuerdo.IdAcuerdoxCliente : '',
        location: { latitude, longitude },
        EmpresaUsuario: empresaUsuarioAsesor,
        Linea: (infoPaquete && infoPaquete.Linea) || (acuerdo && acuerdo.Linea) || '',
        CodigoColeccion: grupo.paquete,
        DetallePedido: detalle,
        TipoPedido: { IdTipoPedido: acuerdo ? acuerdo.IdTipoPedido : null, TipoPedido: tipoPedidoNombre },
        TipoVenta: calcularTipoVenta(cliente, infoPaquete),
        ClienteContadoId: null,
        ModoVenta: modoVenta,
        Flete: 0,
        subtotal,
        Impuesto: impuestoTotal,
        RequiereEntrega: false,
        BodegaEspecifica: bodegaEspecifica,
        Sitio: bodega.CodigoSitio,
        Almacen: bodega.Almacen,
        Ubicacion: '',
        DireccionEntrega: postalAddress,
        Observacion: 'Carga masiva Excel',
    } : null;

    return {
        id,
        clave: grupo.clave,
        codigoCliente: grupo.codigoCliente,
        nombreCliente: cliente.Nombre,
        paquete: grupo.paquete,
        tienda: grupo.tienda,
        tiendaUsada,
        numAcuerdo: grupo.numAcuerdo,
        tipoCredito: grupo.tipoCredito,
        lineas: detalle.length,
        valido,
        errores,
        pedidoPost,
        estado: 'pendiente',
        mensaje: '',
    };
};

// --- Plantilla de ejemplo ----------------------------------------------------

const descargarPlantilla = () => {
    const filas = [
        { PAQUETE: '127F', TIENDA: '5637861608', 'CÓDIGO CLIENTE': 'IMGT-000001296', 'TIPO CREDITO': 'Ordinario', 'NUM ACUERDO': '', CODIGOARTICULO: '10 11 33 07 184 0001', CATEGORIA: 'BASICO', COLOR: 'Negro', TALLA: 39, CANTIDAD: 5 },
        { PAQUETE: '127F', TIENDA: '5637861612', 'CÓDIGO CLIENTE': 'IMGT-000001298', 'TIPO CREDITO': 'Ordinario', 'NUM ACUERDO': '', CODIGOARTICULO: '11 11 33 07 184 0001', CATEGORIA: 'BASICO', COLOR: 'Negro', TALLA: 40, CANTIDAD: 9 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), 'Pedidos');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    FileSaver.saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' }), 'PlantillaPedidosExcel.xlsx');
};

// --- Componente ----------------------------------------------------------------

const authHeaders = () => ({ headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });

const PedidosExcel = () => {
    const [cargando, setCargando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [pedidos, setPedidos] = useState([]);
    const [nombreArchivo, setNombreArchivo] = useState('');
    // 'todos' | 'validos' | 'error' | 'creados' — filtro activo aplicado a la tabla, controlado
    // desde los chips de resumen (clic para filtrar, clic de nuevo para quitar el filtro).
    const [filtro, setFiltro] = useState('todos');
    // Claves (cliente+paquete+tienda+acuerdo) de pedidos ya creados exitosamente en esta sesión.
    // Se conserva entre subidas del mismo Excel para no volver a crear un pedido que ya se procesó,
    // aunque el usuario re-suba el archivo para corregir otras filas con error.
    const [clavesCreadas, setClavesCreadas] = useState(() => new Set());
    // Huellas de archivos ya subidos en esta sesión, para avisar si se sube el mismo Excel dos veces.
    const [hashesSubidos, setHashesSubidos] = useState(() => new Set());
    const bodegaMaestro = useSelector(state => state.MaestroBodegaAlmacenes);

    useEffect(() => {
        document.title = 'Carga masiva de pedidos - Excel';
    }, []);

    const actualizarPedido = (id, cambios) => {
        setPedidos(prev => prev.map(p => (p.id === id ? { ...p, ...cambios } : p)));
    };

    const handleUpload = async event => {
        const file = event.target.files[0];
        event.target.value = '';
        if (!file) {
            return;
        }

        const extension = file.name.split('.').pop();
        if (extension !== 'xlsx' && extension !== 'xls') {
            Swal.fire({ title: 'Error', text: 'El formato del archivo no es permitido.', type: 'error', confirmButtonText: 'Ok' });
            return;
        }

        setCargando(true);
        setPedidos([]);
        setFiltro('todos');
        setNombreArchivo(file.name);

        try {
            const { workbook, hash } = await leerArchivo(file);

            if (hashesSubidos.has(hash)) {
                const confirmacion = await Swal.fire({
                    title: 'Archivo repetido',
                    text: 'Ya subiste este mismo archivo Excel antes en esta sesión. ¿Quieres procesarlo de nuevo de todas formas?',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, procesar de nuevo',
                    cancelButtonText: 'Cancelar',
                });
                if (!confirmacion.value) {
                    setCargando(false);
                    return;
                }
            } else {
                setHashesSubidos(prev => new Set(prev).add(hash));
            }

            const primeraHoja = workbook.SheetNames[0];
            const filasRaw = primeraHoja ? XLSX.utils.sheet_to_row_object_array(workbook.Sheets[primeraHoja]) : [];
            const filas = filasRaw.map(convertirFila).filter(f => f.codigoCliente && f.paquete && f.codigoArticulo);

            if (filas.length === 0) {
                Swal.fire({ title: 'Archivo vacío', text: 'No se encontraron filas válidas en el archivo.', type: 'warning', confirmButtonText: 'Ok' });
                setCargando(false);
                return;
            }

            const grupos = agruparFilas(filas);
            const empresaUsuarioAsesor = (localStorage.getItem('empresa') || '').toUpperCase();

            const { data: clientesData } = await axios.get(`${APIURL}/api/cliente/pedido/excel`, authHeaders());
            const { data: tiposPedidoData } = await axios.get(`${APIURL}/api/tipopedido`, authHeaders());
            const { data: correlativo } = await axios.get(`${APIURL}/api/PedidosXCliente/correlativo/${empresaUsuarioAsesor}`, authHeaders());
            const { data: clienteImpuestos } = await axios.get(`${APIURL}/api/gruposimpuestos/Clientes`, authHeaders()).catch(() => ({ data: [] }));
            const { data: productoImpuestos } = await axios.get(`${APIURL}/api/gruposimpuestos/Articulos`, authHeaders()).catch(() => ({ data: [] }));

            const clientesPorCodigo = new Map((clientesData || []).map(c => [(c.Codigo || '').toUpperCase(), c]));
            const tiposPedidoPorId = new Map((tiposPedidoData || []).map(t => [t.IdTipoPedido, t.TipoPedido]));

            const combosInfo = new Map();
            const combosProductos = new Map();
            for (const grupo of grupos) {
                const cliente = clientesPorCodigo.get(grupo.codigoCliente.toUpperCase());
                if (!cliente) {
                    continue;
                }
                combosInfo.set(`${grupo.paquete}|${cliente.EmpresaId}`, { paquete: grupo.paquete, empresa: cliente.EmpresaId });
                combosProductos.set(`${grupo.paquete}|${cliente.GrupoPrecio}|${cliente.EmpresaId}`, { paquete: grupo.paquete, grupoPrecio: cliente.GrupoPrecio, empresa: cliente.EmpresaId });
            }

            const infoPorPaquete = new Map();
            for (const { paquete, empresa } of combosInfo.values()) {
                try {
                    const { data } = await axios.get(`${APIURL}/api/colecciones/${paquete}/${empresa}/info`, authHeaders());
                    infoPorPaquete.set(`${paquete}|${empresa}`, data);
                } catch (e) {
                    infoPorPaquete.set(`${paquete}|${empresa}`, null);
                }
            }

            const productosPorCombo = new Map();
            for (const { paquete, grupoPrecio, empresa } of combosProductos.values()) {
                try {
                    const { data } = await axios.get(`${APIURL}/api/colecciones/estructura/${paquete}/${grupoPrecio}/${empresa}`, authHeaders());
                    productosPorCombo.set(`${paquete}|${grupoPrecio}|${empresa}`, data);
                } catch (e) {
                    productosPorCombo.set(`${paquete}|${grupoPrecio}|${empresa}`, []);
                }
            }

            // Correlativo genérico (del usuario que sube el archivo), usado solo como respaldo si un
            // cliente no tiene asesor asignado o no se pudo consultar su correlativo específico.
            const match = String(correlativo || '').match(/^(.*-1)(\d+)$/);
            const prefijoReferencia = match ? match[1] : 'EXCEL-1';
            const inicioReferencia = match ? parseInt(match[2], 10) : 1;
            const digitos = match ? match[2].length : 5;

            // El número de referencia del pedido debe seguir la secuencia del asesor asignado al
            // CLIENTE (igual que un pedido normal), no la del usuario que sube el Excel. Se consulta
            // una sola vez por asesor único y se va incrementando por cada pedido de ese mismo asesor.
            const correlativoPorAsesor = new Map();
            const asesoresUnicos = new Set();
            for (const grupo of grupos) {
                const cliente = clientesPorCodigo.get(grupo.codigoCliente.toUpperCase());
                if (cliente && cliente.CodigoAsesor) {
                    asesoresUnicos.add(`${cliente.CodigoAsesor}|${cliente.EmpresaId}`);
                }
            }
            for (const clave of asesoresUnicos) {
                const [codigoAsesor, empresaCliente] = clave.split('|');
                try {
                    const { data } = await axios.get(`${APIURL}/api/PedidosXCliente/correlativo/asesor/${codigoAsesor}/${empresaCliente}`, authHeaders());
                    const m = String(data || '').match(/^(.*-1)(\d+)$/);
                    if (m) {
                        correlativoPorAsesor.set(clave, { prefijo: m[1], siguiente: parseInt(m[2], 10), digitos: m[2].length });
                    }
                } catch (e) {
                    // sin correlativo propio para este asesor: se usa el respaldo genérico más abajo
                }
            }

            const numerosReferencia = grupos.map((grupo, idx) => {
                const cliente = clientesPorCodigo.get(grupo.codigoCliente.toUpperCase());
                const claveAsesor = cliente && cliente.CodigoAsesor ? `${cliente.CodigoAsesor}|${cliente.EmpresaId}` : null;
                const seed = claveAsesor ? correlativoPorAsesor.get(claveAsesor) : null;
                if (seed) {
                    const numero = seed.siguiente;
                    seed.siguiente += 1;
                    return `${seed.prefijo}${String(numero).padStart(seed.digitos, '0')}`;
                }
                return `${prefijoReferencia}${String(inicioReferencia + idx).padStart(digitos, '0')}`;
            });

            const contexto = {
                clientesPorCodigo, infoPorPaquete, productosPorCombo, bodegaMaestro,
                tiposPedidoPorId, empresaUsuarioAsesor,
                clienteImpuestos: clienteImpuestos || [], productoImpuestos: productoImpuestos || [],
            };

            const construidos = grupos.map((grupo, idx) => construirPedido(
                grupo, contexto, idx, numerosReferencia[idx]
            )).map(p => (clavesCreadas.has(p.clave)
                ? { ...p, estado: 'exito', mensaje: 'Ya se había creado anteriormente en esta sesión (omitido).' }
                : p
            ));

            setPedidos(construidos);
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Ocurrió un error al procesar el archivo. Verifique el formato de las columnas.', type: 'error', confirmButtonText: 'Ok' });
        } finally {
            setCargando(false);
        }
    };

    const procesarPedidos = async () => {
        const pendientes = pedidos.filter(p => p.valido && p.estado !== 'exito');
        if (pendientes.length === 0) {
            Swal.fire({ title: 'Nada que procesar', text: 'No hay pedidos válidos pendientes de envío.', type: 'warning', confirmButtonText: 'Ok' });
            return;
        }

        setEnviando(true);
        const cola = [...pendientes];

        const trabajador = async () => {
            while (cola.length > 0) {
                const item = cola.shift();
                actualizarPedido(item.id, { estado: 'enviando' });
                try {
                    const { data } = await axios.post(`${APIURL}/api/PedidosXCliente/excel`, item.pedidoPost, {
                        ...authHeaders(),
                        timeout: 60000,
                    });
                    actualizarPedido(item.id, { estado: 'exito', mensaje: (data && data.mensaje) ? data.mensaje : 'Pedido creado.' });
                    if (item.clave) {
                        setClavesCreadas(prev => new Set(prev).add(item.clave));
                    }
                } catch (e) {
                    const cuerpo = e.response && e.response.data;
                    const mensaje = typeof cuerpo === 'string' ? cuerpo : (cuerpo && cuerpo.Message) ? cuerpo.Message : 'Error al enviar el pedido (sin conexión con el servidor o error inesperado).';
                    actualizarPedido(item.id, { estado: 'error', mensaje });
                }
            }
        };

        await Promise.all(Array.from({ length: Math.min(CONCURRENCIA_ENVIO, pendientes.length) }, trabajador));
        setEnviando(false);
        Swal.fire({ title: 'Proceso finalizado', text: 'Revise el estado de cada pedido en la tabla.', type: 'success', confirmButtonText: 'Ok' });
    };

    const validos = pedidos.filter(p => p.valido).length;
    const conError = pedidos.length - validos;
    const creados = pedidos.filter(p => p.estado === 'exito').length;

    const toggleFiltro = valor => setFiltro(prev => (prev === valor ? 'todos' : valor));
    const pedidosFiltrados = pedidos.filter(p => {
        if (filtro === 'validos') return p.valido;
        if (filtro === 'error') return !p.valido;
        if (filtro === 'creados') return p.estado === 'exito';
        return true;
    });

    return (
        <div style={{ padding: '24px 28px', maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 10, background: COLOR_PRIMARY,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <CloudUploadIcon style={{ color: '#fff', fontSize: 26 }} />
                </div>
                <div>
                    <Typography variant="h5" style={{ fontWeight: 600, lineHeight: 1.2 }}>Carga masiva de pedidos</Typography>
                    <Typography variant="body2" color="textSecondary">Sube un Excel y el sistema valida y crea los pedidos automáticamente.</Typography>
                </div>
            </div>

            <ExpansionPanel style={{ margin: '20px 0', borderRadius: 8 }} variant="outlined" elevation={0}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <InfoOutlinedIcon fontSize="small" style={{ color: COLOR_PRIMARY }} />
                        <Typography variant="body2" style={{ fontWeight: 500 }}>Formato del archivo requerido</Typography>
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ display: 'block', paddingTop: 0 }}>
                    <Typography variant="body2" color="textSecondary" component="div">
                        <p style={{ marginTop: 0 }}>
                            Cada fila es una línea del pedido. Varias filas con el mismo <b>cliente + paquete + tienda + acuerdo</b> forman un solo pedido.
                        </p>
                        <p style={{ marginBottom: 4 }}><b>Columnas:</b> PAQUETE · TIENDA (id de dirección del cliente) · CÓDIGO CLIENTE · TIPO CREDITO · NUM ACUERDO · CODIGOARTICULO · CATEGORIA · COLOR · TALLA · CANTIDAD.</p>
                        <p style={{ margin: '4px 0' }}>NUM ACUERDO es opcional (si va vacío el pedido se envía sin acuerdo, salvo que TIPO CREDITO sea "Credito"); si se indica, debe coincidir con un acuerdo vigente del cliente.</p>
                        <p style={{ marginBottom: 0 }}>El disponible <b>no</b> se valida en esta carga; sí se valida que el color y el producto pertenezcan al paquete.</p>
                    </Typography>
                </ExpansionPanelDetails>
            </ExpansionPanel>

            <Card variant="outlined" style={{ borderRadius: 8 }}>
                <CardContent>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button variant="outlined" color="primary" startIcon={<GetAppIcon />} onClick={descargarPlantilla}>
                            Descargar plantilla
                        </Button>
                        <Button variant="contained" color="primary" component="label" startIcon={<CloudUploadIcon />} disabled={cargando || enviando}>
                            Seleccionar Excel
                            <input type="file" accept=".xlsx,.xls" hidden onChange={handleUpload} />
                        </Button>
                        {nombreArchivo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555' }}>
                                <InsertDriveFileOutlinedIcon fontSize="small" />
                                <Typography variant="body2">{nombreArchivo}</Typography>
                            </div>
                        )}
                        {cargando && <CircularProgress size={22} />}
                    </div>
                </CardContent>
            </Card>

            {pedidos.length > 0 && (
                <>
                    <div style={{ display: 'flex', gap: 10, margin: '20px 0', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                            label={`${pedidos.length} pedidos en el archivo`}
                            variant="outlined"
                            clickable
                            onClick={() => setFiltro('todos')}
                            style={filtro === 'todos' ? { boxShadow: `0 0 0 2px ${COLOR_PRIMARY}` } : {}}
                        />
                        <Chip
                            icon={<CheckCircleIcon style={{ color: COLOR_OK }} />}
                            label={`${validos} válidos`}
                            clickable
                            onClick={() => toggleFiltro('validos')}
                            style={{
                                background: COLOR_OK_BG, color: COLOR_OK, fontWeight: 500,
                                boxShadow: filtro === 'validos' ? `0 0 0 2px ${COLOR_OK}` : 'none',
                            }}
                        />
                        <Chip
                            icon={conError > 0 ? <ErrorOutlineIcon style={{ color: COLOR_ERROR }} /> : undefined}
                            label={`${conError} con error`}
                            clickable={conError > 0}
                            onClick={conError > 0 ? () => toggleFiltro('error') : undefined}
                            style={{
                                ...(conError > 0 ? { background: COLOR_ERROR_BG, color: COLOR_ERROR, fontWeight: 500 } : {}),
                                boxShadow: filtro === 'error' ? `0 0 0 2px ${COLOR_ERROR}` : 'none',
                            }}
                        />
                        {creados > 0 && (
                            <Chip
                                icon={<CheckCircleIcon style={{ color: '#fff' }} />}
                                label={`${creados} creados`}
                                clickable
                                onClick={() => toggleFiltro('creados')}
                                style={{
                                    background: COLOR_OK, color: '#fff', fontWeight: 500,
                                    boxShadow: filtro === 'creados' ? '0 0 0 2px #1b4d1e' : 'none',
                                }}
                            />
                        )}
                        {filtro !== 'todos' && (
                            <Typography variant="caption" color="textSecondary">
                                Mostrando {pedidosFiltrados.length} de {pedidos.length} — clic de nuevo en el chip para quitar el filtro
                            </Typography>
                        )}
                    </div>

                    <TableContainer component={Paper} variant="outlined" style={{ borderRadius: 8, maxHeight: 520 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 600 }}>Cliente</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Nombre</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Paquete</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Tienda solicitada</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Tienda usada</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Num. Acuerdo</TableCell>
                                    <TableCell style={{ fontWeight: 600 }} align="center">Líneas</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Estado</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Detalle</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pedidosFiltrados.map(p => (
                                    <TableRow
                                        key={p.id}
                                        style={{
                                            borderLeft: `3px solid ${!p.valido ? COLOR_ERROR : (p.estado === 'exito' ? COLOR_OK : 'transparent')}`,
                                            background: !p.valido ? COLOR_ERROR_BG : (p.estado === 'exito' ? COLOR_OK_BG : undefined),
                                        }}
                                    >
                                        <TableCell>{p.codigoCliente}</TableCell>
                                        <TableCell>{p.nombreCliente}</TableCell>
                                        <TableCell>{p.paquete}</TableCell>
                                        <TableCell>{p.tienda}</TableCell>
                                        <TableCell>{p.tiendaUsada}</TableCell>
                                        <TableCell>{p.numAcuerdo}</TableCell>
                                        <TableCell align="center">{p.lineas}</TableCell>
                                        <TableCell>{estadoLabel(p)}</TableCell>
                                        <TableCell style={{ maxWidth: 320 }}>
                                            <Typography variant="body2" style={{ color: p.errores.length > 0 ? COLOR_ERROR : undefined }}>
                                                {p.errores.length > 0 ? p.errores.join(' | ') : p.mensaje}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={enviando ? <CircularProgress size={18} style={{ color: '#fff' }} /> : <PlayArrowIcon />}
                            disabled={enviando || validos === 0}
                            onClick={procesarPedidos}
                        >
                            Procesar pedidos válidos ({validos})
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

const estadoLabel = p => {
    if (!p.valido) {
        return <Chip size="small" icon={<ErrorOutlineIcon style={{ color: COLOR_ERROR }} />} label="Error de validación" style={{ background: COLOR_ERROR_BG, color: COLOR_ERROR }} />;
    }
    if (p.estado === 'enviando') {
        return <Chip size="small" icon={<CircularProgress size={14} />} label="Enviando..." />;
    }
    if (p.estado === 'exito') {
        return <Chip size="small" icon={<CheckCircleIcon style={{ color: COLOR_OK }} />} label="Creado" style={{ background: COLOR_OK_BG, color: COLOR_OK }} />;
    }
    if (p.estado === 'error') {
        return <Chip size="small" icon={<ErrorOutlineIcon style={{ color: COLOR_ERROR }} />} label="Error al enviar" style={{ background: COLOR_ERROR_BG, color: COLOR_ERROR }} />;
    }
    return <Chip size="small" label="Pendiente" variant="outlined" />;
};

export default PedidosExcel;
