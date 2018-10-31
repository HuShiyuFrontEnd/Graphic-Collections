console.log("this is main js for piece - 3.1spotlight in project threejs")

import {GUI, Quick, RAFStackObj} from '../lib/base.js';

let scene = new THREE.Scene();

let renderer = Quick.createRenderer({
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

let plane = new THREE.Mesh(
    new THREE.PlaneGeometry(50,100),
    new THREE.MeshLambertMaterial({color:new THREE.Color(0xffffff)})
)
plane.position.set(0, 0, 0);
plane.rotation.x = - Math.PI / 2;
scene.add(plane);

let sphereGeo = new THREE.SphereGeometry(4, 20, 20);
let sphereMate = new THREE.MeshLambertMaterial({color:0x7777ff});
let sphere = new THREE.Mesh(sphereGeo, sphereMate);
sphere.position.set(20, 4, 0);
scene.add(sphere);

let ambientLight = new THREE.AmbientLight(0x303030);
scene.add(ambientLight);

function render(){
    renderer.render(scene, camera);
}
let renderFunc = new RAFStackObj('renderer',function(delt, total){
    render();
}).setAsRenderFunc();