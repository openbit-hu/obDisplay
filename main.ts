enum OBBrightness{
    //% blockId="HI" block="high"
    HI = 255,
    //% blockId="MID" block="middle"
    MID = 63,
    //% blockId="LO" block="low"
    LO = 15,
    //% blockId="OFF" block="off"
    OFF = 0
}
class OBChar{
    pixels:NumberFormat.UInt8BE[]
    constructor(data:NumberFormat.UInt8BE[]){
        this.pixels=data;
    }
}

class OBText{
    x: number
    y: number
    text:OBChar[]
    static char:OBChar[]
    constructor(str:string){
        OBText.char=[]
        OBText.char.push(new OBChar([0,6,9,9,6])) //o
        OBText.char.push(new OBChar([0,7,9,7,1])) //p
        OBText.char.push(new OBChar([6,9,7,1,14])) //e
        OBText.char.push(new OBChar([0,7,9,9,9])) //n
        OBText.char.push(new OBChar([1,1,7,9,7])) //b
        OBText.char.push(new OBChar([4,0,4,4,4])) //i
        OBText.char.push(new OBChar([2,2,14,2,28])) //t
        this.text=OBText.char
    }
    writeString(screen:OBScreen){
        for(let i=0;i<this.text.length;i++){
            let xx=this.x+i*6
            for(let j=0;j<5;j++){
                let line=this.text[i].pixels[j]
                for(let k=0;k<5;k++){
                    if((xx+k<0)||(xx+k>=screen.width)){
                        line=line>>1
                        continue
                    }
                    if((this.y+j<0)||(this.y+j>=screen.height))continue
                    screen.data[xx+k][this.y+j]=(line&0x01)*OBBrightness.HI
                    line=line>>1
                }
                // space between characters
                if((xx+5<0)||(xx+5>=screen.width))continue
                if((this.y+j<0)||(this.y+j>=screen.height))continue
                screen.data[xx+5][this.y+j]=OBBrightness.OFF
            }
        }
    }
    animateString(screen:OBScreen){
        this.x=screen.width
        this.y=0
        let l=this.text.length*6+screen.width
        for(let i=0;i<l;i++){
            this.x--
            this.writeString(screen)
            obDisplay.refresh()
            basic.pause(100)
        }
    }
}

class OBImage{
    x: number
    y: number
    width: number;
    height: number;
    data: number[][];
    constructor(x: number, y: number, w: number, h: number){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.data=[];
        for(let i=0;i<w;i++){
            this.data[i]=[]
            for(let j=0;j<h;j++){
                this.data[i][j]=0
            }
        }
    }
}

class OBScreen extends OBImage {
    constructor(w: number, h: number){
        super(0, 0, w, h)
    }
    setLine(id:number,row:number,lineHI:number,lineLO:number,doPlot:boolean){
        let y=Math.trunc(id*5/this.width)
        let x=id*5-y*this.width
        for(let column=0;column<5;column++){
            let hi=(lineHI&0x01)*255
            let lo=(lineLO&0x01)*255
            let b=0
            if(hi&&lo)b=OBBrightness.HI
            else{
                if(hi)b=OBBrightness.MID
                if(lo)b=OBBrightness.LO
            }
            this.data[x+column][y+row]=b
            if(doPlot)led.plotBrightness(column, row, b)
            lineHI=lineHI>>1
            lineLO=lineLO>>1
        }
    }
}

//% color=#008060 weight=100 icon="\uf00a" block="obDisplay"
namespace obDisplay{
    let id: number
    let x: number
    let y: number
    let screen: OBScreen
    let isSlave: boolean
    radio.onReceivedString(function (receivedString: string) {
        let message = receivedString.split(":")
        if(message[0] == "INIT"){
            let w = parseInt(message[1])
            let h = parseInt(message[2])
            y = Math.trunc(id * (5 / w)) * 5
            x = (id - y * (w / 5)) * 5
            screen=new OBScreen(w,h)
        }
        if(message[0] == "S"){
            if(screen)decode(parseInt(message[1]),message[2])
        }
    })
    function decode(displayID:number, str:string){
        let row=0
        while(row<5){
            let lineHI=parse32(str.charCodeAt(2*row))
            let lineLO=parse32(str.charCodeAt(2*row+1))
            screen.setLine(displayID,row++,lineHI,lineLO,(displayID==id))
        }
    }
    //% blockId="obDisplay_refresh"
    //% block="draws the actual data on each micro:bit of the display"
    export function refresh(){
        if(isSlave)return
        let w=screen.width
        let h=screen.height
        let maxID=Math.trunc(w*h/25)
        for(let n=0;n<maxID;n++){
            let data=""
            y = Math.trunc(n * 5 / w) * 5
            x = (n - y * w / 25) * 5
            if(n==id){
                for(let row=0;row<5;row++){
                    for(let column=0;column<5;column++){
                        led.plotBrightness(column,row,screen.data[x+column][y+row])
                    }
                }
            }
            else{
                for(let row=0;row<5;row++){
                    let line=0
                    for(let column=0;column<5;column++){
                        // HI bit
                        let pixel=(screen.data[x+column][y+row]>=OBBrightness.MID)?1:0
                        line+=pixel<<column
                    }
                    data+=to32(line)
                    line=0
                    for(let column=0;column<5;column++){
                        // LO bit
                        let b=screen.data[x+column][y+row]
                        let pixel=((b==OBBrightness.LO)||(b==OBBrightness.HI))?1:0
                        line+=pixel<<column
                    }
                    data+=to32(line)
                }
                radio.sendString("S:"+n.toString()+":"+data)
            }
        }
    }
    //% blockId="obDisplay_initMaster"
    //% block="initialize display on the master bit $width $height"
    export function initMaster(w: number, h: number){
        isSlave=false
        getID()
        screen=new OBScreen(w,h)
        radio.sendString("INIT:" + w.toString() + ":" + h.toString())
    }
    //% blockId="obDisplay_initMasterWithID"
    //% block="initialize display on the master bit $width $height with $displayID"
    export function initMasterWithID(w: number, h: number, displayID: number){
        isSlave=false
        id=displayID
        screen=new OBScreen(w,h)
        radio.setGroup(4)
        radio.sendString("INIT:" + w.toString() + ":" + h.toString())
    }
    //% blockId="obDisplay_initSlave"
    //% block="initialize display on a slave bit"
    export function initSlave(){
        isSlave=true
        getID()
    }
    //% blockId="obDisplay_initSlaveWithID"
    //% block="initialize display on a slave bit with $displayID"
    export function initSlaveWithID(displayID: number){
        radio.setGroup(4)
        isSlave=true
        id=displayID
    }
    //% blockId="obDisplay_plot"
    //% block="plot on the display at $x $y with $brightness"
    export function plot(x:number, y:number, brightness:OBBrightness){
        screen.data[x][y]=brightness
    }
    //% blockId="obDisplay_drawImage"
    //% block="draws $img on the display"
    export function drawImage(img:OBImage){
        for(let i=0;i<img.width;i++){
            for(let j=0;j<img.height;j++){
                if((img.x+i)>=screen.width)continue;
                if((img.y+j)>=screen.height)continue;
                screen.data[img.x+i][img.y+j]=img.data[i][j]
            }
        }
    }
    //% blockId="obDisplay_drawText"
    //% block="draws $txt on the display"
    export function drawText(txt:string){
        let text=new OBText(txt)
        text.animateString(screen)
    }
    function getID(){
        id = 0
        basic.showNumber(id)
        while(true){
            control.waitMicros(1000)
            if(input.buttonIsPressed(Button.A)){
                id += 1
                basic.showNumber(id)
            }
            if(input.buttonIsPressed(Button.B)){
                basic.clearScreen()
                radio.setGroup(4)
                return
            }
        }        
    }
    let chrs=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v']
    function to32(a:number):string{
        if(a<10)return a.toString()
        return chrs[a-10]
    }
    function parse32(c0: number): number {
        if ((c0 > 47) && (c0 < 58)) return c0 - 48
        return c0 - 87
    }
}
