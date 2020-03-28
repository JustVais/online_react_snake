import React, { Component } from 'react';

class WaitingPlayer extends Component {
    render() {
        return (
            <div className="players-list__player">
                <div className={`players-list__logo players-list__logo--${this.props.logoColor}`}></div>
                <span className="players-list__username">Player</span>
                <span
                    className={`players-list__player-status 
                                players-list__player-status--${this.props.isReady ? 'ready' : 'not-ready'}`}
                ></span>
            </div>
        );
    }
}

export default WaitingPlayer;