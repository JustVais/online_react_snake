import React, { Component } from 'react';
import '../css/gameMenu.css';

class GameMenu extends Component {
    render() {
        return (
            <div className="game-menu">
                <div className="game-menu__wrapper">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default GameMenu;