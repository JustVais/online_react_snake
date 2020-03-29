var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3001);
console.log('Server works on port 3001');

const Direction = {
    Top: { x: 0, y: -1 },
    Bottom: { x: 0, y: 1 },
    Left: { x: -1, y: 0 },
    Right: { x: 1, y: 0 }
};

class Player {
    constructor(socketId, color, isReady) {
        this.socketId = socketId;
        this.logoColor = color;
        this.isReady = isReady;
        this.direction = Direction.Top;
        this.currentSnake = [];
        this.count = 0;
    }

    getSocketId() {
        return this.socketId;
    }

    changeReadyStatus() {
        this.isReady = !this.isReady;
    }

    clearTail() {
        this.currentSnake = [];
    }
}

const roomsList = {};
const PLAYERS_LIMIT = 2;
const MAP_SIZE = 8;

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
        players: [],
        losedPlayers: [],
        gameStarted: false,
        currentApple: {}
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
    socket.emit('onGetAllUsers', { players: roomsList[roomId].players, socketId: socket.id });
}

removePlayerFromRoom = (currentRoom, index) => {
    currentRoom.players.splice(index, 1);
}

prepToAddToRoom = (socket) => {
    for (let roomId in roomsList) {
        if (roomsList[roomId].players.length < 2 && !roomsList[roomId].gameStarted) {
            addPlayerToRoom(socket, roomId);
            return roomId;
        }
    }

    let roomId = createRoom();
    addPlayerToRoom(socket, roomId);
    return roomId;
}

checkReadyStatusInRoom = (currentRoomId) => {
    let currentRoom = roomsList[currentRoomId];
    let count = 0;


    currentRoom.players.forEach((player) => {
        if (player.isReady) count++;
    });


    if (count === currentRoom.players.length && count === PLAYERS_LIMIT) {
        startGame(currentRoom, currentRoomId);
    }
}

eatApple = (head, currentRoom) => {

    let { currentApple } = currentRoom;

    if (head.x === currentApple.x && head.y === currentApple.y) {
        spawnApple(currentRoom);
        return true;
    }
    return false;
}

isInTheField = (head) => {
    if (head.x < 0 || head.x > MAP_SIZE - 1
        || head.y < 0 || head.y > MAP_SIZE - 1) {
        return false;
    }
    return true;
}

headOnTail = (newHead, currentRoom) => {
    let result = false;
    currentRoom.players.forEach(player => {
        player.currentSnake.forEach(snakeCell => {
            if (snakeCell.x === newHead.x && snakeCell.y === newHead.y) {
                result = true;
            }
        });
    });
    return result;
}

gameOverForPlayer = (player, currentRoom, index) => {
    player.clearTail();

    currentRoom.losedPlayers = [...currentRoom.losedPlayers, player];
    
    setTimeout(() => {
        currentRoom.players.splice(index, 1);
    });
}

moveSnake = (currentRoom, currentRoomId) => {
    currentRoom.players.forEach((player, index) => {
        let currentSnake = player.currentSnake;
        let currentDirrection = player.direction;

        let [head] = currentSnake;
        let tail = [];
        
        let newHead = {
            x: head.x + currentDirrection.x,
            y: head.y + currentDirrection.y,
        };
        
        if (!isInTheField(newHead) || headOnTail(newHead, currentRoom)) {
            gameOverForPlayer(player, currentRoom, index);
        } else {
            if (eatApple(newHead, currentRoom)) {
                player.count++;
                tail = currentSnake.slice(0);
            } else {
                tail = currentSnake.slice(0, -1);
            }
            player.currentSnake = [newHead, ...tail];
        }
    });

    io.to(currentRoomId).emit('stepOfGame', { players: currentRoom.players, currentApple: currentRoom.currentApple });
}

spawnApple = (currentRoom) => {
    let newApple = { x: 0, y: 0 }

    newApple.x = Math.floor(Math.random() * MAP_SIZE);
    newApple.y = Math.floor(Math.random() * MAP_SIZE);

    currentRoom.currentApple = newApple;
}

startGame = (currentRoom, currentRoomId) => {
    let centerOfMap = Math.floor(MAP_SIZE / PLAYERS_LIMIT);

    currentRoom.gameStarted = true;

    spawnApple(currentRoom);

    currentRoom.players.forEach((player, index) => {
        player.currentSnake = [
            { x: centerOfMap * index, y: centerOfMap - 1 },
            { x: centerOfMap * index, y: centerOfMap }
        ]
    });

    io.to(currentRoomId).emit('startGame', { players: currentRoom.players, currentApple: currentRoom.currentApple });

    let gameHandler = new Promise((resolve) => {
        setInterval(() => {
            if (currentRoom.players.length > 0) {
                moveSnake(currentRoom, currentRoomId);
            } else {
                resolve();
            }
        }, 250);
    });

    gameHandler.then(() => {
        io.to(currentRoomId).emit('onEndGame', {losedPlayers: currentRoom.losedPlayers});
    });
}

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected!`);

    let currentRoomId = prepToAddToRoom(socket);

    socket.on('changeMyReadyStatus', () => {
        roomsList[currentRoomId].players.forEach(player => {
            if (player.getSocketId() === socket.id) {
                player.changeReadyStatus();
                checkReadyStatusInRoom(currentRoomId);
                io.to(currentRoomId).emit('onChangeReadyStatus', player);
            }
        });
    });

    socket.on('changeDirection', (data) => {
        let currentRoom = roomsList[currentRoomId];

        currentRoom.players.forEach((player) => {
            if (player.getSocketId() === socket.id) {
                player.direction = Direction[data.direction];
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
