import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../css/multiplayer.css';
import DrawingMap from '../components/DrawingMap';

import WaitingPlayer from '../components/WaitingPlayer';
import { Link } from 'react-router-dom';
import GameOverPlayer from "../components/GameOverPlayer";

import Map from '../components/Map.js';

const MAP_SIZE = 32;
let socket;

const Multiplayer = () => {
    const [map] = useState(new Map(MAP_SIZE));
    const [gameStarted, setGameStarted] = useState(false);
    const [playersList, setPlayersList] = useState({});
    const [localIsReady, setLocalIsReady] = useState(false);

    useEffect(() => {
        socket = io.connect("localhost:3001");

        socket.emit("connect to room");

        socket.on('get all players', (data) => {
            setPlayersList(data.playersList);
        });

        socket.on('add new player', (data) => {
            setPlayersList(plList => ({ 
                ...plList, 
                [data.newPlayer.id]: data.newPlayer 
            }));
        });

        socket.on('change player status', (data) => {
            setPlayersList(plList => {
                plList[data.playerId].isReady = data.status;
                return { ...plList };
            });
        });

        socket.on('disconnect some player', (data) => {
            setPlayersList(plList => {
                delete plList[data.playerId];
                return { ...plList };
            });
        });

        socket.on('game start', () => {
            setGameStarted(true);
        });
    }, []);

    const changeMyReadyStatus = () => {
        setLocalIsReady(status => {
            status = !status;
            socket.emit('change my ready status', {status: status});
            return status;
        });
    }

    return (
        <>
            {
                gameStarted ?
                    <div className="container">
                        <DrawingMap map={map} />
                    </div>
                    :
                    <div className="container">
                        <div className="wait-menu">
                            <h1 className="wait-menu__title">Ожидание игроков</h1>
                            <div className="players-list">
                                {
                                    Object.keys(playersList).map((playerId, index) =>
                                        <WaitingPlayer
                                            key={index}
                                            logoColor={playersList[playerId].color}
                                            isReady={playersList[playerId].isReady} />
                                    )
                                }
                            </div>
                            <div className="wait-menu__footer">
                                <button
                                    className={`wait-menu__footer-button
                                                wait-menu__footer-button--${localIsReady ? 'ready' : 'not-ready'}`}
                                    onClick={changeMyReadyStatus}
                                >
                                </button>
                            </div>
                        </div >
                    </div>
            }
        </>
    );
}

export default Multiplayer;