import React from 'react';

import '../css/map.css'

function Map(props) {
    return (
        <div className="map">
            {
                props.MAP.map((row, y) =>
                    <div key={y} className="map__row">
                        {
                            row.map((cell, x) =>
                                <div key={x} className={`map__cell ${props.checkCell(x, y)}`}></div>
                            )
                        }
                    </div>
                )
            }
        </div>
    );
}

export default Map;