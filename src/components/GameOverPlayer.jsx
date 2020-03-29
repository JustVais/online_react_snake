import React from 'react';

function GameOverPlayer(props) {
    return (
        <div className="players-list__player">
            <div className={`players-list__logo players-list__logo--${props.logoColor}`}></div>
            <span className="players-list__username">Player</span>
            <span className="players-list__counter">{props.count}</span>
        </div>
    );
}

export default GameOverPlayer;