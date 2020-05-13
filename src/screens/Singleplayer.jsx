import React, { useState, useEffect } from 'react';
import GameMenu from "../components/GameMenu";
import { Link } from "react-router-dom";

import MapLogic from '../components/MapLogic';

import '../css/singleplayer.css'

const MAP_SIZE = 32;

function Singleplayer() {
    const [loading, setLoading] = useState(true);
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, []);


    const restartGame = () => {
        setIsGameOver(false);
    }

    return (
        !loading &&
        <>
            {
                !isGameOver ?
                    <div className="container">
                        <MapLogic MAP_SIZE={MAP_SIZE} setIsGameOver={setIsGameOver} />
                    </div>
                    :
                    <GameMenu>
                        <h1 className="game-menu__title">Game Over</h1>
                        <button className="game-menu__button" onClick={restartGame} >Играть ещё</button>
                        <Link to="/" className="game-menu__button">Выйти в меню</Link>
                    </GameMenu>
            }
        </>
    );
}

export default Singleplayer;