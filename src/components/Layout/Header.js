//Components
import React from 'react';
import { Link } from 'react-router-dom';
import {
    AppBar as MuiAppBar,
    Toolbar,
    IconButton,
    Badge,
    MenuItem,
    Menu as MuiMenu
} from '@material-ui/core';

//Icons
import {
    Menu as MenuIcon,
    PersonOutline as AccountIcon,
    // Mail as MailIcon,
    NotificationsOutlined as NotificationsIcon,
    MoreVert as MoreIcon,
} from '@material-ui/icons';

//Styles
import {
    makeStyles,
    withStyles
} from '@material-ui/core/styles';
import Logo from 'assets/img/logo/LogoLetras.png'
import styles from 'components/Layout/Layout.module.css'

const Header = () => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

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

    const LogOut = () => {
        localStorage.setItem('token', '');
        window.location.reload();
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
            <MenuItem>
                <Badge badgeContent={17} color="secondary">
                    <NotificationsIcon color="inherit" />
                </Badge>
                <div className="ml-3">
                    Notificaciones
                </div>
            </MenuItem>

            <MenuItem onClick={handleProfileMenuOpen}>

                <AccountIcon color="inherit" />
                <div className="ml-3">
                    Perfil
                </div>
            </MenuItem>
        </Menu>
    );

    return (
        <div className={styles.MarginBottomHeader}>
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
                    <Link className={styles.LogoHeaderContainer} to="/dashboard">
                        <img src={Logo} className={"img-fluid " + styles.LogoHeader} alt="Logo" />
                    </Link>
                    <div className={classes.grow} />
                    <div className={classes.sectionDesktop}>
                        <IconButton aria-label="Notifications" color="inherit">
                            <Badge badgeContent={17} color="secondary">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

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
        background: 'linear-gradient(178deg, rgba(89,140,151,1) 0%, rgba(72,87,101,1) 100%)',
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