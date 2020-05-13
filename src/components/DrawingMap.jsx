import React from 'react';

const DrawingMap = ({ map }) => {
    const checkCell = (x, y) => {
        let classesArray = [];

        switch (map.getCellType(x, y)) {
            case 1:
                classesArray.push("map__snake");
                classesArray.push(`map__snake--${map.cellColor(x, y)}`);
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

    return (
        <div className="map">
            {
                map.MapArray.map((row, y) =>
                    <div key={y} className="map__row">
                        {
                            row.map((cell, x) =>
                                <div key={x} className={`map__cell ${checkCell(x, y)}`}></div>
                            )
                        }
                    </div>
                )
            }
        </div>
    );
};

export default DrawingMap;