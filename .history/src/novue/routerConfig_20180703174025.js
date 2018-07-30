const WebGLBaseCSS = () => import('@/components/webgl/lib/webglBase.scss');
const WebGLBaseDOM = () => import('@/components/webgl/lib/webglBase.html');

//myscript
const helloworld = () => import('@/components/webgl/helloworld')

//轻dom架构
const router = {
    //开发平台
    'webgl':{
        dom:WebGLBaseDOM,
        styles:[WebGLBaseCSS],
        children:{
            //应用
            'helloworld':{
                main:helloworld,
            },
        }
    }
}

export default router;