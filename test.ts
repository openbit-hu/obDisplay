radio.setGroup(4)
radio.sendString("OK:")
let initialized=false
let running=false

input.onButtonPressed(Button.A, function () {
    if(initialized)return
    initialized=true
    obDisplay.initMaster(10, 5)
    running=true
})

input.onButtonPressed(Button.B, function () {
    if(initialized)return
    initialized=true
    obDisplay.initSlave()
})


basic.forever(function () {
    while(true){
        if(running){
            let imgL=new OBImage(0,0,2,3)
            imgL.plot(0,0,OBBrightness.HI)
            imgL.plot(0,1,OBBrightness.MID)
            imgL.plot(0,2,OBBrightness.LO)
            imgL.plot(1,2,OBBrightness.MID)
            imgL.plot(1,1,OBBrightness.HI)
            obDisplay.drawImage(imgL)
            obDisplay.refresh()
            basic.pause(2000)
            imgL.rotateRight()
            obDisplay.drawImage(imgL)
            obDisplay.refresh()
            running=false
//            obDisplay.drawText("")
            return
        }
        basic.pause(100)
   }
 })

/*
basic.forever(function () {
    let x=0
    let dirX=1
    let y=2
    let dirY=1
    let b=1
    let dirB=1
    while(true){
        if(running){
            obDisplay.plot(x,y,OBBrightness.OFF)
            x+=dirX
            y+=dirY
            b+=dirB
            let paramB=OBBrightness.LO
            switch(b){
                case 1 : paramB=OBBrightness.MID; break
                case 2 : paramB=OBBrightness.HI; break
            }
            if((x==0)||(x==4))dirX=-dirX
            if((y==0)||(y==9))dirY=-dirY
            if((b==0)||(b==2))dirB=-dirB
            obDisplay.plot(x,y,paramB)
            obDisplay.refresh()
        }
        basic.pause(100)
    }
})
*/