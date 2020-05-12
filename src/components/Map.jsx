import React, { useState, useEffect } from 'react';

import '../css/map.css'

import useInterval from "./useInterval";

const Direction = {
    Top: { x: 0, y: -1, str: "top" },
    Bottom: { x: 0, y: 1, str: "bottom" },
    Left: { x: -1, y: 0, str: "left" },
    Right: { x: 1, y: 0, str: "right" }
};

class MapCell {
    constructor() {
        this.type = 0;
        this.snakeDirection = "";
    }
}

class Map {
    constructor(MAP_SIZE) {
        this.mapSize = MAP_SIZE;
        this.mapArray = this.getNewMap(MAP_SIZE);
    }

    getNewMap = (MAP_SIZE) => {
        let newMap = [];

        for (let y = 0; y < MAP_SIZE; y++) {
            let newRow = [];

            for (let x = 0; x < MAP_SIZE; x++) newRow.push(new MapCell());

            newMap.push(newRow);
        }
        return newMap;
    }

    insertSnakeToMap = (snake) => {
        snake.forEach((snakeCell) => {
            this.mapArray[snakeCell.x][snakeCell.y].type = 1;
        });
    }
    
    insertAppleToMap = (apple) => {
        this.setCellType(apple.x, apple.y, 2);
    }

    getCellType = (x, y) => this.mapArray[x][y].type;

    setCellType = (x, y, type) => this.mapArray[x][y].type = type;

    updateSnakeOnMap = (newHead, savedSnake) => {
        let lastCell = savedSnake.slice(-1)[0];

        this.setCellType(newHead.x, newHead.y, 1);
        this.setCellType(lastCell.x, lastCell.y, 0);
    }

    get MapArray() {
        return this.mapArray;
    }

    get Size() {
        return this.mapSize;
    }
}

class Snake {
    constructor(map, size) {
        this.map = map;
        this.size = size;
        this.mapSize = map.Size;
        this.snakeArray = this.createNewSnake(size);
    }

    createNewSnake = (size) => {
        let centerOfMap = Math.floor(this.mapSize / 2);
        let newSnake = [];

        for (let i = 0; i < size; i++)
            newSnake.push({ x: centerOfMap, y: centerOfMap + i });

        return newSnake;
    }

    get SnakeArray () {
        return this.snakeArray;
    }

    set SnakeArray (value) {
        this.snakeArray = value;
    }
}

class Apple {
    constructor(map) {
        this.map = map;
        this.mapSize = map.Size;
        this.apple = {};
        this.createNewApple();
    }

    createNewApple = () => {
        let newApple = {
            x: Math.floor(Math.random() * this.mapSize),
            y: Math.floor(Math.random() * this.mapSize)
        };

        this.apple = newApple;
    }

    get CurrentApple () {
        return this.apple;
    }
}

const checkCell = (map, x, y) => {
    let classesArray = [];

    switch (map.getCellType(x, y)) {
        case 1:
            classesArray.push("map__snake");
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

const isInTheField = ({ x, y }, MAP_SIZE) => {
    if (x < 0 || x > MAP_SIZE - 1 || y < 0 || y > MAP_SIZE - 1) {
        return false;
    }
    return true;
}

const isHeadCellAvailable = (head, map) => {
    if (map.MapArray[head.x][head.y].type === 1 ) {
        return false;
    }
    return true;
}

const checkForCollision = (head, map, MAP_SIZE) => {
    if (!isInTheField(head, MAP_SIZE) || !isHeadCellAvailable(head, map)) {
        return true;
    }
    return false;
}

const eatAnApple = (head, apple) => {
    if (head.x === apple.CurrentApple.x && head.y === apple.CurrentApple.y) {
        return true;
    }
    return false;
}

const MapComponent = ({ setIsGameOver, MAP_SIZE }) => {
    const [map] = useState(new Map(MAP_SIZE));
    const [snake] = useState(new Snake(map, 4));
    const [apple] = useState(new Apple(map));
    const [ignored, forceUpdate] = useState(0);
    const [currentDirrection, setCurrentDirrection] = useState(Direction.Left);
    
    const keyboardListener = (event) => {
        switch (event.code) {
            case 'KeyW':
                setCurrentDirrection(Direction.Top);
                break;
            case 'KeyS':
                setCurrentDirrection(Direction.Bottom);
                break;
            case 'KeyA':
                setCurrentDirrection(Direction.Left);
                break;
            case 'KeyD':
                setCurrentDirrection(Direction.Right);
                break;
            default: break;
        }
    }

    const gameOver = () => {
        setIsGameOver(true);
    }

    useEffect(() => {
        map.insertSnakeToMap(snake.SnakeArray);
        map.insertAppleToMap(apple.CurrentApple);

        window.addEventListener("keydown", keyboardListener);
        forceUpdate(x => x+1);

        return(() => {
            window.removeEventListener("keydown", keyboardListener);
        });
    }, []);

    useInterval(() => {
        let [head] = snake.SnakeArray;

        let newHead = {
            x: head.x + currentDirrection.x,
            y: head.y + currentDirrection.y
        }
        
        let savedSnake = snake.SnakeArray.slice(0);

        let tail = [];

        if (checkForCollision(newHead, map, MAP_SIZE)) {
            gameOver();
            return;
        }

        if (eatAnApple(newHead, apple)) {
            tail = snake.SnakeArray.slice(0);
            apple.createNewApple();
            map.insertAppleToMap(apple.CurrentApple);
        } else {
            tail = snake.SnakeArray.slice(0, -1);
        }

        snake.SnakeArray = [newHead, ...tail];

        map.updateSnakeOnMap(newHead, savedSnake);
        forceUpdate(x => x + 1);

    }, 250);

    return (
        <div className="map">
            {
                map.MapArray.map((row, y) =>
                    <div key={y} className="map__row">
                        {
                            row.map((cell, x) =>
                                <div key={x} className={`map__cell ${checkCell(map, x, y)}`}></div>
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}

export default MapComponent;