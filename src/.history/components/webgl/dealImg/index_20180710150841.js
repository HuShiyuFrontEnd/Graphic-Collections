import GL from '@/components/webgl/lib/initGL.js';
import m3 from '@/components/webgl/lib/m3.js';
import vertex from './vertex.html';
import fragment from './fragment.html';
import Subscriber from '@/components/common/subscriber.js'

let gl = GL.init();

let program = GL.createProgramByScript([vertex, fragment]);
GL.useProgram(program);

GL.createAttribute('position', {
    size:2,
    type:gl.FLOAT,
});
GL.createAttribute('texCoord',{
    size:2,
    type:gl.FLOAT
});
let uMatrix = m3.projection(gl.canvas.width, gl.canvas.height);

let assestList = {
    root:'/static/assets/',
    list:[
        'leaves.jpg'
    ]
}
GL.preload(assestList, (textures) => {
    let leaves = textures.leaves_jpg;
    console.log(GL.rect(0, 0, leaves.width, leaves.height))
    GL.setAttribute('position',GL.rect(0, 0, leaves.width, leaves.height));
    GL.setAttribute('texCoord',{
        points:[
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.1, 1.1
        ]}
    );
    //设置视窗
    GL.viewport();
    //清空画布
    gl.clearColor(0, 0, 0, 0);//清空画布时用的色彩
    gl.clear(gl.COLOR_BUFFER_BIT);
    GL.drawAttr('position')
})
