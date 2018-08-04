import { 
    core, //全局属性集中区域、各种发生器的集中区
    res, //资源管理
    Update, //
    anim, //动画工具
    //sceneManager //场景管理器
}from './core/core.js';// core/loader/res/container/easing/animation/cacheDict
import sheetConfig from './config.json';

class Main{
    constructor(){
        core.init('container');
        this.loading();
    }
    loading(){
        res.config(sheetConfig);
        res.load('preload');
        // res.onLoadEach = (name, texture, groupname) => {
        //     console.log(name, texture, groupname)
        // };
        res.onLoadProgress = (complete, error, total) => {
            if(complete == total)
                this.firstScene();
        }
    }
    onResize(width, height){
        console.log(width, height)
    }
    firstScene(){
        // let scene = core.useScene('first');

        let test_jpg = new core.Bitmap('test_jpg');

        console.log(test_jpg.buffer)

        let update = new Update('global',(delt, total) => {
            // core._ctx.drawImage(img)
            let target = test_jpg.buffer
            core._ctx.drawImage(target, 0, 0);
        })
    }
}

let main = new Main();
console.log(core)