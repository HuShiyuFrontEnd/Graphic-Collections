import GL from '@/components/webgl/lib/initGL.js';
import GP from './gpgpuExt.js';
import m3 from '@/components/webgl/lib/m3.js';
import m4 from '@/components/webgl/lib/m4.js';
import Kernel from '@/components/webgl/lib/kernel.js';
import vertex from './vertex.html';
import fragment from './fragment.html';
import Subscriber from '@/components/common/subscriber.js';

let gl = GL.init({alpha: false, depth: false, antialias: false});//
let floatTexture = gl.getExtension('OES_texture_float');
console.log(floatTexture)

GP.init(gl);

let program = GL.createProgramByScript([vertex, fragment]);
GL.useProgram(program);

GL.createAttribute('a_pos', {
    size:2,
    type:gl.FLOAT,
});
// GL.createAttribute('a_multi',{
//     size:2,
//     type:gl.FLOAT
// });
// GL.createAttribute('v_texCoord',{
//     size:2,
//     type:gl.FLOAT
// });
GL.setAttribute('a_pos',{
    points:[
        1, 1,
        1, 2,
        2, 1,
        2, 2
        // 0, 0,
        // 2, 0,
        // 0, 2,
        // 2, 0,
        // 0, 2,
        // 2, 2
    ],
    primitiveType:gl.POINTS,
});
//GL.setAttribute('a_multi',{
//     points:[
//         1.212313211, 1.3412432111423234,
//         1.214321231, 1.1432412214213,
//         1.216536231, 1.134214214321421,
//         1.212544631, 1.4213421421234213,
//     ],
//     primitiveType:gl.POINTS,
// });
// GL.setAttribute('v_texCoord',{
//     points:[
//         0, 0,
//         0, 1,
//         1, 0,
//         0, 1,
//         1, 0,
//         1, 1,
//     ],
//     primitiveType:gl.TRIANGLES,
// });
var data = [
    1.212313211, 1.3412432111423234, 1.214321231, 1.1432412214213,
    1.216536231, 1.134214214321421, 1.212544631, 1.4213421421234213,
    1.212313211, 1.3412432111423234, 1.214321231, 1.1432412214213,
    1.216536231, 1.134214214321421, 1.212544631, 1.4213421421234213,
];
let uMatrix = gl.getUniformLocation(program, 'u_matrix');
// let matrix = m3.projection(4, 4);
gl.uniformMatrix4fv(uMatrix, false, data);

//贴图和帧缓冲
let texture = GL.createTexture();
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, gl.FLOAT, null);
let fbo = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

//设置视窗
// gl.viewport(0, 0, 256, 256);
gl.viewport(0, 0, 2, 2);
//清空画布
gl.clearColor(0, 0, 0, 0);//清空画布时用的色彩
gl.clear(gl.COLOR_BUFFER_BIT);

GL.drawAttr('a_pos');

let backBuffer = new Float32Array(16);
gl.readPixels(0,                // x-coord of lower left corner
    0,                // y-coord of lower left corner
    2,                // width of the block
    2,                // height of the block
    gl.RGBA,          // Format of pixel data.
    gl.FLOAT, // Data type of the pixel data, must match makeTexture
    backBuffer);
// for(var i = 0;i<backBuffer.length;i+=4){
//     console.log(backBuffer[i], backBuffer[i + 1], backBuffer[i + 2], backBuffer[i + 3],'-' + i + '-')
// }

//这里测试的
console.log('做第一组-乘法的性能测试,4组浮点数乘以浮点数');
console.log('单纯的乘法计算，计算性能的优势会被cpu从gpu的帧缓冲中取值的开销掩盖');
console.log('最简单的浮点乘法的运算结果，cpu比gpu还快上几百倍（gpu包含了额外的和cpu的交互开销）');
console.log('做第二组-矩阵乘法的性能测试,4*4浮点数矩阵相乘');
console.log('做第二组-矩阵乘法的性能测试,4*4浮点数矩阵连乘三次');
console.log('随着计算的复杂程度不断提升，gpu和cpu的用时差距不断缩小')

runTestManyTimes('cpu计算',function(){
    //第一次测试是乘法
    // var a = data[0] * data[1];
    // var b = data[2] * data[3];
    // var c = data[4] * data[5];
    // var d = data[6] * data[7];
    //第二次测试，矩阵乘法
    m4.prototype.multiply(m4.prototype.multiply(m4.prototype.multiply(data, data), data), data)
},100000, 10);

let testBuffer = new Float32Array(16);
// GL.setAttribute('a_multi',{
//     points:data,
//     primitiveType:gl.POINTS,
// });
runTestManyTimes('gpu计算',function(){
    GL.drawAttr('a_pos');
    // gl.readPixels(0, 0, 2, 2, gl.RGBA, gl.FLOAT, testBuffer);
},100000, 10);

function runScriptManyTimes(func,times){
    var startTime = Date.now();
    var endTime;
    for(var i = 0;i < times;i++){
        func();
    }
    endTime = Date.now();
    // console.log(`运行${times}次，使用了${endTime-startTime}ms`);
    return endTime-startTime;
}

function runTestManyTimes(name,func,scripttimes,testTimes){
    let result = [];
    for(var i = 0;i < testTimes;i++){
        result.push(runScriptManyTimes(func,scripttimes));
    }
    let timesword = '';
    let maxtime = 0;
    let mintime = 10000000;
    let averagetime = 0;
    for(var i = 0;i < testTimes;i++){
        let current = result[i];
        maxtime = Math.max(maxtime, current);
        mintime = Math.min(mintime, current);
        averagetime += current;
        timesword += (i > 0?',':'') + current; 
    }
    let resultWord = `运行${testTimes}次测试，每次运行代码${scripttimes}次，平均每次测试时间为${averagetime/testTimes},最大值为${maxtime},最小值为${mintime},所有值为${timesword}`;
    console.log(name,resultWord);
}