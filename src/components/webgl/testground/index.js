console.log("this is main js for piece - testground in project webgl")

import { GL , Program } from '@/components/webgl/lib/initGL.1.1.js';

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

let TEXTURE_DOWNSAMPLE = 1; 
let DENSITY_DISSIPATION = 0.98; //密度（？浓度）扩散
let VELOCITY_DISSIPATION = 0.99; //速度扩散
let SPLAT_RADIUS = 0.005; //劈裂半径？
let CURL = 30; //卷曲
let PRESSURE_ITERATIONS = 25; //压力迭代

