import React, { Component } from 'react';
import io from 'socket.io-client';

import '../css/multiplayer.css'

import WaitingPlayer from './WaitingPlayer';

const socket = io.connect("localhost:3001");

const Direction = {
    Top: { x: 0, y: -1 },
    Bottom: { x: 0, y: 1 },
    Left: { x: -1, y: 0 },
    Right: { x: 1, y: 0 }
};

class Multiplayer extends Component {

    constructor() {
        super();
        this.state = {
            players: [],
            localIsReady: true,
            gameStarted: false
        };
    }

    componentDidMount() {
        socket.on('onAddPlayerToRoom', (player) => {
            this.setState({
                players: [...this.state.players, player]
            });
        });

        socket.on('onGetAllUsers', (players) => {
            this.setState({
                players: players
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

            this.setState({
                gameStarted: true,
                players: data.players
            });
        });

        socket.on('stepOfGame', (data) => {
            
        });
    }

    changeMyStatus = () => {
        this.setState({
            localIsReady: !this.state.localIsReady
        });
        socket.emit('changeMyReadyStatus');
    }

    listenDirectionChanging = (event) => {
        if (event.code === 'KeyW') {
            socket.emit('changeDirection', {direction: "Top"});
        } else if (event.code === 'KeyS') {
            socket.emit('changeDirection', {direction: "Bottom"});
        } else if (event.code === 'KeyA') {
            socket.emit('changeDirection', {direction: "Left"});
        } else if (event.code === 'KeyD') {
            socket.emit('changeDirection', {direction: "Right"});
        }
    }

    render() {
        return (
            <div className='container'>
                {!this.state.gameStarted ? (
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
                    </div>
                ) : (
                        <div></div>
                    )
                }
            </div>
        );
    }
}

export default Multiplayer;