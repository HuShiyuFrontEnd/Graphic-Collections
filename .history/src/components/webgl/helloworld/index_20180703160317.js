import GL from '@/components/webgl/lib/initGL.js';
import vertex from './vertex.html';
import fragment from './fragment.html';

let gl = GL.init();

//准备着色器
let vertex_shader = GL.createVertexShader(vertex);
let fragement_shader = GL.createFragmentShader(fragment);
let program = GL.linkShader(vertex_shader, fragement_shader);

//查找GLSL中所需属性的位置
let attribute_position = gl.getAttributeLocation(program, 'position');

//创建保存属性数据的缓冲区
let positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);//gl.ARRAY_BUFFER是一个绑定点，相当于一个全局变量，将数据源绑定到绑定点后，就可以引用绑定点指向数据源