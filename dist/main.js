const socket = io('https://fighter2d-server.herokuapp.com', {
    transports: ['websocket', 'polling', 'flashsocket'],
    cors: {
        origin: "https://2d-fighter.netlify.app",
        allowedHeaders: ['Access-Control-Allow-Origin'],
        credentials: true
    }
})

socket.on('init', handleInit)
socket.on('gameState', handleGameState)
socket.on('gameOver', handleGameOver)
socket.on('gameCode', handleGameCode)
socket.on('unknownGame', handleUnknownGame)
socket.on('tooManyPlayers', handleTooManyPlayers)
socket.on('pauseGame', handlePauseGame)

window.addEventListener('keydown', handleKeyDown)

function handleKeyDown(e){
    //e.preventDefault()
    socket.emit('keydown', e.key)
}

window.addEventListener('keyup', handleKeyUp)

function handleKeyUp(e){
    //e.preventDefault()
    socket.emit('keyup', e.key)
}

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const scenes = {
    mainMenuScene: {
        src: document.getElementById('mainMenuScene')
    },
    pauseMenuScene: {
        src: document.getElementById('pauseMenuScene')
    },
    gameScene: {
        src: document.getElementById('gameScene')
    },
    endGameScene: {
        src: document.getElementById('endGameScene')
    }
}

let playerNumber
const createGameBtn = document.getElementById('createGameBtn')
const joinGameBtn = document.getElementById('joinGameBtn')
const gameCodeInput = document.getElementById('roomIDInput')
createGameBtn.addEventListener('click', createGame)
joinGameBtn.addEventListener('click', joinGame)
const gameCodeDisplay = document.getElementById('roomIDDisplay')
let gameActive = false
const codeTitle = document.getElementById('codeTitle')
const continueBtn= document.getElementById('continueBtn')
continueBtn.addEventListener('click', pauseMenu)

function pauseMenu (){
    if(scenes.pauseMenuScene.src.style.display == 'none'){
        scenes.pauseMenuScene.src.style.display = 'block'
        socket.emit('togglePause')
    } else if (scenes.pauseMenuScene.src.style.display == 'block'){
        scenes.pauseMenuScene.src.style.display = 'none'
        socket.emit('togglePause')
    }
}

function handlePauseGame(){
    pauseMenu()
}


function createGame(){
    socket.emit('newGame')
    init()
}

function joinGame(){
    const code = gameCodeInput.value
    socket.emit('joinGame', code)
    init()
}

function init(){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    socket.emit('gameSize', {width: canvas.width, height: canvas.height})
    gameActive = true
    scenes.mainMenuScene.src.style.display = 'none'
    scenes.gameScene.src.style.display = 'block'
}

function draw(gameState){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    drawPlayer(gameState)
}

function drawPlayer(gameState){
    ctx.fillStyle = 'red'
    ctx.fillRect(gameState[0].position.x, gameState[0].position.y, gameState[0].size.w, gameState[0].size.h)
    ctx.fillStyle = 'blue'
    ctx.fillRect(gameState[1].position.x, gameState[1].position.y, gameState[1].size.w, gameState[1].size.h)
}

function switchToScene(scene){
    for (const menu of Object.keys(scenes)) {
        if(scenes[menu] === scene) {
            scenes[menu].src.style.display = 'block'
        } else {
            scenes[menu].src.style.display = 'none'
        }
    }
}

function handleInit(number){
    playerNumber = number
}

function handleGameState(gameState){
    codeTitle.style.display = 'none'
    if(!gameActive){
        return
    }
    gameState = JSON.parse(gameState)
    requestAnimationFrame(() => {
        draw(gameState.players)
    })
}

function handleGameOver(data){
    if(!gameActive){
        return
    }
    data = JSON.parse(data)
    if(data.winner === playerNumber){
        alert('You win!')
    } else { 
        alert('You lose.')
    }
    gameActive = false
}

function handleGameCode(gameCode){
    gameCodeDisplay.innerText = gameCode
}

function handleUnknownGame(){
    reset()
    alert('Unknown game code')
}

function handleTooManyPlayers(){
    reset()
    alert('Game is room is full')
}

function reset(){
    playerNumber = null
    gameCodeInput = ''
    gameCodeDisplay.innerText = ''
    scenes.mainMenuScene.src.style.display = 'block'
    scenes.gameScene.src.style.display = 'none'
}