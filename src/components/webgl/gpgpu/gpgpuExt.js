var gl;

export default{
    init(GL){
        gl = GL;
        if(!this.getTextureFloat()) console.log('no float texure');
    },
    getTextureFloat(){
        return gl.getExtension('OES_texture_float');
    }
}
