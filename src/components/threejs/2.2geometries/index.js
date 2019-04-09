import {GUI, Quick, RAFStackObj} from '../lib/base.js';
require('../lib/geometry/ConvexGeometry.js');
require('../lib/geometry/ParametricGeometries.js');

let scene = new THREE.Scene();

let renderer = new THREE.WebGLRenderer({ alpha:true, antialias: true });
renderer.setClearColor(new THREE.Color(0xEEEEEE));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
Quick.bindRenderer(renderer);

let axes = new THREE.AxisHelper(20);
scene.add(axes);

let planeGeometry = new THREE.PlaneBufferGeometry(60, 40, 40, 40);
let planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc, side:THREE.DoubleSide});
let plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.rotation.x = - Math.PI/2;
plane.position.set(0, 0, 0);
scene.add(plane);

let geoms = [];
//一个圆锥~圆柱
geoms.push(new THREE.CylinderGeometry(1, 4, 4));
// //一个方块
geoms.push(new THREE.BoxGeometry(3, 3, 3));
// //球
geoms.push(new THREE.SphereGeometry(3, 20, 20));
// //二十面体
geoms.push(new THREE.IcosahedronGeometry(4));
// //凸包:包围points的最小体积几何体
var points = [
    new THREE.Vector3(2, 2, 3),
    new THREE.Vector3(2, 3, -2),
    new THREE.Vector3(-3, 2, -2),
    new THREE.Vector3(-2, 2, 2),
    new THREE.Vector3(2, -2, 2),
    new THREE.Vector3(2, -2, -2),
    new THREE.Vector3(-2, -2, -2),
    new THREE.Vector3(-2, -2, 2)
]
geoms.push(new THREE.ConvexGeometry(points));
// //车床模型
var pts = [];
var detail = 0.1;
var radius = 3;
for(var angle = 0.0; angle < Math.PI;angle += detail)
    pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * angle ));
geoms.push(new THREE.LatheGeometry(pts, 12));
// //八面体
geoms.push(new THREE.OctahedronGeometry(3));
// //参数化的几何体，克莱因瓶、莫比乌斯环等
geoms.push(new THREE.ParametricGeometry(THREE.ParametricGeometries.mobius3d, 20, 10));
// //四面体
geoms.push(new THREE.TetrahedronGeometry(3));
// //环体
geoms.push(new THREE.TorusGeometry(3, 1, 10, 10));
// //扭结
geoms.push(new THREE.TorusKnotGeometry(3, 0.5, 50, 20));
//用户自定义几何体
let vertices = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 4, 1),
    new THREE.Vector3(-1, 4, 1),
    new THREE.Vector3(1, 4, -1),
    new THREE.Vector3(-1, 4, -1),
    new THREE.Vector3(0, 8, 0),
];
let faces = [
    new THREE.Face3(0, 1, 2),
    new THREE.Face3(0, 3, 1),
    new THREE.Face3(0, 4, 3),
    new THREE.Face3(0, 2, 4),
    new THREE.Face3(5, 2, 1),
    new THREE.Face3(5, 1, 3),
    new THREE.Face3(5, 3, 4),
    new THREE.Face3(5, 4, 2),
]
let customGeo = new THREE.Geometry();
customGeo.vertices = vertices;
customGeo.faces = faces;
customGeo.computeFaceNormals();
geoms.push(customGeo);

let meshs = [];
for(let i = 0, j = 0, length = geoms.length;i < length;i++){
    let materials = [
        new THREE.MeshLambertMaterial({color:Math.random() * 0xffffff, shading:THREE.FlatShading, opacity: 0.6, transparent: true}),
        new THREE.MeshBasicMaterial({color:0xeeeeee, wireframe: true })
    ]
    let mesh = THREE.SceneUtils.createMultiMaterialObject(geoms[i], materials);
    mesh.traverse(function(e){
        e.castShadow = true;
    });

    mesh.position.x = -24 + (i % 4) * 12;
    mesh.position.y = 4;
    mesh.position.z = -8 + j * 12;

    if((i + 1) % 4 == 0) j++;
    meshs.push(mesh);
    scene.add(mesh);
}

let ambientLight = new THREE.AmbientLight(0x0c0c0c);
scene.add(ambientLight);

let spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-40, 40, 50);
spotLight.castShadow = true;
scene.add(spotLight);


let camera = new THREE.PerspectiveCamera(45, Quick.width/Quick.height, 0.1, 1000);
camera.position.set(20, 15, 15);
camera.lookAt(meshs[0].position);

let control=new THREE.OrbitControls(camera, renderer.domElement);
control.maxPolarAngle = Math.PI * 0.5;
control.minDistance = 1;
control.maxDistance = 10000;

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

//gui
let GUISetting = {
}

//椎体
// var cone = new THREE.Mesh(new THREE.ConeGeometry(100,100,100,10,false,0,Math.PI*3/2),material);
//十二面体
// var dodecahed = new THREE.Mesh(new THREE.DodecahedronGeometry(50,0),material);