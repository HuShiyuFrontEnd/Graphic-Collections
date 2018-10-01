import {GUI, Quick, RAFStackObj} from '../lib/base.js';
import birdVertex from './birdVertex.html';
import birdFragment from './birdFragment.html';
import GPGPU from '../lib/GPUComputationRenderer';

let scene = new THREE.Scene();
// scene.background = new THREE.Color(0x111111);

let renderer = Quick.createRenderer({
    shadowEnabled:true,
    shadowType:THREE.PCFSoftShadowMap
});

// let axe = new THREE.AxesHelper(20);
// scene.add(axe);

let BIRDS = 50;
let BOUND = 200;
let BOUND_HALF = BOUND / 2;
let SPEED = 1;
let SPEEDINIT = 0.5;
let PosVectors = [];
let VecVectors = [];
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
    this.addAttribute('birdWing', birdWing);
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
    }

    for( var i = 0;i < BIRDS;i++){
        let positionX = (Math.random() - 0.5) * BOUND;
        let positionY = (Math.random() - 0.5) * BOUND;
        let positionZ = (Math.random() - 0.5) * BOUND;

        let velocityX = (Math.random() - 0.5) * SPEEDINIT;
        let velocityY = (Math.random() - 0.5) * SPEEDINIT;
        let velocityZ = (Math.random() - 0.5) * SPEEDINIT;

        PosVectors.push(new THREE.Vector3(positionX, positionY, positionZ));
        VecVectors.push(new THREE.Vector3(velocityX, velocityY, velocityZ));

        let birdValue = Math.random() * 2.0;

        for( var j = 0;j < 9;j++){
            birdWing.array[i * 9 + j] = birdValue;
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
let birdUniforms = {
    color: { value:new THREE.Color(0xff2200) },
    time: { value: 1.0 },
    delta: { value: 0.0 },
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
birdMesh.matrixAutoUpdate = true;
birdMesh.updateMatrix();
scene.add(birdMesh);

let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, BOUND * 50);
camera.position.set(BOUND * 2, BOUND * 2, BOUND * 2);
camera.lookAt(scene.position);

let control=new THREE.OrbitControls(camera, renderer.domElement);
control.maxPolarAngle = Math.PI * 0.5;
control.minDistance = 1;
control.maxDistance = BOUND * 50;

Quick.setResizeFunc(function(width, height){
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.render(scene, camera);
});

let keepingRendering = new RAFStackObj('renderer', function(delt, total){
    renderer.render(scene, camera);
}).setAsRenderFunc();//setAsRenderFunc被设置时，总会在一个raf的最后执行
//算法参考
//https://blog.csdn.net/u3d_20171030/article/details/79626575
let setTime = new RAFStackObj('setTime', function(delt, total){
    birdUniforms.time.value = total;
});
//将鸟飞行所用的参数，置入GUI模块中
let GUISetting = {
    seperation:30, //离散力，每两只鸟之间的斥力，保证队伍不会集中在一起，距离越近，离散力越大
    separationWeight:8,
    alignment:25, //队列力，不同的鸟的飞行轨迹可能是不同的，但是会尽可能保持一个大致的飞行轨迹
    alignmentWeight:1,
    cohesion:20, //内聚力，两只鸟之间的拉力，保证队伍不会太过于分散
    cohesionWeight:2,
    speed:1,
    centralWeight:15,
}
GUI.add(GUISetting, 'seperation', 1, 100);
GUI.add(GUISetting, 'separationWeight', 0.1, 10);
GUI.add(GUISetting, 'alignment', 1, 100);
GUI.add(GUISetting, 'alignmentWeight', 0.1, 10);
GUI.add(GUISetting, 'cohesion', 1, 100);
GUI.add(GUISetting, 'cohesionWeight', 0.1, 10);
GUI.add(GUISetting, 'speed', 0.1, 10).onChange(val => { SPEED = val; });
GUI.add(GUISetting, 'centralWeight', 1, 50);
//鸟的速度还有位置的处理循环
//在这个版本里位置和速度的变化将由js（CPU计算)
let birdPosistionAndVelocity = new RAFStackObj('birdposandveloc', function(delt, total){
    birdMesh.geometry.attributes.birdPosition.needsUpdate = true;
    birdMesh.geometry.attributes.birdVelocity.needsUpdate = true;
    let posArray = birdMesh.geometry.attributes.birdPosition.array;
    let vecArray = birdMesh.geometry.attributes.birdVelocity.array;
    //求速度
    //太近的鸟儿会受到彼此的斥力
    //一个总的方向会对鸟做出约束
    //相隔太远的鸟会收到彼此的引力
    //捕食者会极大的影响鸟群的行为
    let gs = GUISetting;

    let speedLimit = 5;

    let separationDistance = gs.seperation;
    let seperationWeight = gs.separationWeight;
    let seperationSquared = separationDistance * separationDistance;
    let alignmentDistance = gs.seperation + gs.alignment;
    let alignmentWeight = gs.alignmentWeight;
    let alignmentSquared = alignmentDistance * alignmentDistance;
    let cohesionDistance = gs.cohesion + alignmentDistance;
    let cohesionWeight = gs.cohesionWeight;
    let cohesionSquared = cohesionDistance * cohesionDistance;

    let centralWeight = gs.centralWeight;
    
    // Attract flocks to the center
    let central = new THREE.Vector3(0, 0, 0);
    for(let i = 0;i < BIRDS; i++){
        let selfPos = PosVectors[i];
        let selfVec = VecVectors[i];

        let direct = new THREE.Vector3().copy(selfPos).sub(central);
        let dist = direct.length();
        direct.y *= 2.5;

        //本示例方便展示，集中在某一个点上
        selfVec.sub(direct.normalize().multiplyScalar(delt / 1000 * (direct.length() / BOUND + 0.5) * centralWeight));
        // selfVec.sub(direct.normalize().multiplyScalar(delt / 100));

        let alignDirect = new THREE.Vector3(0, 0, 0);

        for(var j = 0;j < BIRDS; j++){
            let birdDirect = new THREE.Vector3().copy(PosVectors[j]).sub(selfPos);
            let birdDistance = birdDirect.length();
            let birdDistanceSqured = birdDistance * birdDistance;
            let birdNorm = birdDirect.normalize();
            let force = new THREE.Vector3(0, 0, 0);

            if(birdDistance < 0.1) continue;//自己或者太近不好处理
            if(birdDistance > cohesionDistance) continue;//相距太远，影响微乎其微
            if(birdDistance < separationDistance){
                //太近,这是处理分离力的距离
                force.sub(new THREE.Vector3().copy(birdNorm).multiplyScalar(seperationSquared * seperationWeight / (birdDistanceSqured + 5)));
            }else if(birdDistance < alignmentDistance){
                //距离适中，伴飞，处理队列力
                alignDirect.add(new THREE.Vector3().copy(VecVectors[j]))
                // force.add(new THREE.Vector3().copy(VecVectors[j]).multiplyScalar(Math.cos((birdDistanceSqured / alignmentDistance / cohesionDistance - separationDistance / alignmentDistance) * Math.PI/2) * alignmentWeight)); 
                
            }else{
                //太远，处理凝聚力
                // console.log(birdDistanceSqured / cohesionSquared * cohesionWeight)
                // force.add(new THREE.Vector3().copy(birdNorm).multiplyScalar(Math.sin(((birdDistance - alignmentDistance) / (cohesionDistance - alignmentDistance) - 0.5 ) * Math.PI / 2 ) * cohesionWeight));
            }
            selfVec.add(force.multiplyScalar(delt / 1000));
        }

        selfVec.add(alignDirect.multiplyScalar(alignmentWeight / j));
        //最大速度限制
        // console.log(selfVec.length())
        if(selfVec.length() > speedLimit)
            selfVec = selfVec.normalize().multiplyScalar(speedLimit);

        selfPos.add(new THREE.Vector3().copy(selfVec).multiplyScalar(delt / 20 * SPEED));
        for(let j = 0;j < 27; j+=3){
            let index = i * 27 + j;
            posArray[index] = selfPos.x;
            posArray[index + 1] = selfPos.y;
            posArray[index + 2] = selfPos.z;

            vecArray[index] = selfVec.x;
            vecArray[index + 1] = selfVec.y;
            vecArray[index + 2] = selfVec.z;  
        }
    }
    //根据速度变化，结算位置变化
});
// console.log(birdMesh.geometry.attributes)