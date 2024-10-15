import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  makeStyles,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Theme,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import HomeIcon from '@material-ui/icons/Home';
import SubAppBar from './SubAppBar';

const drawerWidth = 80;

const useStyles = makeStyles((theme: Theme) => {
  const toolbarHeight = theme.mixins.toolbar.minHeight as number || 56; // Default to 56px if undefined
  const subAppBarHeight = 40;
  const subAppBarSpacing = 16; // Match the top spacing from SubAppBar
  const totalHeaderHeight = toolbarHeight + subAppBarHeight + subAppBarSpacing;

  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    accountButton: {
      marginLeft: theme.spacing(2),
    },
    accountIcon: {
      width: 40,
      height: 40,
      color: theme.custom.iconLight,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      top: theme.mixins.toolbar.minHeight, // Connect drawer to the app bar
      height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`, // Adjust height
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: theme.spacing(3),
      backgroundColor: theme.palette.common.white,
    },
    listItem: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      padding: theme.spacing(2, 0),
    },
    icon: {
      fontSize: 36,
      color: theme.custom.iconDark,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      marginTop: theme.mixins.toolbar.minHeight,
      marginLeft: drawerWidth,
    },
  };
});

const AppHeader: React.FC = () => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  const menuItems = [
    { icon: <HomeIcon className={classes.icon} />, ariaLabel: 'Home' },
  ];

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.leftSection}>
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu" 
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="body2" className={classes.title}>
              Support Desk
            </Typography>
          </div>
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleAccountMenuOpen}
            color="inherit"
            className={classes.accountButton}
          >
            <AccountCircle className={classes.accountIcon} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <SubAppBar />
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <List>
          {menuItems.map((item, index) => (
            <ListItem button key={index} className={classes.listItem} onClick={handleDrawerToggle}>
              <ListItemIcon aria-label={item.ariaLabel}>{item.icon}</ListItemIcon>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Menu
        id="menu-appbar"
        anchorEl={accountAnchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(accountAnchorEl)}
        onClose={handleAccountMenuClose}
      >
        <MenuItem onClick={handleAccountMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleAccountMenuClose}>My Account</MenuItem>
        <MenuItem onClick={handleAccountMenuClose}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

export default AppHeader;
