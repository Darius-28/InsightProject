import React from 'react';
import { Route, Switch } from 'react-router-dom';
import TicketForm from './components/TicketForm';
// Import other components you want to route to

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route path="/ticket-form" render={() => <TicketForm />} />
    </Switch>
  );
};

export default Routes;
