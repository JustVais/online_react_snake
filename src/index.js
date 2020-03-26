import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Menu from './components/MainMenu';
import Singleplay from './components/Singleplay';
// import GameMenu from "./components/GameMenu";

import './css/index.css'

ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={Menu} />
            <Route exact path="/singleplay" component={Singleplay} />
        </Switch>
        {/* <GameMenu /> */}
    </BrowserRouter>,
    document.getElementById('root')
);
