console.log("this is main js for piece - 2.3twocamera in project threejs")
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

let axes = new THREE.AxisHelper(20);
scene.add(axes);

let cameraPerspective = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
cameraPerspective.position.x = 120;
cameraPerspective.position.y = 60;
cameraPerspective.position.z = 180;
cameraPerspective.lookAt(scene.position);

let cameraOrthographic = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
cameraOrthographic.position.x = 120;
cameraOrthographic.position.y = 60;
cameraOrthographic.position.z = 180;
cameraOrthographic.lookAt(scene.position);

let camera = cameraPerspective;

//light
let directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(-20, 40, 60);
scene.add(directionalLight);

let ambientLight = new THREE.AmbientLight(0x292929);
scene.add(ambientLight);

//things
let planeGeo = new THREE.PlaneGeometry(180, 180);
let planeMaterial = new THREE.MeshLambertMaterial({color:0xffffff});
let plane = new THREE.Mesh(planeGeo, planeMaterial);
plane.position.set(0, 0, 0);
plane.rotation.x = - Math.PI / 2;
scene.add(plane);

let size = 4;
let offset = 1;
let boxGeo = new THREE.BoxGeometry(size, size, size);
let xNum = planeGeo.parameters.width / (size + offset);
let zNum = planeGeo.parameters.height / (size + offset);
for(var i = 0; i < xNum; i++){
    for(var j = 0;j < zNum;j++){
        let material = new THREE.MeshLambertMaterial({color:new THREE.Color(0.75 * Math.random() + 0.25, 0, 0)});
        let box = new THREE.Mesh(boxGeo, material);
        box.position.set((i - xNum / 2) * (size + offset), size / 2, (j - zNum / 2) * (size + offset));
        scene.add(box);
    }
}

let GUISetting = {
    camera:'Perspective',
    toggle(){
        if(this.camera == 'Perspective'){
            camera = cameraOrthographic;
            this.camera = 'Orthographic';
        }else{
            camera = cameraPerspective;
            this.camera = 'Perspective';
        }
    }
}
GUI.add(GUISetting, 'camera');
GUI.add(GUISetting, 'toggle').listen();

function render(){
    renderer.render(scene, camera);
}
let renderFunc = new RAFStackObj('renderer',function(delt, total){
    render();
}).setAsRenderFunc(); 
