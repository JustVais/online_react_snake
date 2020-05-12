import React from 'react';
import '../css/gameMenu.css';

const GameMenu = ({children}) => {
    return (
        <div className="game-menu">
            <div className="game-menu__wrapper">
                {children}
            </div>
        </div>
    );
}

export default GameMenu;