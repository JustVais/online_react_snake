import React, { Component } from 'react';

import '../css/singleplay.css'

const MAP_SIZE = 16;
const MAP = [];

class Singleplay extends Component {

    constructor() {
        super();

        this.makeNewMap();

        this.state = {
            currentSnake: [
                { x: 8, y: 8 },
                { x: 8, y: 7 },
                { x: 8, y: 6 }
            ]
        };
    }

    makeNewMap = () => {
        for (let i = 0; i < MAP_SIZE; i++) {
            MAP.push([...new Array(MAP_SIZE)]);
        }
    }

    checkCell = (x, y, cell) => {

        let result_class = "";

        this.state.currentSnake.forEach(piece_of_snake => {
            if (piece_of_snake.x === x && piece_of_snake.y === y) {
                result_class = "map__snake";
                return result_class;
            }
        });

        return result_class;
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