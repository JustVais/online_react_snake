var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3001);
console.log('Server works on port 3001');

// rooms statuses
const WAITING_FOR_PLAYERS = "WAITING_FOR_PLAYERS";
const IN_GAME = "IN_GAME";

const MAX_PLAYERS_IN_ROOM = 2;

class Player {
    constructor(socketId) {
        this.isReady = false;
        this.color;
        this.socketId = socketId;
    }
}

class Room {
    constructor() {
        this.id = this.generateRoomId();
        this.status = WAITING_FOR_PLAYERS;
        this.playersList = {};
        this.playersCount = 0;
        this.colors = [
            { occupied: false, color: 'red' },
            { occupied: false, color: 'green' },
            { occupied: false, color: 'blue' },
            { occupied: false, color: 'pink' },
            { occupied: false, color: 'black' },
            { occupied: false, color: 'white' },
            { occupied: false, color: 'gray' },
            { occupied: false, color: 'brown' }
        ];
    }

    generateRoomId = () => {
        let chrs = 'abdehkmnpswxzABDEFGHKMNPQRSTWXZ123456789';
        let result = '';

        for (let i = 0; i < 10; i++) {
            const index = Math.floor(Math.random() * chrs.length);
            result += chrs[index];
        }

        return result;
    }

    add = (player) => {
        this.playersCount++;

        for (let i = 0; i < this.colors.length; i++) {
            if (!this.colors[i].occupied) {
                this.colors[i].occupied = true;
                player.color = this.colors[i].color;
                break;
            }
        }

        this.playersList[player.socketId] = player;
    }

    getPlayersList = () => {
        let newPlayersList = {};
        let keys = Object.keys(this.playersList);

        for (let i = 0; i < keys.length; i++) {
            let player = this.playersList[keys[i]];

            newPlayersList[keys[i]] = {
                isReady: player.isReady,
                color: player.color,
                id: player.socketId
            };
        }

        return newPlayersList;
    }
}

class RoomsList {
    constructor() {
        this.roomsList = {};
    }

    getIdOfFreeRoom = () => {
        let keysOfRooms = Object.keys(this.roomsList);

        for (let i = 0; i < keysOfRooms.length; i++) {
            let currentRoom = rooms.roomsList[keysOfRooms[i]];

            if (currentRoom.status === WAITING_FOR_PLAYERS && currentRoom.playersCount < MAX_PLAYERS_IN_ROOM) {
                return currentRoom.id;
            }
        }

        return this.createNewRoom();
    }

    createNewRoom = () => {
        let newRoom = new Room();

        this.add(newRoom);

        return newRoom.id;
    }

    add = (room) => {
        this.roomsList[room.id] = room;
    }
}

const rooms = new RoomsList();

io.on('connection', (socket) => {
    let myRoom;

    socket.on('connect to room', () => {
        let player = new Player(socket.id);

        myRoom = rooms.roomsList[rooms.getIdOfFreeRoom()];

        myRoom.add(player);

        socket.emit('get all players', { playersList: myRoom.getPlayersList() });

        // socket.broadcast.to(roomId).emit('onAddPlayerToRoom', newPlayer);
    });
});