import Subscriber from '@/components/common/subscriber.js'

let sheetList = {
    root:'/static/assets/',
    list:[
        'fly_gold.png',
        'flying_book.png',
        'flying_circle.png',
        'main.png',
        'medal_fly.png',
        'meteor_red.png',
        'meteor_white.png',
        'ribbon_1.png',
        'ribbon_2.png'
    ]
}

let animation = {
    main:{
    },
    book:{
        wait:550,
        duration:11000,
        ease:function(a, b, c){
            return a/c;
        },
        from:{
            x:520,
            y:-10,
            rotate:-10
        },
        to:{
            x:620,
            y:0,
            rotate:20 
        }
    },
    gold:{
        wait:550,
        duration:11000,
        ease:function(a, b, c){
            return Math.sin(a/10);
        },
        from:{
            x:350,
            y:100,
        },
        to:{
            x:352,
            y:102,
        }
    }
}

function valueInRange(val,min,max){
    if(min!=undefined&&val<min)
        return min;
    if(max!=undefined&&val>max)
        return max;
    return val;
}

function getBoundingBoxFromPoints(PointArray){
    let minX = 0,minY = 0,maxX = 0,maxY = 0;
    let length = PointArray.length;
    for(let i = 0;i < length;i++){
        let point = PointArray[i];
        maxX = Math.max(point[0], maxX);
        minX = Math.min(point[0], minX);
        maxY = Math.max(point[1], maxY);
        minY = Math.min(point[1], minY);
    }
    return [minX, minY, maxX, maxY];
}

//t=当前动画运行了多长时间,b=动画开始位置,c动画结束位置,d=动画总时长
const LINEAR = function(t, b, c, d){
    if(t > d) t = d;
    return ((c - b) * t / d + b) ;
}
const FLOAT_BETWEEN = function(t, b, c, d){
    if(t > d) t = d;
    return (c - b) * (Math.sin(t / d * 20) + 0.5) + b;
}
const EASE_IN = function(t, b, c, d){
    if(t > d) t = d;
    t /= d;
    return (c - b) * t * t * t + b;
}

function Texture(img){
    if(!img){
        console.error('create Texture error:不存在的img参数')
        return false;
    }
    this.name = img.name;
    this.buffer = document.createElement('canvas');
    this.context = this.buffer.getContext('2d');
    this.width = img.width;
    this.height = img.height;
    this.buffer.width = this.width;
    this.buffer.height = this.height;
    this.context.drawImage(img, 0, 0);
}


const Matrix = {
    Matrix12(x, y){
        let m = [
            x, 
            y
        ];
        m.spec = [1, 2];
        return m;
    },
    Matrix22(a, b, c, d){
        let m = [
            a, c,
            b, d
        ];
        m.spec = [2, 2];
        return m;
    },
    //Fork Multiply  22 x 12 = 12
    FM_22_12(m22, m12){
        return [
            m12[0] * m22[0] + m12[1] * m22[1],
            m12[0] * m22[2] + m12[1] * m22[3]
        ]
    },
    Mnormal(m, n){
        let length = m.length;
        for(let i = 0;i < length;i++) m[i] = m[i] * n;
    }
}

//具备补间动画的基本单位，其child可以是 Sprite、Bitmap、BitmapText、MovieClip等等
//约定：在本项目中，boundingbox的概念应该是[minx, miny ,maxX, maxY]
function Sprite({width, height, x, y} = {}){
    this.temp = document.createElement('canvas');
    this.tempCtx =this.temp.getContext('2d');
    this.buffer = document.createElement('canvas');
    this.ctx = this.buffer.getContext('2d');
    this.x = 0;
    this.y = 0;
    this.type = 'Sprite';
    this.offsetX = 0;
    this.offsetY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.opacity = 1;
    this.anchorX = 0.5;
    this.anchorY = 0.5;
    this.rotate = 0;
    this.transformUse = false;
    // this.originWidth = 0;
    // this.originHeight = 0;
    this.width = 0;
    this.height = 0;
    this.bound = null;
    this.children = [];
    this.showBorder = false;//绘制边缘
    this.getChildByName = (name) => {

    }
    this.computeBound = function(){
        this.bound = null;
        for(let child of this.children){
            let bound = [child.x + (child.offsetX||0) + child.bound[0], child.y + (child.offsetY||0) + child.bound[1], child.x + (child.offsetX||0) + child.bound[2], child.y + (child.offsetY||0) + child.bound[3]];
            if(!this.bound){ this.bound = bound;continue; }
            else{
                if(bound[0] < this.bound[0]) this.bound[0] = bound[0];
                if(bound[1] < this.bound[1]) this.bound[1] = bound[1];
                if(bound[2] > this.bound[2]) this.bound[2] = bound[2];
                if(bound[3] > this.bound[3]) this.bound[3] = bound[3];
            }
        }
        let width = this.bound[2] - this.bound[0];
        let height = this.bound[3] - this.bound[1];
        this.offsetX = this.bound[0];
        this.offsetY = this.bound[1];
        this.bound = [0, 0, width, height];//width = 0 +width,height = 0 + height
        this.transformBoundingBox();
        this.width = width;
        this.height = height;
        this.buffer.width = width;//+ this.offsetX;
        this.buffer.height = height;// + this.offsetY;
        // this.originWidth = width;
        // this.originHeight = height;
        // let max = Math.sqrt(Math.pow(this.originWidth * this.scaleX, 2) + Math.pow(this.originHeight * this.scaleY, 2));
        // this.temp.width = this.originWidth;
        // this.temp.height = this.originHeight;
    }
    this.transformBoundingBox = () => {
        this.anchorX = valueInRange(this.anchorX, 0, 1);
        this.anchorY = valueInRange(this.anchorY, 0, 1);
        let width = this.width;
        let height = this.height;
        let offsetX = this.anchorX * width;
        let offsetY = this.anchorY * height;
        let boundingBoxPoints = [ 
            [ this.bound[0] - offsetX, this.bound[1] - offsetY ], 
            [ this.bound[2] - offsetX, this.bound[1] - offsetY ],
            [ this.bound[0] - offsetX, this.bound[3] - offsetY ], 
            [ this.bound[2] - offsetX, this.bound[3] - offsetY ],
        ];
        if(this.scaleX != 1 || this.scaleY != 1 || this.rotate !=0 ){
            let sina = Math.sin(this.rotate * Math.PI / 180);
            let cosa = Math.cos(this.rotate * Math.PI / 180);
            let transformMatrix = [
                cosa * this.scaleX, sina * this.scaleX,
                -sina * this.scaleY, cosa * this.scaleY
            ];
            for(let i = 0;i < 4;i++){
                boundingBoxPoints[i] = Matrix.FM_22_12(transformMatrix, boundingBoxPoints[i]);
                boundingBoxPoints[i][0] += offsetX;
                boundingBoxPoints[i][1] += offsetY;
            }
            this.bound = getBoundingBoxFromPoints(boundingBoxPoints);
            // console.log(this.bound)
        }
    }
    this.add = (child) => {
        child.parent = this;
        this.children.push(child);
        this.computeBound();
        this.render();
    }
    //为了使其旋转和放缩围绕中心点，render的时候，会给一个平移（简化算法）
    this.render = (compute) => {
        if(compute)
            this.computeBound();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.globalAlpha = this.opacity;
        // this.tempCtx.clearRect(0, 0, this.originWidth, this.originHeight);
        for(let item of this.children){
            if((item.scaleX != 1 || item.scaleY != 1 || item.rotate != 0) && item.type != 'BitMap'){
                let alpha = Math.PI / 180 * item.rotate;
                let sina = Math.sin(alpha);
                let cosa = Math.cos(alpha);
                let w = item.width * item.scaleX;
                let h = item.height * item.scaleY;
                this.ctx.setTransform(
                    item.scaleX * cosa, 
                    -item.scaleX * sina, 
                    item.scaleY * sina, 
                    item.scaleY * cosa, 
                    -(w * cosa + h * sina) * item.anchorX + item.x + (item.offsetX||0) - this.offsetX + (item.width) * item.anchorX, 
                    (w * sina - h * cosa) * item.anchorY + item.y + (item.offsetY||0) - this.offsetY + (item.height) * item.anchorY
                );
            }else this.ctx.setTransform(1, 0, 0, 1, item.x + (item.offsetX||0) - this.offsetX, item.y + (item.offsetY||0) - this.offsetY);

            this.ctx.drawImage(item.buffer, 0, 0);
            if(item.showBorder){
                this.ctx.setTransform(1, 0, 0, 1, item.x + (item.offsetX||0) - this.offsetX, item.y + (item.offsetY||0) - this.offsetY);
                // item.bound[0] + item.x - this.offsetX, item.bound[1] + item.y - this.offsetY
                this.ctx.strokeRect(item.bound[0], item.bound[1], item.bound[2] - item.bound[0] + item.offsetX, item.bound[3] - item.bound[1] + item.offsetY);
            }
        }
        // if(this.scaleX != 1 || this.scaleY != 1 ||this.rotate != 0 || this.transformUse){
        //     let alpha = Math.PI / 180 * this.rotate;
        //     let sina = Math.sin(alpha);
        //     let cosa = Math.cos(alpha);
        //     let w = this.originWidth * this.scaleX;
        //     let h = this.originHeight * this.scaleY;
        //     this.ctx.setTransform(this.scaleX * cosa, -this.scaleX * sina, this.scaleY * sina, this.scaleY * cosa, -(w * cosa + h * sina) / 2 + this.width / 2, (w * sina - h * cosa) / 2 + this.width / 2 );
        // }
        // this.ctx.drawImage(this.temp, 0, 0, this.originWidth, this.originHeight);
        if(this.parent)
            this.parent.render(true);
    }
    this.particleSet = (particle) => {
        
    }
}

//本身不具备动画能力
function BitMap(texture, x, y, width, height){
    if(!texture) return false;
    this.type = 'BitMap';
    this.texture = texture;
    this.buffer = texture.buffer;
    this.width = width || texture.width;
    this.height = height || texture.height;
    this.x = x||0;
    this.y = y||0;
    this.bound = [0, 0, this.width, this.height];
    this.refreshTree = function(){
        this.parent.render(true);
    }
}

function Scene(width, height){
    this.buffer = document.createElement('canvas');
    this.ctx = this.buffer.getContext('2d');
    this.width = width;
    this.height = height;
    this.buffer.width = width;
    this.buffer.height = height;
    this.children = [];
    this.add = (child) => {
        this.children.push(child);
        child.parent = this;
        this.render();
    }
    this.render = () => {
        this.ctx.clearRect(0, 0, this.width, this.height)
        for(let item of this.children){
            this.ctx.drawImage(item.buffer, item.x + item.offsetX, item.y + item.offsetY);
        }
    }
}

//event list:
//example[push type] [params...] [use]
//progress[cover] [current, total] [接收加载进度]
function GameObject(){
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('id','gameObjectCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.renderStack = [];
    // this.scene.parent = this;
    //预载资源/进度管理
    this.sheetStack = {};
    this.insert = function(containerId){
        this.container = document.getElementById(containerId);
        this.container.appendChild(this.canvas);
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.scene = new Scene(this.width, this.height);
    }
    this.preload = function(sheetList){
        this.progressStart(sheetList.list.length);
        for(let item of sheetList.list){
            let url = sheetList.root + item;
            let name = item.replace(/\./g,'_');
            if(/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(url)){
                this.imgLoader(url,name);
            }
        }
    }
    this.progress = [0, 0];
    this.progressStart = function(length){
        this.progress[1] = length;
        Subscriber.register('sourceloaded',() => {
            this.progress[0]++;
            Subscriber.cover('progress', ...this.progress);
        })
    }
    //图片读取器
    this.imgLoader = function(url, name){
        let img = new Image();
        let that = this;
        img.src = url;
        img.name = name;
        img.onload = () => {
            if(that.sheetStack[name]) console.error(`同名资源${name}`);
            that.sheetStack[name] = new Texture(img);
            Subscriber.cover('sourceloaded');
            img = null;
        }
        img.onerror = () => {
            console.error(`img:${url} 加载失败，请检查资源是否存在`)
            Subscriber.cover('sourceloaded');
            img = null;
        }
    }
    //
    this.createBitMap = (name, width, height, x, y) => {
        return new BitMap(this.sheetStack[name], width, height, x, y);
    }
    this.render = () => {
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.ctx.drawImage(this.scene.buffer, 0, 0);
    }
    //轮询逻辑
    this.tickStack = [];
    this.starttime = 0;
    this.lasttime = 0;
    this.pushTickStack = (func,target) => {
        this.tickStack.push({
            func:func,
            target:target,
            enable:true
        })
        return this.tickStack.length-1;
    }
    this.popTickStack = (index) => {
        this.tickStack[index] = null;
    }
    this.tick = () => {
        let now = Date.now();
        if(this.lasttime == 0 || now - this.lasttime > 500){
            this.lasttime = now;
            RAF.call(window,this.tick.bind(this));
            return false;
        }
        if(!this.starttime) this.starttime = now;
        let total = now - this.starttime;
        let delt = now - this.lasttime;
        this.lasttime = now;
        
        for(let item of this.tickStack){
            if(!item || !item.enable)
                continue;
            item.func.call(item.target || this, delt, total);
        }
        this.render();

        RAF.call(window,this.tick.bind(this));
    }
    //动画处理
    this.addTransition = (target, setting) => {
        let transform = {};
        let to = setting.to;
        let duration = setting.duration;
        let ease = setting.ease;
        let start;
        for(let key in setting.from){
            target[key] = setting.from[key];
            transform[key] = setting.to[key] - setting.from[key];
        }
        setTimeout(() => {
            let transitionStack = this.pushTickStack(function(delt ,total){
                if(!start) start = total;
                // console.log(total,start,duration)
                if(total - start >duration){
                    for(let key in transform){
                        target[key] = to[key];
                    }
                    this.popTickStack(transitionStack);
                    console.log('transition end')
                }else{
                    let deltTransform = ease(delt, total-start, duration);
                    for(let key in transform){
                        target[key] += transform[key] * deltTransform;
                    }
                }
                target.render();
            });
        },setting.wait);
    }
}

window.RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback, element) {
    var start,
        finish;
    window.setTimeout(function(){
        start =+ new Date();
        callback(start);
        finish =+ new Date();
        self.timeout = 1000 / 60 - (finish - start);
    },self.timeout);
};

let gameObject = new GameObject();

let Tween =(function(game){
    return function(name){
        this.name = name;
        this.animateIn = false;
        this.gameObject = game;
        this.stack = [];
        this.target = null;
        this.start = null;//记录动画开始的初始参数
        this.startTime = 0;//当动画开始时，将update的total传过来，用于记录初始动画位置
        this.duration = 0;
        this.end = null;//将需要被执行的动画的参数注入，
        this.nextTrigger = true;
        this.rendering = false;
        this.get = (target) => {
            this.target = target;
            return this;
        }
        //useDefault,则从target当前的值作为动画开始的设置值
        this.from = (setting) => {
            if(setting instanceof Array){
                this.start = {};
                for(let item of setting){
                    this.start[item] = this.target[item];
                }
            }else{
                this.start = setting;
                for(let key in setting){
                    this.target[key] = setting[key];
                }
            }
            return this;
        }
        //setting 动画参数设置，time 动画持续时间，easing 缓动函数， istransition 是否为补间值
        this.to = (setting, time, easing) => {
            this.animateIn = true;
            this.stack.push({
                type:'to',
                to:setting,
                transition:setting.istransition,
                time:time || 500,
                easing:easing || LINEAR
            })
            return this;
        }
        this.by = (setting, time, easing) => {
            setting.istransition = true;
            this.to(setting, time, easing, true)
        }
        this.wait = (time) => {
            this.animateIn = true;
            this.stack.push({
                type:'wait',
                time:time
            })
            return this;
        }
        this.render = (total) => {
            if(total - this.starttime > this.duration){
                this.rendering = false;
                this.nextTrigger = true;
            }
            for(let key in this.start){
                this.target[key] = this.easing(total - this.starttime, this.start[key] , this.end[key], this.duration);
            }
            this.target.render();
        }
        this.update = (delt, total) => {
            if(this.nextTrigger){
                this.nextTrigger = false;
                this.next(total);
            }
            if(this.rendering)
                this.render(total);
        }
        this.next = (total) => {
            let next = this.stack.shift();
            if(!next){
                if(this.animateIn)this.animateIn = false, this.destory();
                return false;
            }
            if(next.type == 'wait') setTimeout(() => {
                this.nextTrigger = true;
            }, next.time);
            else{
                if(this.end)
                    this.start = this.end;//记录动画开始的初始参数
                this.starttime = total;//当动画开始时，将update的total传过来，用于记录初始动画位置
                this.duration = next.time;
                if(next.transition){
                    this.end = {};
                    for(let key in this.start){
                        this.end[key] = this.start[key] + next.to[key];
                    }
                }else this.end = next.to;//将需要被执行的动画的参数注入，
                // debugger
                this.rendering = true;
                this.easing = next.easing || LINEAR;
            }
            this.nextTrigger = false;
        }
        this.destory = () => {
            this.gameObject.popTickStack(this.tickIndex);
            // this = {};
        }
        this.tickIndex = this.gameObject.pushTickStack(this.update,this);//推进栈中的位置
    }
})(gameObject);

//run
gameObject.preload(sheetList);
gameObject.insert('container');
Subscriber.register('progress',(current, total) => {
    if(current == total){
        //建立内容的树状结构
        this.main = new Sprite();
        this.main.name = 'main';
            
            this.flyMedal = new Sprite();
            this.flyMedal.x = 1100;
            this.flyMedal.y = 520;
            this.flyMedal.anchorX = 0.2;
            this.flyMedal.anchorY = 0.2;
            this.flyMedal.name = 'flyMedal';
            this.flyMedal.add(gameObject.createBitMap('medal_fly_png'));
            this.main.add(this.flyMedal);

            this.mainMedalGroup = new Sprite();
            this.mainMedalGroup.x = 400;
            this.mainMedalGroup.name = 'mainMedalGroup';

                this.ribbon_1 = new Sprite();
                this.ribbon_1.name = 'ribbon1';
                this.ribbon_1.x = 520;
                this.ribbon_1.y = 15;
                this.ribbon_1.add(gameObject.createBitMap('ribbon_1_png'));
                this.mainMedalGroup.add(this.ribbon_1);

                this.ribbon_2 = new Sprite();
                this.ribbon_2.name = 'ribbon2';
                this.ribbon_2.x = 20;
                this.ribbon_2.y = 550;
                this.ribbon_2.add(gameObject.createBitMap('ribbon_2_png'));
                this.mainMedalGroup.add(this.ribbon_2);

                this.mainMedal = new Sprite();
                this.mainMedal.name = 'mainMedal';
                this.mainMedal.add(gameObject.createBitMap('main_png'));
                this.mainMedalGroup.add(this.mainMedal);

            this.main.add(this.mainMedalGroup);

            this.flyingBook = new Sprite();
            this.flyingBook.x = 970;
            this.flyingBook.name = 'flyingBook';

            this.flyingBook.add(gameObject.createBitMap('flying_book_png'));
            this.main.add(this.flyingBook);

            this.gold = new Sprite();
            this.gold.x = 300;
            this.gold.y = 100;
            this.gold.name = 'gold';
            this.gold.add(gameObject.createBitMap('fly_gold_png'));
            this.main.add(this.gold);

            this.flyingCircle = new Sprite();
            this.flyingCircle.x = 250;
            this.flyingCircle.y = -20;
            this.flyingCircle.add(gameObject.createBitMap('flying_circle_png'));
            this.main.add(this.flyingCircle);

            this.meteorWhite = new Sprite();
            this.meteorWhite.x = 100;
            this.meteorWhite.y = 200;
            this.meteorWhite.add(gameObject.createBitMap('meteor_white_png'));
            this.main.add(this.meteorWhite);
        
        //设置动画;
        // this.main.showBorder = true;
        //绝对值动画，from需设置实际的值，to设置动画的结束值，
        let anim_main = new Tween()
            .get(this.main)
            .from({x:3580, y:-2800, scaleX:0.1, scaleY:0.1})
            .to({x:180, y:80, scaleX:1, scaleY:1},500)
            .to({x:140, y:110, scaleX:1.1, scaleY:1.1},9000)
            .to({x:-3000, y:2000, scaleX:2, scaleY:2},500);
        //相对值动画，直接使用原先的初始值，from只需设置一个name正确的对象，to是变化量而不是结束位置，to使用时需带上第四个参数,平时缺省的第三个参数(easing动画类型)需要设置false
        this.main.y = 100;
        let anim_book = new Tween('book')
            .get(this.flyingBook)
            .from(['rotate','x','y'])
            .by({rotate:30,x:30,y:30},10000);
        let anim_gold = new Tween('gold')
            .get(this.gold)
            .from(['x','y'])
            .by({x:20,y:20},10000,FLOAT_BETWEEN);
        let anim_circle = new Tween('circle')
            .get(this.flyingCircle)
            .from(['x','y'])
            .by({x:-10,y:-10},10000,FLOAT_BETWEEN);
        let anim_meteor_white = new Tween('meteor_white')
            .get(this.meteorWhite)
            .from(['x','y','opacity'])
            .by({x:500,y:-500,opacity:-1},300,EASE_IN);
        let anim_fly_medal = new Tween('fly_medal')
            .get(this.flyMedal)
            .from(['rotate'])
            .by({rotate:4},10000,FLOAT_BETWEEN)

        gameObject.scene.add(this.main);
        console.log(this.main)

        // document.body.appendChild(this.main.buffer)
        // this.main.render();
        // document.body.appendChild(this.flyingBook.buffer)
        // this.flyingBook.render();

        gameObject.tick();
    }   
},true);