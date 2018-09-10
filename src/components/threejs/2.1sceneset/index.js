import {GUI, Quick, RAFStackObj} from '../lib/base.js';

let scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 0.1, 200);
// scene.fog = undefined;
// scene.overrideMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});

let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0xEEEEEE));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;
Quick.bindRenderer(renderer);

let axes = new THREE.AxisHelper(20);
// scene.add(axes);

let planeGeometry = new THREE.PlaneBufferGeometry(60, 40, 1, 1);
let planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
let plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.rotation.x = - Math.PI/2;
plane.position.set(0, 0, 0);
scene.add(plane);

let ambientLight = new THREE.AmbientLight(0x0c0c0c);
scene.add(ambientLight);

let spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-40, 60, -10);
spotLight.castShadow = true;
scene.add(spotLight);

let camera = new THREE.PerspectiveCamera(45, Quick.width/Quick.height, 0.1, 1000);
camera.position.set(-30, 40, 30);
camera.lookAt(scene.position);

function render(){
    renderer.render(scene, camera);
}
Quick.setResizeFunc(function(width, height){
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render()
});
render();

let animSpeed = 1/1000;
let renderFunc = new RAFStackObj('renderer',function(delt, total){
    render();
}).setAsRenderFunc();//.deactivate();
var fogfar = 200;
//雾气鉴浓
let fogAdd = new RAFStackObj('fogadd', function(delt){
    if(fogfar > 50){
        fogfar -= delt/50
        scene.fog.far = fogfar
    }
})

//gui
let GUISetting = {
    '使用雾':false,
    '添加方块':function(){
        let randomSize = ( 1 + Math.random() * 5)<<0;
        let randomColor = (Math.random() * 0xffffff)<<0;
        let cubeGeo = new THREE.BoxGeometry(randomSize, randomSize, randomSize);
        let cubeMater = new THREE.MeshLambertMaterial({color: randomColor});
        let Cube = new THREE.Mesh(cubeGeo, cubeMater);

        Cube.position.x = 0 + 50 * (Math.random() - 0.5);
        Cube.position.y = randomSize * 0.8;
        Cube.position.z = 0 + 30 * (Math.random() - 0.5);
        scene.add(Cube);
    },
    '使用强制材质':false,
}
GUI.add(GUISetting, '使用雾').onChange(function(val){
    if(!val){
        scene.fog.far = 10000000;
    }else{
        scene.fog.far = 100;
    }
});
GUI.add(GUISetting, '使用强制材质').onChange(function(val){
    if(!val){
        scene.overrideMaterial = null;
    }else{
        scene.overrideMaterial = new THREE.MeshLambertMaterial({color:0xffffff});
    }
})
GUI.add(GUISetting, '添加方块');