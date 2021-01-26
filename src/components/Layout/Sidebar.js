import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Link as RouterLink } from 'react-router-dom';
import { Tour } from 'components/Layout';
import {
    SwipeableDrawer as MuiSwipeableDrawer,
    Divider,
    //ListSubheader,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse
} from '@material-ui/core';

//Icons
import {
    ExpandLess,
    ExpandMore,
    //DashboardOutlined,
    FeaturedPlayListOutlined,
    PostAdd,
    AddBoxOutlined,
    Sync,
    Dvr,
    FlashAuto,
    AllInbox,
    Input,
    Dashboard,
    //Book,
    ListAlt,
    EventNote,
    EventAvailable,
    Receipt,
    SwapHorizOutlined,
    StoreMallDirectoryOutlined,
    CameraAltOutlined,
    LocationOnOutlined,
    HelpOutline,
    Public,
    Security,
    AccountBox,
    SyncAlt,
    ViewCompact,
    Explore,
    MyLocation,
    DriveEta,
    Home
} from '@material-ui/icons';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import LocalLibraryIcon from '@material-ui/icons/LocalLibrary';
import DescriptionIcon from '@material-ui/icons/Description';
import AssessmentIcon from '@material-ui/icons/Assessment';

//components
import Logo from 'assets/img/logo/Barra.png';
import styles from 'components/Layout/Layout.module.css';
import {IsAllow} from 'components/Seguridad/Permisos';




const Drawer = withStyles({
    paper: {
        background: '#243746',//'linear-gradient(110deg, rgba(67,191,240,94) 0%, rgba(19,53,66,26) 100%)',
    },
})(MuiSwipeableDrawer);

const useStyles = makeStyles(theme => ({
    list: {
        width: 250,
    },
    nested: {
        paddingLeft: theme.spacing(4),
        color: 'white',
        //transition: "all 0.5s",
        "&:hover": {
            color : "white"
          } //Color blanco al apuntar con el mouse
    },
    navItem: {
        color: 'white'
      }
}));


const navItems = [
    { to: '/home', name: 'Inicio', dataTut: 'DataTut_home', Icon: Home },
    { to: '/estadistica-visita', name: 'Estadistica Visita', dataTut: 'DataTut_EstadisticaVisista', Icon: AssessmentIcon },
    { to: '/DashBoard-Comercial', name: 'Estadistica Comercial', dataTut: 'DataTut_DashBoardComercial', Icon: Dashboard },
    {
        to: '/monitoreo', name: 'Monitoreo', dataTut: 'DataTut_Sinc', Icon: Explore,
        expanded: [
            { to: '/ultima-geolocalizacion-monitoreo', name: 'Ultima Geolocalización', dataTut: 'DataTut_SincLista', Icon: MyLocation, backgroundColor:''  },
            { to: '/recorrido-monitoreo', name: 'Recorrido', dataTut: 'DataTut_SincLista', Icon: DriveEta, backgroundColor:''  }
        ]
    },
    { to: '/asignacion', name: 'Asignación', dataTut: 'DataTut_Asignación', Icon: EventAvailable },
    { to: '/agenda', name: 'Agenda', dataTut: 'DataTut_Agenda', Icon: EventNote },
    { to: '/cartera', name: 'Cartera Clientes', dataTut: 'DataTut_Agenda', Icon: AccountBox },
    //{ to: '/dashboard', name: 'Dashboard', dataTut: 'DataTut_Dashboard', Icon: DashboardOutlined },
    {
        to: '/encuesta', name: 'Encuesta', dataTut: 'DataTut_EncuetasGeneral', Icon: LibraryBooksIcon,
        expanded: [
            { to: '/Mantenimiento/Encuesta', name: 'Mantemiento Encuesta', dataTut: 'DataTut_MantenimientoEncuestas', Icon: LocalLibraryIcon, backgroundColor:'' },
            { to: '/Encuesta', name: 'Encuesta', dataTut: 'DataTut_Encuestas', Icon: DescriptionIcon, backgroundColor:''  },
           ]
    },
    {
        to: '/pedidos', name: 'Pedidos', dataTut: 'DataTut_Pedidos', Icon: FeaturedPlayListOutlined,
        expanded: [
            { to: '/lista-pedidos-BandejaSalida', name: 'Bandeja Salida', dataTut: 'DataTut_ListadoPedidos', Icon: Input, backgroundColor:'#c41021' },
            { to: '/lista-pedidos-pendientes', name: 'Pendientes AX', dataTut: 'DataTut_ListadoPedidos', Icon: AllInbox, backgroundColor:'#d49008'  },
            { to: '/pedidos', name: 'Nuevo Pedido', dataTut: 'DataTut_NuevoPedido', Icon: PostAdd, backgroundColor:''  },
            { to: '/lista-pedidos', name: 'Listado Pedidos', dataTut: 'DataTut_ListadoPedidos', Icon: ListAlt, backgroundColor:''  },
        ]
    },
    {
        to: '/recibos', name: 'Recibos', dataTut: 'DataTut_Recibos', Icon: Receipt,
        expanded: [
            { to: '/lista-recibos-BandejaSalida', name: 'Bandeja Salida', dataTut: 'DataTut_BandejaSalida', Icon: Input, backgroundColor:'#c41021' },
            { to: '/lista-recibos-pendientes', name: 'Pendientes AX', dataTut: 'DataTut_BandejaSalida', Icon: AllInbox, backgroundColor:'#d49008' },
            { to: '/recibos', name: 'Nuevo Recibo', dataTut: 'DataTut_NuevoRecibo', Icon: AddBoxOutlined, backgroundColor:''  },
            { to: '/lista-recibos', name: 'Listado Recibos', dataTut: 'DataTut_ListadoRecibos', Icon: ListAlt, backgroundColor:''  },
            { to: '/lista-recibos-creditos', name: 'Resincronización recibos', dataTut: 'DataTut_ListadoRecibos', Icon: SyncAlt, backgroundColor:''  }
        ]
    },
    {
        to: '/seguridad', name: 'Seguridad', dataTut: 'DataTut_Seguridad', Icon: Security,
        expanded: [
            { to: '/seguridad-permisos', name: 'Asignar Permisos', dataTut: 'DataTut_AsignarPermisos', Icon: AddBoxOutlined, backgroundColor:''  },
            { to: '/seguridad-mantenimiento', name: 'Mantenimiento', dataTut: 'DataTut_Mantenimiento', Icon: ListAlt, backgroundColor:''  },
        ]
    },
    { to: '/devoluciones', name: 'Devoluciones', dataTut: 'DataTut_Devoluciones', Icon: SwapHorizOutlined },
    { to: '/inventarios', name: 'Inventarios', dataTut: 'DataTut_Inventarios', Icon: StoreMallDirectoryOutlined },
    { to: '/fotografias', name: 'Fotografias', dataTut: 'DataTut_Fotografias', Icon: CameraAltOutlined },
    { to: '/coordenadas', name: 'Coordenadas', dataTut: 'DataTut_Coordenadas', Icon: LocationOnOutlined },
    { to: '/coordenadas-global', name: 'Coordenadas Global', dataTut: 'DataTut_Coordenadas', Icon: Public },
    {
        to: '/sincronizacion', name: 'Sincronizacion', dataTut: 'DataTut_Sinc', Icon: Sync,
        expanded: [
            { to: '/sincronizacionlista', name: 'Sincronizacion Automática', dataTut: 'DataTut_SincLista', Icon: FlashAuto, backgroundColor:''  },
            { to: '/sincronizacionListaMonitor', name: 'Monitor Sincronizaciones', dataTut: 'DataTut_SincListaMonitor', Icon: Dvr, backgroundColor:''  },
            //{ to: '/sincronizacionespecifica', name: 'Sincronizacion Manual', dataTut: 'DataTut_SincEspec', Icon: Book },
            { to: '/sincronizacion-especifica-coleccion', name: 'Colección Específica', dataTut: 'DataTut_SincLista', Icon: ViewCompact, backgroundColor:''  }
        ]
    }
];

const Sidebar = (props) => {
    const classes = useStyles();
    const [isMenuOpen, setIsMenuOpen] = useState([]);
    const [NodeGuia, setNodeGuia] = useState(null);
    const [SideMenu, setSideMenu] = useState({
        left: false,
        right: false,
    });
    useEffect(() => {
        // Update the document title using the browser API
        let node = document.getElementById("SidebarToggle");

        if (node !== null) {
            node.addEventListener("click", () => toggleDrawer('left', true));
        }

        let Submenus = [];
        navItems.map((menu, index) => {
            if (menu.expanded && menu.expanded !== null && menu.expanded !== undefined) {
                Submenus[index] = false;
            }
            return false;
        });
        setIsMenuOpen(Submenus);
        // eslint-disable-next-line
    }, []);

    const toggleDrawer = (side, open) => {
        setSideMenu({ ...SideMenu, [side]: open });

        setTimeout(() => {
            let guia = document.getElementById('OpenHelperGuide');

            if (guia !== null) {
                setNodeGuia(guia);
            }
        }, 300)

    };

    const handleClick = (index) => {
        let Submenu = [...isMenuOpen];
        Submenu[index] = !Submenu[index];

        setIsMenuOpen(Submenu);
    };

    const handleClick2 = (index) => {
        toggleDrawer('left', false);
    };

    const sideList = side => (
        <div
            className={classes.list}
            role="presentation"
        >
            <div className="px-3 py-3" style={{backgroundColor:'#EBEBF3'}}> 
                <div className="px-3">
                    <img
                        src={Logo}
                        className="img-fluid"
                        alt="Logo"
                    />
                </div>
            </div>
            <Divider />
            <List
                component="nav"
            // subheader={
            //     <ListSubheader component="div" id="nested-list-subheader" className="text-light">
            //         Nested List Items
            //     </ListSubheader>
            // }
            >
                {
                    // eslint-disable-next-line
                    navItems.map((menu, index) => {
                        if (menu.expanded && menu.expanded !== null && menu.expanded !== undefined) {
                            if(IsAllow(menu.name))
                            {
                            return (
                                <React.Fragment key={index}>
                                    <ListItem data-tut={menu.dataTut} data-content={index} button className={styles.Titulo} onClick={() => handleClick(index)}>
                                        <ListItemIcon>
                                            <menu.Icon className={styles.Icons} />
                                        </ListItemIcon>
                                        <ListItemText primary={menu.name} />
                                        {isMenuOpen[index] ? <ExpandLess /> : <ExpandMore />}
                                    </ListItem>
                                    <Collapse in={isMenuOpen[index]} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {
                                                // eslint-disable-next-line
                                                menu.expanded.map((submenu, ind) => {

                                                    if(IsAllow(submenu.to, true))
                                                    {
                                                          return (
                                                            /*<ListItemLink
                                                                key={ind}
                                                                nested
                                                                dataTut={submenu.dataTut}
                                                                classes={classes}
                                                                to={submenu.to}
                                                                primary={submenu.name}
                                                                icon={<submenu.Icon className={styles.Icons} />}
                                                            />*/
                                                            
                                                            <ListItem data-tut={submenu.dataTut} style={{backgroundColor:submenu.backgroundColor}} nested button className={classes.nested} component={Link} to={submenu.to} onClick={() => handleClick2(index)}>
                                                                <ListItemIcon>
                                                                    <submenu.Icon className={styles.Icons} />
                                                                </ListItemIcon>
                                                                <ListItemText primary={submenu.name} />
                                                            </ListItem>
                                                        )
                                                    } 
                                                })
                                            }
                                        </List>
                                    </Collapse>
                                </React.Fragment>
                            )
                            }
                        }
                        if(IsAllow(menu.to)){
                        return (
                            /*<ListItemLink
                                key={index}
                                to={menu.to}
                                dataTut={menu.dataTut}
                                primary={menu.name}
                                icon={<menu.Icon className={styles.Icons} />}
                            />*/
                            <ListItem data-tut={menu.dataTut} button className={styles.Titulo} component={Link} to={menu.to} onClick={() => handleClick2(index)}>
                                <ListItemIcon>
                                    <menu.Icon className={styles.Icons} />
                                </ListItemIcon>
                                <ListItemText primary={menu.name} />
                            </ListItem>
                        )
                        } 
                    })
                }

                <ListItemLink
                    id={"OpenHelperGuide"}
                    to={'#'}
                    primary={"Ayuda"}
                    dataTut={"DataTut_HelperButton"}
                    icon={<HelpOutline className={styles.Icons} />}
                />
            </List>
        </div >
    );

    const tourConfig = [
        {
            selector: '[data-tut="DataTut_EstadisticaVisista"]',
            content: `Información de las visistas.`
        },
        {
            selector: '[data-tut="DataTut_Dashboard"]',
            content: `Información del dashboard.`
        },
        {
            selector: '[data-tut="DataTut_Pedidos"]',
            content: `Controles Pedidos.`
        },
        {
            selector: '[data-tut="DataTut_NuevoPedido"]',
            content: "Realizar Nuevo Pedido",
            action: () => {
                let node = document.querySelector('[data-tut="DataTut_Pedidos"]');
                let index = node.getAttribute('data-content');

                if (!isMenuOpen[index]) {
                    handleClick(index);
                }
            }
        },
        {
            selector: '[data-tut="DataTut_ListadoPedidos"]',
            content: "Ver listado de pedidos",
            action: () => {
                let node = document.querySelector('[data-tut="DataTut_Pedidos"]');
                let index = node.getAttribute('data-content');

                if (!isMenuOpen[index]) {
                    handleClick(index);
                }
            }
        },
        {
            selector: '[data-tut="DataTut_Agenda"]',
            content: `Ver agenda y las asignaciones de trabajo.`
        },
        {
            selector: '[data-tut="DataTut_Asignación"]',
            content: `Configurar asignaciones de trabajo.`
        },
        {
            selector: '[data-tut="DataTut_Recibos"]',
            content: `Recibos.`
        },

        {
            selector: '[data-tut="DataTut_NuevoRecibo"]',
            content: "Realizar Nuevo Recibo",
            action: () => {
                let node = document.querySelector('[data-tut="DataTut_Recibos"]');
                let index = node.getAttribute('data-content');

                if (!isMenuOpen[index]) {
                    handleClick(index);
                }
            }
        },
        {
            selector: '[data-tut="DataTut_ListadoRecibos"]',
            content: "Ver Listado de Recibos",
            action: () => {
                let node = document.querySelector('[data-tut="DataTut_Recibos"]');
                let index = node.getAttribute('data-content');

                if (!isMenuOpen[index]) {
                    handleClick(index);
                }
            }
        },
        {
            selector: '[data-tut="DataTut_Devoluciones"]',
            content: `Devoluciones.`
        },
        {
            selector: '[data-tut="DataTut_Inventarios"]',
            content: `Inventarios.`
        },
        {
            selector: '[data-tut="DataTut_Fotografias"]',
            content: `Fotografias.`
        },
        {
            selector: '[data-tut="DataTut_Coordenadas"]',
            content: `Ver coordenadas.`
        },
        {
            selector: '[data-tut="DataTut_HelperButton"]',
            content: `Obtener ayuda de la interfaz`
        },
    ];

    return (
        <div>
            <Drawer className={styles.Container} onOpen={() => toggleDrawer('left', true)} open={SideMenu.left} onClose={() => toggleDrawer('left', false)}>
                {sideList('left')}
            </Drawer>
            <Drawer anchor="right" open={SideMenu.right} onOpen={() => toggleDrawer('right', true)} onClose={() => toggleDrawer('right', false)}>
                {sideList('right')}
            </Drawer>

            <Tour startAt={0} Steps={tourConfig} Color={"#598c97"} Node={NodeGuia} />
        </div>
    );
}

const ListItemLink = (props) => {
    const { icon, primary, to } = props;

    const renderLink = React.useMemo(
        () =>
            React.forwardRef((itemProps, ref) => (
                // With react-router-dom@^6.0.0 use `ref` instead of `innerRef`
                // See https://github.com/ReactTraining/react-router/issues/6056
                <RouterLink to={to} {...itemProps} innerRef={ref} />
            )),
        [to],
    );
    let classes = styles.Titulo;
    if (props.nested !== undefined) {
        classes += " " + props.classes.nested;
    }

    return (
        <li id={props.id && props.id} data-tut={props.dataTut}>
            <ListItem className={classes} button component={renderLink}>
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={primary} />
            </ListItem>
        </li>
    );
}

export default Sidebar;