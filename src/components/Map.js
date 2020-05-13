import MapCell from './MapCell';

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

export default Map;