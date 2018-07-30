import {THREE, GUI, Quick, RAFStackObj} from '../lib/base.js';

let scene = new THREE.Scene();

let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0xEEEEEE));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;
Quick.bindRenderer(renderer);

let axes = new THREE.AxisHelper(20);
// scene.add(axes);

let planeGeometry = new THREE.PlaneBufferGeometry(60, 20);
let planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc});
let planeMaterial2 = new THREE.MeshLambertMaterial({color: 0xcccccc});
let plane = new THREE.Mesh(planeGeometry, planeMaterial);
let plane2 = new THREE.Mesh(planeGeometry, planeMaterial2);
plane2.receiveShadow = true;
plane.rotation.x = - Math.PI/2;
plane2.rotation.x = - Math.PI/2;
plane.position.set(15, 0, 0);
plane2.position.set(15, 0, 0);
plane2.visible = false;
scene.add(plane);
scene.add(plane2);

let sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
let sphereMaterial = new THREE.MeshBasicMaterial({color:0x7777ff, wireframe:true});
let sphereMaterial2 = new THREE.MeshLambertMaterial({color:0x7777ff, wireframe:true});
let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
let sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial2); 
sphere.position.set(20, 4, 2); 
sphere2.position.set(20, 4, 2);
sphere2.visible = false;
sphere.castShadow = true;
sphere2.castShadow = true;
let currentSphere = sphere;
scene.add(sphere);
scene.add(sphere2);

let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
let cubeMaterial = new THREE.MeshBasicMaterial({color:0xff0000, wireframe:true});
let cubeMaterial2 = new THREE.MeshLambertMaterial({color:0xff0000, wireframe:true});
let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
let cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial2);
cube.position.set(-5, 4, 0);
cube.castShadow = true;
cube2.position.set(-5, 4, 0);
cube2.castShadow = true;
cube2.visible = false;
let currentCube = cube;
scene.add(cube);
scene.add(cube2);

let spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-40, 60, -20);
spotLight.castShadow = true;
spotLight.visible = false;
scene.add(spotLight);

let camera = new THREE.PerspectiveCamera(45, Quick.width/Quick.height, 0.1, 1000);
camera.position.set(-40, 30, 50);
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
let sphereAnimate = new RAFStackObj('sphereAnimate',function(delt, total){
    // console.log(delt, total);
    cube.rotation.x += delt * animSpeed;
    cube.rotation.y += delt * animSpeed;
    cube.rotation.y += delt * animSpeed;
    cube2.rotation.x += delt * animSpeed;
    cube2.rotation.y += delt * animSpeed;
    cube2.rotation.z += delt * animSpeed;

    sphere.position.x = 20 + 10 * Math.cos(total * animSpeed * 5);
    sphere.position.y = 4 + 20 * Math.abs(Math.sin(total * animSpeed * 5));
    sphere2.position.x = 20 + 10 * Math.cos(total * animSpeed * 5);
    sphere2.position.y = 4 + 20 * Math.abs(Math.sin(total * animSpeed * 5));
});//.deactivate();
let renderFunc = new RAFStackObj('renderer',function(delt, total){
    render();
}).setAsRenderFunc();//.deactivate();

//gui
let GUISetting = {
    useWireframe:{
        '圆':true,
        '方块':true,
    },
    material:{
        '圆':'basic',
        '方块':'basic',
    },
    '使用灯光':false,
    '速度控制':1,
}
let useWireframe = GUI.addFolder('使用线框');
    useWireframe.open();
    useWireframe.add(GUISetting.useWireframe, '圆').onChange(function(val){
        sphereMaterial.wireframe = val;
        sphereMaterial2.wireframe = val;
        render();
    });
    useWireframe.add(GUISetting.useWireframe, '方块').onChange(function(val){
        cubeMaterial.wireframe = val;
        cubeMaterial2.wireframe = val;
        render();
    });
let useMaterial = GUI.addFolder('材质选择');
    useMaterial.open();
    useMaterial.add(GUISetting.material, '圆', ['basic', 'lambert']).onChange(function(val){
        if(val == 'basic'){
            sphere.visible = true;
            sphere2.visible = false;
            render();
        }else{
            sphere.visible = false;
            sphere2.visible = true;
            render();
        }
    })
    useMaterial.add(GUISetting.material, '方块', ['basic', 'lambert']).onChange(function(val){
        if(val == 'basic'){
            cube.visible = true;
            cube2.visible = false;
            render();
        }else{
            cube.visible = false;
            cube2.visible = true;
            render();
        }
    })
// let useLight = GUI.addFolder('使用灯光');
GUI.add(GUISetting, '使用灯光').onChange(function(val){
    if(val){
        spotLight.visible = true;
        plane.visible = false;
        plane2.visible = true;
        render();
    }else{
        spotLight.visible = false;
        plane.visible = true;
        plane2.visible = false;
        render();
    }
});
GUI.add(GUISetting, '速度控制', 0.1, 10).onChange(function(val){
    animSpeed = val / 1000;
})