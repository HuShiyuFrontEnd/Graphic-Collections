/**
 * @example npm run add --[projectname]/[piecename]
 * projectname目前支持: cssonly svg canvas webgl threejs performance math free
 * 用于迅速在分之下开启一个作品的必要单位
 */

var chalk = require('chalk');
var fs = require('fs');

var argv;
try {
    argv = JSON.parse(process.env.npm_config_argv).original;
}	catch(ex) {
    argv = process.argv;
}
argv = argv[2].split('--')[1].split('/');

let project = argv[0];
let piece = argv[1];

let path = './src/components';
let piecePath = `${path}/${project}/${piece}`;
try{
    fs.mkdirSync(piecePath);
    console.log('合法的新项目名')
    switch(project){
        case 'canvas':
            fs.writeFile(`${piecePath}/index.js`, '', (err) => {
                if(err) throw err;
                console.log('index.js创建成功')
            })
            break;
        case 'cssonly':
        fs.writeFile(`${piecePath}/index.html`, '', (err) => {
            if(err) throw err;
            console.log('index.html创建成功')
        })
        fs.writeFile(`${piecePath}/index.js`, `console.log("this is main js for piece - ${piece} in project ${project}")`, (err) => {
            if(err) throw err;
            console.log('index.js创建成功')
        })
        fs.writeFile(`${piecePath}/style.scss`, '', (err) => {
            if(err) throw err;
            console.log('style.scss创建成功')
        })
        break;
        case 'svg':
        fs.writeFile(`${piecePath}/index.html`, '', (err) => {
            if(err) throw err;
            console.log('index.html创建成功')
        })
        fs.writeFile(`${piecePath}/index.js`, `console.log("this is main js for piece - ${piece} in project ${project}")`, (err) => {
            if(err) throw err;
            console.log('index.js创建成功')
        })
        fs.writeFile(`${piecePath}/style.scss`, '', (err) => {
            if(err) throw err;
            console.log('style.scss创建成功')
        })
        break;
        case 'doodle':
        fs.writeFile(`${piecePath}/index.html`, '', (err) => {
            if(err) throw err;
            console.log('index.html创建成功')
        })
        fs.writeFile(`${piecePath}/index.js`, `console.log("this is main js for piece - ${piece} in project ${project}")`, (err) => {
            if(err) throw err;
            console.log('index.js创建成功')
        })
        fs.writeFile(`${piecePath}/style.scss`, '', (err) => {
            if(err) throw err;
            console.log('style.scss创建成功')
        })
        break;
        case 'gsap':
        fs.writeFile(`${piecePath}/index.html`, '', (err) => {
            if(err) throw err;
            console.log('index.html创建成功')
        })
        fs.writeFile(`${piecePath}/index.js`, `console.log("this is main js for piece - ${piece} in project ${project}")`, (err) => {
            if(err) throw err;
            console.log('index.js创建成功')
        })
        fs.writeFile(`${piecePath}/style.scss`, '', (err) => {
            if(err) throw err;
            console.log('style.scss创建成功')
        })
        break;
        case 'threejs':
        fs.writeFile(`${piecePath}/index.js`, `console.log("this is main js for piece - ${piece} in project ${project}")`, (err) => {
            if(err) throw err;
            console.log('index.js创建成功')
        })
        default:break;
    }
}catch(e){
    console.log(e)
    console.log(chalk.red('该项目中，这个作品名似乎已经存在了'));
}

let machineRouterPath = './src/novue/machineRouter.js';
let machineRouterOriginPath = './src/novue/machineOrigin.js';
let machineRouterOrigin = require(machineRouterOriginPath);
let machineRouter;

let writeRouter = (data, path, log) => {
    let writeStream = fs.createWriteStream(path);
    writeStream.write(data, "UTF8");
    // //标记文件末尾
    writeStream.end();
    // //处理事件流    
    writeStream.on("finish", () => {if(log) console.log(log)}); 
    writeStream.on("error", err => console.log(err));
}

let writeMachineRouter = (machineRouterOrigin) => {

}

if(machineRouterOrigin[project].children.indexOf(piece) > -1){
    console.log('这个piece已经存在，请手动处理')
}else{
    machineRouterOrigin[project].children.push(piece);
    writeRouter(`let a =${JSON.stringify(machineRouterOrigin)};module.exports = a;`, machineRouterOriginPath);
    let objectText = '';
    for(let p in machineRouterOrigin){
        let content = '';
        for(let piece of machineRouterOrigin[p].children){
            switch(p){
                case 'canvas':
                content += `"${piece}":{"main":() => import('@/components/canvas/${piece}/index.js')},`;
                ;break;
                case 'cssonly':
                content += `"${piece}":{"main":() => import('@/components/cssonly/${piece}/index.js'),"dom":() => import('@/components/cssonly/${piece}/index.html'),"styles":[() => import('@/components/cssonly/${piece}/style.scss')]},`;
                break;
                case 'svg':
                content += `"${piece}":{"main":() => import('@/components/svg/${piece}/index.js'),"dom":() => import('@/components/svg/${piece}/index.html'),"styles":[() => import('@/components/svg/${piece}/style.scss')]},`;
                break;
                case 'doodle':
                content += `"${piece}":{"main":() => import('@/components/doodle/${piece}/index.js'),"dom":() => import('@/components/doodle/${piece}/index.html'),"styles":[() => import('@/components/doodle/${piece}/style.scss')]},`;
                break;
                case 'gsap':
                content += `"${piece}":{"main":() => import('@/components/gsap/${piece}/index.js'),"dom":() => import('@/components/gsap/${piece}/index.html'),"styles":[() => import('@/components/gsap/${piece}/style.scss')]},`;
                break;
                case 'threejs':
                content += `"${piece}":{"main":() => import('@/components/threejs/${piece}/index.js')},`;
                ;break;
                default:break;
                
            }
        }
        objectText += `"${p}":{"children":{${content}}},`;
    }
    machineRouter = `let machineRouter = {${objectText}};export default machineRouter;`
    writeRouter(machineRouter, machineRouterPath);
}
