//基本的容器分为两类：1.Contain(不具备画布功能) 2.Sprite() 3.Scene（最顶级的一个画布，它和设定额的尺寸必须一致，并且不能做transform）
//基本的内容为：Texture (由img绘制，或者shape，它的实质是一个离屏canvas，尺寸即包围盒) 未来可能有MovieClip/TextureFont

import RES from './res.js'
import Utils from './utils.js'
import rafStackObj from './update.js'

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

//bound 标准表示法 [x, y, width, height]
//带下划线的变量，一般属于不可操作（不推荐操作的变量）
class Container{
    _x = 0
    _y = 0
    _width = 0
    _height = 0
    bound = [0, 0, 0, 0]
    constructor(){}
}

class Bitmap extends Container{
    _type = 'bitmap'
    parent = null
    constructor(texture){
        super();
        if(typeof texture == 'string')
            texture = res.getResByName(texture);
        this.buffer = texture.buffer;
        this._width = texture.width;
        this._height = texture.height;
        this.bound = [0, 0, this._width, this._height];
    }
}

class Scene{

}

//渲染栈，每一帧发生改动时，渲染栈会保证只每个只渲染一次
class Sprite extends Container{
    nodeType = 'sprite';
    constructor({width, height, x, y} = {}){
        super();
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
    }
    getChildByName(name){

    }
    computeBound(){
        if(this.children.length == 0)
            return false;
        this.bound = null;
        for(let child of this.children){
            let bound
            if(child.nodeType == 'texture'){
                bound = [0, 0, child.width, child.height]
            }else{
                bound = [child.x + (child.offsetX||0) + child.bound[0], child.y + (child.offsetY||0) + child.bound[1], child.x + (child.offsetX||0) + child.bound[2], child.y + (child.offsetY||0) + child.bound[3]];
            }
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
    transformBoundingBox(){
        this.anchorX = Utils.valueInRange(this.anchorX, 0, 1);
        this.anchorY = Utils.valueInRange(this.anchorY, 0, 1);
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
            this.bound = Utils.getBoundingBoxFromPoints(boundingBoxPoints);
            // console.log(this.bound)
        }
    }
    add(child){
        if(child.nodeType == 'texture'){
            this.children.push(child);
        }
        else{
            child.parent = this;
            this.children.push(child);
        }
        this.computeBound();
        this.render();
    }
    //为了使其旋转和放缩围绕中心点，render的时候，会给一个平移（简化算法）
    render(compute){
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
    particleSet(particle){
        
    }
}

class Core{
    _canvas = null
    _ctx = null
    _width = 0
    _height = 0
    constructor(){}
    //提供一写全局变量的获取，为适配提供需要的参数
    /**
     *@param {String|DOMObject} entry canvas入口
     */
    init(entry){
        let $entry = document.getElementById(entry);
        if($entry){
            if($entry.tagName.toLowerCase() == 'canvas')
                this._canvas = $entry;
            else{
                this._canvas = document.createElement('canvas');
                Utils.setAttrs(this._canvas.style, {
                    width:'100%',
                    height:'100%'
                })
                $entry.appendChild(this._canvas);
            }
        }else{
            this._canvas = document.createElement('canvas');
            Utils.setAttrs(this._canvas.style, {
                width:'100%',
                height:'100%',
                position:'fixed',
                left:0,
                top:0
            })
            document.body.appendChild(this._canvas);
        }
        setTimeout(()=>{
            let bounding = this._canvas.getBoundingClientRect();
            this._width = this._canvas.width = bounding.width;
            this._height = this._canvas.height = bounding.height;
            this._ctx = this._canvas.getContext('2d');
        })
        
        window.onresize = () => {
            this.whenResize();
        };
    }
    //处理绘图界面尺寸变化
    whenResize(){
        let bounding = this._canvas.getBoundingClientRect();
        this._width = this._canvas.width = bounding.width;
        this._height = this._canvas.height = bounding.height;
        //留给用户的处理接口
        if(this.onResize)
            this.onResize(this._width, this._height);
        if(this.activeScene)
            this.activeScene.setSize(this._width, this._height);
    }
    /////构造器
    Bitmap = Bitmap
    // Sprite = Sprite
    // Scene = Scene
    /////场景管理器
    scene = {}
    activeScene = null
    createScene(name){
        if(!this.scene[name]){
            this.scene[name] = new core.Scene(name);
        }
        this.scene[name].setSize(this._width, this._height);
        return this.scene[name];
    }
    useScene(name){
        this.createScene(name);
        if(typeof name == 'string')
            this.activeScene = this.scene[name];
        else this.activeScene = name;
        return this.scene[name];
    }
    getScene(name){
        return this.scene[name];
    }
    render(){
        this._ctx.clearRect(0, 0, this._width, this._height);
        this._ctx.drawImage(this.activeScene.buffer, 0, 0, this.activeScene.buffer.width, this.activeScene.buffer.height);
    }
    /////
}


export var core = new Core();

export var res = new RES();

export var Update = rafStackObj;