import React, { Component } from 'react';
import GameMenu from "./GameMenu";
import { Link } from "react-router-dom";

import Map from './Map';

import '../css/singleplayer.css'

const MAP_SIZE = 32;
const QUANTITY_OF_STABLE_WALLS = 50;

const Direction = {
    Top: { x: 0, y: -1, str: "top" },
    Bottom: { x: 0, y: 1, str: "bottom" },
    Left: { x: -1, y: 0, str: "left" },
    Right: { x: 1, y: 0, str: "right" }
};

const DirectionOfSnakeCell = {
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    left_bottom: "left-bottom",
    left_top: "left-top",
    right_bottom: "right-bottom",
    right_top: "right-top",
    bottom_left: "bottom-left",
    bottom_right: "bottom-right",
    top_left: "top-left",
    top_right: "top-right"
};

class MapLogic {
    constructor() {
        this.stack = [];
        this.fillingMap();
    }

    fillingMap = () => {
        for (let y = 0; y < MAP_SIZE; y++) {
            let newRow = [];

            for (let x = 0; x < MAP_SIZE; x++) newRow.push(new MapCell());

            this.stack.push(newRow);
        }
    }

    SetTypeToCell = (x, y, type) => this.stack[x][y].type = type;

    GetCellType = (x, y) => this.stack[x][y].type;

    SetSnakeDirection = (x, y, snakeDirection) => this.stack[x][y].snakeDirection = snakeDirection;

    GetSnakeDirection = (x, y) => this.stack[x][y].snakeDirection;

    SetDirectionOfCell = (x, y, directionOfCell) => this.stack[x][y].directionOfCell = directionOfCell;

    GetDirectionOfCell = (x, y) => this.stack[x][y].directionOfCell;

    SetSnakeHeadAndTipToMap = (head, newHead, currentSnake) => {
        let lastCellOfSnake = currentSnake[currentSnake.length - 1];

        this.stack[newHead.x][newHead.y].directionOfCell = newHead.directionOfCell;
        this.stack[head.x][head.y].directionOfCell = head.directionOfCell;
        this.stack[lastCellOfSnake.x][lastCellOfSnake.y].type = 0;
        this.stack[newHead.x][newHead.y].type = 1;
    }

    GetAllCells = () => this.stack;
}

class MapCell {
    constructor() {
        this.type = 0;
        this.snakeDirection = "";
        this.directionOfCell = "";
    }
}

let MAP;

class Singleplay extends Component {

    constructor() {
        super();

        this.state = {
            currentSnake: [],
            currentApple: { x: -1, y: -1 },
            currentDirrection: Direction.Left,
            menuOpened: false,
            gameOver: false,
            isLoading: true
        };
    }

    // fillingMap = () => {
    //     MAP = [];

    //     for (let y = 0; y < MAP_SIZE; y++) {
    //         let newRow = [];

    //         for (let x = 0; x < MAP_SIZE; x++) {
    //             newRow.push(new MapCell());
    //         }

    //         MAP.push(newRow);
    //     }
    // }

    addingSnakeToMap = (snake) => {
        snake.forEach(({ x, y }) => {
            MAP.SetTypeToCell(x, y, 1);
            MAP.SetDirectionOfCell(x, y, DirectionOfSnakeCell.top);
        });
    }

    getZeroZone = (snake) => {
        return {
            forX: { from: snake[0].x - 3, to: snake[0].x + 3 },
            forY: { from: snake[0].y - 4, to: snake[snake.length - 1].x + 1 }
        };
    }

    makingWalls = (zeroZone) => {
        for (let i = 1; i <= QUANTITY_OF_STABLE_WALLS; i++) {
            let coords = {
                x: Math.floor(Math.random() * MAP_SIZE),
                y: Math.floor(Math.random() * MAP_SIZE)
            }

            if (this.isInTheField(coords) && !this.isInTheZeroZone(coords, zeroZone)) {
                MAP.SetTypeToCell(coords.x, coords.y, -1);
                this.spawnIslandsAround(coords, zeroZone);
            }
        }
    }

    makeNewMap = (snake) => {
        MAP = new MapLogic();
        this.makingWalls(this.getZeroZone(snake));
        this.addingSnakeToMap(snake);
    }

    spawnIslandsAround = ({ x, y }, zeroZone) => {
        for (let direction in Direction) {
            let willItBeSpawned = Math.floor(Math.random() * 2) === 1 ? true : false;

            if (willItBeSpawned) {
                let islandPiece = {
                    x: x + direction.x,
                    y: y + direction.y
                };

                if (!this.isInTheZeroZone(islandPiece, zeroZone) && this.isInTheField(islandPiece)) {
                    MAP.SetTypeToCell(islandPiece.x, islandPiece.y, -1);
                }
            }
        }
    }

    checkCell = (x, y) => {
        let classesArray = [];

        switch (MAP.GetCellType(x, y)) {
            case -1:
                classesArray.push("map__wall");
                break;
            case 1:
                classesArray.push("map__snake");
                classesArray.push(`map__snake--${MAP.GetDirectionOfCell(x, y)}`);
                break;
            case 2:
                classesArray.push("map__apple");
                break;
            default:
                classesArray = [];
                break;
        }

        return classesArray.join(" ");
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

        if (MAP.GetCellType(newApple.x, newApple.y) === 0) {
            MAP.SetTypeToCell(newApple.x, newApple.y, 2);

            this.setState({
                currentApple: newApple
            });
        } else {
            this.spawnApple();
        }
    }

    dataСleaning = () => {
        clearInterval(this.interval);
        window.removeEventListener('keydown', this.listenDirectionChanging);
    }

    gameOver = () => {
        this.dataСleaning();
        this.setState({
            menuOpened: true,
            gameOver: true
        });
        console.log('Game Over!');
    }

    isHeadOnTail = (head) => MAP.GetCellType(head.x, head.y) === 1 ? true : false;

    isHeadOnWall = (head) => MAP.GetCellType(head.x, head.y) === -1 ? true : false;

    changeDirectionOfSnakeCell = (currentDirectOfCell, oldDirectOfCell) => (
        currentDirectOfCell === oldDirectOfCell ? oldDirectOfCell : `${currentDirectOfCell}-${oldDirectOfCell}`
    );

    shouldGameEnd = (head) => {
        if (!this.isInTheField(head) || this.isHeadOnTail(head) || this.isHeadOnWall(head)) {
            this.gameOver();
            return true;
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
            directionOfCell: currentDirrection.str
        };

        if (this.shouldGameEnd(newHead)) return;

        tail = this.eatApple(newHead) ? currentSnake.slice(0) : currentSnake.slice(0, -1);

        head.directionOfCell = this.changeDirectionOfSnakeCell(newHead.directionOfCell, head.directionOfCell);

        MAP.SetSnakeHeadAndTipToMap(head, newHead, currentSnake);

        this.setState({
            currentSnake: [newHead, ...tail]
        });
    }

    listenDirectionChanging = (event) => {
        switch (event.code) {
            case 'KeyW':
                this.setState({ currentDirrection: Direction.Top });
                break;
            case 'KeyS':
                this.setState({ currentDirrection: Direction.Bottom });
                break;
            case 'KeyA':
                this.setState({ currentDirrection: Direction.Left });
                break;
            case 'KeyD':
                this.setState({ currentDirrection: Direction.Right });
                break;
            default: break;
        }

    }

    startGame = () => {
        let centerOfMap = Math.floor(MAP_SIZE / 2);

        let newSnake = [
            { x: centerOfMap, y: centerOfMap - 3, directionOfCell: DirectionOfSnakeCell.top },
            { x: centerOfMap, y: centerOfMap - 2, directionOfCell: DirectionOfSnakeCell.top },
            { x: centerOfMap, y: centerOfMap - 1, directionOfCell: DirectionOfSnakeCell.top },
            { x: centerOfMap, y: centerOfMap, directionOfCell: DirectionOfSnakeCell.top },
        ];

        this.makeNewMap(newSnake);

        this.spawnApple();

        this.setState({
            currentSnake: newSnake,
            currentDirrection: Direction.Left,
            menuOpened: false,
            gameOver: false,
            isLoading: false
        });

        this.interval = setInterval(this.moveSnake, 250);


        window.addEventListener('keydown', this.listenDirectionChanging);
    }

    componentDidMount() {
        this.startGame();
    }

    componentWillUnmount() {
        this.gameOver();
    }

    render() {
        return (
            !this.state.isLoading &&
            <div className="container">
                <Map allCells={MAP.GetAllCells()} checkCell={this.checkCell} />
                {this.state.menuOpened &&
                    <GameMenu>
                        <h1 className="game-menu__title">Game Over</h1>
                        <button onClick={this.startGame} className="game-menu__button">Играть ещё</button>
                        <Link to="/" className="game-menu__button">Выйти в меню</Link>
                    </GameMenu>
                }
            </div>

        );
    }
}

export default Singleplay;