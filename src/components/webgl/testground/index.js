console.log("this is main js for piece - testground in project webgl")

import { GL , Program } from '@/components/webgl/lib/initGL.1.1.js';
// import { Update } from '../../canvas/engineremake/core/core';

//初始化
let gl = GL.init({alpha: false, depth: false, stencil: false, antialias: true});
gl.clearColor(.0, .0, .0, 1.0);

//加载扩展，webgl2是可以不加载直接调用的，但是这里还是需要加载一下
//增加了16位（所谓的半浮点）、32位浮点的支持
let halfFloat = gl.getExtension('OES_texture_half_float'); //有一个_linear的，是带有线性过滤的，gl.LINEAR
let halfFloatLinear = gl.getExtension('OES_texture_half_float_linear');
if (GL._isWebGL2) {
    gl.getExtension('EXT_color_buffer_float');
    halfFloatLinear = gl.getExtension('OES_texture_float_linear');
}

let TEXTURE_DOWNSAMPLE = 1; //设定贴图尺寸右移的位数
let DENSITY_DISSIPATION = 0.98; //密度（？浓度）扩散
let VELOCITY_DISSIPATION = 0.99; //速度扩散
let SPLAT_RADIUS = 0.005; //劈裂半径？
let CURL = 30; //卷曲
let PRESSURE_ITERATIONS = 25; //压力迭代

let baseVS = GL.createVertexShader(`
    precision highp float;
    precision mediump sampler2D;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize; //贴图尺寸

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`);

let displayFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;  

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`);

let splatFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`);

//流体（用手操控）
let advectionManualFilterFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    vec4 bilerp (in sampler2D sam, in vec2 p) {
        vec4 st;
        st.xy = floor(p - 0.5) + 0.5;
        t.zw = st.xy + 1.0;
        vec4 uv = st * texelSize.xyxy;
        vec4 a = texture2D(sam, uv.xy);
        vec4 b = texture2D(sam, uv.zy);
        vec4 c = texture2D(sam, uv.xw);
        vec4 d = texture2D(sam, uv.zw);
        vec2 f = p - st.xy;
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main () {
        vec2 coord = gl_FragCoord.xy - dt * texture2D(uVelocity, vUv).xy;
        gl_FragColor = dissipation * bilerp(uSource, coord);
        gl_FragColor.a = 1.0;
    }
`);

let advectionFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;

    void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
    }
`)

//分叉、分歧
let divergenceFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;

    vec2 sampleVelocity (in vec2 uv) {
        vec2 multiplier = vec2(1.0, 1.0);
        if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }
        if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }
        if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }
        if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }
        return multiplier * texture2D(uVelocity, uv).xy;
    }

    void main () {
        float L = sampleVelocity(vL).x;
        float R = sampleVelocity(vR).x;
        float T = sampleVelocity(vT).y;
        float B = sampleVelocity(vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`);

//螺旋卷曲
let curlFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
    }
`);

//涡度
let vorticityFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).y;
        float R = texture2D(uCurl, vR).y;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L));
        force *= 1.0 / length(force + 0.00001) * curl * C;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
    }
`);

//压力
let pressureFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    vec2 boundary (in vec2 uv) {
        uv = min(max(uv, 0.0), 1.0);
        return uv;
    }

    void main () {
        float L = texture2D(uPressure, boundary(vL)).x;
        float R = texture2D(uPressure, boundary(vR)).x;
        float T = texture2D(uPressure, boundary(vT)).x;
        float B = texture2D(uPressure, boundary(vB)).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`);

//渐变减去
let gradientSubtractFS = GL.createFragmentShader(`
    precision highp float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    vec2 boundary (in vec2 uv) {
        uv = min(max(uv, 0.0), 1.0);
        return uv;
    }

    void main () {
        float L = texture2D(uPressure, boundary(vL)).x;
        float R = texture2D(uPressure, boundary(vR)).x;
        float T = texture2D(uPressure, boundary(vT)).x;
        float B = texture2D(uPressure, boundary(vB)).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`);

let blit = function(){
    GL.createBuffer();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, new Float32Array([0, 1, 2, 0, 1, 3]), gl.STATIC_DRAW);
    //这边感觉在默认认定顶点着色器属性的position为0（即开辟的这个buffer的最开始位置），当然这样也就是这有一个属性，所以也不需要关心属性名
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    //这个destination是一个frame buffer object
    return function(destination){
        gl.bindFrameBuffer(gl.FRAMEBUFFER, destination); //相当于将后面的gl的绘制对象改掉了
        //mode, count, type, offset
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
}

function clear(target){
    gl.bindFrameBuffer(gl.FRAMEBUFFER, target);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function createFBO(texId, w, h, internalFormat, format, type, param){
    //激活纹理单元，一般的浏览器环境，会有4/8/16个纹理单元，对应会有查询方法
    //将其设定为当前纹理
    gl.activeTexture(gl.TEXTURE0 + texId);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //设置纹理的缩放、延展策略
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //target / level(0) /internaformat(gl.RGBA) / width / height / border / format / type / ArrayBufferView?pixels
    //这个方法初始化了一张贴图
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    var fbo = gl.createFramebuffer();
    gl.bindFrameBuffer(gl.FRAMEBUFFER, fbo);
    //target / attachment / texTarget / texture / level
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return [texture, fbo, texId];
}

//两个fbo，猜测是用来对图像进行多次处理的
function createDoubleFBO(texId, w, h, internalFormat, format, type, param) {
    var fbo1 = createFBO(texId, w, h, internalFormat, format, type, param);
    var fbo2 = createFBO(texId + 1, w, h, internalFormat, format, type, param);

    return {
        get first() {
            return fbo1;
        },
        get second() {
            return fbo2;
        },
        swap: function swap() {
            var temp = fbo1;
            fbo1 = fbo2;
            fbo2 = temp;
        }
    };
}

//贴图尺寸
var textureWidth = undefined;
var textureHeight = undefined;
//密度
var density = undefined;
//速度
var velocity = undefined;
//离散
var divergence = undefined;
//螺旋卷曲
var curl = undefined;
//压力
var pressure = undefined;

function initFrameBuffer(){
    //drawingBufferWidth property represents the actual width of the current drawing buffer
    //as canvas's width and height
    textureWidth = gl.drawingBufferWidth >> TEXTURE_DOWNSAMPLE;
    textureHeight = gl.drawingBufferHeight >> TEXTURE_DOWNSAMPLE;
    
    var internalFormat = isWebGL2 ? gl.RGBA16F : gl.RGBA;
    var internalFormatRG = isWebGL2 ? gl.RG16F : gl.RGBA;
    var formatRG = isWebGL2 ? gl.RG : gl.RGBA;
    var texType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;

    density = createDoubleFBO(0, textureWidth, textureHeight, internalFormat, gl.RGBA, texType, halfFloatLinear ? gl.LINEAR : gl.NEAREST);
    velocity = createDoubleFBO(2, textureWidth, textureHeight, internalFormatRG, formatRG, texType, halfFloatLinear ? gl.LINEAR : gl.NEAREST);
    divergence = createFBO(4, textureWidth, textureHeight, internalFormatRG, formatRG, texType, gl.NEAREST);
    curl = createFBO(5, textureWidth, textureHeight, internalFormatRG, formatRG, texType, gl.NEAREST);
    pressure = createDoubleFBO(6, textureWidth, textureHeight, internalFormatRG, formatRG, texType, gl.NEAREST);
}

//准备好计算用的fbo
initFramebuffers();

//准备好对应的program
var displayProgram = new GLProgram(baseVS, displayFV);
var splatProgram = new GLProgram(baseVS, splatFS);
var advectionProgram = new GLProgram(baseVS, halfFloatLinear ? advectionFS : advectionManualFilterFS);
var divergenceProgram = new GLProgram(baseVS, divergenceFS);
var curlProgram = new GLProgram(baseVS, curlFS);
var vorticityProgram = new GLProgram(baseVS, vorticityFS);
var pressureProgram = new GLProgram(baseVS, pressureFS);
var gradienSubtractProgram = new GLProgram(baseVS, gradientSubtractFS);

function pointerPrototype() {
    this.id = -1;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300];
}

let pointers = [];
pointers.push(new pointerPrototype);

function splat(x, y, dx, dy, color){
    splatProgram.use();
    //为啥sampler2D给一个贴图索引?采样器应该使用的纹理单元的索引作为参数
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.first[2]);
    gl.uniform1f(splatProgram.uniforms.aspectRatio, GL._canvas.width, GL._canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x / GL._canvas.width, 1.0 - y / GL._canvas.height);
    gl.uniform3f(splatProgram.uniforms.color);
    gl.uniform1f(splatProgram.uniforms.radius);
}

//
for(let i = 0; i < 1; i++){
    //生成一个随机的rgb颜色值
    let color = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
    let x = GL._canvas.width * Math.random();
    let y = GL._canvas.heihgt * Math.random();
    let dx = 1000 * (Math.random() - 0.5);
    let dy = 1000 * (Math.random() - 0.5);
    splat(x, y, dx, dy, color);
}

let lastTime = Date.now();
Update();

function Update(){

}