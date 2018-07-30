import GL from '@/components/webgl/lib/initGL.js';
import MAT4 from '@/components/webgl/lib/m4.js';
import vertex from './vertex.html';
import fragment from './fragment.html';
import GUI from '@/components/webgl/lib/dat.gui.js';

let gl = GL.init();
let gui = new GUI();

let program = GL.createProgramByScript([vertex, fragment]);
GL.useProgram(program);


let Fwidth = 150;
let Fheight = 250;
let Fbar = 40;
function drawF(barWidth, height, width){
    let points = [
        ...[0, 0, barWidth, 0, 0, height, barWidth, 0, 0, height, barWidth, height],
        ...[barWidth, 0, width, 0, barWidth, barWidth, width, 0, barWidth, barWidth, width, barWidth],
        ...[barWidth, height/2 - barWidth, width/3*2, height/2 - barWidth, barWidth, height/2, width/3*2, height/2 - barWidth, barWidth, height/2, width/3*2, height/2]
    ];
    let insertLength = points.length / 2;
    var i = 0;
    while(i < insertLength){
        points.splice(2 + i * 3, 0, 0);
        i++;
    }
    return {
        points:points,
        primitiveType:gl.TRIANGLES
    }
}

//可以只绘制正三角(三个顶点的顺序是逆时针)
gl.enable(gl.CULL_FACE);
GL.createAttribute('a_position',{
    size:3,
    type:gl.FLOAT
});
GL.createAttribute('a_color',{
    size:4,
    type:gl.FLOAT
});
GL.setAttribute('a_position',GL.cube(0, 0, 0, 200, 200, 200));
GL.setAttribute('a_color',{
    points:[
        1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
        1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
        0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
        0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
        0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1,
        0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1,
    ],
    primitiveType:gl.TRIANGLES
});

// let uColor = GL.createUniform('u_color');
// gl.uniform4f(uColor, 1, 0.8, 0.5, 1);

let uMatrix = GL.createUniform('u_matrix');
let Matrix = new MAT4();
Matrix.projection(gl.canvas.width, gl.canvas.height, 1000);
let translation = [0, 0, 0];
let scale = [1, 1 ,1];
let rotateX = 0;
let rotateY = 0;
let rotateZ = 0;

function move(){
    GL.viewport();
    gl.clearColor(0, 0, 0, 0);//清空画布时用的色彩
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    Matrix.restore();
    Matrix.save();
    Matrix.translate(translation);
    if(rotateX != 0) Matrix.rotateX(rotateX);
    if(rotateY != 0) Matrix.rotateY(rotateY);
    if(rotateZ != 0) Matrix.rotateZ(rotateZ);
    Matrix.scale(scale);
    gl.uniformMatrix4fv(uMatrix, false, Matrix.matrix);

    GL.drawAttr('a_position');
}

//画一个四边形，传入四个点和color
function createCube(vertexs, color){
    return {
        points:[
            vertexs[0], vertexs[1], vertexs[2], vertexs[1], vertexs[2], vertexs[3]
        ],
        color:color
    }
}

let guiSetting = {
    'X位移':0,
    'Y位移':0,
    'Z位移':0,
    'X轴旋转':0,
    'Y轴旋转':0,
    'Z轴旋转':0,
    '缩放':1
}
let guiTranslate = gui.addFolder('平移');
guiTranslate.open();
guiTranslate.add(guiSetting, 'X位移', 0, gl.canvas.width-Fwidth).onChange(function(val){
    translation[0] = val;
    move();
});
guiTranslate.add(guiSetting, 'Y位移', 0, gl.canvas.height-Fheight).onChange(function(val){
    translation[1] = val;
    move();
});
guiTranslate.add(guiSetting, 'Z位移', -500, 500).onChange(function(val){
    translation[2] = val;
    move();
});
let guiRotate = gui.addFolder('旋转');
guiRotate.open();
let Radians = 180 / Math.PI;
guiRotate.add(guiSetting, 'X轴旋转', 0, 360).onChange(function(val){
    rotateX = val / Radians;
    move();
});
guiRotate.add(guiSetting, 'Y轴旋转', 0, 360).onChange(function(val){
    rotateY = val / Radians;
    move();
});
guiRotate.add(guiSetting, 'Z轴旋转', 0, 360).onChange(function(val){
    rotateZ = val / Radians;
    move();
});
gui.add(guiSetting, '缩放', 0.1, 10).onChange(function(val){
    scale = [val, val, val];
    move();
});

move();