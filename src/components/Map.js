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

    insertSnakeToMap = (snake, color) => {
        snake.forEach((snakeCell) => {
            this.setCellType(snakeCell.x, snakeCell.y, 1);

            if (color) this.setCellColor(snakeCell.x, snakeCell.y, color);
        });
    }
    
    insertAppleToMap = (apple) => {
        this.setCellType(apple.x, apple.y, 2);
    }

    getCellType = (x, y) => this.mapArray[x][y].type;

    setCellType = (x, y, type) => this.mapArray[x][y].type = type;

    setCellColor = (x, y, color) => this.mapArray[x][y].color = color;

    getCellColor = (x, y) => this.mapArray[x][y].color;

    updateSnakeOnMap = (newHead, savedSnake) => {
        let lastCell = savedSnake.slice(-1)[0];

        this.setCellType(newHead.x, newHead.y, 1);
        this.setCellType(lastCell.x, lastCell.y, 0);
        this.setCellColor(newHead.x, newHead.y, this.getCellColor(lastCell.x, lastCell.y));
        this.setCellColor(lastCell.x, lastCell.y, "");
    }

    cellColor = (x, y) => {
        if (this.mapArray[x][y].color === "") {
            return "green";
        }

        return this.mapArray[x][y].color;
    }

    get MapArray() {
        return this.mapArray;
    }

    get Size() {
        return this.mapSize;
    }
}

export default Map;