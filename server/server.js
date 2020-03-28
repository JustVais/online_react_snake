var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3001);
console.log('Server works on port 3001');

class Player {
    constructor(socketId, color, isReady) {
        this.socketId = socketId;
        this.logoColor = color;
        this.isReady = isReady;
    }

    getSocketId() {
        return this.socketId;
    }

    changeReadyStatus() {
        this.isReady = !this.isReady;
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
    let currentRoomColors = roomsList[roomId].roomColors;

    for (let i = 0; i < currentRoomColors.length; i++) {
        if (!currentRoomColors[i].occupied) {
            currentRoomColors[i].occupied = true;
            return currentRoomColors[i].color;
        }
    }
}

createRoom = () => {
    const newRoomId = generateRoomId(6);

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

    roomsList[newRoomId] = {
        roomColors: colors,
        players: []
    };

    return newRoomId;
}

deleteRoom = (roomId) => {
    delete roomsList[roomId];
}

resetColorOfPlayer = (currentRoom, player) => {
    currentRoom.roomColors.forEach(item => {
        if (item.color === player.logoColor) item.occupied = false;
    });
}

addPlayerToRoom = (socket, roomId) => {
    const newPlayer = new Player(socket.id, getNotOccupiedColor(roomId), false);
    roomsList[roomId].players.push(newPlayer);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('onAddPlayerToRoom', newPlayer);
    socket.emit('onGetAllUsers', roomsList[roomId].players);
}

removePlayerFromRoom = (currentRoom, index) => {
    currentRoom.players.splice(index, 1);
}

prepToAddToRoom = (socket) => {
    for (let roomId in roomsList) {
        if (roomsList[roomId].players.length < 2) {
            addPlayerToRoom(socket, roomId);
            return roomId;
        }
    }

    let roomId = createRoom();
    addPlayerToRoom(socket, roomId);
    return roomId;
}

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected!`);

    let currentRoomId = prepToAddToRoom(socket);

    socket.on('changeMyReadyStatus', () => {
        roomsList[currentRoomId].players.forEach(player => {
            if (player.getSocketId() === socket.id) {
                player.changeReadyStatus();
                io.to(currentRoomId).emit('onChangeReadyStatus', player);
            }
        });
    });

    socket.on('disconnect', () => {
        let currentRoom = roomsList[currentRoomId];

        currentRoom.players.forEach((player, index) => {
            if (player.getSocketId() === socket.id) {
                resetColorOfPlayer(currentRoom, player);
                removePlayerFromRoom(currentRoom, index);

                if (currentRoom.players.length === 0) {
                    deleteRoom(currentRoomId);
                } else {
                    io.to(currentRoomId).emit('onDisconnectSomeUser', { socketId: socket.id });
                }
            }
        });
    });
});
