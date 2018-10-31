/**
 * requestAnimationFrame
 */

import datGUI from '../../threejs/lib/dat.gui.js';
//raf
window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
//Vector
//点和向量是同一种数值的不同表现形式
class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.scaleX = 1;
        this.scaleY = 1;
    }
    copy(){
        return new Vector(this.x, this.y);
    }
    //compute
    add(v){
        this.x += v.x;
        this.y += v.y;
    }
    sub(v){
        this.x -= v.x;
        this.y -= v.y;
    }
    //
    set(x, y){
        this.x = x;
        this.y = y;
    }
    set scaleX(v){
        this.x /= this._scaleX;
        this._scaleX = v;
        this.x *= this._scaleX;
    }
    get scaleX(){
        return this._scaleX;
    }
    set scaleY(v){
        this.y /= this._scaleY;
        this._scaleY = v;
        this.y *= this._scaleY;
    }
    get scaleY(){
        return this._scaleY;
    }
    get length(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    get lengthSq() {
        return this.x * this.x + this.y * this.y;
    }
    normalize(){
        let length = this.length;
        if(length == 0) return false;
        this.x /= length;
        this.y /= length;
    }
    get angle(){
        return Math.atan2(this.y, this.x);
    }
    //用途何在？
    angleTo(v) {
        var dx = v.x - this.x,
            dy = v.y - this.y;
        return Math.atan2(dy, dx);
    }
    //插值, t 0~1
    lerp(v, t){
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        return this;
    }
    toString(){
        return `X:${this.x},y:${this.y}`;
    }
}