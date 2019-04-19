import GL from '@/components/webgl/lib/initGL.js'
// import m3 from '@/components/webgl/lib/m3.js'
// import Subscriber from '@/components/common/subscriber.js'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

let gl = GL.init()

let program = GL.createProgramByScript([vertex, fragment])
