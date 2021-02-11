radio.setGroup(4)
radio.sendString("OK:")
let initialized=false
let running=false

input.onButtonPressed(Button.A, function () {
    if(initialized)return
    initialized=true
    obDisplay.initMaster(10, 5)    
    obDisplay.plot(0, 0, 255)
    obDisplay.plot(1, 1, 255)
    obDisplay.plot(2, 2, 255)
    obDisplay.plot(7, 2, 255)
    obDisplay.plot(8, 1, 255)
    obDisplay.plot(9, 0, 255)
    obDisplay.refresh()
    running=true
})

input.onButtonPressed(Button.B, function () {
    if(initialized)return
    initialized=true
    obDisplay.initSlave()
})

basic.forever(function () {
    let x=0
    let dirX=1
    let y=2
    let dirY=1
    while(true){
        if(running){
            obDisplay.plot(x,y,0)
            x+=dirX
            y+=dirY
            if((x==0)||(x==9))dirX=-dirX
            if((y==0)||(y==4))dirY=-dirY
            obDisplay.plot(x,y,255)
            obDisplay.refresh()
        }
        basic.pause(100)
    }
})