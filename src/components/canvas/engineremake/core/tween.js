import rafStackObj from './update.js';

let EASING = {
    //t=当前动画运行了多长时间,b=动画开始位置,c动画结束位置,d=动画总时长
    LINEAR(t, b, c, d){
        if(t > d) t = d;
        return ((c - b) * t / d + b) ;
    },
    FLOAT_BETWEEN(t, b, c, d){
        if(t > d) t = d;
        return (c - b) * (Math.sin(t / d * 20) + 0.5) + b;
    },
    EASE_IN(t, b, c, d){
        if(t > d) t = d;
        t /= d;
        return (c - b) * t * t * t + b;
    }
}

let TWEEN = function(name){
    this.name = name;
    this.animateIn = false;
    this.stack = [];
    this.target = null;
    this.start = null;//记录动画开始的初始参数
    this.starttime = 0;//当动画开始时，将update的total传过来，用于记录初始动画位置
    this.duration = 0;
    this.end = null;//将需要被执行的动画的参数注入，
    this.nextTrigger = true;
    this.reset = false;
    this.computing = false;
    this.setMapFunc = null;
    this.getMapFunc = null;
    this.callfunc = function(){};
    this.get = (target) => {
        this.target = target;
        return this;
    }
    //useDefault,则从target当前的值作为动画开始的设置值
    this.from = (setting) => {
        this.reset = true;
        this.stack = [];//这是个坑
        if(setting instanceof Array){
            this.start = {};
            for(let item of setting){
                this.start[item] = this.getMapFunc ? this.getMapFunc(this.target, item) : this.target[item];
            }
        }else{
            this.start = setting;
            for(let key in setting){
                this.setMapFunc ? this.setMapFunc(this.target, key, setting[key]) : this.target[key] = setting[key]; 
            }
        }
        return this;
    }
    //setting 动画参数设置，time 动画持续时间，easing 缓动函数，istransition 是否为补间值
    this.to = (setting, time, easing) => {
        this.animateIn = true;
        this.stack.push({
            type:'to',
            to:setting,
            transition:setting.istransition,
            time:time || 500,
            easing:easing || EASING.LINEAR
        })
        return this;
    }
    //与to不同之处在于，setting中的值是相对值，例如从100px 到 200px to需要设置值为200px，而by则是200px - 100px = 100px
    this.by = (setting, time, easing) => {
        setting.istransition = true;
        this.to(setting, time, easing, true)
    }
    //暂停
    this.wait = (time) => {
        this.animateIn = true;
        this.stack.push({
            type:'wait',
            time:time
        })
        return this;
    }
    //有些设置值是数值但却不是数字，例如100px，那么我们需要提供一个映射方法，使得最后获得的值正确
    //func有三个参数,target赋值对象 key键值名 value值 
    this.setMap = (func) => {
        this.setMapFunc = func;
        return this;
    }
    //func有两个参数,target赋值对象 key键值名 并且需要有return
    this.getMap = (func) => {
        this.getMapFunc = func;
        return this;
    }
    //tween只管值的补间
    this.compute = (total) => {
        if(total - this.starttime > this.duration){
            this.computing = false;
            this.nextTrigger = true;
            this.callfunc();
        }
        for(let key in this.start){
            let value = this.easing(total - this.starttime, this.start[key] , this.end[key], this.duration);
            this.setMapFunc ? this.setMapFunc(this.target, key, value) : (this.target[key] = value);
        }
    }
    this.updateIndex = Symbol('tween');
    this.update = new rafStackObj(this.updateIndex,(delt, total) => {
        if(this.reset) this.reset = false, this.starttime = total, this.nextTrigger = true;
        if(this.nextTrigger){
            this.nextTrigger = false;
            this.next(total);
        }
        if(this.computing)
            this.compute(total);
    });
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
            if(this.end && next.transition)
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
            this.computing = true;
            this.easing = next.easing || EASING.LINEAR;
        }
        this.nextTrigger = false;
    }
    this.call = function(func){
        this.callfunc = func;
        return this;
    }
    this.destory = () => {
        this.update.destory;
    }
};

export var Tween = TWEEN;
export var Easing = EASING;