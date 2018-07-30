let $canvas = document.getElementById('canvas');
let _width = window.innerWidth;
let _height = window.innerHeight;

export default {
    _canvas:$canvas,
    _width:_width,
    _height:_height,
    //options:
    // alpha: _alpha,
    // depth: _depth,
    // stencil: _stencil,
    // antialias: _antialias,
    // premultipliedAlpha: _premultipliedAlpha,
    // preserveDrawingBuffer: _preserveDrawingBuffer,
    _gl:null,
    init:function(options){
        if(!options) var options = {};
        this._gl = this._canvas.getContext('webgl', options) || this._canvas.getContext('experimental-webgl', options);
        if(!this._gl){
            console.log('没有对webgl的支持')
        }
    }
};