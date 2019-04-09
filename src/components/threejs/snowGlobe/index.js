console.log("this is main js for piece - snowGlobe in project threejs")
//https://codepen.io/al-ro/pen/XBXWjm

import { GUI, RAFStackObj } from '../lib/base';
import DI from '../../common/dependenceInject.js';
require('../lib/loader/STLLoader.js');

DI.insertDOM(`
    <div class="label">SNOW GLOBE</div>
    <div class="instructions">DRAG TO MOVE CAMERA</div>
`);

DI.addCSSStyle(`
    .label {
        position: absolute;
        top: 0;
        left: 50%;
        transform:translate(-50%, 0);
        padding: 5px 15px;
        color: #fff;
        font-size: 13px;
        background-color: rgba(0, 0, 0, .15);
    }
    .instructions {
        position: absolute;
        bottom: 0%;
        left: 0;
        padding: 5px 15px;
        color: #fff;
        font-size: 13px;
        background-color: rgba(0, 0, 0, .15);
    }
`);

DI.import([
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/896175/perlin.js'
]).then(function () {
    /**********define********/
    //init renderEnvironment
    let container = document.getElementById("container");
    let canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    const TWO_PI = Math.PI * 2;
    const mobile = (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        //|| navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    );

    //Spatial variables
    var width = 2000;
    var height = 2000;
    var depth = 2000;
    var centre = [width / 2, height / 2, depth / 2];

    //鳞片
    var flakes = [];
    var flakeCount = mobile ? 2000 : 2500;
    //Noise field zoom
    var step = 100;
    //GUISetting
    var GUISetting = {
        //Speed of falling
        fall: 2,
        //Rotation of flakes
        swirl: 1,
        //Camera rotate
        rotate: true,
        colour: 0x939393
    };

    //镜头参数
    var distance = 400;
    var FOV = 2 * Math.atan(window.innerHeight / (2 * distance)) * 90 / Math.PI;
    /**********logic begin*********/
    //Initialise three.js
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog( scene.background, 1, 5000 );

    var renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x114457, 0.8);

    var camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 1, 20000);
    camera.up.set(0, 0, 1);
    camera.position.set(width / 2, -height / 2, 500);
    camera.lookAt(new THREE.Vector3(centre[0], centre[1], centre[2]));
    scene.add(camera);

    //OrbitControls.js for camera manipulation
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 2 * width;
    controls.minDistance = width / 2;
    controls.autoRotate = GUISetting.rotate;

    //尺寸变化
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //lights
    var light_1;
    light_1 = new THREE.HemisphereLight(0x114417, 0xffffff, 0.3);
    light_1.position.set(0, 0, -depth);
    light_1.lookAt(0, 0, -1);
    scene.add(light_1);

    var light_2 = new THREE.DirectionalLight(0xff0000, 0.8);
    light_2.position.set(-1, 1, 1);
    scene.add(light_2);
    
    var light_3;
    light_3 = new THREE.DirectionalLight(0x00ff00, 0.8);
    light_3.position.set(-1, -1, 1);
    scene.add(light_3);
    
    var light_4;
    light_4 = new THREE.DirectionalLight(0x3333ff, 0.8);
    light_4.position.set(1, -1, 1);
    scene.add(light_4);
    
    //Material for dancer and base
    var material_d = new THREE.MeshLambertMaterial({ color: 0xffffff });

    var loader = new THREE.STLLoader();
    //Load dancer
    loader.load("https://res.cloudinary.com/al-ro/raw/upload/v1531776249/ballerina_1_mu2pmx.stl", function (geometry) {

        var mesh = new THREE.Mesh(geometry, material_d);

        mesh.scale.set(depth / 22, depth / 22, depth / 22);
        mesh.position.set(-20, -30, -depth / 3 + 75);

        scene.add(mesh);

    });

    //Load base
    loader.load("https://res.cloudinary.com/al-ro/raw/upload/v1531777915/base_uluxjn.stl", function (geometry) {

        var mesh = new THREE.Mesh(geometry, material_d);

        mesh.scale.set(depth / 2, depth / 2, depth / 2);
        mesh.position.set(-745, -725, -1050);

        scene.add(mesh);

    });
    
    //Define hexagon shape for flakes
    var geom = new THREE.Geometry();

    //Brackets for purely aesthetic considerations
    //一个正六边形
    {
        geom.vertices.push(
            new THREE.Vector3(-0.5, 0.86, 0),
            new THREE.Vector3(0.5, 0.86, 0),
            new THREE.Vector3(0.93, 0.0, 0),
            new THREE.Vector3(0.5, -0.86, 0),
            new THREE.Vector3(-0.5, -0.86, 0),
            new THREE.Vector3(-0.93, 0.0, 0)
        );
    }

    geom.faces.push(new THREE.Face3(0, 1, 2));
    geom.faces.push(new THREE.Face3(0, 2, 3));
    geom.faces.push(new THREE.Face3(0, 3, 4));
    geom.faces.push(new THREE.Face3(0, 4, 5));

    geom.scale(7, 7, 7);

    var material = new THREE.MeshPhongMaterial({ color: GUISetting.colour, specular: 0xffffff, shininess: 100, side: THREE.DoubleSide, shading: THREE.FlatShading });

    //Generate random flakes
    for (var i = 0; i < flakeCount; i++) {

        var g_ = new THREE.Mesh(geom, material);

        var x = 0.5 - Math.random();
        var y = 0.5 - Math.random();
        var z = 0.5 - Math.random();

        var flake = {
            vel_x: x,
            vel_y: y,
            vel_z: z,
            geo: g_
        };

        flake.geo.position.x = width / 2 - Math.random() * width;
        flake.geo.position.y = height / 2 - Math.random() * height;
        flake.geo.position.z = depth / 2 - Math.random() * depth;

        flake.geo.rotation.x = 2 * (Math.random() - 1.0);
        flake.geo.rotation.y = 2 * (Math.random() - 1.0);
        flake.geo.rotation.z = 2 * (Math.random() - 1.0);

        flakes.push(flake);
    }

    for (var i = 0; i < flakes.length; i++) {
        scene.add(flakes[i].geo);
    }

    //-----------GUI-----------//
    //dat.gui library controls
    var reset_button = {
        reset: function () {
            //Use noise.js library to generate a grid of 3D simplex noise values
            try {
                noise.seed(Math.random());
            }
            catch (err) {
                console.log(err.message);
            }

            for (i = 0; i < flakeCount; i++) {

                var x = 0.5 - Math.random();
                var y = 0.5 - Math.random();
                var z = 0.5 - Math.random();

                flakes[i].vel_x = x;
                flakes[i].vel_y = y;
                flakes[i].vel_z = z;

                flakes[i].geo.position.x = width / 2 - Math.random() * width;
                flakes[i].geo.position.y = height / 2 - Math.random() * height;
                flakes[i].geo.position.z = depth / 2 - Math.random() * depth;

            }

        }
    };

    GUI.add(GUISetting, 'fall').min(0).max(10).step(1).listen();
    GUI.add(GUISetting, 'swirl').min(0).max(10).step(1).listen();
    if (!mobile) {
        GUI.addColor(GUISetting, 'colour').listen().onChange(function (value) { setColour(); });
    }
    GUI.add(GUISetting, 'rotate').listen().onChange(function (value) { controls.autoRotate = GUISetting.rotate; });
    GUI.add(reset_button, 'reset');

    function setColour() {
        material.color.setHex(GUISetting.colour);
    }
    /***********flakes position change************/
    //USed for flake position
    //
    var A = {
        x: 0,
        y: 0,
        z: 0
    };

    //Vector pointing up
    //B是固定的指向上方的恒定向量
    var B = {
        x: 0,
        y: 0,
        z: 1
    }

    //Vector tangent to A and B to define movement around B
    //n通过a和b的叉乘得到，是A B所成面的法向量
    var n = {
        x: 0,
        y: 0,
        z: 0
    };;

    //cross product
    function cross(A, B, n) {
        n.x = A.y * B.z - B.y * A.z;
        n.y = A.z * B.x - B.z * A.x;
        n.z = A.x * B.y - B.x * A.y;
    }
    var noise_ = [];
    //Use noise.js library to generate a grid of 3D simplex noise values
    try {
        noise.seed(Math.random());
    }
    catch (err) {
        console.log(err.message);
    }
    //Find the curl of the noise field based on on the noise value at the location of a flake
    function computeCurl(x, y, z) {
        var eps = 0.0001;

        var curl = new THREE.Vector3();

        //Find rate of change in YZ plane
        var n1 = noise.simplex3(x, y + eps, z);
        var n2 = noise.simplex3(x, y - eps, z);
        //Average to find approximate derivative
        var a = (n1 - n2) / (2 * eps);
        var n1 = noise.simplex3(x, y, z + eps);
        var n2 = noise.simplex3(x, y, z - eps);
        //Average to find approximate derivative
        var b = (n1 - n2) / (2 * eps);
        curl.x = a - b;

        //Find rate of change in XZ plane
        n1 = noise.simplex3(x, y, z + eps);
        n2 = noise.simplex3(x, y, z - eps);
        //Average to find approximate derivative
        a = (n1 - n2) / (2 * eps);
        n1 = noise.simplex3(x + eps, y, z);
        n2 = noise.simplex3(x + eps, y, z);
        //Average to find approximate derivative
        b = (n1 - n2) / (2 * eps);
        curl.y = a - b;

        //Find rate of change in XY plane
        n1 = noise.simplex3(x + eps, y, z);
        n2 = noise.simplex3(x - eps, y, z);
        //Average to find approximate derivative
        a = (n1 - n2) / (2 * eps);
        n1 = noise.simplex3(x, y + eps, z);
        n2 = noise.simplex3(x, y - eps, z);
        //Average to find approximate derivative
        b = (n1 - n2) / (2 * eps);
        curl.z = a - b;

        return curl;
    }
    //----------MOVE----------//
    function move() {
        for (i = 0; i < flakeCount; i++) {
            //获取当前位置
            A.x = flakes[i].geo.position.x;
            A.y = flakes[i].geo.position.y;
            A.z = flakes[i].geo.position.z;

            cross(A, B, n);
            //将n归一化处理，作为速度向量执行碎片的移动
            var mag_n = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
            flakes[i].vel_x = GUISetting.swirl * (n.x / mag_n);
            flakes[i].vel_y = GUISetting.swirl * (n.y / mag_n);

            var curl = computeCurl(flakes[i].geo.position.x / step, flakes[i].geo.position.y / step, flakes[i].geo.position.z / step);
            var mag_c = Math.sqrt(curl.x * curl.x + curl.y * curl.y + curl.z * curl.z);

            // //Update flake velocity according to curl direction and fall
            flakes[i].vel_x -= (GUISetting.fall / 4) * (curl.x / mag_c);
            flakes[i].vel_y -= (GUISetting.fall / 4) * (curl.y / mag_c);

            if (GUISetting.fall > 0) {
                flakes[i].vel_z -= (GUISetting.fall / 60);
                flakes[i].vel_z = Math.max(flakes[i].vel_z, -GUISetting.fall);
            } else {
                flakes[i].vel_z = 0;
            }

            //根据各自方向的移动速度换算自旋速度
            flakes[i].geo.rotation.x += flakes[i].vel_x / 10 + flakes[i].vel_z / 60;
            flakes[i].geo.rotation.y += flakes[i].vel_y / 10 + flakes[i].vel_z / 60;

            //超出界面的不渲染
            var distanceFromCentre = Math.sqrt(A.x * A.x + A.y * A.y + A.z * A.z);
            if (distanceFromCentre > width / 2) {
                flakes[i].geo.visible = false;
            } else {
                flakes[i].geo.visible = true;
            }

            //如果碎片超出画面外，重置它，否则执行移动
            if (flakes[i].geo.position.z < -(depth / 2) || Math.sqrt(A.x * A.x + A.y * A.y) > width) {
                //If outside bounding volume, reset to top
                flakes[i].geo.position.x = width / 2 - Math.random() * width;
                flakes[i].geo.position.y = height / 2 - Math.random() * height;
                flakes[i].geo.position.z = depth / 2;
                flakes[i].vel_x = 0;
                flakes[i].vel_y = 0;

            } else {
                //Update flake position based on velocity
                flakes[i].geo.position.x += flakes[i].vel_x;
                flakes[i].geo.position.y += flakes[i].vel_y;
                flakes[i].geo.position.z += flakes[i].vel_z;
            }
        }
    }


    //----------DRAW----------//
    function draw() {
        if (GUISetting.rotate) {
            controls.update();
        }
        move();
        renderer.render(scene, camera);
    }
    let renderFunc = new RAFStackObj('renderer', draw).setAsRenderFunc();
});
