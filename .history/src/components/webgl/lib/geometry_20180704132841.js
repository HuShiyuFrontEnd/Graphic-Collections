let gl;

export default {
    init(gl){
        gl = gl;
    },
    setGeometry(){
        if(!gl){console.log('geometry.js需要初始化出gl');return false;}
        gl.buffer
    }
}