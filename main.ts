class OBImage{
    data: string;
    x: number;
    y: number
    width: number;
    height: number;
    constructor(x: number, y: number, w: number, h: number){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
}
class OBScreen extends OBImage {
    constructor(w: number, h: number){
        super(0, 0, w, h);
    }
}
namespace obDisplay{
    let id: number;
    let screen: OBScreen;
    let x: number;
    let y: number;
    let w: number;
    let h: number;
    let checkSum: number;
    let ready: boolean;
    radio.onReceivedString(function (receivedString: string) {
        let message = receivedString.split(":");
        if(message[0] == "INIT"){
            led.plot(0, 1);
            w = parseInt(message[1]);
            h = parseInt(message[2]);
            y = Math.trunc(id * (5 / w)) * 5;
            x = (id - y * (w / 5)) * 5;
            basic.pause(100);
            radio.sendString("RESPONSE:" + id.toString());
        }
        let cs = 0
        if(message[0] == "RESPONSE"){
            led.plot(1, 1);
            cs += parseInt(message[1]);
            if(checkSum == cs){
                ready = true;
            }
        }
        if(!ready){
            return
        }
        if(message[0] == "CMD"){
            led.plot(2, 1);
            basic.showString(message[1]);
        }
    })
    export function initMaster(w: number, h: number){
        ready = false;
        getID();
        basic.clearScreen();
        led.plot(0, 0)
        checkSum = 0
        for(let i = 1; i < w * h / 25;  i++){
            checkSum += i;
        }
        led.plot(1, 0)
        radio.setGroup(4);
        radio.sendString("INIT:" + w.toString() + ":" + h.toString());
        led.plot(2, 0)
        while(!ready){
            basic.pause(100);
        }
    }
    export function initSlave(){
        radio.setGroup(4);
        getID();
        basic.clearScreen();
    }
    export function drawDisplay(){
        //Adat a screen változóban
        for(let i = screen.x; i < screen.x + screen.width; i++){
            for(let j = screen.y; j < screen.y + screen.height; j++){
                let index = j * screen.width + i;
                let ch = screen.data.charAt(index);
                let brightness = parseInt(ch) * 16;
                led.plotBrightness(i - x, j - y, brightness);
            }
        }
    }
    export function isReady(): boolean{
        return ready;
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
                // let rows = screen.width / 5;
                return;
            }
        }        
    }
}