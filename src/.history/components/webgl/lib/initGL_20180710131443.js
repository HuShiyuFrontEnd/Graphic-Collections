let $canvas = document.getElementById('canvas');
let _width = window.innerWidth;
let _height = window.innerHeight;
let gl;

let defaultShaderType = [];

function resize(){
    if(!gl) return false;
    var realToCSSPixels = window.devicePixelRatio;
    
    // 获取浏览器显示的画布的CSS像素值
    // 然后计算出设备像素设置drawingbuffer
    var displayWidth  = Math.floor(window.innerWidth  * realToCSSPixels);
    var displayHeight = Math.floor(window.innerHeight * realToCSSPixels);
    
    // 检查画布尺寸是否相同
    if (gl.canvas.width  !== displayWidth ||
        gl.canvas.height !== displayHeight) {
        
        // 设置为相同的尺寸
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;
    }
    
    _width = displayWidth;
    _height = displayHeight;
}

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
    init(options){
        if(!options) var options = {};
        gl = this._canvas.getContext('webgl', options) || this._canvas.getContext('experimental-webgl', options);
        if(!gl){
            console.log('没有对webgl的支持')
        }else{
            window.gl = gl;
            defaultShaderType = [gl.VERTEX_SHADER,gl.FRAGMENT_SHADER];
            resize();
            window.addEventListener('resize',resize);
            return gl;
        }
    },
    /** 
     * @param {String} source 着色器的脚本文本 
     */
    createVertexShader(source){
        return this.createShader(gl.VERTEX_SHADER, source);//gl.VERTEX_SHADER是一个表示着色器类型的内置常量
    },
    /** 
     * @param {String} source 着色器的脚本文本 
     */
    createFragmentShader(source){
        return this.createShader(gl.FRAGMENT_SHADER, source);//gl.FRAGMENT_SHADER是一个表示着色器类型的内置常量
    },
    /** 
     * @param {Constant} type 要创建的脚本类型，是一个webgl内置常量 gl.FRAGMENT_SHADER/gl.VERTEX_SHADER
     * @param {String} source 着色的脚本文本 
     */
    //type-着色器类型 source-数据源
    createShader(type, source){
        let shader = gl.createShader(type);//创建着色器对象
        gl.shaderSource(shader, source);//提供数据源
        gl.compileShader(shader);//编译 -> 生成着色器
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(success)
            return shader;
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    },
    /** 
     * @param {WebGLShader} shader1 
     * @param {WebGLShader} shader2 创建WebGLProgram所需的片元着色器和顶点着色器
     */
    //创建一个着色程序并将输入的着色器链接到一起
    linkShader(shader1, shader2){
        let program = gl.createProgram();
        gl.attachShader(program, shader1);
        gl.attachShader(program, shader2);
        gl.linkProgram(program);
        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if(success)
            return program;
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    },
    /** 
     * @param {String[]} sourceList 着色器的脚本文本列表
     */
    createProgramByScript(sourceList){
        let shaders = [];
        for(let i = 0;i < sourceList.length;i++){
            let shader = this.createShader(defaultShaderType[i], sourceList[i]);
            shaders.push(shader);
        }
        return this.createProgram(shaders);
    },
    /**
     * 用一系列的参数，迅速生成着色器程序
     * @param {WebGLShader} shaders 
     * @param {string[]} attribs 
     * @param {number[]} locations 
     * @param {function} callback 
     */
    createProgram(shaders, attribs, locations, callback){
        let program = gl.createProgram();
        shaders.forEach((shader) => {
            gl.attachShader(program, shader);
        });
        //do something to deal with the location and attrib
        gl.linkProgram(program);
        // Check the link status
        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if(success)
            return program;
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    },
    /**
     *  @param {WebGLProgram} program 
     */
    useProgram(program){

    },
    /**
     *  @param {WebGLProgram} program 
     *  @param {string} attrname
     *  @param {object} setting
     *  size //每次迭代运行提取两个单位数据 2
        type //每个单位的数据类型是32位浮点数 gl.FLOAT
        normalize 不需要归一化数据 false
        stride // = 移动单位数量 * 每个单位占用内存(sizeof(type)) //每次迭代运动多少字节才能到下一个数据开始点 0
        offset //从缓冲的多少位开始读取 0
     */
    Attribute:{},
    createAttribute(program, attrname, setting){
        let attr = gl.getAttribLocation(program, attrname);
        this.Attribute[attrname] = {
            position:attr,
            setting:setting
        }
        return attr;
    },
    activateAttribute(attrname){
        let attr = this.Attribute[attrname].position;
        let setting = this.Attribute[attrname].setting;
        gl.enableVertexAttribArray(attr);
        //第四个参数是normalizeFlag，标准化数据，例如，一般颜色使用一个gl.FLOAT类型的0.0 ~ 1.0的数据来表示，但是你也可以使用
        //UNSIGNED_BYTE来设置一个0到255的数据，通过标准化数据后，变成0.0和1.0，节省了大量的空间,对应的ArrayBuffer的类型也要更换
        gl.vertexAttribPointer(attr, setting.size, setting.type, false, 0, 0);
    },
    createBuffer(){
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        return buffer;
    },
    viewport(){
        gl.viewport(0, 0, _width, _height);
    },
    //Geometry : {points:Array, primitiveType:type}
    setAttribute(attrname, geometry){
        let buffer = gl.createBuffer();
        this.Attribute[attrname].buffer = buffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(geometry.points),
            gl.STATIC_DRAW
        );
        let setting = this.Attribute[attrname].setting;
        setting.count = geometry.points.length / setting.size;
        setting.primitiveType = geometry.primitiveType;
        this.activateAttribute(attrname);
    },
    //gl.POINTS gl.LINE_STRIP gl.LINE_LOOP gl.LINES gl.TRIANGLE_STRIP gl.TRIANGLE_FAN gl.TRIANGLES
    rect(x1, y1 ,width, height){
        let x2 = x1 + width;
        let y2 = y1 + height;
        return {
            points:[
                x1, y1, x2, y1, x1, y2, x2, y2
            ],
            primitiveType:gl.TRIANGLE_STRIP
        }
    },
    circle(r, x, y, section){
        if(!section) section = Math.floor(r);
        let points = [x, y];
        let oneRoundRadiansUnit = Math.PI * 2 / section;
        for(let i = 0;i <= section;i++){
            points.push(x + Math.sin(oneRoundRadiansUnit * i) * r);
            points.push(y + Math.cos(oneRoundRadiansUnit * i) * r);
        }
        return{
            points:points,
            primitiveType:gl.TRIANGLE_FAN
        }
    },
    bezier(){

    },
    drawAttr(attrname, setting){
        if(!setting) setting = {};
        let primitiveType = setting.type || this.Attribute[attrname].setting.primitiveType || gl.TRIANGLES;
        let offset = setting.offset || 0;
        let count = setting.count || this.Attribute[attrname].setting.count;
        gl.drawArrays(primitiveType, offset, count);
    }
};