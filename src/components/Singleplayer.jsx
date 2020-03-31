import React, { Component } from 'react';
import GameMenu from "./GameMenu";
import { Link } from "react-router-dom";

import Map from './Map';

import '../css/singleplayer.css'

const MAP_SIZE = 32;
const QUANTITY_OF_STABLE_WALLS = 50;
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

        this.makeNewMap(true);
        this.state = {
            currentSnake: [],
            currentApple: { x: -1, y: -1 },
            currentDirrection: Direction.Left,
            menuOpened: false,
            gameOver: false
        };
    }

    makeNewMap = (isFirst, snake) => {

        MAP = [];

        for (let i = 0; i < MAP_SIZE; i++) {
            MAP.push([...new Array(MAP_SIZE).fill(0)]);
        }

        if (!isFirst) {
            let zeroZone = {
                forX: { from: snake[0].x - 3, to: snake[0].x + 3 },
                forY: { from: snake[0].y - 4, to: snake[snake.length - 1].x + 1 }
            }

            snake.forEach((cell) => {
                MAP[cell.x][cell.y] = 1;
            });

            for (let i = 1; i <= QUANTITY_OF_STABLE_WALLS; i++) {
                let coords = {
                    x: Math.floor(Math.random() * MAP_SIZE),
                    y: Math.floor(Math.random() * MAP_SIZE)
                }

                if (this.isInTheField(coords) && !this.isInTheZeroZone(coords, zeroZone)) {
                    MAP[coords.x][coords.y] = -1;

                    this.spawnIslandsAround(coords, zeroZone);
                }
            }
        }
    }

    spawnIslandsAround = ({ x, y }, zeroZone) => {

        let pointsAround = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 }
        ];
        for (let i = 0; i < 3; i++) {
            let isSpawn = Math.floor(Math.random() * 2) === 1 ? true : false;

            if (isSpawn) {
                let newPoint = {
                    x: x + pointsAround[i].x,
                    y: y + pointsAround[i].y
                };

                if (!this.isInTheZeroZone(newPoint, zeroZone) && this.isInTheField(newPoint)) {
                    MAP[newPoint.x][newPoint.y] = -1;
                }
            }
        }
    }

    checkCell = (x, y) => {
        let result_class = "map__";

        switch (MAP[x][y]) {
            case -1:
                result_class += "wall";
                break;
            case 1:
                result_class += "snake";
                break;
            case 2:
                result_class += "apple";
                break;
            default:
                result_class = "";
                break;
        }

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

    isInTheZeroZone = ({ x, y }, zeroZone) => {
        if (x < zeroZone.forX.from || x > zeroZone.forX.to
            || y < zeroZone.forY.from || y > zeroZone.forY.to) {
            return false;
        }
        return true;
    }

    isInTheField = ({ x, y }) => {
        if (x < 0 || x > MAP_SIZE - 1
            || y < 0 || y > MAP_SIZE - 1) {
            return false;
        }
        return true;
    }

    spawnApple = () => {
        let newApple = {
            x: Math.floor(Math.random() * MAP_SIZE),
            y: Math.floor(Math.random() * MAP_SIZE)
        }

        if (MAP[newApple.x][newApple.y] === 0) {
            MAP[newApple.x][newApple.y] = 2;

            this.setState({
                currentApple: newApple // ВОЗМОЖНО ЭТО СКОРО БУДЕТ НЕ НУЖНО
            });
        } else {
            this.spawnApple();
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

        let lastCellOfSnake = currentSnake[currentSnake.length - 1]

        MAP[lastCellOfSnake.x][lastCellOfSnake.y] = 0;
        MAP[newHead.x][newHead.y] = 1;

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
        let centerOfMap = Math.floor(MAP_SIZE / 2);

        let newSnake = [
            { x: centerOfMap, y: centerOfMap - 3 },
            { x: centerOfMap, y: centerOfMap - 2 },
            { x: centerOfMap, y: centerOfMap - 1 },
            { x: centerOfMap, y: centerOfMap },
        ];

        this.setState({
            currentSnake: newSnake,
            currentDirrection: Direction.Left,
            menuOpened: false,
            gameOver: false
        });

        this.makeNewMap(false, newSnake);

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
                <Map MAP={MAP} checkCell={this.checkCell} />
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