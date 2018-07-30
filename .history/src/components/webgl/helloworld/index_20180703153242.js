import GL from '@/components/webgl/lib/initGL.js';
import vertex from './vertex.html'

let gl = GL.init();

let vertex_shader = GL.createShader(vertex)

console.log(gl)