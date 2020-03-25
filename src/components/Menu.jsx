import React from 'react';

import '../css/menu.css';

class Menu extends React.Component {
    render() { 
        return (
            <div className="menu">
                <button className="menu__button" id="start_single_play">Одиночная игра</button>
                <button className="menu__button" id="start_multy_play">Мультиплеер</button>
            </div>
        );
    }
}
 
export default Menu;