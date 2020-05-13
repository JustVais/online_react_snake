import React from 'react';
import { Link } from "react-router-dom";
import GameMenu from "../components/GameMenu";

class Menu extends React.Component {
    render() {
        return (
            <div className="container">
                <GameMenu>
                    <Link to="/singleplayer" className="game-menu__button">Одиночная игра</Link>
                    <Link to="/multiplayer" className="game-menu__button">Мультиплеер</Link>
                </GameMenu>
            </div>
        );
    }
}

export default Menu;