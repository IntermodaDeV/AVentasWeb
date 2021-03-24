//Components
import React from 'react';
import { Link } from 'react-router-dom';
import {
    AppBar as MuiAppBar,
    Toolbar,
    IconButton,
    //Badge,
    MenuItem,
    Menu as MuiMenu
} from '@material-ui/core';

//Icons
import {
    Menu as MenuIcon,
    PersonOutline as AccountIcon,
    // Mail as MailIcon,
    //NotificationsOutlined as NotificationsIcon,
    MoreVert as MoreIcon,
} from '@material-ui/icons';
//Styles
import {
    makeStyles,
    withStyles
} from '@material-ui/core/styles';
import Logo from 'assets/img/logo/Cabecera.png'
import styles from 'components/Layout/Layout.module.css'
import Button from '@material-ui/core/Button';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import {useSelector} from 'react-redux';
import { FaWifi } from "react-icons/fa";
import { verificarConexion } from 'utils/http';
import { Loading } from 'components/Global/Loading';
import {APIURL} from 'utils/Enviroment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
const Header = (props) => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const [Visible, setVisible] = React.useState(null);
    const [Online, setIsOnline] = React.useState(true);
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    const Permisos = useSelector(e=> e.Permisos);
    const UsuarioOficina = Permisos !== undefined && Permisos !== null && Permisos.length > 0 ? Permisos[0].UsuarioOficina : false;
    const [loading,setLoading] = React.useState(false);
    const PedidosCache = useSelector(p=>p.PedidoSincronizar);
    const RecibosCache = useSelector(r=> r.RecibosEnCache);
    const BodegaSeleccionada = useSelector(e=>e.BodegaSeleccionada);
   
    const StyledMenu = withStyles({
        paper: {
          border: '1px solid #d3d4d5',
        },
      })((props) => (
        <Menu
          elevation={0}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          {...props}
        />
      ));
      
      const StyledMenuItem = withStyles((theme) => ({
        root: {
          '&:focus': {
            backgroundColor: theme.palette.primary.main,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: theme.palette.common.white,
            },
          },
        },
      }))(MenuItem);

    const handleProfileMenuOpen = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = event => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleClick = async () => {
        setLoading(true);
        let isOnline = await verificarConexion();
        setLoading(false);
        setIsOnline(isOnline);
        setVisible(true)

      };

    const handleClose = () => {
        localStorage.setItem("Conexion", "offline");
        props.history.push('/home');
        setVisible(null);
    };

    const contieneRuta = ruta => {
        return ruta.toLowerCase().includes("/pedidos") || ruta.includes("/recibos") || ruta.includes("/Recibos")|| ruta.includes("/cartera");
    }

      const handleCloseOnline = () => {
        localStorage.setItem("Conexion", "Online")
        if(!contieneRuta(props.history.location.pathname)){
            props.history.push('/home');
        }
        setVisible(null);
        
      };
    const handleCloseOffline = () => {
        localStorage.setItem("Conexion", "offline");
        if (props.history.location.pathname.toLowerCase().includes("/pedidos")) {
            if (BodegaSeleccionada) {
                if (!BodegaSeleccionada.BodegaPrincipal) {
                    Swal.fire({
                        title: 'Bodega Especifico',
                        text: "La funcionalidad de bodega especifico funciona unicamente online.",
                        type: 'warning',
                        confirmButtonText: 'OK',
                    });
                    props.history.push('/home');
                }
            }
        } else {
            if (!contieneRuta(props.history.location.pathname)) {
                props.history.push('/home');
            }
        }
        setVisible(null);
    };

    const tieneDocumentosPendientes = () => {
        return PedidosCache.length > 0 || RecibosCache.length > 0;
    }

    const LogOut = async () => {
        if (tieneDocumentosPendientes()) {
            Swal.fire({
                title: 'Documentos Pendientes',
                text: 'Tiene documentos pendientes por sincronizar. Sincronice los documentos antes de cerrar sesión.',
                type: 'warning',
                confirmButtonText: 'Ok',
            });
        } else {
            let isOnline = await verificarConexion();
            if (isOnline) {
                fetch(APIURL + "/api/cerrarSesion", {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(localStorage.getItem("codigo"))
                })
                    .then(res => res.json())
                    .then((result) => {
                        console.log(result.Message);
                        localStorage.clear();
                        window.location.reload();
                    },
                    )
            }
            else {
                Swal.fire({
                    title: 'Sin Internet',
                    text: '¡La sesion se puede cerrar unicamente si cuenta con acceso a internet!',
                    type: 'error',
                    confirmButtonText: 'Ok',
                });
            }
        }
    }

    const menuId = 'account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={LogOut}>Cerrar Sesión</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            {/*<MenuItem>
                <Badge badgeContent={17} color="secondary">
                    <NotificationsIcon color="inherit" />
                </Badge>
                <div className="ml-3">
                    Notificaciones
                </div>
            </MenuItem>*/}

            <MenuItem onClick={handleProfileMenuOpen}>

                <AccountIcon color="inherit" />
                <div className="ml-3">
                    Perfil
                </div>
            </MenuItem>
        </Menu>
    );
    if(localStorage.getItem("Conexion") === null){
        localStorage.setItem("Conexion", "Online");
    }
    return (
        <div className={styles.MarginBottomHeader}>
            <Loading open={loading} title={"Verificando conexión"}/>
            <AppBar color="default" position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        id="SidebarToggle"
                    >
                        <MenuIcon />
                    </IconButton>
                    <Link className={styles.LogoHeaderContainer} to="/home">
                        <img src={Logo} className={"img-fluid " + styles.LogoHeader} alt="Logo" />
                    </Link>
                    <div className={classes.grow} />
                    <div className={classes.menuButton}>
                        <Button  aria-controls="customized-menu"
                            aria-haspopup="true"
                            variant="contained"
                            hidden = {UsuarioOficina}
                            style={{textAlign: 'right',background:localStorage.getItem("Conexion")==="Online"?'green':'red',color:'#fff'}} 
                            onClick={handleClick}>{localStorage.getItem("Conexion")}
                        </Button>
                            <StyledMenu
                                id="customized-menu"
                                Visible={Visible}
                                keepMounted
                                open={Boolean(Visible)}
                                onClose={handleClose}>

                                <StyledMenuItem hidden={!Online}>
                                    <MenuItem onClick={handleCloseOnline}>
                                        <ListItemIcon>
                                            <FaWifi  />
                                        </ListItemIcon>
                                        <ListItemText primary="ONLINE" />
                                    </MenuItem>
                                </StyledMenuItem>
                                <StyledMenuItem>
                                    <MenuItem onClick={handleCloseOffline}>
                                        <ListItemIcon>
                                            <InboxIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="OFFLINE" />
                                    </MenuItem>
                                </StyledMenuItem>
                            </StyledMenu>
                        </div>
                    <div className={classes.sectionDesktop}>
                        {/*<IconButton aria-label="Notifications" color="inherit">
                            <Badge badgeContent={17} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>*/}

                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountIcon />
                        </IconButton>
                    </div>
            
                    <div className={classes.sectionMobile}>
                        <IconButton
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                        >
                            <MoreIcon />
                        </IconButton>
                    </div>
                   
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
        </div >
    );
}

const AppBar = withStyles({
    colorDefault: {
        background: '#243746',//'linear-gradient(178deg, rgba(67,191,240,94) 0%, rgba(19,53,66,26) 100%)',
        color: 'white',
    },
})(MuiAppBar);

const Menu = withStyles({
    paper: {
        minWidth: 150,
    }
})(MuiMenu);

const useStyles = makeStyles(theme => ({
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
}));

export default Header;