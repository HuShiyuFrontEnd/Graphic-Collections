import GL from '@/components/webgl/lib/initGL.js';
import m3 from '@/components/webgl/lib/m3.js';
import vertex from './vertex.html';
import fragment from './fragment.html';
import Subscriber from '@/components/common/subscriber.js'

let gl = GL.init();

let program = GL.createProgramByScript([vertex, fragment]);
GL.useProgram(program);

GL.createAttribute('a_position', {
    size:2,
    type:gl.FLOAT,
});
GL.createAttribute('a_texCoord',{
    size:2,
    type:gl.FLOAT
});
let uMatrix = gl.getUniformLocation(program, 'u_matrix');
let uMode = gl.getUniformLocation(program, 'u_mode');
let uKernel = gl.getUniformLocation(program, 'u_kernel');
let uKernelWeight = gl.getUniformLocation(program, 'u_kernelWeight');
let uImageSize = gl.getUniformLocation(program, 'u_imageSize');
let uImage = gl.getUniformLocation(program, 'u_image');

let assestList = {
    root:'/static/assets/',
    list:[
        'leaves.jpg'
    ]
}
GL.preload(assestList, (textures) => {
    let leaves = textures.leaves_jpg;
    
    GL.setAttribute('a_position',GL.rect(0, 0, leaves.width, leaves.height));
    GL.setAttribute('a_texCoord',{
        points:[
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.1, 1.1
        ],
        primitiveType:gl.TRIANGLE_STRIP
    });
    //去掉这段代码，依然能正常运行，全局变量默认使用纹理单元0，所以即使没有设置u_image,纹理单元也会
    //默认单元0为当前的活跃纹理
    let textureUnitIndex = 6;
    let u_imageLoc = gl.getUniformLocation(program, 'u_image');
    gl.uniform1i(uImage, textureUnitIndex);
    gl.activeTexture(gl.TEXTURE6);
    //or
    gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
    //-------------------------------------------
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, leaves);

    //设置视窗
    GL.viewport();
    //清空画布
    gl.clearColor(0, 0, 0, 0);//清空画布时用的色彩
    gl.clear(gl.COLOR_BUFFER_BIT);

    let matrix = m3.projection(gl.canvas.width, gl.canvas.height);
    gl.uniformMatrix3fv(uMatrix, false, matrix);
    gl.uniform1i(uMode, 1);

    GL.drawAttr('a_position');

    //色彩转换
    let translation = [gl.canvas.width/2, 0];
    matrix = m3.translate(matrix, ...translation);
    gl.uniformMatrix3fv(uMatrix, false, matrix);
    gl.uniform1i(uMode, 2);
    GL.drawAttr('a_position');

    //以下是图像处理的示例部分
    //https://docs.gimp.org/en/plug-in-convmatrix.html
    function computeKernelWeight(kernel){
        var weight = kernel.reduce(function(prev, curr){
            return prev + curr;
        });
        return weight <= 0 ? 1 : weight;
    }

    let edgeDetectKernel = [
        // -0.125, -0.125, -0.125,
        // -0.125,  1,     -0.125,
        // -0.125, -0.125, -0.125
         1.0,  1.0,  1.0,
         1.0,  -1.0,  1.0,
         1.0,  1.0,  1.0
    ];
    let edgeDetectKernelWeight = computeKernelWeight(edgeDetectKernel);
    translation = [ - gl.canvas.width/2, leaves.height * 1.2];
    matrix = m3.translate(matrix, ...translation);
    matrix = m3.scale(matrix, 3, 3);
    gl.uniformMatrix3fv(uMatrix, false, matrix);
    gl.uniform1i(uMode, 3);
    console.log(edgeDetectKernel, edgeDetectKernelWeight)
    gl.uniform1f(uKernelWeight, edgeDetectKernelWeight);
    gl.uniform1fv(uKernel, edgeDetectKernel);
    gl.uniform2f(uImageSize, leaves.width, leaves.height);
    GL.drawAttr('a_position');

    let normal = [
      0, 0, 0,
      0, 1, 0,
      0, 0, 0
    ];
    let gaussianBlur = [
      0.045, 0.122, 0.045,
      0.122, 0.332, 0.122,
      0.045, 0.122, 0.045
    ];
    let gaussianBlur2 = [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1
    ];
    let gaussianBlur3 = [
      0, 1, 0,
      1, 1, 1,
      0, 1, 0
    ];
    let unsharpen = [
      -1, -1, -1,
      -1,  9, -1,
      -1, -1, -1
    ];
    let sharpness = [
       0,-1, 0,
      -1, 5,-1,
       0,-1, 0
    ];
    let sharpen = [
       -1, -1, -1,
       -1, 16, -1,
       -1, -1, -1
    ];
    let edgeDetect = [
       -0.125, -0.125, -0.125,
       -0.125,  1,     -0.125,
       -0.125, -0.125, -0.125
    ];
    let edgeDetect2 = [
       -1, -1, -1,
       -1,  8, -1,
       -1, -1, -1
    ];
    let edgeDetect3 = [
       -5, 0, 0,
        0, 0, 0,
        0, 0, 5
    ];
    let edgeDetect4 = [
       -1, -1, -1,
        0,  0,  0,
        1,  1,  1
    ];
    let edgeDetect5 = [
       -1, -1, -1,
        2,  2,  2,
       -1, -1, -1
    ];
    let edgeDetect6 = [
       -5, -5, -5,
       -5, 39, -5,
       -5, -5, -5
    ];
    let sobelHorizontal = [
        1,  2,  1,
        0,  0,  0,
       -1, -2, -1
    ];
    let sobelVertical = [
        1,  0, -1,
        2,  0, -2,
        1,  0, -1
    ];
    let previtHorizontal = [
        1,  1,  1,
        0,  0,  0,
       -1, -1, -1
    ];
    let previtVertical = [
        1,  0, -1,
        1,  0, -1,
        1,  0, -1
    ];
    let boxBlur = [
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111
    ];
    let triangleBlur = [
        0.0625, 0.125, 0.0625,
        0.125,  0.25,  0.125,
        0.0625, 0.125, 0.0625
    ];
    let emboss = [
       -2, -1,  0,
       -1,  1,  1,
        0,  1,  2
    ]
});

