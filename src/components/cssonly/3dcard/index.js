console.log("this is main js for piece - 3dcard in project cssonly");

require('../../common/jquery.js');

let $card = $('.tdcard');
let $shiness = $('.tdcard-shiness');
console.log($card[0].animate)

let params = {
    // _rotateX:0,
    // _rotateXTarget:0,
    // _rotateXInterval:null,
    // set rotateXTarget(val){
    //     clearInterval(this._rotateXInterval);
    //     this._rotateXTarget = val;
    //     this._rotateXInterval = setInterval(() => {
    //         if(this._rotateX != this._rotateXTarget){
    //             if(this._rotateXTarget > this._scale){
    //                 if(this._rotateXTarget - this._scale > 2)this._rotateX = this._rotateX + 2;
    //                 else this._rotateX = this._rotateXTarget;
    //             }
    //             if(this._rotateXTarget < this._rotateX){
    //                 if(this._rotateXTarget - this._rotateX < -2) this._rotateX = this._rotateX - 2;
    //                 else this._rotateX = this._rotateXTarget;;
    //             }
    //             this.refresh();
    //         }else clearInterval(this._rotateXInterval);
    //     },17);
    // },
    // set rotateX(val){
    //     if(val - this._rotateX > -0.001 && val - this._rotateX < 0.001)
    //         return false;
    //     this.rotateXTarget = val;
    // },
    _rotateX:0,
    set rotateX(val){
        if(val - this._rotateX > -0.001 && val - this._rotateX < 0.001)
            return false;
        this._rotateX = val;
        this.refresh();
    },
    _rotateY:0,
    set rotateY(val){
        if(val - this._rotateY > -0.001 && val - this._rotateY < 0.001)
            return false;
        this._rotateY = val;
        this.refresh();
    },
    _scale:1,
    _scaleTarget:1,
    _scaleInterval:null,
    set scaleTarget(val){
        clearInterval(this._scaleInterval);
        this._scaleTarget = val;
        this._scaleInterval = setInterval(() => {
            if(this._scale != this._scaleTarget){
                if(this._scaleTarget > this._scale){
                    if(this._scaleTarget - this._scale > 0.01)this._scale = this._scale + 0.01;
                    else this._scale = this._scaleTarget;
                }
                if(this._scaleTarget < this._scale){
                    if(this._scaleTarget - this._scale < -0.01) this._scale = this._scale - 0.01;
                    else this._scale = this._scaleTarget;;
                }
                this.refresh();
            }else clearInterval(this._scaleInterval);
        },17);
    },
    set scale(val){
        // if(val - this._scale > -0.001 && val - this._scale < 0.001)
        //     return false;
        // this.scaleTarget = val;
        this._scale = val;
        this.refresh();
    },
    refresh(){
        $card.css('transform',`rotateX(${this._rotateX}deg) rotateY(${this._rotateY}deg) scale3d(${this._scale}, ${this._scale}, ${this._scale})`);
    }
}

$card.on('mousein', (e) => {
    params.rotateX = e.offsetY / 10 - 10;
    params.rotateY = 10 - e.offsetX / 16;
    params.scale = 1.07;
    $shiness.css('background', `radial-gradient(at ${e.offsetX}px ${e.offsetY}px ,rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.05) 100%`);
});

$card.on('mousemove', (e) => {
    params.rotateX = e.offsetY / 10 - 10;
    params.rotateY = 10 - e.offsetX / 16;
    params.scale = 1.07;
    $shiness.css('background', `radial-gradient(at ${e.offsetX}px ${e.offsetY}px ,rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.05) 100%`);
});

$card.on('mouseout', (e) => {
    params.rotateX = 0;
    params.rotateY = 0;
    params.scale = 1;
    $shiness.css('background', `radial-gradient(at 120px 60px ,rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%`);
});