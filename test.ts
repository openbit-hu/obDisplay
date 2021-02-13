radio.setGroup(4)
radio.sendString("OK:")
let initialized=false
let running=false

input.onButtonPressed(Button.A, function () {
    if(initialized)return
    initialized=true
    obDisplay.initMaster(5, 10)    
    serial.writeLine("Master")
    running=true
})

input.onButtonPressed(Button.B, function () {
    if(initialized)return
    initialized=true
    obDisplay.initSlave()
    serial.writeLine("Slave")
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
            if((x==0)||(x==4))dirX=-dirX
            if((y==0)||(y==9))dirY=-dirY
            obDisplay.plot(x,y,255)
            obDisplay.refresh()
        }
        basic.pause(100)
    }
})