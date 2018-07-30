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
    init(options){
        if(!options) var options = {};
        this._gl = this._canvas.getContext('webgl', options) || this._canvas.getContext('experimental-webgl', options);
        if(!this._gl){
            console.log('没有对webgl的支持')
        }else return this._gl;
    },
    createVertexShader(source){
        if(!this._gl){
            console.log('gl 未准备好，你是否init过')
            return false;
        }
        return this.createShader(this._gl, this._gl.VERTEX_SHADER, source);//gl.VERTEX_SHADER是一个表示着色器类型的内置常量
    },
    createFragmentShader(source){
        if(!this._gl){
            console.log('gl 未准备好，你是否init过')
            return false;
        }
        return this.createShader(this._gl, this._gl.FRAGMENT_SHADER, source);//gl.FRAGMENT_SHADER是一个表示着色器类型的内置常量
    },
    //type-着色器类型 source-数据源
    createShader(gl, type, source){
        let shader = gl.createShader(type);//创建着色器对象
        console.log(shader)
        gl.shaderSource(shader, source);//提供数据源
        gl.compileShader(shader);//编译 -> 生成着色器
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        console.log(success)
        if(success)
            return shader;
    }
};