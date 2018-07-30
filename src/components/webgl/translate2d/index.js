import GL from '@/components/webgl/lib/initGL.js';
import m3 from '@/components/webgl/lib/m3.js';
import vertex from './vertex.html';
import fragment from './fragment.html';
import GUI from '@/components/webgl/lib/dat.gui.js'

let gui = new GUI();

let gl = GL.init();

let program = GL.createProgramByScript([vertex, fragment]);

gl.useProgram(program);
GL.createAttribute(program, 'a_position',{
    size:2,
    type:gl.FLOAT,
});
let Fwidth = 150;
let Fheight = 250;
let Fbar = 30;
GL.setAttribute('a_position',drawF(Fbar, Fheight, Fwidth));

function drawF(barWidth, height, width){
    let points = [
        ...[0, 0, barWidth, 0, 0, height, barWidth, 0, 0, height, barWidth, height],
        ...[barWidth, 0, width, 0, barWidth, barWidth, width, 0, barWidth, barWidth, width, barWidth],
        ...[barWidth, height/2 - barWidth, width/3*2, height/2 - barWidth, barWidth, height/2, width/3*2, height/2 - barWidth, barWidth, height/2, width/3*2, height/2]
    ];
    return {
        points:points,
        primitiveType:gl.TRIANGLES
    }
}

function createRandomColorVec4(){
    return [Math.random(), Math.random(), Math.random(), 1];
}

GL.createAttribute(program, 'a_color',{
    size:4,
    type:gl.FLOAT,
});
// let color_points = [];
// let length = 52;
// for(let i = 0;i < length;i++ ){
//     color_points.push(...[i/length,(length-i)/length,(length-i)/length,1]);
// }
let color_points = [];
var color = createRandomColorVec4();
for(let i = 0;i<18;i++ ){
    color_points.push(...color);
}
GL.setAttribute('a_color',{
    points:color_points,
    primitiveType:gl.TRIANGLE_FAN
})

let uniformMatrix = gl.getUniformLocation(program, "u_matrix");

let translation = [0, 0];
let angleInRadians = 0;
let scale = [1, 1];

let GUISetting = {
    'x轴移动':0,
    'y轴移动':0,
    '旋转(度)':0,
    'x轴缩放':1,
    'y轴缩放':1
}

gui.add(GUISetting, 'x轴移动', 0, gl.canvas.width-Fwidth).onChange(moveX);
gui.add(GUISetting, 'y轴移动', 0, gl.canvas.height-Fheight).onChange(moveY);
gui.add(GUISetting, '旋转(度)', 0, 360).onChange(rotate);
gui.add(GUISetting, 'x轴缩放', 0.1, 10).onChange(scaleX);
gui.add(GUISetting, 'y轴缩放', 0.1, 10).onChange(scaleY);
function moveX(x){
    translation[0] = x;
    move();
}
function moveY(y){
    translation[1] = y;
    move();
}
const RADIANS_UNIT = 180/Math.PI;
function rotate(ang){
    angleInRadians = ang / RADIANS_UNIT;
    move();
}
function scaleX(value){
    scale[0] = value;
    move();
}
function scaleY(value){
    scale[1] = value;
    move();
}
function move(){
    //设置视窗
    GL.viewport();
    //清空画布
    gl.clearColor(0, 0, 0, 0);//清空画布时用的色彩
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let matrix = m3.projection(gl.canvas.width, gl.canvas.height);
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);
    gl.uniformMatrix3fv(uniformMatrix, false, matrix);
    
    GL.drawAttr('a_position');
}
move()

console.log(gl)