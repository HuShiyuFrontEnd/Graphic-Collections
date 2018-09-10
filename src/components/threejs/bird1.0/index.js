import {GUI, Quick, RAFStackObj} from '../lib/base.js';
import birdVertex from './birdVertex.html';
import birdFragment from './birdFragment.html';
import GPGPU from '../lib/GPUComputationRenderer';

let scene = new THREE.Scene();

let renderer = Quick.createRenderer({
    shadowEnabled:true,
    shadowType:THREE.PCFSoftShadowMap
});

let axe = new THREE.AxesHelper(20);
scene.add(axe);

let BIRDS = 3;
let BOUND = 200;
let BOUND_HALF = BOUND / 2;
let SPEED = 10;
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
    var birdPosition = new THREE.BufferAttribute( new Float32Array(points * 3), 3);
    var birdVelocity = new THREE.BufferAttribute( new Float32Array(points * 3), 3);

    this.addAttribute('position', vertices);
    this.addAttribute('birdColor', birdColors);
    this.addAttribute('reference', references);
    this.addAttribute('birdVertex', birdVertex);
    this.addAttribute('birdPosition', birdPosition);
    this.addAttribute('birdVelocity', birdVelocity);

    var v = 0;
    function verts_push(){
        for(let i = 0;i < arguments.length; i++){
            vertices.array[v++] = arguments[i];
        }
    }

    var wingsSpan = 20;//翼展
    for(var f = 0; f < BIRDS; f++){
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
            -wingsSpan, 0, -5,
            0, 0, 15,
        );
        //right wing
        verts_push(
            0, -0, 15,
            wingsSpan, 0, -5,
            0, 0, -15,
        );
    }
    for( var v = 0; v < points; v++ ){
        //i - 第几个triangle 将原
        var i = ~~(v/3);//~~ 先parseNumber，然后去掉小数位（既不是floor，也不是ceil）
        var x = (i % BIRDS) / BIRDS;
        var y = ~~( i / BIRDS) / BIRDS;

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

    for( var i = 0;i < BIRDS;i++){
        let positionX = (Math.random() - 0.5) * BOUND;
        let positionY = (Math.random() - 0.5) * BOUND;
        let positionZ = (Math.random() - 0.5) * BOUND;

        let velocityX = (Math.random() - 0.5) * SPEED;
        let velocityY = (Math.random() - 0.5) * SPEED;
        let velocityZ = (Math.random() - 0.5) * SPEED;
        for( var j = 0;j < 9;j++){
            birdPosition.array[i * 27 + j * 3] = positionX;
            birdPosition.array[i * 27 + j * 3 + 1] = positionY;
            birdPosition.array[i * 27 + j * 3 + 2] = positionZ;
            birdVelocity.array[i * 27 + j * 3] = velocityX;
            birdVelocity.array[i * 27 + j * 3 + 1] = velocityY;
            birdVelocity.array[i * 27 + j * 3 + 2] = velocityZ;
        }
    }

    this.scale(0.2, 0.2, 0.2);
}
THREE.BirdGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );

//初始化鸟群
let birdsGeo = new THREE.BirdGeometry();
//在这个版本里位置和速度的变化将由js（CPU计算）
// let birdPosition = (function(){
//     let position = new Float32Array(BIRDS * 3);
//     for(let i = 0;i < BIRDS;i++){
//         position[ i * 3 ] = (Math.random() - 0.5) * BOUND;
//         position[ i * 3 + 1 ] = (Math.random() - 0.5) * BOUND;
//         position[ i * 3 + 2 ] = (Math.random() - 0.5) * BOUND;
//     }
//     return position;
// })();
// let birdVelocity = (function(){
//     let velocity = new Float32Array(BIRDS * 3);
//     for(let i = 0;i < BIRDS;i++){
//         velocity[ i * 3 ] = (Math.random() - 0.5) * SPEED;
//         velocity[ i * 3 + 1 ] = (Math.random() - 0.5) * SPEED;
//         velocity[ i * 3 + 2 ] = (Math.random() - 0.5) * SPEED;
//     }
//     return velocity;
// })();
let birdUniforms = {
    color: { value:new THREE.Color(0xff2200) },//好像没用上。。
    // birdPosition: { value:[1.0, 2.0, 3.0] },
    // birdVelocity: { value:[1.0, 2.0, 3.0] },
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
birdMesh.rotation.y = Math.PI / 2;
birdMesh.matrixAutoUpdate = false;
birdMesh.updateMatrix();
scene.add(birdMesh);
console.log(birdMaterial)

let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, BOUND * 5);
camera.position.set(-300, 200, 300);
camera.lookAt(scene.position);

let control=new THREE.OrbitControls(camera, renderer.domElement);
control.maxPolarAngle = Math.PI * 0.5;
control.minDistance = 1;
control.maxDistance = BOUND * 5;

Quick.setResizeFunc(function(width, height){
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.render(scene, camera);
});

let keepingRendering = new RAFStackObj('renderer', function(delt, total){
    renderer.render(scene, camera);
}).setAsRenderFunc();//setAsRenderFunc被设置时，总会在一个raf的最后执行
//鸟拍动翅膀的动画
let birdFlap = new RAFStackObj('birdflap', function(delt, total){
    birdUniforms.birdWing.value = [total/100];
});
//算法参考
//https://blog.csdn.net/u3d_20171030/article/details/79626575
//将鸟飞行所用的参数，置入GUI模块中
let GUISetting = {
    seperation:20, //离散力，每两只鸟之间的斥力，保证队伍不会集中在一起，距离越近，离散力越大
    alignment:20, //队列力，不同的鸟的飞行轨迹可能是不同的，但是会尽可能保持一个大致的飞行轨迹
    cohesion:20 //内聚力，两只鸟之间的拉力，保证队伍不会太过于分散
}
GUI.add(GUISetting, 'seperation', 1, 100);
GUI.add(GUISetting, 'alignment', 1, 100);
GUI.add(GUISetting, 'cohesion', 1, 100);
//鸟的速度还有位置的处理循环
let birdPosistionAndVelocity = new RAFStackObj('birdposandveloc', function(delt, total){
    //求速度
    //太近的鸟儿会受到彼此的斥力
    //一个总的方向会对鸟做出约束
    //相隔太远的鸟会收到彼此的引力
    //捕食者会极大的影响鸟群的行为
});