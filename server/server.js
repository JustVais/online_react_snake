var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3001);
console.log('Server works on port 3001');

const colors = [
    { occupied: false, color: 'red' },
    { occupied: false, color: 'green' },
    { occupied: false, color: 'blue' },
    { occupied: false, color: 'pink' },
    { occupied: false, color: 'black' },
    { occupied: false, color: 'white' },
    { occupied: false, color: 'gray' },
    { occupied: false, color: 'brown' }
];

class Player {
    constructor(socketId, color, isReady) {
        this.socketId = socketId;
        this.color = color;
        this.isReady = isReady;
    }
}

const roomsList = {};

generateRoomId = (len) => {
    let chrs = 'abdehkmnpswxzABDEFGHKMNPQRSTWXZ123456789';
    let result = '';

    for (let i = 0; i < len; i++) {
        const index = Math.floor(Math.random() * chrs.length);
        result += chrs[index];
    }

    return result;
}

getNotOccupiedColor = (roomId) => {
    for (let i = 0; i < roomsList[roomId].colors.length; i++) {
        if (!roomsList[roomId].colors[i].occupied) {
            roomsList[roomId].colors[i].occupied = true;
            return roomsList[roomId].colors[i].color;
        }
    }
}

createRoom = () => {
    const newRoomId = generateRoomId(6);

    roomsList[newRoomId] = {
        colors: colors, // НУЖНО СКОПИРОВАТЬ ОБЪЕКТ
        players: []
    };
    
    return newRoomId;
}

addPlayerToRoom = (socket, roomId) => {
    const newPlayer = new Player(socket.id, getNotOccupiedColor(roomId), false);
    roomsList[roomId].players.push(newPlayer);
    socket.join(roomId);
}
 
addingPlayerToRoomsList = (socket) => {
    for (let roomId in roomsList) {
        if (roomsList[roomId].players.length < 2) {
            addPlayerToRoom(socket, roomId);
            return;
        }
    }
    
    let roomId = createRoom();
    addPlayerToRoom(socket, roomId);
}

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected!`);

    addingPlayerToRoomsList(socket);

    socket.on('changeMyStatus', () => {
        const currentRoom = Object.keys(socket.rooms)[1];
    });
});
