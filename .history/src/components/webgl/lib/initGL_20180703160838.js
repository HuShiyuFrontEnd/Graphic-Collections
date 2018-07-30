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
    resize(){
        let gl = this.checkGL();
        if(!gl) return false;
        var realToCSSPixels = window.devicePixelRatio;
        
        // 获取浏览器显示的画布的CSS像素值
        // 然后计算出设备像素设置drawingbuffer
        var displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
        var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);
        
        // 检查画布尺寸是否相同
        if (gl.canvas.width  !== displayWidth ||
            gl.canvas.height !== displayHeight) {
        
            // 设置为相同的尺寸
            gl.canvas.width  = displayWidth;
            gl.canvas.height = displayHeight;
        }
    },
    checkGL(){
        if(!this._gl){
            console.log('gl 未准备好，你是否init过')
            return false;
        }else return this._gl;
    },
    createVertexShader(source){
        let gl = this.checkGL();
        if(!gl) return false;
        return this.createShader(gl, gl.VERTEX_SHADER, source);//gl.VERTEX_SHADER是一个表示着色器类型的内置常量
    },
    createFragmentShader(source){
        let gl = this.checkGL();
        if(!gl) return false;
        return this.createShader(gl, gl.FRAGMENT_SHADER, source);//gl.FRAGMENT_SHADER是一个表示着色器类型的内置常量
    },
    //type-着色器类型 source-数据源
    createShader(gl, type, source){
        let shader = gl.createShader(type);//创建着色器对象
        gl.shaderSource(shader, source);//提供数据源
        gl.compileShader(shader);//编译 -> 生成着色器
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(success)
            return shader;
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    },
    //创建一个着色程序并将输入的着色器链接到一起
    linkShader(shader1, shader2){
        let gl = this.checkGL();
        if(!gl) return false;
        let program = gl.createProgram();
        gl.attachShader(program, shader1);
        gl.attachShader(program, shader2);
        gl.linkProgram(program);
        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if(success)
            return program;
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
};