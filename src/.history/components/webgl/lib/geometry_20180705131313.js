var gl;

export default {
    init(GL){
        gl = GL;
    },
    setGeometry(){
        if(!gl){console.log('geometry.js需要初始化出gl');return false;}
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                0, -100,
                150, 124,
                -175, 100
            ]),
            gl.STATIC_DRAW
        );
    },
    drawScene(){
        if(!gl){console.log('geometry.js需要初始化出gl');return false;}
        let primitiveType = gl.TRIANGLES;
        let offset = 0;
        let count = 3;
        gl.drawArrays(primitiveType, offset, count);
    }
}