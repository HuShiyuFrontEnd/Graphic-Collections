console.log("this is main js for piece - triangleFragmentTransform in project threejs")
import DI from '../../common/dependenceInject'
import vs from './vertexShader.glsl'
import fs from './fragShader.glsl'

DI.insertDOM(`
  <div id="app">
    <div id="body">
      <div id="screenshot"></div>
      <div id="demo-preloader-container" class="preloader">
        <p id="preloader" class="progress headline white">0</p>
      </div>
      <div id="bodyGrad">
        <div class="body-grad"></div>
        <div class="body-grad started"></div>
        <div class="body-grad doper"></div>
      </div>
      <div id="world"></div>
      <a id="staakLogo" class="link" href="http://www.staak.co.uk" target="_blank" rel="noreferrer noopener">
        <svg class="link" xmlns="http://www.w3.org/2000/svg" viewBox="17 348.4 630.7 145.5">
          <path class="link" d="M255.4 450.9c-2.1 6.7-2.9 12.1-2.9 16.4 0 15.2 15 22.7 26 22.7v1.2h-59.9l.1-1.3c9.6 0 17.3-8.5 24-22.6l28.5-59.9.6 1.9c-7.1 15.4-12.3 27.9-15.4 37.8M381 490v1.2h-75V490c9.6 0 18.1-6.2 12.9-17l-39.3-82.7 19-42.5h2.1l61.5 131.4c3.8 8.1 8.6 10.8 18.8 10.8z"
          />
          <path class="link" d="M386 450.2c-2.1 6.7-2.9 12.1-2.9 16.4 0 15.2 15 22.7 26 22.7v1.2h-59.9v-.8c9.6 0 17.5-8.9 24.1-23.1l28.5-59.9.6 1.9c-7.1 15.4-12.3 27.9-15.4 37.8M511.1 490v1.2h-75V490c9.6 0 18.1-6.2 12.9-17l-39.3-82.7 19.1-42.5h2.1l61.5 131.4c3.7 8.1 8.5 10.8 18.7 10.8z"
          />
          <path class="link" d="M559.7 490v1.2h-66.3V490c12.5 0 15.6-5 15.6-10.6V362c0-5.6-3.1-10.8-15.6-10.8v-1.3h66.3v1.2c-12.3 0-15.4 5.2-15.4 10.8v117.5c0 5.6 3.2 10.6 15.4 10.6zm88.4 0v1.2h-68.2V490c6.4 0 11-3.1 11-7.3 0-4.4-1.2-6.7-2.9-9.1l-32.6-49.9c32.2-32.4 38.3-51.6 38.3-60.9 0-8.1-8.1-11.6-13.9-11.6v-1.3h61.1v1.2c-8.9 0-13.9 4.2-20.4 10.4L580.2 400l52.2 79.6c4 6.3 8 10.4 15.7 10.4zM19.1 442.6h-1.7v50.7h1.7l6.9-10.2c10.8 6.7 23.9 9.8 40.3 10.2v-1.2c-25.6-8.6-40.4-26-47.2-49.5zM48 368.2c0-11.4 8.7-17.5 18.3-19.1v-1.3C38.6 349.7 18.4 364 18.4 389c0 42.2 79.4 45.5 79.4 81.9 0 12.5-11.2 19.1-22.7 21.2v1.2c32.2-1.2 52.2-15.8 52.2-42.6.1-42.2-79.3-46.1-79.3-82.5zM204.9 479V349.9h-35.3V479c0 5.6-3.1 11-15.6 11v1.2h66.5V490c-12.5 0-15.6-5.4-15.6-11zM215.3 349.9v1.2c16 4 28.5 22.5 33.7 44.9h1.7v-46.1h-35.4zM159.2 349.9h-39.1l-7.5 8.9c-9.6-6.8-21.8-10.4-37.4-11v1.2c21.3 4.3 45.1 29.5 47.2 55.8l.2 4.1c6.2-34.7 20.2-53 36.6-57.8v-1.2z"
          /></svg>
      </a>
      <div class="cookie-warning" v-bind:class="[{accepted: cookiesAccepted}, {hide: toggleMobile}]">
        <p class="regular brown">
          An experimental, automated demo celebrating The Tour de France |
          <a href="http://www.toujoursjaune.com/" target="_blank" rel="noreferrer noopener">toujoursjaune.com</a>
        </p>
      </div>

    </div>
  </div>
`).
addCSSStyle(`
  * {
    cursor: unset !important;
  }

  a {
    cursor: pointer !important;
  }

  #body .cookie-warning {
    max-width: 100%;
    text-align: center;
    top: 0;
    bottom: auto;
    left: 0;
    right: 0;
  }

  #body .cookie-warning p {
    margin: 0 auto;
  }

  #body #staakLogo {
    bottom: 10px;
    left: 50%;
    transform: translate3d(-50%, 0, 0);
  }

  #screenshot {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-image: url('https://toujours-jaune.s3.amazonaws.com/codepen/toujours-jaune.jpg');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    z-index: 100;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;

    &.hide {
      pointer-events: none;
      opacity: 0;
    }
  }
`)

DI.import([
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/95/three.min.js',
  '/static/common/gsap/tweenmax.js',
  'https://code.createjs.com/1.0.0/preloadjs.min.js',
  '//s3-us-west-2.amazonaws.com/s.cdpn.io/16327/CustomEase.min.js?r=2'
]).then(function(){
  class ToujoursJaune {
    constructor() {
        this.world = document.getElementById('world');
        this.state = 'shirt';
        this.timeout = 2500;
    }

    preloadComplete() {
        // window listeners
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // initialise app
        this.init();

        // create shirt / rider mesh shader
        this.initToujoursJaune();

        // add shadow planes
        this.addShadow();
        this.addRiderShadow();

        // call animate to render
        this.animate();

        return true;
    }

    appInit() {
        // hide preloader
        document.getElementById('demo-preloader-container').remove();

        // animate shirt into view
        this.animateShirtIn();
    }

    animateShirtIn() {
        let duration = 0.5;

        let shirtAnimation = new TimelineMax({
            onComplete: () => {
                // wait, then explode
                setTimeout(() => {
                    this.changeState();
                }, this.timeout);
            }
        });

        // shirt drops in
        shirtAnimation.fromTo(
            this.shirtMesh.position,
            duration,
            {
                x: 0,
                y: 200
            },
            {
                y: -10,
                ease: Power2.easeOut
            },
            0
        );

        // reset shadow x position
        shirtAnimation.fromTo(
            this.shirtShadow.position,
            duration,
            {
                x: 0
            },
            {
                x: 0,
                y: -17.5
            },
            0
        );

        // animate shadow in
        shirtAnimation.fromTo(
            this.shirtShadow.scale,
            duration,
            {
                x: 0.01,
                y: 0.01
            },
            {
                x: 1.5,
                y: 1.25,
                ease: Power2.easeOut
            },
            0
        );
    }

    changeState() {
        // animation timeline
        this.shirtAnimation = new TimelineMax({
            paused: true,
            onComplete: () => {
                this.state = 'rider';

                setTimeout(() => {
                    this.changeState();
                }, this.timeout);
            },
            onReverseComplete: () => {
                // set new face end state
                this.state = 'shirt';
                this.updateNextRider();
            },
            onUpdate: () => {
                this.shirtMesh.material.uniforms['uTime'].value =
                    this.shirtMesh.animationDuration *
                    this.shirtMesh.animationProgress;
                this.shirtMesh.material.uniforms['uTimeReverse'].value =
                    this.shirtMesh.animationDuration *
                    this.shirtMesh.animationProgressReverse;
            }
        });

        // animate progress
        let duration = 2.5;
        let delay = 1;

        this.shirtAnimation.fromTo(
            this.shirtMesh,
            duration,
            {
                animationProgress: 0.0,
                animationProgressReverse: 1.0
            },
            {
                animationProgress: 1.0,
                animationProgressReverse: 0.0
            },
            delay - 0.09
        );

        // animate shadow
        this.shirtAnimation.fromTo(
            this.riderShadow.scale,
            duration / 2,
            {
                x: 0.01,
                y: 0.01
            },
            {
                x: 1,
                y: 1
            },
            2
        );

        // play animation forward or backwards
        if (this.state == 'shirt') {
            // bounce shirt up from floor
            this.bounceUp(delay);
            this.spinshirtClockwise(duration, delay);

            // play
            this.shirtAnimation.play();
        } else {
            //bounce back to floor
            this.bounceDown(duration);
            this.spinshirtAntiClockwise(duration, delay - 0.09);

            // reverse animation (face to shirt)
            this.shirtAnimation.reverse(0);
        }
    }

    bounceUp(duration) {
        // shirt bounces up before it explodes
        let shirtAnimation = new TimelineMax({
            onComplete: () => {}
        });

        shirtAnimation.fromTo(
            this.shirtMesh.position,
            duration,
            {
                // from current position
            },
            {
                y: 15,
                ease: CustomEase.create(
                    'bounceUp',
                    'M0,0 C0,0 0.036,0.044 0.098,0.044 0.172,0.044 0.194,0.002 0.2,0 0.205,0.006 0.248,0.062 0.34,0.062 0.428,0.062 0.46,0.004 0.464,0 0.468,0.011 0.616,1.09 0.784,1.186 0.885,1.243 1,1 1,1'
                )
            },
            0
        );

        // animate shadow
        shirtAnimation.fromTo(
            this.shirtShadow.scale,
            duration,
            {},
            {
                x: 0.01,
                y: 0.01,
                ease: CustomEase.create(
                    'bounceUpShadow',
                    'M0,0,C0,0,0.036,0.044,0.098,0.044,0.172,0.044,0.194,0.002,0.2,0,0.205,0.006,0.248,0.062,0.34,0.062,0.428,0.062,0.46,0.004,0.464,0,0.467,0.008,0.557,0.66,0.675,0.997,0.764,0.997,1,1,1,1'
                )
            },
            0
        );
    }

    bounceDown(delay) {
        // shirt bounces down after it reforms
        let duration = 1;
        let shirtAnimation = new TimelineMax();

        shirtAnimation.fromTo(
            this.shirtMesh.position,
            duration,
            {
                // from current position
            },
            {
                y: -10,
                ease: Bounce.easeOut
            },
            2.25
        );

        // animate shadow
        shirtAnimation.fromTo(
            this.shirtShadow.scale,
            duration,
            {
                x: 0.01,
                y: 0.01
            },
            {
                x: 1.5,
                y: 1.25,
                ease: Bounce.easeOut
            },
            2.25
        );
    }

    spinshirtClockwise(duration, delay) {
        // spin shirt during explosion
        let shirtAnimation = new TimelineMax();

        // spin shirt
        shirtAnimation.fromTo(
            this.shirtMesh.rotation,
            duration + 1.5,
            {
                y: THREE.Math.degToRad(0)
            },
            {
                y: THREE.Math.degToRad(360),
                ease: CustomEase.create(
                    'custom',
                    'M0,0 C0.06,0.536 0.142,0.652 0.3,0.8 0.492,0.98 0.818,1 1,1'
                )
            },
            0.75
        );
    }

    spinshirtAntiClockwise(duration, delay) {
        // spin shirt during explosion
        let shirtAnimation = new TimelineMax();

        // spin shirt
        shirtAnimation.fromTo(
            this.shirtMesh.rotation,
            duration + 0.25,
            {
                y: THREE.Math.degToRad(360)
            },
            {
                y: THREE.Math.degToRad(0),
                ease: CustomEase.create(
                    'custom',
                    'M0,0 C0.06,0.536 0.142,0.652 0.3,0.8 0.492,0.98 0.818,1 1,1'
                )
            },
            delay
        );
    }

    updateNextRider() {
        // set new rider data
        // set random rider
        this.$riders = assets._assets.riders;
        let character = this.$riders.riders[
            Math.floor(Math.random() * this.$riders.riders.length)
        ];
        let rider = assets._assets[character.model];

        // set rider data for 'facts'
        this.rider = character;

        // update end positions
        // update end colours
        let vertices = rider.vertices;
        let colors = rider.colors;
        let aEndPositionArray = new Float32Array(this.maxVerticesCount);
        let aEndColorArray = new Float32Array(this.maxVerticesCount);

        // assign new end position
        // assign new end colour
        for (let index = 0; index < this.maxVerticesCount; index += 3) {
            if (vertices[index]) {
                aEndPositionArray[index + 0] = vertices[index + 0];
                aEndPositionArray[index + 1] = vertices[index + 1];
                aEndPositionArray[index + 2] = vertices[index + 2];

                aEndColorArray[index + 0] = colors[index + 0];
                aEndColorArray[index + 1] = colors[index + 1];
                aEndColorArray[index + 2] = colors[index + 2];
            } else {
                aEndColorArray[index + 0] = 0;
                aEndColorArray[index + 1] = 0;
                aEndColorArray[index + 2] = 0;

                aEndPositionArray[index + 0] = 0;
                aEndPositionArray[index + 1] = 0;
                aEndPositionArray[index + 2] = 0;
            }
        }

        this.updateBufferGeometryAttribute(aEndPositionArray, 'aEndPosition');
        this.updateBufferGeometryAttribute(aEndColorArray, 'aEndColor');

        // animate again
        setTimeout(() => {
            this.changeState();
        }, this.timeout);
    }

    updateBufferGeometryAttribute(data, attributeName) {
        // set new data
        this.shirtMesh.geometry.attributes[attributeName].array = data;

        // update data for the gpu
        this.shirtMesh.geometry.attributes[attributeName].needsUpdate = true;
    }

    init() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        this.renderer.domElement.id = 'scene-canvas';

        // window.devicePixelRatio;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.world.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );

        window.camera = this.camera;

        this.camera.position.x = 0;
        this.camera.position.y = 30;
        this.camera.position.z = 125;

        // this.controls = new OrbitControls(this.camera)

        this.scene = new THREE.Scene();

        this.raycaster = new THREE.Raycaster();
    }

    initToujoursJaune() {
        let shirtBufferGeometry = new THREE.BufferGeometry();

        let shirtMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { type: 'f', value: 0 },
                uTimeReverse: { type: 'f', value: 1 },
                tMatCap: { type: 't', value: assets._assets.matcap }
            },
            vertexShader: vs,
            fragmentShader: fs,
            side: THREE.DoubleSide
        });

        shirtMaterial.uniforms.tMatCap.value.wrapS = shirtMaterial.uniforms.tMatCap.value.wrapT =
            THREE.ClampToEdgeWrapping;

        // set random rider
        this.$riders = assets._assets.riders;
        let character = this.$riders.riders[
            Math.floor(Math.random() * this.$riders.riders.length)
        ];
        let rider = assets._assets[character.model];

        // set rider data for 'facts'
        this.rider = character;

        // if first rider is a doper - set var
        if (this.rider.type === 'doper') {
            this.firstRiderIsDoper = true;
        }

        // set data from rider
        this.$tdftshirt = assets._assets.tdftshirt;
        let verticesCount = this.$tdftshirt.vertices.length;
        let vertices = rider.vertices;
        let colors = rider.colors;

        // set max vertices length to access in updateNextRider()
        this.maxVerticesCount = verticesCount;

        // attributes
        let aStartPositionArray = new Float32Array(this.$tdftshirt.vertices);
        let aEndPositionArray = new Float32Array(this.maxVerticesCount);

        let aNormalArray = new Float32Array(this.$tdftshirt.normals);

        for (let index = 0, j = 0; index < this.maxVerticesCount; index += 3) {
            if (vertices[index]) {
                aEndPositionArray[index + 0] = vertices[index + 0];
                aEndPositionArray[index + 1] = vertices[index + 1];
                aEndPositionArray[index + 2] = vertices[index + 2];
            } else {
                aEndPositionArray[index + 0] = 0;
                aEndPositionArray[index + 1] = 0;
                aEndPositionArray[index + 2] = 0;
            }
        }

        shirtBufferGeometry.addAttribute(
            'position',
            new THREE.BufferAttribute(aStartPositionArray, 3)
        );
        shirtBufferGeometry.addAttribute(
            'normal',
            new THREE.BufferAttribute(aNormalArray, 3)
        );
        shirtBufferGeometry.addAttribute(
            'aNormal',
            new THREE.BufferAttribute(aNormalArray, 3)
        );

        shirtBufferGeometry.addAttribute(
            'aStartPosition',
            new THREE.BufferAttribute(aStartPositionArray, 3)
        );
        shirtBufferGeometry.addAttribute(
            'aEndPosition',
            new THREE.BufferAttribute(aEndPositionArray, 3)
        );

        let aStartColorArray = new Float32Array(this.maxVerticesCount);
        let shirtColor = new THREE.Color(0xffc035);

        for (let index = 0; index < this.maxVerticesCount; index += 3) {
            aStartColorArray[index + 0] = shirtColor.r;
            aStartColorArray[index + 1] = shirtColor.g;
            aStartColorArray[index + 2] = shirtColor.b;
        }
        shirtBufferGeometry.addAttribute(
            'aStartColor',
            new THREE.BufferAttribute(aStartColorArray, 3)
        );

        let aEndColorArray = new Float32Array(this.maxVerticesCount);
        for (let index = 0, j = 0; index < this.maxVerticesCount; index += 3) {
            if (vertices[index]) {
                aEndColorArray[index + 0] = colors[index + 0];
                aEndColorArray[index + 1] = colors[index + 1];
                aEndColorArray[index + 2] = colors[index + 2];
            } else {
                aEndColorArray[index + 0] = 0;
                aEndColorArray[index + 1] = 0;
                aEndColorArray[index + 2] = 0;
            }
        }
        shirtBufferGeometry.addAttribute(
            'aEndColor',
            new THREE.BufferAttribute(aEndColorArray, 3)
        );

        let aControlPoint1Array = new Float32Array(this.maxVerticesCount);
        let aControlPoint2Array = new Float32Array(this.maxVerticesCount);

        // set offsets
        let xOffset = window.innerWidth / 8;
        let yOffset = window.innerHeight / 8;
        let zOffset = (window.innerWidth + window.innerHeight) / 8;

        for (
            let i = 0, index = 0;
            i < aStartPositionArray.length;
            index += 9, i += 9
        ) {
            // axis angle
            let v1 = new THREE.Vector3(
                aStartPositionArray[index + 0],
                aStartPositionArray[index + 1],
                aStartPositionArray[index + 2]
            );

            let v2 = new THREE.Vector3(
                aStartPositionArray[index + 3],
                aStartPositionArray[index + 4],
                aStartPositionArray[index + 5]
            );

            let v3 = new THREE.Vector3(
                aStartPositionArray[index + 6],
                aStartPositionArray[index + 7],
                aStartPositionArray[index + 8]
            );

            // face centroid
            let position = new THREE.Vector3();
            position.x = (v1.x + v2.x + v3.x) / 3;
            position.y = (v1.y + v2.y + v3.y) / 3;
            position.z = (v1.z + v2.z + v3.z) / 3;

            // multiply position
            position.multiplyScalar(THREE.Math.randFloat(1, 10));

            // add new centroid position to each vertex
            v1.add(position);
            v2.add(position);
            v3.add(position);

            // update positions
            aControlPoint1Array[i + 0] = v1.x;
            aControlPoint1Array[i + 1] = v1.y;
            aControlPoint1Array[i + 2] = v1.z;

            aControlPoint1Array[i + 3] = v2.x;
            aControlPoint1Array[i + 4] = v2.y;
            aControlPoint1Array[i + 5] = v2.z;

            aControlPoint1Array[i + 6] = v3.x;
            aControlPoint1Array[i + 7] = v3.y;
            aControlPoint1Array[i + 8] = v3.z;
        }
        shirtBufferGeometry.addAttribute(
            'aControlPoint1',
            new THREE.BufferAttribute(aControlPoint1Array, 3)
        );

        let axis = new THREE.Vector3();
        let aAxisAngleArray = new Float32Array((this.maxVerticesCount / 3) * 4);

        for (
            let index = 0;
            index < (this.maxVerticesCount / 3) * 4;
            index += 12
        ) {
            axis.x = THREE.Math.randFloatSpread(1);
            axis.y = THREE.Math.randFloatSpread(1);
            axis.z = THREE.Math.randFloatSpread(1);
            axis.normalize();

            let angle = Math.PI * THREE.Math.randFloat(-1, 1);
            // let angle = 0;

            aAxisAngleArray[index + 0] = axis.x;
            aAxisAngleArray[index + 1] = axis.y;
            aAxisAngleArray[index + 2] = axis.z;
            aAxisAngleArray[index + 3] = angle;

            aAxisAngleArray[index + 4] = axis.x;
            aAxisAngleArray[index + 5] = axis.y;
            aAxisAngleArray[index + 6] = axis.z;
            aAxisAngleArray[index + 7] = angle;

            aAxisAngleArray[index + 8] = axis.x;
            aAxisAngleArray[index + 9] = axis.y;
            aAxisAngleArray[index + 10] = axis.z;
            aAxisAngleArray[index + 11] = angle;
        }
        shirtBufferGeometry.addAttribute(
            'aAxisAngle',
            new THREE.BufferAttribute(aAxisAngleArray, 4)
        );

        // create mesh
        this.shirtMesh = new THREE.Mesh(shirtBufferGeometry, shirtMaterial);
        // this.shirtMesh.rotation.y = THREE.Math.degToRad(180)

        // hides flash of tshirt
        this.shirtMesh.position.y = 200;

        this.scene.add(this.shirtMesh);

        // give mesh a name
        this.shirtMesh.name = this.shirtName;

        // add properties
        this.shirtMesh.animationDuration = 1;
        this.shirtMesh.animationProgress = 0;
        this.shirtMesh.animationProgressReverse = 1.0;
        this.shirtMesh.frustumCulled = false;
    }

    addShadow() {
        let geometry = new THREE.PlaneGeometry(35, 7.5);
        let material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            map: assets._assets.shirtShadow
        });

        this.shirtShadow = new THREE.Mesh(geometry, material);
        this.shirtShadow.position.y = -17.5;
        this.shirtShadow.scale.set(0.01, 0.01, 1);
        this.shirtShadow.name = 'shirtShadow';

        this.scene.add(this.shirtShadow);
    }

    addRiderShadow() {
        let geometry = new THREE.PlaneGeometry(40, 20);
        let material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            map: assets._assets.riderShadow
        });

        // default shadow
        this.riderShadow = new THREE.Mesh(geometry, material);
        this.riderShadow.position.y = -25.5;
        this.riderShadow.scale.set(0.01, 0.01, 1);
        this.riderShadow.name = 'riderShadow';
        this.scene.add(this.riderShadow);
    }

    animate() {
        this.sceneAnimation = requestAnimationFrame(() => this.animate());

        this.update();
        this.render();
    }

    update() {}

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

class Preloader {
    constructor() {
        this.preloaderProgress = document.getElementById('preloader');

        this.queue = new createjs.LoadQueue(true, '/', true);

        let cdn = '/static/model'//'https://tourdefrancefrontendproduction.herokuapp.com/static';

        this.manifest = [
            {
                id: 'tdftshirt',
                src: `${cdn}/tdf-tshirt.json`
            },
            // {
            //     id: 'riders',
            //     src: `${cdn}/data/rider-data.json`
            // },
            // {
            //     id: 'wiggins',
            //     src: `${cdn}/data/riders/wiggins.json`
            // },
            // {
            //     id: 'contador',
            //     src: `${cdn}/data/riders/contador.json`
            // },
            // {
            //     id: 'hinault',
            //     src: `${cdn}/data/riders/hinault.json`
            // },
            // {
            //     id: 'froome',
            //     src: `${cdn}/data/riders/froome.json`
            // },
            // {
            //     id: 'merck',
            //     src: `${cdn}/data/riders/merck.json`
            // },
            // {
            //     id: 'coppi',
            //     src: `${cdn}/data/riders/coppi.json`
            // },
            // {
            //     id: 'landis',
            //     src: `${cdn}/data/riders/landis.json`
            // },
            // {
            //     id: 'lemond',
            //     src: `${cdn}/data/riders/lemond.json`
            // },
            // {
            //     id: 'anquetil',
            //     src: `${cdn}/data/riders/anquetil.json`
            // },
            // {
            //     id: 'armstrong',
            //     src: `${cdn}/data/riders/armstrong.json`
            // },
            // {
            //     id: 'bobet',
            //     src: `${cdn}/data/riders/bobet.json`
            // },
            // {
            //     id: 'fignon',
            //     src: `${cdn}/data/riders/fignon.json`
            // },
            // {
            //     id: 'pantani',
            //     src: `${cdn}/data/riders/pantani.json`
            // },
            // {
            //     id: 'indurain',
            //     src: `${cdn}/data/riders/indurain.json`
            // },
            // {
            //     id: 'roche',
            //     src: `${cdn}/data/riders/roche.json`
            // },
            {
                id: 'thomas',
                src: `${cdn}/thomas.json`
            }
        ];

        this.models = [
            {
                loaderType: 'texture',
                name: 'matcap',
                url: `${cdn}/img/matcap.png`
            },
            {
                loaderType: 'texture',
                name: 'shirtShadow',
                url: `${cdn}/img/shirt-shadow-yellow.png`
            },
            {
                loaderType: 'texture',
                name: 'riderShadow',
                url: `${cdn}/img/rider-shadow-yellow.png`
            }
        ];

        this.totalFiles = 0;
        this.filesLoaded = 0;
    }

    intro() {
        let progressAnimation = new TimelineMax({
            onComplete: () => {
                // delay
                setTimeout(() => {
                    this.init();
                }, 250);
            },
            paused: true
        });

        // ball drops in
        progressAnimation.fromTo(
            this.preloaderProgress,
            0.75,
            {
                y: -window.innerHeight
            },
            {
                y: 0,
                ease: Elastic.easeOut.config(1, 0.5)
            },
            0
        );

        // delay before playing animation
        setTimeout(() => {
            progressAnimation.play();
        }, 250);
    }

    init() {
        // instantiate a loader
        this.threeLoaderManager = new THREE.LoadingManager();
        this._loader = new THREE.TextureLoader(this.threeLoaderManager);

        this.threeLoaderManager.onStart = (item, loaded, total) => {
            // console.log( 'Loading started' );
        };

        this.threeLoaderManager.onProgress = (item, loaded, total) => {
            // console.log( item, loaded, total );

            // handle progress
            this.handleOverallProgress();
        };

        this.threeLoaderManager.onError = url => {
            // console.log( 'Error loading', url );
        };

        // calculate total file count
        this.totalFiles = this.models.length + this.manifest.length;

        // loop through manifest and load each item
        while (this.manifest.length > 0) {
            this.loadAsset();
            this.preloadThree();
        }

        // event listeners
        this.queue.on('fileload', e => this.handleFileLoad(e));
        this.queue.on('fileprogress', e => this.handleFileProgress(e));
        this.queue.on('error', e => this.handleFileError(e));
    }

    preloadThree() {
        // get next model
        let nextModel = this.models.shift();

        if (!nextModel) {
            // no more models to load
            return;
        }

        if (nextModel.loaderType == 'font') {
            this._loader = new THREE.FontLoader(this._threeLoadingManager);
        } else if (nextModel.loaderType == 'json') {
            this._loader = new THREE.JSONLoader(this._threeLoadingManager);
        } else if (nextModel.loaderType == 'object') {
            this._loader = new THREE.ObjectLoader(this._threeLoadingManager);
        }

        this._loader.load(
            nextModel.url,

            (geometry, materials) => {
                if (geometry) {
                    // save data to vue instance
                    // Vue.prototype['$' + nextModel.name] = geometry

                    assets._assets[nextModel.name] = geometry;
                }

                // load next model
                this.preloadThree();
            }
        );
    }

    loadAsset() {
        // Get the next manifest item, and load it
        let item = this.manifest.shift();

        // load item
        this.queue.loadFile(item);
    }

    handleFileLoad(event) {
        // set data on global Vue instance
        let name = event.item.id;
        let data = event.result;

        assets._assets[name] = data;

        this.handleOverallProgress();
    }

    handleFileProgress(event) {
        // console.log(event, event.progress)
    }

    handleFileError(event) {
        // console.log('handleFileError', event);
    }

    handleOverallProgress(type) {
        this.filesLoaded++;

        // handle progress
        let progress = this.filesLoaded / this.totalFiles;
        progress = progress * 100;
        progress = progress.toFixed(0);

        // increment loaded progress counter
        this.preloaderProgress.innerHTML = progress;

        if (this.totalFiles === this.filesLoaded) {
            // animate out
            let progressAnimation = new TimelineMax({
                onComplete: () => {
                    // delay
                    setTimeout(() => {
                        // complete preloader
                        this.preloadComplete();
                    }, 250);
                },
                paused: true
            });

            // ball drops out
            progressAnimation.fromTo(
                this.preloaderProgress,
                0.75,
                {
                    y: 0
                },
                {
                    y: window.innerHeight,
                    ease: Elastic.easeIn.config(1, 0.5)
                },
                0
            );

            // delay before playing animation
            setTimeout(() => {
                progressAnimation.play();
            }, 250);
        }
    }
    preloadComplete() {
        let result = app.preloadComplete();

        // run app now threejs is set up
        if (result) {
            setTimeout(() => {
                app.appInit();
            }, 250);
        }
    }
}

  class Assets {
      constructor() {
          this._assets = [];
      }
  }

  let assets = new Assets();
  let app = new ToujoursJaune();
  let preloader = new Preloader();

  // start app
  setTimeout(() => {

    document.getElementById('screenshot').classList.add('hide');
    preloader.intro();
  }, 2000);
})
