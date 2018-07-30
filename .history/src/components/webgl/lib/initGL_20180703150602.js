let $canvas = document.getElementById('canvas');
let _width = window.innerWidth;
let _height = window.innerHeight;

let gl = $canvas.getContext('webgl');
if(!gl){
    gl = {};
    console.log('没有对webgl的支持')
}

export default {
    get functon(){
        return this._gl;
    },
    init:function(options){

    }
};