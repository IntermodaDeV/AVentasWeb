const initialState = {
    Login: false,
    colecciones: [],
    producto: null,
    coleccion: null,
    clientes: [],
    cliente: null,
    listaProductosAgregados: [],
    TipoPedido: null,
    AcuerdoVenta: null,
    TiposPedido: [],
    MaestroLineas: [],
    LineaSeleccionada: null,
    TableValue: {},
    PedidoEnCurso: false,
    codigoColeccionActiva: '',
    TotalPedido: 0.0,
    Limite: Infinity,
    NumeroOrden: null,
    AsesorId: 80,
    TiposColeccion: [],
    pedidoSelected:null,
    Recibo: {
        clientes: [],
        clienteSelected: null,
        cuotasXCliente: null,
        cuotasAPagar: null,
        facturasXCliente: null,
        cuotasCuentaCorriente: [],
    },
    clienteContado:null,
    clientesContado:[],
    requiereEntrega:true,
    asesor:'',
    empresasTransporte:[],
    precioCajas:[],
    comunidadesAutonomas:[],
    flete:0.0,
    ClienteImpuestos:[],
    ProductoImpuestos:[],
    Empresas:[],
    Monedas:[],
    CuentaImprimir:[],
    Bloqueo:false,
    Asignaciones:[],
    AbreviacionMonedas:[],
    Permisos:[],
    PedidoSincronizar:[],
    ReciboSincronizar:[],
    RecibosEnCache:[],
    Cartera:[],
    MonedasGlobal:[],
    BancosGlobal:[],
    TipoPagoGlobal:[],
    Configuraciones:null,
    EmpresaTransporteGlobal:[],
    PrecioCajasGlobal:[],
    ClienteImpuestosGlobal:[],
    ProductoImpuestosGlobal:[],
    TipoVisita:[],
    ListaPrecios:[],
    SeccionEncuesta: [],
    PreguntasEncuesta: [],
    TipoIngreso: [],
    GrupoOpciones: [],
    EncuestaSelected : [],
    DocumentosPendientes:[],
    RespuestaDetalle: [],
    MaestroBodegaAlmacenes: [],
    BodegaSeleccionada: null,
    Devolucion: {
        clienteSelected: null,
        TableValue:{}
    },
}

const calcularLimite = (state) => {
    if (state.AcuerdoVenta) {
        return state.AcuerdoVenta;
    }
    return state.cliente.LimiteCredito;

}
const reducer = (state = initialState, action) => {
    if (action.type === 'STORE_COLECCIONES') {
        return {
            ...state,
            colecciones: action.colecciones,
            TableValue: {},
            TotalPedido: 0.0
        }
    }
    if (action.type === 'SET_PRODUCTO') {
        return {
            ...state,
            producto: action.producto
        }
    }
    if (action.type === 'TOGGLE_SELECT_PRODUCTO') {
        let listaProductosAgregados = [...state.listaProductosAgregados];
        let producto = { ...action.producto };

        if (listaProductosAgregados.findIndex(productoAgregado => producto.ProductoId === productoAgregado.ProductoId) >= 0) {

            listaProductosAgregados[listaProductosAgregados.findIndex(productoAgregado => producto.ProductoId === productoAgregado.ProductoId)].selected =

                !listaProductosAgregados[listaProductosAgregados.findIndex(productoAgregado => producto.ProductoId === productoAgregado.ProductoId)].selected;
        } else {
            producto.selected = true;
            listaProductosAgregados.push(producto);
        }

        return {
            ...state,
            listaProductosAgregados: listaProductosAgregados
        }
    }
    if (action.type === 'SET_COLECCION') {
        return {
            ...state,
            coleccion: action.coleccion,
            codigoColeccionActiva: action.coleccion.CodigoColeccion
        }
    }
    if (action.type === 'SET_NUMEROORDEN') {
        return {
            ...state,
            NumeroOrden: action.NumeroOrden,
        }
    }
    if (action.type === 'SET_PEDIDOENCURSO') {
        return {
            ...state,
            PedidoEnCurso: action.pedidoEnCurso
        }
    }
    if (action.type === 'STORE_CLIENTES') {

        return {
            ...state,
            clientes: action.clientes
        }
    }
    if (action.type === 'STORE_DATOSPARAPEDIDO') {
        return {
            ...state,
            clientes: action.clientes,
            colecciones: action.colecciones,
            TiposPedido: action.TiposPedido,
            MaestroLineas: action.maestroLineas

        }
    }
    if (action.type === 'CALCULARLIMITE') {
        return {
            ...state,
            Limite: calcularLimite(state)

        }
    }
    if (action.type === 'SET_CLIENTE') {
        return {
            ...state,
            cliente: action.cliente
        }
    }
    if (action.type === 'SET_PEDIDO') {
        return {
            ...state,
            TipoPedido: action.TipoPedido,
            AcuerdoVenta: action.AcuerdoVenta,
            Limite: calcularLimite(state)
        }
    }
    if (action.type === 'CANCELAR_PEDIDO') {
        return {
            ...state,
            producto: null,
            coleccion: null,
            cliente: null,
            TipoPedido: null,
            AcuerdoVenta: null,
            listaProductosAgregados: [],
            LineaSeleccionada: null,
            TableValue: {},
            TotalPedido: 0.0,
            NumeroOrden: null,
            BodegaSeleccionada: null
        }
    }
    if (action.type === 'SET_TOTALPEDIDO') {
        return {
            ...state,
            TotalPedido: action.TotalPedido
        }
    }
    if (action.type === 'REINICIAR_PEDIDO') {
        return {
            ...state,
            producto: null,
            coleccion: null,
            TipoPedido: null,
            AcuerdoVenta: null,
            listaProductosAgregados: [],
            LineaSeleccionada: null,
            TableValue: {},
            TotalPedido: 0.0,
            NumeroOrden: null,
            BodegaSeleccionada: null 
        }
    }
    if (action.type === 'RESET_PRODUCTOS_AGREGADOS') {

        let listaProductosAgregados = [...state.listaProductosAgregados];
        listaProductosAgregados.forEach(element => {
            element.selected = false;
        });
        return {
            ...state,

            listaProductosAgregados: listaProductosAgregados
        }
    }
    if (action.type === 'STORE_TIPO_PEDIDO') {

        return {
            ...state,

            TiposPedido: action.TipoPedido
        }
    }
    if (action.type === 'STORE_TIPOS_COLECCION') {
        return {
            ...state,

            TiposColeccion: action.TiposColeccion
        }
    }
    if (action.type === 'STORE_MAESTROLINEA') {
        return {
            ...state,

            MaestroLineas: action.maestroLineas
        }
    }
    if (action.type === 'SET_LINEA') {
        return {
            ...state,

            LineaSeleccionada: action.LineaSeleccionada
        }
    }
    if (action.type === 'SET_BODEGASELECCIONADA') {
        return {
            ...state,

            BodegaSeleccionada: action.payload
        }
    }
    if (action.type === 'SET_TABLEVALUE') {
        return {
            ...state,

            TableValue: { ...action.TableValue }
        }
    }
    if (action.type === 'SET_COLECCIONESFILTRADAS') {
        return {
            ...state,

            ColeccionesFiltradas: action.coleccionesFiltradas
        }
    }


    if (action.type === 'STORE_RECIBO_CLIENTES') {
        return {
            ...state,

            Recibo:{
                ...state.Recibo,
                clientes: action.clientes
            }
        }
    }
  if (action.type === 'STORE_RECIBO_CLIENTESELECTED') {
        return {
            ...state,

            Recibo:{
                ...state.Recibo,
                clienteSelected: action.clienteSelected
            }
        }
    }
  if (action.type === 'STORE_RECIBO_CUOTASXCLIENTE') {
        return {
            ...state,

            Recibo:{
                ...state.Recibo,
                cuotasXCliente: action.cuotasXCliente
            }
        }
    }
  if (action.type === 'STORE_RECIBO_CUOTASAPAGAR') {
        return {
            ...state,

            Recibo:{
                ...state.Recibo,
                cuotasAPagar: action.cuotasAPagar
            }
        }
    }
  if (action.type === 'STORE_RECIBO_FACTURASXCLIENTE') {
        return {
            ...state,

            Recibo:{
                ...state.Recibo,
                facturasXCliente: action.facturasXCliente
            }
        }
    }
  if (action.type === 'STORE_RECIBO_CUOTASCUENTACORRIENTE') {
        return {
            ...state,

            Recibo:{
                ...state.Recibo,
                cuotasCuentaCorriente: action.cuotasCuentaCorriente
            }
        }
    }

    if (action.type === 'DELETE_RECIBO_CUOTASCUENTACORRIENTE') {
        return {
            ...state,

            Recibo:{
                ...state.Recibo,
                cuotasCuentaCorriente: []
            }
        }
    }

    if (action.type === 'DELETE_RECIBO_CLIENTESELECTED') {
        return {
            ...state,

            Recibo:{
                ...state.Recibo,
                clienteSelected: null
            }
        }
    }
    
    if(action.type === "SET_CLIENTECONTADO")
    {
        return {
            ...state,
            clienteContado:action.payload
        }
    }

    if(action.type === "DELETE_CLIENTECONTADO")
    {
        return {
            ...state,
            clienteContado:null
        }
    }

    if(action.type === "SET_CLIENTESCONTADO")
    {
        return {
            ...state,
            clientesContado:action.payload
        }
    }

    if(action.type === "SET_REQUIEREENTREGA")
    {
        return {
            ...state,
            requiereEntrega:action.payload
        }
    }

    if(action.type === "DELETE_REQUIEREENTREGA")
    {
        return {
            ...state,
            requiereEntrega:true
        }
    }

    if(action.type === "SET_ASESOR")
    {
        return {
            ...state,
            asesor:action.payload
        }
    }
    if(action.type==='store_pedidoselected')
    {
        return{
            ...state,
            pedidoSelected:action.payload
        }
    }

    if(action.type==='delete_pedidoselected')
    {
        return{
            ...state,
            pedidoSelected:null
        }
    }

    if(action.type==='SET_EMPRESASTRANSPORTE')
    {
        return{
            ...state,
            empresasTransporte:action.payload
        }
    }

    if(action.type==='SET_EMPRESASTRANSPORTEGLOBAL')
    {
        return{
            ...state,
            EmpresaTransporteGlobal:action.payload
        }
    }

    if(action.type==='SET_PRECIOCAJAS')
    {
        return{
            ...state,
            precioCajas:action.payload
        }
    }

    if(action.type==='SET_PRECIOCAJASGLOBAL')
    {
        return{
            ...state,
            PrecioCajasGlobal:action.payload
        }
    }

    if(action.type==='SET_COMUNIDADAUTONOMA')
    {
        return{
            ...state,
            comunidadesAutonomas:action.payload
        }
    }

    if(action.type==='SET_CLIENTEIMPUESTOS')
    {
        return{
            ...state,
            ClienteImpuestos:action.payload
        }
    }

    if(action.type==='SET_CLIENTEIMPUESTOSGLOBAL')
    {
        return{
            ...state,
            ClienteImpuestosGlobal:action.payload
        }
    }

    if(action.type==='SET_PRODUCTOIMPUESTOS')
    {
        return{
            ...state,
            ProductoImpuestos:action.payload
        }
    }

    if(action.type==='SET_PRODUCTOIMPUESTOSGLOBAL')
    {
        return{
            ...state,
            ProductoImpuestosGlobal:action.payload
        }
    }

    if(action.type==='SET_FLETE')
    {
        return{
            ...state,
            flete:action.payload
        }
    }

    if(action.type==='DELETE_FLETE')
    {
        return{
            ...state,
            flete:0.0
        }
    }

    if(action.type==='SET_EMPRESAS')
    {
        return{
            ...state,
            Empresas:action.payload
        }
    }

    
    if(action.type==='SET_MONEDAS')
    {
        return{
            ...state,
            Monedas:action.payload
        }
    }

    if(action.type==='SET_MONEDASGLOBAL')
    {
        return{
            ...state,
            MonedasGlobal:action.payload
        }
    }

    if(action.type==='SET_BANCOSGLOBAL')
    {
        return{
            ...state,
            BancosGlobal:action.payload
        }
    }

    if(action.type==='SET_TIPOPAGOGLOBAL')
    {
        return{
            ...state,
            TipoPagoGlobal:action.payload
        }
    }

    if(action.type==='SET_PERMISOS')
    {
        return{
            ...state,
            Permisos:action.payload
        }
    }
    if(action.type==='SET_CUENTAIMPRIMIR'){
        return {
            ...state,
            CuentaImprimir:action.payload
        }
    }

    if(action.type==='SET_BLOQUEO'){
        return {
            ...state,
            Bloqueo:action.payload
        }
    }

    if(action.type==='SET_PRODUCTOSCOLECCION'){

        let colecciones = state.colecciones;

        colecciones.forEach((coleccion)=>{
            if(coleccion.CodigoColeccion===state.coleccion.CodigoColeccion){
                coleccion.Edades = action.payload;
            }
        })

        return {
            ...state,
            TableValue:{},
            colecciones,
            coleccion:{
                ...state.coleccion,
                Edades:action.payload
            }
        }
    }

    if(action.type==='SET_ASIGNACIONES'){
        return {
            ...state,
            Asignaciones:action.payload
        }
    }

    if(action.type==='SET_ABREVACIONMONEDAS')
    {
        return{
            ...state,
            AbreviacionMonedas:action.payload
        }
    }

    if(action.type==='SET_PEDIDOSINCRONIZAR')
    {
        return{
            ...state,
            PedidoSincronizar:[...state.PedidoSincronizar,action.payload]
        }
    }

    if(action.type==='SET_RECIBOSENCACHELOG')
    {
        return{
            ...state,
            RecibosEnCache:action.payload
        }
    }

    if(action.type==='SET_RECIBOSENCACHE')
    {
        return{
            ...state,
            RecibosEnCache:[...state.RecibosEnCache,action.payload]
        }
    }

    if(action.type==='SET_RECIBOSINCRONIZAR')
    {
        return{
            ...state,
            ReciboSincronizar:[...state.ReciboSincronizar,action.payload]
        }
    }

    if(action.type==='SET_RESETPEDIDOSINCRONIZAR')
    {
        return{
            ...state,
            PedidoSincronizar:action.payload
        }
    }
    if(action.type==='SET_RESETRECIBOSENCACHE')
    {
        return{
            ...state,
            RecibosEnCache:action.payload
        }
    }
    if(action.type==='SET_RESETRECIBOSINCRONIZAR')
    {
        return{
            ...state,
            ReciboSincronizar:action.payload
        }
    }

    if(action.type==='SET_CARTERA')
    {
        return{
            ...state,
            Cartera:action.payload
        }
    }

    if(action.type === 'SET_CONFIGURACIONES'){
        return {
            ...state,
            Configuraciones:action.payload
        }
    }

    if(action.type === 'SET_TIPOVISITA'){
        return {
            ...state,
            TipoVisita:action.payload
        }
    }

    if(action.type === 'SET_LISTAPRECIOS'){
        return {
            ...state,
            ListaPrecios:action.payload
        }
    }

    if (action.type === "SET_PRODUCTOAGREGADO") {
        let productos = [];

        if (state.listaProductosAgregados.length > 0) {
            let codigosProductos = state.listaProductosAgregados.map(x => x.ProductoId);

            if (!codigosProductos.includes(action.payload.ProductoId)) {
                productos = [...state.listaProductosAgregados, action.payload];
            } else {
                let productosEstado = state.listaProductosAgregados;
                let index = codigosProductos.indexOf(action.payload.ProductoId);
                productosEstado[index] = action.payload;
                productos = productosEstado;
            }
        } else {
            productos.push(action.payload);
        }

        return {
            ...state,
            listaProductosAgregados: productos
        };
    }

    if(action.type==="RESET_PRODUCTOAGREGADO"){
        return {...state,listaProductosAgregados:[]}
    }

    
    if(action.type === 'SET_SECCIONESENCUESTA'){
        return {
            ...state,
            SeccionEncuesta:action.payload
        }
    }

    if(action.type === 'SET_PREGUNTASENCUESTA'){
        return {
            ...state,
            PreguntasEncuesta: action.payload
        }
    }

    if(action.type === 'SET_TIPOINGRESO'){
        return {
            ...state,
            TipoIngreso: action.payload
        }
    }

    if(action.type === 'SET_GRUPOOPCIONES'){
        return {
            ...state,
            GrupoOpciones: action.payload
        }
    }

    
    if(action.type === 'SET_ENCUESTASELECTED'){
        return {
            ...state,
            EncuestaSelected: action.payload
        }
    }

    if(action.type === 'SET_DOCUMENTOSPENDIENTES'){
        return {
            ...state,
            DocumentosPendientes: action.payload
        }
    }

    if(action.type === 'SET_RESPUESTADETALLE'){
        return {
            ...state,
            RespuestaDetalle: action.payload
        }
    }

    if(action.type === 'SET_BODEGAALMACENES'){
        return {
            ...state,
            MaestroBodegaAlmacenes: action.payload
        }
    }

    if (action.type === 'STORE_DEVOLUCION_CLIENTESELECTED') {
        return {
            ...state,
            Devolucion: {
                ...state.Devolucion,
                clienteSelected: action.clienteSelected,
                TableValue: {}
            }
        }
    }

    if (action.type === 'SET_TABLEVALUEDEVOLUCION') {
        return {
            ...state,

            Devolucion: {
                ...state.Devolucion,
                TableValue: action.payload
            }
        }
    }
    
    return state;
};

export default reducer;