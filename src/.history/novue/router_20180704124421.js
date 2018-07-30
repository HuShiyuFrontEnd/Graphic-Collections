import router from './routerConfig'

let Router = function(){
    let path = this.getUrl();
    let node = router[path[0]];
    let useDom;
    let scripts = [];
    if(path.length == 0 || !router[path[0]])
        location.href = '/home';

    for(let i = 0;i < path.length;i++){
        //将延伸最远的dom引入
        if(node.dom)
            useDom = node.dom;
        //注入所有的css
        for(let j = 0;node.styles && j < node.styles.length;j++){
            node.styles[j]();
        }
        if(path[i - (-1)])
            node = node.children[path[i - (-1)]];
    }

    useDom().then(function(data){
        document.body.innerHTML = data;
    });

    if(node.main)
        node.main();
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