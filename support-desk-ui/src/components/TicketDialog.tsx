import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  makeStyles 
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      overflow: 'hidden',
      backgroundColor: theme.palette.background.default,
    },
  },
  blueBar: {
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(2),
    color: theme.palette.primary.contrastText,
  },
  title: {
    fontWeight: 'bold',
  },
  content: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingBottom: theme.spacing(3),
  },
  linkContainer: {
    marginTop: theme.spacing(2),
  },
  link: {
    color: '#0000EE',
    textDecoration: 'underline',
    '&:hover': {
      color: '#551A8B',
    },
    '&:active': {
      color: '#FF0000',
    },
  },
  actions: {
    borderTop: `1px solid ${theme.palette.divider}`,
    margin: 0,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  closeButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.MuiButton-contained': {
      boxShadow: 'none',
    },
  },
  buttonIcon: {
    marginRight: theme.spacing(-0.5),
  },
}));

interface TicketDialogProps {
  open: boolean;
  onClose: () => void;
}

const TicketDialog: React.FC<TicketDialogProps> = ({ open, onClose }) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="ticket-dialog-title" className={classes.dialog}>
      <div className={classes.blueBar}>
        <Typography variant="h6" className={classes.title} id="ticket-dialog-title">
          For any Activity Tracker support please contact RCL:
        </Typography>
      </div>
      <DialogContent className={classes.content}>
        <Typography className={classes.linkContainer}>
          <Link to="/ticket-form" className={classes.link} onClick={onClose}>
            ATSupport@rclfoods.com
          </Link>
        </Typography>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button 
          onClick={onClose} 
          fullWidth 
          variant="contained"
          className={classes.closeButton}
          startIcon={<CheckIcon className={classes.buttonIcon} />}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDialog;
