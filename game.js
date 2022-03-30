module.exports = {
    initGame,
    gameLoop,
    makeId
}

function initGame(){
    const state = createGameState()
    return state
}

function createGameState() {
    return {
        players: [
            {
                position: {
                    x: 0, 
                    y: 0
                },
                size: {
                    w: 50, 
                    h: 150
                }, 
                vel: {
                    x: 0, y: 10
                },
                speed: 7,
                keys: {
                    a: {
                        pressed: false
                    }, 
                    d: {pressed: false}, 
                    lastKey: null
                },
                jumps: 2,
                jumpForce: 50,
                isPaused: false
            },
            {
                position: {
                    x: 700, 
                    y: 0
                },
                size: {
                    w: 50, 
                    h: 150
                }, 
                vel: {
                    x: 0, y: 10
                },
                speed: 7,
                keys: {
                    a: {
                        pressed: false
                    }, 
                    d: {pressed: false}, 
                    lastKey: null
                },
                jumps: 2,
                jumpForce: 50,
                isPaused: false
            }
        ]
    }
}

function gameLoop(state){
    if(!state){
        console.log('No State')
        return
    }
    const gravity = 4
    const playerOne = state.players[0]
    const playerTwo = state.players[1]

    playerOne.vel.x = 0

    playerOne.size.h = 150
    if(playerOne.isCrouch){
        playerOne.size.h = 100
    }

    if(playerOne.keys.a.pressed && playerOne.keys.lastKey === 'a'){
        playerOne.vel.x = -playerOne.speed
    }else if(playerOne.keys.d.pressed && playerOne.keys.lastKey === 'd'){
        playerOne.vel.x = playerOne.speed
    }

    playerOne.position.y += playerOne.vel.y

    if(playerOne.position.y + playerOne.size.h + playerOne.vel.y >= playerOne.canvas.height){
        playerOne.vel.y = 0
        playerOne.jumps = 2
    }else {
        playerOne.vel.y += gravity
    }

    if(playerOne.position.x + playerOne.vel.x <= 0 || playerOne.position.x + playerOne.size.w + playerOne.vel.x >= playerOne.canvas.width){
        playerOne.position.x += playerOne.vel.x * -1
        playerOne.vel.x *= 1
    } else {
        playerOne.vel.x *= 1
        playerOne.position.x += playerOne.vel.x
    }

    playerTwo.vel.x = 0

    playerTwo.size.h = 150
    if(playerTwo.isCrouch){
        playerTwo.size.h = 100
    }

    if(playerTwo.keys.a.pressed && playerTwo.keys.lastKey === 'a'){
        playerTwo.vel.x = -playerTwo.speed
    }else if(playerTwo.keys.d.pressed && playerTwo.keys.lastKey === 'd'){
        playerTwo.vel.x = playerTwo.speed
    }

    playerTwo.position.y += playerTwo.vel.y

    if(playerTwo.position.y + playerTwo.size.h + playerTwo.vel.y >= playerTwo.canvas.height){
        playerTwo.vel.y = 0
        playerTwo.jumps = 2
    }else {
        playerTwo.vel.y += gravity
    }

    if(playerTwo.position.x + playerTwo.vel.x <= 0 || playerTwo.position.x + playerTwo.size.w + playerTwo.vel.x >= playerTwo.canvas.width){
        playerTwo.position.x += playerTwo.vel.x * -1
        playerTwo.vel.x *= 1
    } else {
        playerTwo.vel.x *= 1
        playerTwo.position.x += playerTwo.vel.x
    }

    return false
}

function makeId(length){
    let res = ''
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charsLength = chars.length
    for(let i = 0; i < length; i++){
        res += chars.charAt(Math.floor(Math.random() * charsLength))
    }
    return res
}