import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Menu from './components/Menu';
import Singleplay from './components/Singleplay';

import './css/index.css'

ReactDOM.render(
    <BrowserRouter>
        <div className="container">
            <Switch>
                <Route exact path="/" component={Menu} />
                <Route exact path="/singleplay" component={Singleplay} />
            </Switch>
        </div>
    </BrowserRouter>,
  document.getElementById('root')
);
