import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  Theme,
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    
  },
  subAppBarContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    left: 0,
    right: 0,
    top: (theme.mixins.toolbar.minHeight as number) + 175,
    zIndex: theme.zIndex.drawer - 1,
    marginBottom: -40,
  },
  subAppBar: {
    width: '300%',
    maxWidth: '1800px',
    height: '50px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
  },
  subToolbar: {
    minHeight: '50px', // Match this with the subAppBar height
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // Center the content horizontally
    padding: 0,
  },
  boldTitle: {
    fontWeight: 'bold',
    color: theme.palette.primary.contrastText,
    textAlign: 'center', // Ensure text is centered
    width: '100%', // Take full width of the toolbar
  },
  headingContainer: {
    position: 'relative',
    top: (theme.mixins.toolbar.minHeight as number) + 175 + 70,
    right: theme.spacing(60),
    zIndex: theme.zIndex.drawer - 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Align content to the left
  },

  heading: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1), 
  },
  underline: {
    width: '270%',
    height: '2px',
    backgroundColor: theme.palette.primary.main,
  },
}));

const SubAppBar: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.subAppBarContainer}>
        <AppBar position="static" className={classes.subAppBar}>
          <Toolbar className={classes.subToolbar}>
            <Typography variant="h6" className={classes.boldTitle}>
              SUPPORT DESK
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className={classes.headingContainer}>
        <Typography variant="h4" className={classes.heading}>
          SUPPORT DESK
        </Typography>
        <div className={classes.underline} />
      </div>
    </div>
  );
};

export default SubAppBar;
