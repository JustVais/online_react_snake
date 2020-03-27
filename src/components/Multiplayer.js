import React, { Component } from 'react';
import io from 'socket.io-client';

import '../css/multiplayer.css'

const socket = io.connect("localhost:3001");

class Multiplayer extends Component {

    constructor() {
        super();
        this.state = {
            players: [],
            areYouReady: true
        };
    }
    
    componentDidMount() { 
    }
    
    changeMyStatus = () => {
        socket.emit('changeMyStatus');
    }

    render() {
        
        // this.setState({
        //     socket: socketIOClient(this.state.endpoint)
        // });
        
        return (
            <div className='container'>
                <div className="waiting">
                    <div className="waiting__wrapper-title">
                        <h1 className="waiting__title">Ожидание игроков</h1>
                    </div>
                    <div className="players-list">
                        <div className="players-list__player">
                            <div className="players-list__logo"></div>
                            <span className="players-list__username">Player 1</span>
                            <span
                                className={`players-list__player-status 
                                            players-list__player-status--${this.state.areYouReady ? 'ready' : 'not-ready'}`}
                            ></span>
                        </div>
                    </div>
                    <div className="waiting__ready">
                        {
                            <button 
                                className={`waiting__ready-button 
                                            waiting__ready-button--${this.state.areYouReady ? 'ready' : 'not-ready'}`}
                                onClick={this.changeMyStatus}
                            >                    
                            </button>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Multiplayer;