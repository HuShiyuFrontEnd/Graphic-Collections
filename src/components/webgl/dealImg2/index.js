import GL from '@/components/webgl/lib/initGL.js';
import m3 from '@/components/webgl/lib/m3.js';
import Kernel from '@/components/webgl/lib/kernel.js';
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
GL.preload(assestList, (source) => {
    let leaves = source.leaves_jpg;
    
    GL.setAttribute('a_position',GL.rect(0, 0, leaves.width, leaves.height));
    GL.setAttribute('a_texCoord',{
        points:[
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ],
        primitiveType:gl.TRIANGLE_STRIP
    });
    //去掉这段代码，依然能正常运行，全局变量默认使用纹理单元0，所以即使没有设置u_image,纹理单元也会
    //默认单元0为当前的活跃纹理
    let textureUnitIndex = 6;
    let u_imageLoc = gl.getUniformLocation(program, 'u_image');
    gl.uniform1i(uImage, textureUnitIndex);
    // gl.activeTexture(gl.TEXTURE6);
    //or
    gl.activeTexture(gl.TEXTURE0 + textureUnitIndex);
    //-------------------------------------------
    let originTexture = GL.createTexture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, leaves);
    
    let textures = [];
    let fbs = [];
    for(let i = 0;i < 2;i++){
        let texture = GL.createTexture();
        textures.push(texture);

        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, leaves.width, leaves.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        let fbo = gl.createFramebuffer();
        fbs.push(fbo);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        //最后一个参数是mipmap level
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }

    //设置视窗
    GL.viewport();
    //清空画布
    gl.clearColor(0, 0, 0, 0);//清空画布时用的色彩
    gl.clear(gl.COLOR_BUFFER_BIT);

    //原始贴图
    gl.bindTexture(gl.TEXTURE_2D, originTexture);
    gl.uniform2f(uImageSize, leaves.width, leaves.height);

    let kernelList = ['gaussianBlur', 'unsharpen',]// 'edgeDetect'];
    let kernelLength = kernelList.length;
    for(let i = 0;i < kernelLength;i++){
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[i%2]);

        let useKernel = Kernel(kernelList[i]);
        gl.uniform1f(uKernelWeight, useKernel.weight);
        gl.uniform1fv(uKernel, useKernel.kernel);
        
        let matrix = m3.projection(leaves.width, leaves.height);
        matrix[7] = -1;
        matrix[4] = -matrix[4];
        gl.uniformMatrix3fv(uMatrix, false, matrix);
        gl.viewport(0, 0, leaves.width, leaves.height);

        GL.drawAttr('a_position');

        gl.bindTexture(gl.TEXTURE_2D, textures[i%2]);
    }
    let matrix = m3.projection(gl.canvas.width, gl.canvas.height);//这个矩阵是会做y轴翻转的，而在帧缓冲中不可以这么做
    matrix = m3.scale(matrix, 2, 2);
    gl.uniformMatrix3fv(uMatrix, false, matrix);
    GL.viewport();
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    let useKernel = Kernel('normal');
    gl.uniform1f(uKernelWeight, useKernel.weight);
    gl.uniform1fv(uKernel, useKernel.kernel);
    GL.drawAttr('a_position');
});
