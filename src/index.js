import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import MainMenu from './screens/MainMenu';
import Singleplayer from './screens/Singleplayer';
import Multiplayer from './screens/Multiplayer';

import './css/index.css'

ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={MainMenu} />
            <Route exact path="/singleplayer" component={Singleplayer} />
            <Route exact path="/multiplayer" component={Multiplayer} />
        </Switch>
    </BrowserRouter>,
    document.getElementById('root')
);
