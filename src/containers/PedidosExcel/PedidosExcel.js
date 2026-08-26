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
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import { APIURL } from 'utils/Enviroment';

const CONCURRENCIA_ENVIO = 4;

// --- Lectura y normalización del Excel -------------------------------------
// La plantilla es una sola hoja plana: cada fila trae cliente + tienda + acuerdo
// junto con UNA línea de detalle (artículo, color, talla, cantidad). Un mismo
// cliente+paquete+tienda+acuerdo puede repetirse en varias filas (una por línea).

const leerArchivo = file => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = e => {
            const leido = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
            leido ? resolve(leido) : reject('No se pudo leer el archivo');
        };
        reader.readAsBinaryString(file);
    });
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
        const clave = `${fila.codigoCliente}|${fila.paquete}|${fila.tienda}|${fila.numAcuerdo}`;
        if (!grupos.has(clave)) {
            grupos.set(clave, {
                clave,
                paquete: fila.paquete,
                tienda: fila.tienda,
                codigoCliente: fila.codigoCliente,
                tipoCredito: fila.tipoCredito,
                numAcuerdo: fila.numAcuerdo,
                lineas: [],
            });
        }
        grupos.get(clave).lineas.push({
            codigoArticulo: fila.codigoArticulo,
            categoria: fila.categoria,
            paquete: fila.paquete,
            color: fila.color,
            talla: fila.talla,
            cantidad: fila.cantidad,
        });
    });
    return Array.from(grupos.values());
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

const resolverLinea = (detalleFila, productosEdades, grupoPrecio) => {
    const productos = (productosEdades || []).flatMap(e => e.ProductosXEdad || []);
    const producto = productos.find(p => normalizarTexto(p.ProductoId) === normalizarTexto(detalleFila.codigoArticulo));

    if (!producto) {
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

    return {
        ok: true,
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
        tiposPedidoPorId, empresaUsuarioAsesor
    } = contexto;

    const id = `${indice}-${grupo.codigoCliente}-${grupo.paquete}-${grupo.tienda}`;
    const errores = [];
    const cliente = clientesPorCodigo.get(grupo.codigoCliente.toUpperCase());

    if (!cliente) {
        errores.push(`El cliente ${grupo.codigoCliente} no existe o no está asignado a este asesor.`);
        return {
            id, codigoCliente: grupo.codigoCliente, nombreCliente: '', paquete: grupo.paquete,
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

    // Tienda: TIENDA en el Excel es directamente el postalAddress del cliente.
    // Si no coincide con ninguna dirección conocida, el backend cae a la dirección
    // principal del cliente (mismo comportamiento que el pedido manual).
    const postalAddress = parseInt(grupo.tienda, 10) || 0;
    const direcciones = cliente.Direcciones || [];
    const direccionMatch = direcciones.find(d => String(d.postalAddress) === String(postalAddress));
    let tiendaUsada;
    if (direccionMatch) {
        tiendaUsada = direccionMatch.nombreDireccion || String(postalAddress);
    } else {
        const principal = direcciones.find(d => d.principal);
        tiendaUsada = principal
            ? `${principal.nombreDireccion} (principal, sin match para "${grupo.tienda}")`
            : `Sin dirección (sin match para "${grupo.tienda}")`;
    }

    // Detalle: cada grupo trae sus propias líneas (artículo/color/talla/cantidad)
    if (grupo.lineas.length === 0) {
        errores.push(`No se encontraron líneas de detalle para el cliente ${grupo.codigoCliente} / paquete ${grupo.paquete}.`);
    }

    const productosEdades = productosPorCombo.get(`${grupo.paquete}|${cliente.GrupoPrecio}|${cliente.EmpresaId}`) || [];
    const detalle = [];
    for (const lineaExcel of grupo.lineas) {
        const resuelto = resolverLinea(lineaExcel, productosEdades, cliente.GrupoPrecio);
        if (!resuelto.ok) {
            errores.push(resuelto.error);
        } else {
            detalle.push(resuelto.linea);
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
        location: { latitude: null, longitude: null },
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
        Impuesto: 0,
        RequiereEntrega: false,
        BodegaEspecifica: bodegaEspecifica,
        Sitio: bodega.CodigoSitio,
        Almacen: bodega.Almacen,
        Ubicacion: '',
        DireccionEntrega: postalAddress,
        Observacion: 'Carga masiva Excel',
        OrigenExcel: true,
    } : null;

    return {
        id,
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
        setNombreArchivo(file.name);

        try {
            const workbook = await leerArchivo(file);
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

            const { data: clientesData } = await axios.get(`${APIURL}/api/cliente/pedido`, authHeaders());
            const { data: tiposPedidoData } = await axios.get(`${APIURL}/api/tipopedido`, authHeaders());
            const { data: correlativo } = await axios.get(`${APIURL}/api/PedidosXCliente/correlativo/${empresaUsuarioAsesor}`, authHeaders());

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
                    const { data } = await axios.get(`${APIURL}/api/colecciones/productos/${paquete}/${grupoPrecio}/${empresa}`, authHeaders());
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
            };

            const construidos = grupos.map((grupo, idx) => construirPedido(
                grupo, contexto, idx, numerosReferencia[idx]
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
                    const { data } = await axios.post(`${APIURL}/api/PedidosXCliente`, item.pedidoPost, {
                        ...authHeaders(),
                        timeout: 60000,
                    });
                    actualizarPedido(item.id, { estado: 'exito', mensaje: (data && data.mensaje) ? data.mensaje : 'Pedido creado.' });
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

    return (
        <div style={{ padding: 20 }}>
            <Typography variant="h5" gutterBottom>Carga masiva de pedidos por Excel</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Suba un Excel con las columnas PAQUETE, TIENDA (id de dirección del cliente), CÓDIGO CLIENTE,
                TIPO CREDITO, NUM ACUERDO, CODIGOARTICULO, CATEGORIA, COLOR, TALLA y CANTIDAD. Cada fila es una línea
                de un pedido; varias filas con el mismo cliente+paquete+tienda+acuerdo forman un solo pedido.
                NUM ACUERDO es opcional (si viene vacío, el pedido se envía sin acuerdo); si se indica, debe
                coincidir con un acuerdo vigente del cliente. El disponible no se valida en esta carga; sí se valida
                que el color y el producto pertenezcan al paquete.
            </Typography>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '16px 0' }}>
                <Button variant="outlined" color="primary" onClick={descargarPlantilla}>
                    Descargar plantilla
                </Button>
                <Button variant="contained" color="primary" component="label" disabled={cargando || enviando}>
                    Seleccionar Excel
                    <input type="file" accept=".xlsx,.xls" hidden onChange={handleUpload} />
                </Button>
                {nombreArchivo && <span>{nombreArchivo}</span>}
                {cargando && <CircularProgress size={22} />}
            </div>

            {pedidos.length > 0 && (
                <>
                    <div style={{ margin: '8px 0' }}>
                        <Chip label={`${pedidos.length} pedidos`} style={{ marginRight: 8 }} />
                        <Chip label={`${validos} válidos`} style={{ marginRight: 8, background: '#c8e6c9' }} />
                        <Chip label={`${conError} con error`} style={{ background: conError > 0 ? '#ffcdd2' : undefined }} />
                    </div>

                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Paquete</TableCell>
                                    <TableCell>Tienda solicitada</TableCell>
                                    <TableCell>Tienda usada</TableCell>
                                    <TableCell>Num. Acuerdo</TableCell>
                                    <TableCell>Líneas</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Detalle</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pedidos.map(p => (
                                    <TableRow key={p.id} style={{ background: !p.valido ? '#ffebee' : (p.estado === 'exito' ? '#e8f5e9' : undefined) }}>
                                        <TableCell>{p.codigoCliente}</TableCell>
                                        <TableCell>{p.nombreCliente}</TableCell>
                                        <TableCell>{p.paquete}</TableCell>
                                        <TableCell>{p.tienda}</TableCell>
                                        <TableCell>{p.tiendaUsada}</TableCell>
                                        <TableCell>{p.numAcuerdo}</TableCell>
                                        <TableCell>{p.lineas}</TableCell>
                                        <TableCell>{estadoLabel(p)}</TableCell>
                                        <TableCell>
                                            {p.errores.length > 0 ? p.errores.join(' | ') : p.mensaje}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <div style={{ marginTop: 16 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={enviando || validos === 0}
                            onClick={procesarPedidos}
                        >
                            {enviando ? <CircularProgress size={20} style={{ marginRight: 8 }} /> : null}
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
        return <Chip size="small" label="Error de validación" style={{ background: '#ffcdd2' }} />;
    }
    if (p.estado === 'enviando') {
        return <Chip size="small" label="Enviando..." />;
    }
    if (p.estado === 'exito') {
        return <Chip size="small" label="Creado" style={{ background: '#c8e6c9' }} />;
    }
    if (p.estado === 'error') {
        return <Chip size="small" label="Error al enviar" style={{ background: '#ffcdd2' }} />;
    }
    return <Chip size="small" label="Pendiente" />;
};

export default PedidosExcel;
