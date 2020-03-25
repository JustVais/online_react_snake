import React, { Component } from 'react';

import '../css/singleplay.css'

const MAP_SIZE = 16;
const MAP = [];

const Direction = {
    Top: { x: 0, y: -1 },
    Bottom: { x: 0, y: 1 },
    Left: { x: -1, y: 0 },
    Right: { x: 1, y: 0 }
};

class Singleplay extends Component {

    constructor() {
        super();

        this.makeNewMap();

        this.state = {
            currentSnake: [
                { x: 8, y: 6 },
                { x: 8, y: 7 },
                { x: 8, y: 8 },
            ],

            currentApple: this.spawnApple(),

            currentDirrection: Direction.Left
        };
    }

    makeNewMap = () => {
        for (let i = 0; i < MAP_SIZE; i++) {
            MAP.push([...new Array(MAP_SIZE)]);
        }
    }


    checkCell = (x, y) => {

        let { currentSnake, currentApple } = this.state;

        let result_class = "";

        currentSnake.forEach(piece_of_snake => {

            if (piece_of_snake.x === x && piece_of_snake.y === y) {

                result_class = "map__snake";

            } else if (currentApple.x === x && currentApple.y === y) {

                result_class = "map__apple";

            }

        });

        return result_class;
    }

    eatApple = (head) => {

        let { currentApple } = this.state;

        if (head.x === currentApple.x && head.y === currentApple.y) {
            this.setState({
                currentApple: this.spawnApple()
            });
            return true;
        }
        return false;
    }

    isInTheField = (head) => {
        if (head.x < 0 || head.x > 15
            || head.y < 0 || head.y > 15) {
            return false;
        }
        return true;
    }

    spawnApple = () => {
        let newApple = { x: 0, y: 0 }

        newApple.x = Math.floor(Math.random() * MAP_SIZE);
        newApple.y = Math.floor(Math.random() * MAP_SIZE);

        return newApple;
    }

    gameOver = () => {
        clearInterval(this.interval);
        window.removeEventListener('keydown', () => { });
        alert('Game Over!');
    }

    headOnTail = (head, tail) => {
        for (let i = 0; i < tail.length; i++) {
            debugger;
            if (head.x == tail[i].x && head.y == tail[i].y) {
                return true;
            }
        }
        return false;
    }

    moveSnake = () => {
        let { currentSnake, currentDirrection } = this.state;

        let [head] = currentSnake;
        let tail = [];

        let newHead = {
            x: head.x + currentDirrection.x,
            y: head.y + currentDirrection.y,
        };
        
        tail = this.eatApple(newHead) ? currentSnake.slice(0) : currentSnake.slice(0, -1);
        
        if (!this.isInTheField(newHead) || this.headOnTail(newHead, tail)) {
            this.gameOver();
            return;
        }

        this.setState({
            currentSnake: [newHead, ...tail]
        });
    }


    componentDidMount() {
        this.interval = setInterval(() => {
            this.moveSnake();
        }, 250);

        window.addEventListener('keydown', (event) => {
            if (event.code == 'KeyW') {
                this.state.currentDirrection = Direction.Top;
            } else if (event.code == 'KeyS') {
                this.state.currentDirrection = Direction.Bottom;
            } else if (event.code == 'KeyA') {
                this.state.currentDirrection = Direction.Left;
            } else if (event.code == 'KeyD') {
                this.state.currentDirrection = Direction.Right;
            }
        });
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        window.removeEventListener('keydown', () => { });
    }

    render() {
        return (
            <div className="map">
                {
                    MAP.map((row, y) =>
                        <div key={y} className="map__row">
                            {
                                row.map((cell, x) =>
                                    <div key={x} className={`map__cell ${this.checkCell(x, y, cell)}`}></div>
                                )
                            }
                        </div>
                    )
                }
            </div>
        );
    }
}

export default Singleplay;