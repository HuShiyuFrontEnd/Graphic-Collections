import GL from '@/components/webgl/lib/initGL.js'
import m3 from '@/components/webgl/lib/m3.js'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'

let gl = GL.init()

let program = GL.createProgramByScript([vertex, fragment])

gl.useProgram(program)
GL.createAttribute(program, 'a_position', {
  size: 2,
  type: gl.FLOAT
})
GL.setAttribute('a_position', GL.circle(200, 350, 600, 50))

function createRandomColorVec4() {
  return [Math.random(), Math.random(), Math.random(), 1]
}

GL.createAttribute(program, 'a_color', {
  size: 4,
  type: gl.FLOAT
})
GL.circle(100, 350, 600, 50)
let color_points = []
let length = 52
for (let i = 0; i < length; i++) {
  color_points.push(...[i / length, (length - i) / length, (length - i) / length, 1])
}
// let color_points = [];
// for(let i = 0;i<4;i++ ){
//     color_points.push(...createRandomColorVec4());
// }
GL.setAttribute('a_color', {
  points: color_points,
  primitiveType: gl.TRIANGLE_FAN
})

let uniformMatrix = gl.getUniformLocation(program, 'u_matrix')

let translation = [0, 0]
let angleInRadians = 0
let scale = [1, 1]

// 设置视窗
GL.viewport()
// 清空画布
gl.clearColor(0, 0, 0, 0)// 清空画布时用的色彩
gl.clear(gl.COLOR_BUFFER_BIT)

let matrix = m3.projection(gl.canvas.width, gl.canvas.height)
matrix = m3.translate(matrix, translation[0], translation[1])
matrix = m3.rotate(matrix, angleInRadians)
matrix = m3.scale(matrix, scale[0], scale[1])
gl.uniformMatrix3fv(uniformMatrix, false, matrix)

GL.drawAttr('a_position')

console.log(gl)
