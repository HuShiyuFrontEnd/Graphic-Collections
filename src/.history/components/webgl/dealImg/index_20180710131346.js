import GL from '@/components/webgl/lib/initGL.js';
import m3 from '@/components/webgl/lib/m3.js';
import vertex from './vertex.html';
import fragment from './fragment.html';

let gl = GL.init();

let program = GL.createProgramByScript([vertex, fragment]);
gl.useProgram(program);

GL.createAttribute()