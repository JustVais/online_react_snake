import React, { Component } from 'react';
import io from 'socket.io-client';
import '../css/multiplayer.css';
import Map from './Map';

import WaitingPlayer from './WaitingPlayer';
import { Link } from 'react-router-dom';
import GameOverPlayer from "./GameOverPlayer";

let socket;
let MAP;
let MAP_SIZE = 32;

class Multiplayer extends Component {

    constructor() {
        super();
        this.state = {
            players: [],
            losedPlayers: [],
            localIsReady: true,
            gameStarted: false,
            currentApple: {},
            gameIsOver: false,
        };
        socket = io.connect("localhost:3001");
    }

    componentDidMount() {
        socket.emit('addToRoom');

        socket.on('onAddPlayerToRoom', (player) => {
            this.setState({
                players: [...this.state.players, player]
            });
        });

        socket.on('onGetAllUsers', (data) => {
            this.setState({
                players: data.players
            });
        });

        socket.on('onChangeReadyStatus', (data) => {
            let { players } = this.state;

            this.setState({
                players: players.map((player) => {
                    if (player.socketId === data.socketId) player.isReady = data.isReady;
                    return player;
                })
            });
        });

        socket.on('onDisconnectSomeUser', (data) => {
            let { players } = this.state;

            this.setState({
                players: players.filter(player => player.socketId !== data.socketId)
            });
        });

        socket.on('disconnect', () => {
            console.log('server disconnected');
        });

        socket.on('startGame', (data) => {
            window.addEventListener('keydown', this.listenDirectionChanging);
            this.makeNewMap();
            this.setState({
                gameStarted: true,
                players: data.players,
                currentApple: data.currentApple
            });
        });

        socket.on('stepOfGame', (data) => {
            this.setState({
                players: data.players,
                currentApple: data.currentApple
            });
        });

        socket.on('onEndGame', (data) => {
            this.setState({
                players: [],
                localIsReady: true,
                gameStarted: false,
                currentApple: {},
                gameIsOver: true,
                losedPlayers: data.losedPlayers
            });

            this.endGame();
        });
    }

    endGame = () => {
        socket.close();
        window.removeEventListener('keydown', this.listenDirectionChanging);
    }

    changeMyStatus = () => {
        this.setState({
            localIsReady: !this.state.localIsReady
        });
        socket.emit('changeMyReadyStatus');
    }

    listenDirectionChanging = (event) => {
        if (event.code === 'KeyW') {
            socket.emit('changeDirection', { direction: "Top" });
        } else if (event.code === 'KeyS') {
            socket.emit('changeDirection', { direction: "Bottom" });
        } else if (event.code === 'KeyA') {
            socket.emit('changeDirection', { direction: "Left" });
        } else if (event.code === 'KeyD') {
            socket.emit('changeDirection', { direction: "Right" });
        }
    }

    makeNewMap = () => {
        MAP = [];
        for (let i = 0; i < MAP_SIZE; i++) {
            MAP.push([...new Array(MAP_SIZE)]);
        }
    }

    checkCell = (x, y) => {
        let { players, currentApple } = this.state;
        let result_class = "";

        players.forEach(player => {
            player.currentSnake.forEach(snakeCell => {
                if (snakeCell.x === x && snakeCell.y === y) {
                    result_class = 'map__snake--' + player.logoColor;
                } else if (currentApple.x === x && currentApple.y === y) {
                    result_class = 'map__apple';
                }
            });
        });

        return result_class;
    }

    componentWillUnmount() {
        this.setState({
            gameIsOver: false
        });
    }

    render() {
        return (
            <div className='container'>
                {!this.state.gameStarted ? (
                    this.state.gameIsOver ? (
                        <div className="game-over-menu">
                            <h1 className="game-over-menu__title">Статистика</h1>
                            <div className="game-over-menu__list">
                                {
                                    this.state.losedPlayers.map(player =>
                                        <GameOverPlayer key={player.logoColor} logoColor={player.logoColor} count={player.count} />
                                    )
                                }
                            </div>
                            <div className="game-over-menu__footer">
                                <Link to="/" className="game-over-menu__footer-button">
                                    Выйти в меню
                                </Link>
                            </div>
                        </div>
                    ) : (
                            <div className="wait-menu">
                                <h1 className="wait-menu__title">Ожидание игроков</h1>
                                <div className="players-list">
                                    {
                                        this.state.players.map(player =>
                                            <WaitingPlayer key={player.logoColor} logoColor={player.logoColor} isReady={player.isReady} />
                                        )
                                    }
                                </div>
                                <div className="wait-menu__footer">
                                    <button
                                        className={`wait-menu__footer-button
                                                wait-menu__footer-button--${this.state.localIsReady ? 'ready' : 'not-ready'}`}
                                        onClick={this.changeMyStatus}
                                    >
                                    </button>
                                </div>
                            </div >
                        )
                ) : (
                        <Map MAP={MAP} checkCell={this.checkCell} />
                    )
                }
            </div>
        );
    }
}

export default Multiplayer;