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

    let translation = [gl.canvas.width/2, 0];
    matrix = m3.translate(matrix, ...translation);
    gl.uniformMatrix3fv(uMatrix, false, matrix);
    gl.uniform1i(uMode, 2);

    GL.drawAttr('a_position');

    console.log(leaves.height)
    translation = [-gl.canvas.width/2, leaves.height * 1.2];
    matrix = m3.translate(matrix, ...translation);
    gl.uniformMatrix3fv(uMatrix, false, matrix);
    gl.uniform1i(uMode, 3);

    GL.drawAttr('a_position');
});

