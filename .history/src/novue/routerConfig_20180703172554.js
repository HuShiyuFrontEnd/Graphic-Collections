const WebGLBaseCSS = () => import('@/components/webgl/lib/webglBase.scss');
const WebGLBaseDOM = () => import('@/components/webgl/lib/webglBase.html');

//myscript
const helloworld = () => import('@/components/webgl/helloworld')
const helloworldExample = () => import('@/components/webgl/helloworld/index.1.js')

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
            'helloworldExample':{
                main:helloworldExample
            }
        }
    }
}

export default router;