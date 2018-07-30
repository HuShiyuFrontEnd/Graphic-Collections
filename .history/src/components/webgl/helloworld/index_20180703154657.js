import GL from '@/components/webgl/lib/initGL.js';
import vertex from './vertex.html';
import fragment from './fragment.html';

let gl = GL.init();

let vertex_shader = GL.createVertexShader(vertex);
let fragement_shader = GL.createFragmentShader(fragment);


console.log(gl)