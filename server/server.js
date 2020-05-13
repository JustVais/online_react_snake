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
    constructor(socket) {
        this.isReady = false;
        this.color;
        this.socket = socket;
    }
}

class Room {
    constructor() {
        this.id = this.generateRoomId();
        this.status = WAITING_FOR_PLAYERS;
        this.gameStarted = false;
        this.playersList = {};
        this.playersCounter = 0;
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
        this.playersCounter++;

        for (let i = 0; i < this.colors.length; i++) {
            if (!this.colors[i].occupied) {
                this.colors[i].occupied = true;
                player.color = this.colors[i].color;
                break;
            }
        }

        player.socket.join(this.id);

        this.playersList[player.socket.id] = player;
    }

    remove = (socketId) => {
        this.playersCounter--;

        for (let i = 0; i < this.colors.length; i++) {
            if (this.colors[i].color === this.playersList[socketId].color) {
                this.colors[i].occupied = false;
                break;
            }
        }

        delete this.playersList[socketId];
    }

    getPlayersList = () => {
        let newPlayersList = {};
        let keys = Object.keys(this.playersList);

        for (let i = 0; i < keys.length; i++) {
            let player = this.playersList[keys[i]];

            newPlayersList[keys[i]] = {
                isReady: player.isReady,
                color: player.color,
                id: player.socket.id
            };
        }

        return newPlayersList;
    }

    changePlayerReadyStatus = (socketId, status) => {
        
        this.playersList[socketId].isReady = status;

        if (this.gameStarted == true) return;

        this.startGame();
    }

    startGame = () => {
        let readyPlayersCounter = 0;

        let playersKeys = Object.keys(this.playersList);

        for(let i = 0; i < playersKeys.length; i++) {
            if (this.playersList[playersKeys[i]].isReady) {
                readyPlayersCounter++;
            } else {
                break;
            }
        }

        if (readyPlayersCounter === this.playersCounter) {
            this.gameStarted = true;
            io.to(this.id).emit('game start');
        }
    }

    game = () => {
        new Promise((resolve, reject) => {
            setInterval(() => {
                
            }, 1000);
        });
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

            if (currentRoom.status === WAITING_FOR_PLAYERS && currentRoom.playersCounter < MAX_PLAYERS_IN_ROOM) {
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

    remove = (roomId) => {
        delete this.roomsList[roomId];
    }
}

const rooms = new RoomsList();

io.on('connection', (socket) => {
    let myRoom;

    socket.on('connect to room', () => {
        let player = new Player(socket);

        myRoom = rooms.roomsList[rooms.getIdOfFreeRoom()];

        myRoom.add(player);

        socket.emit('get all players', { playersList: myRoom.getPlayersList() });

        socket.broadcast.to(myRoom.id).emit('add new player', {newPlayer: {
            isReady: player.isReady,
            color: player.color,
            id: player.socket.id
        }});
    });

    socket.on('change my ready status', (data) => {
        myRoom.changePlayerReadyStatus(socket.id, data.status);

        io.to(myRoom.id).emit('change player status', {
            playerId: socket.id, 
            status: data.status
        });
    });

    socket.on('disconnect', () => {
        if (!myRoom) return;

        if (myRoom.playersCounter === 1) {
            rooms.remove(myRoom.id);
        } else {
            socket.broadcast.to(myRoom.id).emit('disconnect some player', {playerId: socket.id});
            myRoom.remove(socket.id);
        }
    });
});