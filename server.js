const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { initGame, gameLoop, makeId } = require('./game')
const { FRAME_RATE, PORT } = require('./constants')

const state = {}
const clientRooms = {}

io.on('connection', client => {
    client.emit('init', JSON.stringify(state))

    client.on('togglePause', handleTogglePause)

    function handleTogglePause(){
        const roomName = clientRooms[client.id]
        state[roomName].players[client.number - 1].isPaused = !state[roomName].players[client.number - 1].isPaused
    }

    client.on('newGame', handleNewGame)

    function handleNewGame(){
        let roomName = makeId(5)
        clientRooms[client.id] = roomName
        client.emit('gameCode', roomName)
        state[roomName] = initGame()
        client.join(roomName)
        client.number = 1
        client.emit('init', 1)
    }

    client.on('joinGame', handleJoinGame)

    function handleJoinGame(roomName){
        client.emit('gameCode', roomName)
        
        const room = io.sockets.adapter.rooms.get(roomName)

        const numClients = room ? room.size : 0

        if(numClients === 0){
            client.emit('unknownGame')
            return
        } else if(numClients > 1){
            client.emit('tooManyPlayers')
            return
        }

        clientRooms[client.id] = roomName
        client.join(roomName)
        
        client.number = 2
        client.emit('init', 2)
        
        startGameInterval(roomName)
        client.on('gameSize', setGameSize)
    }

    function setGameSize(canvas){
        const roomName = clientRooms[client.id]
        state[roomName].players[0].canvas = canvas
        state[roomName].players[1].canvas = canvas
    }

    client.on('keydown', handleKeyDown)

    function handleKeyDown(e){
        const roomName = clientRooms[client.id]
        if(!roomName || state[roomName].players[client.number - 1].isPaused){
            return
        }
        switch(e){
            case 'a':
                state[roomName].players[client.number - 1].keys.a.pressed = true
                state[roomName].players[client.number - 1].keys.lastKey = 'a'
                break
            case 'd':
                state[roomName].players[client.number - 1].keys.d.pressed = true
                state[roomName].players[client.number - 1].keys.lastKey = 'd'
                break
            case 'w':
                if(state[roomName].players[client.number - 1].jumps > 0){
                    state[roomName].players[client.number - 1].vel.y = -state[roomName].players[client.number - 1].jumpForce
                    state[roomName].players[client.number - 1].jumps -= 1
                }
                break
            case ' ':
                if(state[roomName].players[client.number - 1].jumps > 0){
                    state[roomName].players[client.number - 1].vel.y = -state[roomName].players[client.number - 1].jumpForce
                    state[roomName].players[client.number - 1].jumps -= 1
                }
                break
            case 's':
                state[roomName].players[client.number - 1].isCrouch = true
                break
            case 'p':
                client.emit('pauseGame', state[roomName].players[client.number - 1])
                break
            case 'Escape':
                client.emit('pauseGame', state[roomName].players[client.number - 1])
                break
        }
    }

    client.on('keyup', handleKeyUp)

    function handleKeyUp(e){
        const roomName = clientRooms[client.id]

        if(!roomName || state[roomName].players[client.number - 1].isPaused){
            return
        }

        switch(e){
            case 'a':
                state[roomName].players[client.number - 1].keys.a.pressed = false
                break
            case 'd':
                state[roomName].players[client.number - 1].keys.d.pressed = false
                break
            case 's':
                state[roomName].players[client.number - 1].isCrouch = false
                state[roomName].players[client.number - 1].position.y -= 101
                break
        }
    }
})

function startGameInterval(roomName){
    const intervalId = setInterval(()=>{
        const winner = gameLoop(state[roomName])
        if(!winner){
            emitGameState(roomName, state[roomName])
        } else {
            emitGameOver(roomName, winner)
            state[roomName] = null
            clearInterval(intervalId)
        }
    }, 1000/FRAME_RATE)
}

function emitGameState(roomName, state){
    io.sockets.in(roomName).emit('gameState', JSON.stringify(state))
}

function emitGameOver(roomName, winner){
    io.sockets.in(roomName).emit('gameOver', JSON.stringify({ winner }))
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
});

server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`))