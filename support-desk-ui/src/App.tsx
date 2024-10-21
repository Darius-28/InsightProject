import { useState } from 'react';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import TicketForm from './components/TicketForm';
import TicketDialog from './components/TicketDialog';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0069B3', // blue
      light: '#16A0DB', // lightBlue
      dark: '#042B48', // darkBlue
    },
    secondary: {
      main: '#EF3742', // red
    },
    success: {
      main: '#30B888', // green
      dark: '#A9DDBB', // darkGreen
    },
    warning: {
      main: '#FFD24F', // yellow
    },
    text: {
      primary: '#545454', // textDark
      secondary: '#FFFFFF', // textLight
      disabled: '#808080', // textDisabled
    },
    background: {
      default: '#FFFFFF', // white
      paper: '#D3D3D3', // lightGray
    },
  },
  custom: {
    black: '#171717',
    iconLight: '#FFFFFF',
    iconDark: '#545454',
    iconDisabled: '#808080',
  },
});

// Extend the Theme type to include our custom colors
declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    custom: {
      black: string;
      iconLight: string;
      iconDark: string;
      iconDisabled: string;
    }
  }
  interface ThemeOptions {
    custom?: {
      black?: string;
      iconLight?: string;
      iconDark?: string;
      iconDisabled?: string;
    }
  }
}

function App() {
  const [dialogOpen, setDialogOpen] = useState(true);

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <AppHeader />
          <main style={{ marginTop: '64px', padding: '20px' }}>
            <Switch>
              <Route exact path="/" render={() => <div>Home Page</div>} />
              <Route path="/ticket-form" component={TicketForm} />
            </Switch>
          </main>
          <TicketDialog open={dialogOpen} onClose={handleDialogClose} />
        </div>
      </Router>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
