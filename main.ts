class OBImage{
    x: number;
    y: number
    width: number;
    height: number;
    size: number;
    data: number[][];
    constructor(x: number, y: number, w: number, h: number){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.size = w*h;
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
        super(0, 0, w, h);
    }
    setLine(id:number,row:number,line:number,doPlot:boolean){
        let y=Math.trunc(id/this.width)
        let x=id-y*this.width
        for(let column=0;column<5;column++){
            line=line>>1
            this.data[x+column][y+row]=line&1*255
            if(doPlot)led.plot(column, row)
        }
    }
}

namespace obDisplay{
    let id: number;
    let screen: OBScreen;
    let x: number;
    let y: number;
    let w: number;
    let h: number;
    radio.onReceivedString(function (receivedString: string) {
        let message = receivedString.split(":");
        if(message[0] == "INIT"){
            w = parseInt(message[1]);
            h = parseInt(message[2]);
            y = Math.trunc(id * (5 / w)) * 5;
            x = (id - y * (w / 5)) * 5;
        }
        if(message[0] == "D"){
            decode(parseInt(message[1]),message[2])
        }
    })
    function decode(displayID:number, str:string){
        let index=0;
        while(index<5){
            let v=parse32(str.charCodeAt(index))
            screen.setLine(id,index,v,(displayID==id))
        }
    }
    function refresh(){
        let data=""
        radio.sendString("")
    }
    export function initMaster(w: number, h: number){
        getID();
        basic.clearScreen();
        radio.setGroup(4);
        screen=new OBScreen(w,h);
        radio.sendString("INIT:" + w.toString() + ":" + h.toString());
    }
    export function initSlave(){
        radio.setGroup(4);
        getID();
        basic.clearScreen();
    }
    export function plot(x:number, y:number, brightness:number){
        screen.data[x][y]=brightness;
    }
    function getID(){
        id = 0
        basic.showNumber(id);
        while(true){
            control.waitMicros(1000);
            if(input.buttonIsPressed(Button.A)){
                id += 1;
                basic.showNumber(id);
            }
            if(input.buttonIsPressed(Button.B)){
                return;
            }
        }        
    }
    let chrs=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v']
    function to32(a1:number,a2:number,a3:number,a4:number):string{
        let a=a1
        a+=a2<<2
        a+=a3<<4
        a+=a4<<8
        if(a<10)return a.toString()
        return chrs[a-10]
    }
    function parse32(c0: number): number {
        if ((c0 > 47) && (c0 < 58)) return c0 - 48
        return c0 - 87
    }
}
/*
class Index2D{
    x:number
    y:number
    w:number
    h:number
    constructor(offset:number,w:number,h:number){
        this.y=Math.trunc(offset/w)
        this.x=offset-this.y*w
        this.w=w
        this.h=h
    }
    increas():boolean{
        this.x++;
        if(this.x>=this.w){
            this.x=0
            this.y++
        }
        return (this.y>=this.h)
    }
}*/