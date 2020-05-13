import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import '../css/multiplayer.css';
import DrawingMap from '../components/DrawingMap';

import WaitingPlayer from '../components/WaitingPlayer';
import { Link } from 'react-router-dom';
import GameOverPlayer from "../components/GameOverPlayer";

import Map from '../components/Map.js';

const Direction = {
    top: { x: 0, y: -1 },
    bottom: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

const MAP_SIZE = 32;
let socket;

const Multiplayer = () => {
    const [map] = useState(new Map(MAP_SIZE));
    const [gameStarted, setGameStarted] = useState(false);
    const [playersList, setPlayersList] = useState({});
    const [localIsReady, setLocalIsReady] = useState(false);

    const keyboardListener = (event) => {
        switch (event.code) {
            case 'KeyW':
                socket.emit('change snake direction', { Direction: "top" });
                break;
            case 'KeyS':
                socket.emit('change snake direction', { Direction: "bottom" });
                break;
            case 'KeyA':
                socket.emit('change snake direction', { Direction: "left" });
                break;
            case 'KeyD':
                socket.emit('change snake direction', { Direction: "right" });
                break;
            default: break;
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", keyboardListener);

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

        socket.on('game start', (data) => {
            Object.keys(data.playersList).forEach(playerId => {
                let player = data.playersList[playerId];
                map.insertSnakeToMap(player.snake, player.color);
            });

            setPlayersList(data.playersList);
            setGameStarted(true);
        });

        socket.on('move snakes', (data) => {
            applyDirectionsChanges(data.changedDirections);
            moveSnakes();
        });
    }, []);

    const moveSnakes = () => {
        setPlayersList(plList => {
            Object.keys(plList).forEach(playerId => {
                let player = plList[playerId];
                let snake = player.snake;

                let [head] = snake;

                let newHead = {
                    x: head.x + Direction[player.direction].x,
                    y: head.y + Direction[player.direction].y
                }

                let savedSnake = snake.slice(0);

                let tail = [];

                tail = snake.slice(0, -1);

                plList[playerId].snake = [newHead, ...tail];

                map.updateSnakeOnMap(newHead, savedSnake);
            });

            return { ...plList };
        });
    }

    const applyDirectionsChanges = (changes) => {
        setPlayersList(plList => {
            Object.keys(changes).forEach(playerId => {
                plList[playerId].direction = changes[playerId];
            });

            return { ...plList }
        });
    }

    const changeMyReadyStatus = () => {
        setLocalIsReady(status => {
            status = !status;
            socket.emit('change my ready status', { status: status });
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