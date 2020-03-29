import React, { Component } from 'react';
import GameMenu from "./GameMenu";
import { Link } from "react-router-dom";

import Map from './Map';

import '../css/singleplayer.css'

const MAP_SIZE = 8;
let MAP;

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
                { x: 8, y: 5 },
                { x: 8, y: 6 },
                { x: 8, y: 7 },
                { x: 8, y: 8 },
            ],
            currentApple: { x: -1, y: -1 },
            currentDirrection: Direction.Left,
            menuOpened: false,
            gameOver: false
        };
    }

    makeNewMap = () => {
        MAP = [];
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
            this.spawnApple();
            return true;
        }
        return false;
    }

    isInTheField = (head) => {
        if (head.x < 0 || head.x > MAP_SIZE - 1
            || head.y < 0 || head.y > MAP_SIZE - 1) {
            return false;
        }
        return true;
    }

    spawnApple = () => {
        let { currentSnake } = this.state;

        let newApple = { x: 0, y: 0 }

        newApple.x = Math.floor(Math.random() * MAP_SIZE);
        newApple.y = Math.floor(Math.random() * MAP_SIZE);

        let flag = true;

        for (let i = 0; i < currentSnake.length; i++) {
            if (newApple.x === currentSnake[i].x && newApple.y === currentSnake[i].y) {
                this.spawnApple();
                flag = false;
                break;
            }
        }

        if (flag === true) {
            this.setState({
                currentApple: newApple
            });
        }
    }

    dataСleaning = () => {
        clearInterval(this.interval);
        window.removeEventListener('keydown', this.listenDirectionChanging);
        window.removeEventListener('keydown', this.listenMenuOpening);
    }

    gameOver = () => {
        this.dataСleaning();
        this.setState({
            menuOpened: true, // gameMenu on
            gameOver: true // gameOver Buttons on
        });
        console.log('Game Over!');
    }

    headOnTail = (head, tail) => {
        for (let i = 0; i < tail.length; i++) {
            if (head.x === tail[i].x && head.y === tail[i].y) return true;
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

    listenDirectionChanging = (event) => {
        let newDirection = this.state.currentDirrection;

        if (event.code === 'KeyW') {
            newDirection = Direction.Top;
        } else if (event.code === 'KeyS') {
            newDirection = Direction.Bottom;
        } else if (event.code === 'KeyA') {
            newDirection = Direction.Left;
        } else if (event.code === 'KeyD') {
            newDirection = Direction.Right;
        }

        this.setState({
            currentDirrection: newDirection
        });
    }

    listenMenuOpening = (event) => {
        if (event.code === 'Escape') {
            this.setState({
                menuOpened: !this.state.menuOpened
            });
        }
    }

    startGame = () => {
        this.makeNewMap();

        let centerOfMap = Math.floor(MAP_SIZE / 2);

        this.setState({
            currentSnake: [
                { x: centerOfMap, y: centerOfMap - 3 },
                { x: centerOfMap, y: centerOfMap - 2 },
                { x: centerOfMap, y: centerOfMap - 1 },
                { x: centerOfMap, y: centerOfMap },
            ],
            currentDirrection: Direction.Left,
            menuOpened: false,
            gameOver: false
        });

        this.spawnApple();

        this.interval = setInterval(() => {
            this.moveSnake();
        }, 250);

        window.addEventListener('keydown', this.listenDirectionChanging);
        window.addEventListener('keydown', this.listenMenuOpening);
    }

    componentDidMount() {
        this.startGame();
    }

    componentWillUnmount() {
        this.gameOver();
    }

    render() {
        return (
            <div className="container">
                <Map MAP={MAP} checkCell={this.checkCell}/>
                {this.state.menuOpened &&
                    <GameMenu>
                        {this.state.gameOver ? (
                            <>
                                <h1 className="game-menu__title">Game Over</h1>
                                <button onClick={this.startGame} className="game-menu__button">Играть ещё</button>
                                <Link to="/" className="game-menu__button">Выйти в меню</Link>
                            </>
                        ) : (
                                <>
                                    <button className="game-menu__button">Продолжить</button>
                                    <button className="game-menu__button">Выйти</button>
                                </>
                            )}
                    </GameMenu>
                }
            </div>
        );
    }
}

export default Singleplay;