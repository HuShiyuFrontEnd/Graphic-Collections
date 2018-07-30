import {THREE, GUI, Quick, RAFStackObj} from '../lib/base.js';
import birdVertex from './birdVertex.html';
import birdFragment from './birdFragment.html';

let scene = new THREE.Scene();

let renderer = Quick.createRenderer({
    shadowEnabled:true,
    shadowType:THREE.PCFSoftShadowMap
});

let axe = new THREE.AxesHelper(20);
scene.add(axe);

let BIRDS = 3;
THREE.BirdGeometry = function(){
    var triangles = BIRDS * 3;//一只鸟由三个三角形简单组成
    var points = triangles * 3;//每个三角形三个点

    THREE.BufferGeometry.call(this);//继承

    //分别对应的应该是 gl.bindBuffer 和 设置size
    var vertices = new THREE.BufferAttribute( new Float32Array(points * 3), 3);
    var birdColors = new THREE.BufferAttribute( new Float32Array(points * 3), 3);
    var references = new THREE.BufferAttribute( new Float32Array(points * 2), 2);
    var birdVertex = new THREE.BufferAttribute( new Float32Array(points), 1);
    var birdWing = new THREE.BufferAttribute( new Float32Array(points), 1);

    this.addAttribute('position', vertices);
    this.addAttribute('birdColor', birdColors);
    this.addAttribute('reference', references);
    this.addAttribute('birdVertex', birdVertex);

    var v = 0;
    function verts_push(){
        for(let i = 0;i < arguments.length; i++){
            vertices.array[v++] = arguments[i];
        }
    }

    var WIDTH = 1;
    var wingsSpan = 20;//hmmm...可以理解为翼展吗。。
    for(var f = 0; f<BIRDS; f++){
        //这里其实是为了看着容易理解才这么写的，，其实。。。写成一次输入27个点是一样的。
	    // Body
        verts_push(
            0, -0, -20,
            0, 4, -20,
            0, 0, 30,
        );
        //左右翼为何第一个点和第三个点是反的？可能性之一是，，为了保持从某一个方向看去，三角形的正逆方向都为同一个方向 详细的可能和这个api有关 gl.enable(gl.CULL_FACE);
        //left wing emmm。。。在没有基准方向的条件下，，，左右貌似没有意义，所以这里应该以鸟头为正方向（body三角形的尖端）
        verts_push(
            0, -0, -15,
            -wingsSpan, 0, 0,
            0, 0, 15,
        );
        //right wing
        verts_push(
            0, -0, 15,
            wingsSpan, 0, 0,
            0, 0, -15,
        );
    }
    for( var v = 0; v < points; v++ ){
        //i - 第几个triangle 将原
        var i = ~~(v/3);//~~ 先parseNumber，然后去掉小数位（既不是floor，也不是ceil）
        var x = (i % WIDTH) / WIDTH;
        var y = ~~( i / WIDTH) / WIDTH;

        var c = new THREE.Color(
            0x444444 + ~~( v / 9 ) / BIRDS / 0x666666
        );

        birdColors.array[ v * 3 + 0 ] = c.r;
        birdColors.array[ v * 3 + 1 ] = c.g;
        birdColors.array[ v * 3 + 2 ] = c.b;

        references.array[ v * 2 ] = x;
        references.array[ v * 2 + 1 ] = y;

        birdVertex.array[ v ] = v % 9;//

        birdWing.array[ v ] = 0.0;
    }

    this.scale(0.2, 0.2, 0.2);
}
THREE.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );

//初始化鸟群
let birdsGeo = new THREE.BirdGeometry();
let birdUniforms = {
    color: { value:new THREE.Color(0xff2200) },//好像没用上。。
    texturePosition: { value:[0.0, 0.0, 0.0] },
    textureVelociry: { value:[1.0, 1.0, 0.0] },
    time: { value: 1.0 },
    delta: { value: 0.0 },
    birdWing: {value: [0.0] },
    birds: {value: BIRDS },
};
var birdMaterial = new THREE.ShaderMaterial({
    uniforms: birdUniforms,
    vertexShader: birdVertex,
    fragmentShader: birdFragment,
    side:THREE.DoubleSide
});
var birdMesh = new THREE.Mesh( birdsGeo, birdMaterial );
// birdMesh.rotation.y = Math.PI / 2;
birdMesh.matrixAutoUpdate = false;
birdMesh.updateMatrix();
scene.add(birdMesh);

let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-10, 50, 50);

camera.lookAt(scene.position);

Quick.setResizeFunc(function(width, height){
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.render(scene, camera);
});
let keepingRendering = new RAFStackObj('renderer', function(delt, total){
    renderer.render(scene, camera);
}).setAsRenderFunc();
let birdFlap = new RAFStackObj('birdflap', function(delt, total){
    birdUniforms.birdWing.value = [total/100];
});
let position = [[0, 0, 0],[0, 0, 0],[0, 0, 0]];
let velocity = [[1, 1, 1],[1, 1, 1],[1, 1, 1]];
let birdVelocity = new RAFStackObj('birdvelocity', function(delt, total){
    for(let i = 0;i < position.length;i++){

    }
    let velocity = [Math.sin(total/1000), 0.1 ,Math.cos(total/1000)];
    // let velocity = [1.0 , 1, 1];
    birdUniforms.textureVelociry.value = velocity;
    position[0] += velocity[0] * 0.2;
    position[1] += velocity[1] * 0.1;
    position[2] += velocity[2] * 0.2;
    birdUniforms.texturePosition.value = position;
    birdUniforms.birdWing.value = [total/50];
});