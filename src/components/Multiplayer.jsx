import React, { Component } from 'react';
import io from 'socket.io-client';

import '../css/multiplayer.css'

import WaitingPlayer from './WaitingPlayer';

const socket = io.connect("localhost:3001");

class Multiplayer extends Component {

    constructor() {
        super();
        this.state = {
            players: [],
            localIsReady: true
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

        socket.on('disconnect', function () {
            console.log('server disconnected');
        });
    }

    changeMyStatus = () => {
        this.setState({
            localIsReady: !this.state.localIsReady
        });
        socket.emit('changeMyReadyStatus');
    }

    render() {
        return (
            <div className='container'>
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
            </div>
        );
    }
}

export default Multiplayer;