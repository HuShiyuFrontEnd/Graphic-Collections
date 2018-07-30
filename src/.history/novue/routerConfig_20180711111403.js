const WebGLBaseSCSS = () => import('@/components/webgl/lib/webglBase.scss');
const WebGLBaseDOM = () => import('@/components/webgl/lib/webglBase.html');
const homeDOM = () => import('@/components/home/home.html');
const homeSCSS = () => import('@/components/home/home.scss');

//myscript
//webgl
const helloworld = () => import('@/components/webgl/helloworld/index.js');
const working = () => import('@/components/webgl/working/index.js');
const dealimg = () => import('@/components/webgl/dealimg/index.js');
//performance
const performswitch = () => import('@/components/performance/switch/index.js');

//轻dom架构
const router = {
    'home':{
        dom:homeDOM,
        styles:[homeSCSS],
    },
    //开发平台
    //webgl主要基于对canvas的操作，95%以上的工作用js完成
    'webgl':{
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
            }
        }
    },
    'performance':{
        children:{
            'switch':{
                main:performswitch
            }
        }
    }
}

export default router;