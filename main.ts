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
    let id = 0;
    export function initMaster(){

    }
    export function initSlawe(){
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
}