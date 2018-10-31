console.log("this is main js for piece - 3.1spotlight in project threejs")

import {GUI, Quick, RAFStackObj} from '../lib/base.js';

let scene = new THREE.Scene();

let axe = new THREE.AxisHelper(100);
scene.add(axe);

let renderer = Quick.createRenderer({
    shadowEnabled:true,
    shadowType:THREE.PCFSoftShadowMap,
    clearColor:new THREE.Color(0xeeeeee)
});
Quick.setResizeFunc(function(width, height){
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.render(scene, camera);
});

let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(50, 50 ,50);
camera.lookAt(scene.position);

let control=new THREE.OrbitControls(camera, renderer.domElement);
control.maxPolarAngle = Math.PI * 0.5;
control.minDistance = 0.1;
control.maxDistance = 1000;

let plane = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({color:new THREE.Color(0xffffff)})
)
plane.position.set(0, 0, 0);
plane.rotation.x = - Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

let sphereGeo = new THREE.SphereGeometry(3, 20, 20);
let sphereMate = new THREE.MeshLambertMaterial({color:0x7777ff});
let sphere = new THREE.Mesh(sphereGeo, sphereMate);
sphere.position.set(0, 3, -20);
sphere.castShadow = true;
scene.add(sphere);

let cubeGeo = new THREE.BoxGeometry(4, 4, 4);
let cubeMate = new THREE.MeshLambertMaterial({color:0xff3333});
let cube = new THREE.Mesh(cubeGeo, cubeMate);
cube.position.set(0, 2, 20);
cube.castShadow = true;
scene.add(cube);

let ambientLight = new THREE.AmbientLight(0x303030);
scene.add(ambientLight);

let spotLight = new THREE.SpotLight(0xeeeeee);
spotLight.position.set(-20, 40, -10);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.05;
spotLight.decay = 2;
spotLight.distance = 200;
spotLight.castShadow = true;
scene.add(spotLight);

function render(){
    renderer.render(scene, camera);
}
let renderFunc = new RAFStackObj('renderer',function(delt, total){
    render();
}).setAsRenderFunc();