import React from 'react';
import { Link } from "react-router-dom";

import '../css/menu.css';

class Menu extends React.Component {
    render() { 
        return (
            <div className="menu">
                <Link to="/singleplay" className="menu__button" id="start_single_play">Одиночная игра</Link>
                <Link  className="menu__button" id="start_multy_play">Мультиплеер</Link>
            </div>
        );
    }
}
 
export default Menu;