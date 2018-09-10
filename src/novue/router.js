import router from './routerConfig';

let Router = function(){
    let path = this.getUrl();
    let node = router[path[0]];
    let useDom;
    let scripts = [];
    if(path.length == 0){
        let indexDom = `<h1>前端视觉探索项目</h1><h3>${'前端开发者第一的职能，是<span>呈现</span>'}<br>最<span>优雅</span>的画面效果<br>最<span>极致</span>的页面、图像性能<br>最<span>炫酷而稳定</span>的动画效果<br>最<span>流畅而有趣</span>的交互<br>信息，能分清主次的最<span>直接</span>的得到传达<br>画面，每一帧都<span>流畅</span>而<span>美丽</span><br>交互，每个动作都包含<span>温暖</span>和<span>善意</span><br>让前端的使用者，感到<span>轻松</span>和<span>喜悦</span><br>向着这个目标，不断的探索</h3>`;
        for(let p in router){
            indexDom += (`<a href='/${p}'><span>[${p}专题]</span>${(router[p].peom)||'尚未开题'}</a>`)
        }
        document.body.innerHTML = indexDom;
        let style = document.createElement("style");
        style.innerHTML = 'body{padding:40px;}h1{color:#f56487;font-size:24px;font-weight:bold;line-height:50px;}h3{font-size:18px;line-height:30px;color:#666;padding-bottom:5px;}h3>span{color:#f56487;}a{width:100%;color:#444;display:inline-block;font-size:16px;line-height:24px;color:#f56487;}';
        document.head.appendChild(style);
    }else if(path.length == 1){
        let project = router[path[0]];
        let indexDom = `<h1>${path[0]}项目合集</h1><h3>${project.desc||'暂无介绍'}</h3>`;
        if(!project.children) alert('项目施工中'), history.go(-1);
        console.log(project)
        for(let p in project.children){
            indexDom += (`<a href='/${path[0]}/${p}'>${p}</a>`)
        }
        document.body.innerHTML = indexDom;
        let style = document.createElement("style");
        style.innerHTML = 'body{padding:40px;}h1{color:#f56487;font-size:24px;font-weight:bold;line-height:50px;}h3{font-size:18px;line-height:30px;color:#666;padding-bottom:5px;}a{width:100%;color:#f56487;display:inline-block;font-size:16px;line-height:30px;}';
        document.head.appendChild(style);
    }if(path.length > 1){
        switch(path[0]){
            case 'doodle':
                node = node.children[path[1]];
                node.dom().then(function(data){
                    document.body.innerHTML = data;
                    let doodle = document.createElement('script');
                    doodle.src = '/static/css-doodle.min.js';
                    document.body.appendChild(doodle);
                });
                for(let j = 0;node.styles && j < node.styles.length;j++){
                    node.styles[j]();
                }
                break;
            case 'threejs':
                useDom = node.dom;
                for(let j = 0;node.styles && j < node.styles.length;j++){
                    node.styles[j]();
                }
                node = node.children[path[1]];
                for(let j = 0;node.styles && j < node.styles.length;j++){
                    node.styles[j]();
                }
                break;
            default:{
                for(let i = 0;i < path.length;i++){
                    if(path[i - (-1)])
                        node = node.children[path[i - (-1)]];
                    //将延伸最远的dom引入
                    if(node.dom)
                        useDom = node.dom;
                    //注入所有的css
                    for(let j = 0;node.styles && j < node.styles.length;j++){
                        node.styles[j]();
                    }
                }
            };break;
        }
        if(useDom)
            useDom().then(function(data){
                document.body.innerHTML = data;
            });
    
        if(node.main)
            node.main();
    }

}

Router.prototype.getUrl = function(){
    let url = location.pathname;
    url = url.split('/');
    let result = [];
    for(let i = 0;i < url.length;i++){
        if(!url[i])
            continue;
        else result.push(url[i]);
    }
    return result;
}

export default Router