const WebGLBaseSCSS = () => import('@/components/webgl/lib/webglBase.scss');
const WebGLBaseDOM = () => import('@/components/webgl/lib/webglBase.html');
const homeDOM = () => import('@/components/home/home.html');
const homeSCSS = () => import('@/components/home/home.scss');

//myscript
const helloworld = () => import('@/components/webgl/helloworld')

//轻dom架构
const router = {
    'home':{
        dom:homeDOM,
        styles:[helloworld],
    },
    //开发平台
    'webgl':{
        dom:WebGLBaseDOM,
        styles:[WebGLBaseSCSS],
        children:{
            //应用
            'helloworld':{
                // main:helloworld,
            },
        }
    }
}

export default router;