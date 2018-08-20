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
        core.useScene('firstScene')

        let circle = new core.Shape();
        circle.width = 100;
        circle.height = 100;
        circle.ctx.rect(10, 10, 50, 50);
        circle.ctx.fill();

        res.addShapeTexture('circle', circle);

        let bitmap = new 

        core.render()
    }
}

let main = new Main();