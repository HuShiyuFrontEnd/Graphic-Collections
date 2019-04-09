//基本的容器分为两类：1.Contain(不具备画布功能) 2.Sprite() 3.Scene（最顶级的一个画布，它和设定额的尺寸必须一致，并且不能做transform）
//基本的内容为：Texture (由img绘制，或者shape，它的实质是一个离屏canvas，尺寸即包围盒) 未来可能有MovieClip/TextureFont

import RES from './res.js'
import Utils from './utils.js'
import rafStackObj from './update.js'

const RADIAN = 0.01745329252;//Math.PI / 180

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

let instanceId = 0
const getInstanceId = () =>{
    return instanceId++;
}

//有些逻辑，其结果是由好几个值共同计算出来的，这些值中的每一个，都会引发重计算，但是我们可以将每一帧内的同一组计算累积下来，在帧尾将其一起计算，而不是一次一次的重复
//规定：所有需要渲染的数据都具备[renderName]所定义的方法
class DepthManager{
    depth = 0
    depthIndex = {};
    constructor(){}
    refresh(id, depth){
        if(depth > this.depth)
            this.depth = depth;
        this.depthIndex[id] = depth;
    }
}
let DM = new DepthManager();

class RenderTree{
    depth = 0
    index = {};//对象索引
    stack = [];
    name = '';
    //name，这种RenderTree的名字
    //renderName，这种RenderTree所含对象在更新时的操作
    constructor(name, renderName){
        this.name = name;
        this.depthIndex = DM.depthIndex;
        new rafStackObj(name, (delt, total) => {
            for(let i = 0;i < DM.depth;i++){
                if(!this.stack[i] || this.stack[i].length === 0)
                    continue;
                for(let j = 0;j < this.stack[i].length;j++){
                    this.index[this.stack[i][j]][renderName]();
                }
                this.stack[i] = [];
            }
        })
    }
    create(instance){
        let instanceId = instance.instanceId;
        let depth = instance.depth;
        if(depth > this.depth) this.depth = depth;
        DM.refresh(instanceId, depth);
        this.index[instanceId] = instance;
    }
    prepare(id){
        let depth = this.depthIndex[id];
        let stack = this.stack[depth - 1];
        if(!stack){
            this.stack[depth - 1] = [];
            stack = this.stack[depth - 1];
        }
        if(stack.indexOf(id) == -1)
            stack.push(id);
    }
}
let RTB = new RenderTree('spriteBound', 'computeBound');
let RTM = new RenderTree('spriteMatrix', 'computeMatrix');
let RT = new RenderTree('renderTree', 'render');

class Shape{
    get width(){
        return this._width;
    }
    set width(val){
        this.setSize(val);
    }
    get height(){
        return this._height;
    }
    set height(val){
        this.setSize(undefined, val);
    }
    _width = 0
    _height = 0
    constructor(){
        this.buffer = document.createElement('canvas');
        this.ctx = this.buffer.getContext('2d');
    }
    setSize(width, height){
        if(!width && width!==0) width = this._width; else this._width = width
        if(!height && height!==0) height = this._height; else this._height = height;
        this.buffer.width = width;
        this.buffer.height = height;
    }
}

//bound 标准表示法 [x, y, x + width, y + height]
//带下划线的变量，一般属于不可操作（不推荐操作的变量）
class Container{
    depth = 1
    matrix = [1, 0, 0, 1, 0, 0]
    core = core
    _x = 0
    _y = 0
    _width = 0
    _height = 0
    bound = [0, 0, 0, 0]
    instanceId = -1;
    parent = null;
    get width(){
        return this._width;
    }
    set width(val){
        this.setSize(val);
    }
    get height(){
        return this._height;
    }
    set height(val){
        this.setSize(undefined, val);
    }
    set size([width, height]){
        this.setSize(width, height);
    }
    get x(){
        return this._x;
    }
    set x(val){
        this.setPosition(val);
    }
    get y(){
        return this._y;
    }
    set y(val){
        this.setPosition(undefined, val);
    }
    set position([x, y]){
        this.setPosition(x, y);
    }
    constructor(){
        this.instanceId = getInstanceId();
        this.bound = [0, 0, 0, 0];
        RT.create(this);
        this.buffer = document.createElement('canvas');
        this.ctx = this.buffer.getContext('2d');
    }
    setSize(width, height){
        if(!width && width!==0) width = this._width; else this._width = width
        if(!height && height!==0) height = this._height; else this._height = height;
        this.buffer.width = width;
        this.buffer.height = height;
        this.bound[2] = this.bound[0] + width;
        this.bound[3] = this.bound[1] + height;
        if(this.refreshBound)
            this.refreshBound();
        this.refresh();
    }
    setPosition(x, y){
        if(!x && x!==0) x = this._x; else this._x = x;
        if(!y && y!==0) y = this._y; else this._y = y;
        this.bound = [x, y, x + this._width, y + this._height];
        this.refreshParent();
    }
    refresh(){
        RT.prepare(this.instanceId);
        this.refreshParent();
    }
    refreshParent(){
        if(this.parent)
            RT.prepare(this.parent.instanceId);
    }
    render(){}
}

class Bitmap extends Container{
    _type = 'bitmap';
    parent = null;
    texture = null;
    constructor(texture){
        super();
        if(typeof texture == 'string')
            texture = res.getResByName(texture);
        this.texture = texture;
        this.setSize(texture.width, texture.height);
        this.refresh();
    }
    render(){
        this.ctx.drawImage(this.texture.buffer, 0, 0, this._width, this._height);
    }
}

//Sprite和Bitmap不同之处：1.具备复杂transform/opacity等等功能 2.不需要用texture初始化 3.bound的计算不再总令x/y为0
//在sprite做大量的变换时，旋转、缩放等，如果使用，内部计算bound、matrix并在buffer内绘制的方案，将造成大量多余的drawImage
//若sprite内不计算matrix，bound，而将一切丢给父级绘制时来做，作为粒子发生器存在时，或者被多处引用时，同样有大量多余的matrix计算
//所以这里选择的方案是，每当元素触发了旋转角度等属性变化，将重新计算matrix，并利用matrix重新计算bound，但buffer不会执行这些matrix，而交由父级单元处理
class Sprite extends Container{
    nodeType = 'sprite';
    _scaleY = 1;
    get scaleY(){
        return this._scaleY
    }
    set scaleY(val){
        this._scaleY = val
        this.refreshMatrix();
    }
    _scaleX = 1;
    get scaleX(){
        return this._scaleX;
    }
    set scaleX(val){
        this._scaleX = val;
        this.refreshMatrix();
    }
    _anchorX = 0.5;
    get anchorX(){
        return this._anchorX;
    }
    set anchorX(val){
        this._anchorX = Utils.valueInRange(val, 0, 1);
        this.refreshMatrix();
    }
    _anchorY = 0.5;
    get anchorY(){
        return this._anchorY;
    }
    set anchorY(val){
        this._anchorY = Utils.valueInRange(val, 0, 1);
        this.refreshMatrix();
    }
    _rotate = 0;
    _radian = 0;
    get rotate(){
        return this._rotate;
    }
    set rotate(val){
        this._rotate = val;
        this._radian = val * RADIAN;
        this.refreshMatrix();
    }
    _opacity = 1;
    get opacity(){
        return this._opacity;
    }
    set opacity(val){
        this._opacity = Utils.valueInRange(val, 0, 1);
        this.refresh();
    }
    constructor({width, height, x, y} = {}){
        super();
        RTM.create(this);
        RTB.create(this);
        this.children = [];
        this.childrenIndex = {};
        this.showBorder = false;//绘制边缘
    }
    refreshMatrix(){
        RTM.prepare(this.instanceId);
        this.refreshParent();
    }
    //重新计算矩阵
    computeMatrix(){
        let sina = Math.sin(this._radian);
        let cosa = Math.cos(this._radian);
        let w = this._width * this._scaleX;
        let h = this._height * this._scaleY;
        this.matrix =[
            this._scaleX * cosa, this._scaleX * - sina,
            this._scaleY * sina, this._scaleY * cosa,
            - ( w * cosa + h * sina ) * this._anchorX, ( w * sina - h * cosa ) * this._anchorY
            // - ( w * cosa + h * sina ) * this._anchorX + w * this._anchorX, ( w * sina - h * cosa ) * this._anchorY + h *this._anchorY
        ];
        console.log(this.matrix)
    }
    //添加child
    add(obj){
        this.refreshDepth(obj.depth);
        this.children.push(obj);
        obj.parent = this;
        let index = this.children.length - 1;
        this.refreshBound();
        this.refresh();
        if(obj.name){
            this.childrenIndex[obj.name] = index;
            return obj.name;
        }else{
            this.childrenIndex[index] = index;
            return index;
        }
    }
    refreshDepth(depth){
        if(depth + 1 > this.depth){
            this.depth = depth + 1;
            DM.refresh(this.instanceId, this.depth);
            if(this.parent && this.parent.refreshDepth)
                this.parent.refreshDepth(this.depth);
        }
    }
    getChild(name){
        if(typeof name === 'string')
            return this.children[name];
        else return this.children[this.chilrenIndex[name]];
    }
    computeBound(){
        let index = -1;
        for(let child of this.children){
            index ++;
            if(index == 0){
                this.bound = [child.bound[0] + child.x, child.bound[1] + child.y, child.bound[2] + child.x, child.bound[3] + child.y];
                continue;
            }
            let bound = child.bound;
            if(bound[0] + child.x < this.bound[0])
                this.bound[0] = bound[0] + child.x;
            if(bound[1] + child.y < this.bound[1])
                this.bound[1] = bound[1] + child.y;
            if(bound[2] + child.x > this.bound[2])
                this.bound[2] = bound[2] + child.x;
            if(bound[3] + child.y > this.bound[3])
                this.bound[3] = bound[3] + child.y;
        }
        //size和position决定bound，不可反过来bound改动决定size和position
        this._width = this.bound[2] - this.bound[0];
        this._height = this.bound[3] - this.bound[1];
        this.buffer.width = this._width;
        this.buffer.height = this._height;
    }
    refreshBound(){
        RTB.prepare(this.instanceId);
    }
    render(){
        this.ctx.clearRect(0, 0, this._width, this._height);
        for(let child of this.children){
            this.ctx.save();
            this.ctx.setTransform(...child.matrix);

            let drawRect = [child.bound[0] + child.x - this.bound[0], child.bound[1] + child.y - this.bound[1], child.bound[2] - child.bound[0], child.bound[3] - child.bound[1]];

            this.ctx.drawImage(child.buffer, ...drawRect);

            if(child.showBorder){
                this.ctx.strokeStyle = "#ff00f0";
                this.ctx.strokeRect(...drawRect);
            }

            this.ctx.restore();
        }
    }
}

class Core{
    canvas = null
    ctx = null
    _width = 0
    _height = 0
    constructor(){
        this.temp = document.createElement('canvas');
        this.tempCtx =this.temp.getContext('2d');
    }
    //提供一写全局变量的获取，为适配提供需要的参数
    /**
     *@param {String|DOMObject} entry canvas入口
     */
    init(entry){
        let $entry = document.getElementById(entry);
        if($entry){
            if($entry.tagName.toLowerCase() == 'canvas')
                this.canvas = $entry;
            else{
                this.canvas = document.createElement('canvas');
                Utils.setAttrs(this.canvas.style, {
                    width:'100%',
                    height:'100%'
                })
                $entry.appendChild(this.canvas);
            }
        }else{
            this.canvas = document.createElement('canvas');
            Utils.setAttrs(this.canvas.style, {
                width:'100%',
                height:'100%',
                position:'fixed',
                left:0,
                top:0
            })
            document.body.appendChild(this.canvas);
        }
        setTimeout(()=>{
            let bound = this.canvas.getBoundingClientRect();
            this._width = this.canvas.width = bound.width;
            this._height = this.canvas.height = bound.height;
            this.ctx = this.canvas.getContext('2d');
        })

        window.onresize = () => {
            this.whenResize();
        };
    }
    //处理绘图界面尺寸变化
    whenResize(){
        let bound = this.canvas.getBoundingClientRect();
        this._width = this.canvas.width = bound.width;
        this._height = this.canvas.height = bound.height;
        //留给用户的处理接口
        if(this.onResize)
            this.onResize(this._width, this._height);
        if(this.activeScene)
            this.activeScene.setSize(this._width, this._height);
    }
    /////构造器
    Bitmap = Bitmap
    Sprite = Sprite
    Shape = Shape
    /////场景管理器
    scene = {}
    activeScene = null
    createScene(name){
        if(!this.scene[name]){
            this.scene[name] = [];
        }
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
    children = [];
    add(obj){
        this.activeScene.push(obj);
    }
    render(){
        for(let target of this.children){
            core.ctx.clearRect(0, 0, core._width, core._height);
            core.ctx.save();
            core.ctx.setTransform(...target.matrix);
            // core.ctx.setTransform(1,0.5,-0.5,1,30,10);
            let drawRect = [target.x + target.bound[0], target.y + target.bound[1], target.bound[2] - target.bound[0], target.bound[3] - target.bound[1]];
            core.ctx.drawImage(target.buffer, ...drawRect);
            core.ctx.strokeStyle = '#ff0fff';
            core.ctx.strokeRect(...drawRect);
            core.ctx.restore();
        }
    }
    /////
}


export var core = new Core();

export var res = new RES();

export var Update = rafStackObj;
