import GL from '@/components/webgl/lib/initGL.js';
import vertex from './vertex.html';
import fragment from './fragment.html';

let gl = GL.init();

//准备着色器
let vertex_shader = GL.createVertexShader(vertex);
let fragement_shader = GL.createFragmentShader(fragment);
let program = GL.linkShader(vertex_shader, fragement_shader);

//查找GLSL中所需属性的位置
let attribute_position = gl.getAttribLocation(program, 'position');

//创建保存属性数据的缓冲区
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);//gl.ARRAY_BUFFER是一个绑定点，相当于一个全局变量，将数据源绑定到绑定点后，就可以引用绑定点指向数据源

let positions = [
    0, 0,
    0, 0.5,
    0.7, 0
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);//gl.STATIC_DRAW提供给webGL这个数据推荐的优化思路，这里表示这个数据不太经常更新，webGL会根据你的提示来做一些优化。
//这里是将序列化的位置信息绑定到绑定点，

//设置视窗
GL.viewport();

//清空画布
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

//使用着色器
gl.useProgram(program);
gl.enableVertexAttribArray(attribute_position);

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

let size = 2;//每次迭代运行提取两个单位数据
let type = gl.FLOAT; //每个单位的数据类型是32位浮点数
let normalize = false; //不需要归一化数据
let stride = 0; // = 移动单位数量 * 每个单位占用内存(sizeof(type)) 
//每次迭代运动多少内幕才能到下一个数据开始点
let offset = 0; //从缓冲的多少位开始读取
gl.vertexAttribPointer(attribute_position, size, type, normalize, stride, offset);