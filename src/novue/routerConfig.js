import machineRouter from './machineRouter.js';

const WebGLBaseSCSS = () => import('@/components/webgl/lib/webglBase.scss');
const WebGLBaseDOM = () => import('@/components/webgl/lib/webglBase.html');
const ThreeJSBaseJS = () => import('@/components/threejs/lib/base.js');
const ThreeJSBaseDOM = () => import('@/components/threejs/lib/threejsBase.html');
const ThreeJSBaseSCSS = WebGLBaseSCSS;

//myscript
//threejs
    //learning threejs
const d11firstscene = () => import('@/components/threejs/1.1firstscene/index.js');
const d21sceneset = () => import('@/components/threejs/2.1sceneset/index.js'); 
const d22geometries = () => import('@/components/threejs/2.2geometries/index.js');
    //threejs-gpgpu-birds 
const birdd10 = () => import('@/components/threejs/bird1.0/index.js')
//webgl
const helloworld = () => import('@/components/webgl/helloworld/index.js');
const working = () => import('@/components/webgl/working/index.js');
const dealimg = () => import('@/components/webgl/dealimg/index.js');
const dealimg2 = () => import('@/components/webgl/dealimg2/index.js');
const translate2d = () => import('@/components/webgl/translate2d/index.js')
const orthophoto = () => import('@/components/webgl/orthophoto/index.js')
const gpgpu = () => import('@/components/webgl/gpgpu/index.js')
//performance
const performswitch = () => import('@/components/performance/switch/index.js');
//cssonly
const sliderItem = () => import('@/components/cssonly/slider/index.js');
const sliderDom = () => import('@/components/cssonly/slider/index.html');
const sliderScss = () => import('@/components/cssonly/slider/style.scss');
const coolformDOM = () => import('@/components/cssonly/coolform/coolform.html');
const coolformScss = () => import('@/components/cssonly/coolform/coolform.scss');
const coolformController = () => import('@/components/cssonly/coolform/coolform.js');
const pureCSSJumpDOM = () => import('@/components/cssonly/pureCSSJump/purecss.html');
const pureCSSJumpScss = () => import('@/components/cssonly/pureCSSJump/purecss.scss');
const pureCSSJumpController = () => import('@/components/cssonly/pureCSSJump/purecss.js');
//svg
const elasticInputScss = () => import('@/components/svg/elasticInput/index.scss');
const elasticInputDOM = () => import('@/components/svg/elasticInput/index.html');
//canvas
const engineremake = () => import('@/components/canvas/engineremake/index.js');
const bonerobot = () => import('@/components/canvas/bonerobot/index.js');
 
//轻dom架构
let router = {
    //开发平台
    //webgl主要基于对canvas的操作，95%以上的工作用js完成
    //九州明月造化内，锦鲤金龙河图中
    'webgl':{
        peom:'九州明月造化内，锦鲤金龙河图中',
        dom:WebGLBaseDOM,
        styles:[WebGLBaseSCSS],
        children:{
            //应用
            'helloworld':{
                main:helloworld,
            },
            'working':{
                main:working,
            },
            'dealimg':{
                main:dealimg
            },
            'dealimg2':{
                main:dealimg2
            },
            'translate2d':{
                main:translate2d
            },
            'orthophoto':{
                main:orthophoto
            },
            'gpgpu':{
                main:gpgpu
            }
        }
    },
    //性能测试
    //巧取风雷化双翼，手执神兵当先锋
    'performance':{
        peom:'巧取风雷化双翼，手执神兵当先锋',
        children:{
            'switch':{
                main:performswitch
            },
        }
    },
    //螣蛇乘雾吞巨象，遇雨化龙金鳞开
    'svg':{
        peom:'螣蛇乘雾吞巨象，遇雨化龙金鳞开',
        desc:'svg技术，即Scalable Vector Graphics(可缩放矢量图形),相比起css、canvas等技术，技术栈的深度处于中等<br>核心优势：处理以路径为核心的动画时有显著优势，与html还有css可以耦合使用，可由ui用AI软件出直接可以写交互的svg标签（但需要开发粗加工一下），另外还有十分强大的滤镜功能（功能强于css、canvas，弱于webgl用户shader，但是开发难度亦低于webgl用户shader）',
        children:{
            'elasticinput':{
                dom:elasticInputDOM,
                styles:[elasticInputScss]
            }
        }
    },
    //麻雀虽小五脏具，茅庐未出三国分
    'cssonly':{
        peom:'麻雀虽小五脏具，茅庐未出三国分',
        children:{
            'slider':{
                main:sliderItem,
                dom:sliderDom,
                styles:[sliderScss],
            },
            'coolform':{
                main:coolformController,
                dom:coolformDOM,
                styles:[coolformScss],
            },
            'purecssjump':{
                main:pureCSSJumpController,
                dom:pureCSSJumpDOM,
                styles:[pureCSSJumpScss]
            }
        }
    },
    //天地无涯分四象，洪荒来去拓两仪
    'canvas':{
        peom:'天地无涯分四象，洪荒来去拓两仪',
        dom:ThreeJSBaseDOM,
        styles:[ThreeJSBaseSCSS],
        children:{
            'engineremake':{
                main:engineremake
            },
            'bonerobot':{
                main:bonerobot
            }
        }
    },
    //落红本是无情物，化作春泥更护花
    'math':{
        peom:'落红本是无情物，化作春泥更护花',
    },
    //两岸猿声啼不住，轻舟已过万重山
    'threejs':{
        peom:'两岸猿声啼不住，轻舟已过万重山',
        dom:ThreeJSBaseDOM,
        styles:[ThreeJSBaseSCSS],
        children:{
            '1.1firstscene':{
                main:d11firstscene,
            },
            '2.1sceneset':{
                main:d21sceneset
            },
            '2.2geometries':{
                main:d22geometries
            },
            'bird1.0':{
                main:birdd10
            }
        }
    },
    //笑领汉骑三千骏，直捣黄龙万里遥
    'free':{
    },
    //
    'doodle':{
        peom:'定场诗酝酿中...',
        desc:'[核心技术栈]grid布局、自定义标签、自定义属性、css动画技术、shadowDOM、高级CSS选择器<br>[感受集群之美]doodle是一个基于grid布局+shadowDom的纹理绘制库，可以做出许多很炫酷的效果',
        children:[]
    },
    'gsap':{
        peom:'定场诗酝酿中...',
        desc:'全名Grees Sock Animation Platform，是一系列html动画开发标准组件的合集',
        children:[]
    }
};

for(let p in machineRouter){
    for(let q in machineRouter[p]){
        if(typeof machineRouter[p][q] == 'object'){
            for(let r in machineRouter[p][q]){
                router[p][q][r] = machineRouter[p][q][r];
            }
        }
        else router[p][q] = machineRouter[p][q];
    }
}

export default router;