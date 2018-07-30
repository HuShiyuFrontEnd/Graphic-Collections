//订阅发布数据模型
let Subscriber = (function(){
    let list = {},
        onceList = {},
        history = {},
        count = 0,
        index = {};
    
    //用于取出arguments的从第start开始的参数
    function toArray (list, start) {
        start = start || 0;
        var i = list.length - start;
        var ret = new Array(i);
        while (i--) {
            ret[i] = list[i + start];
        }
        return ret
    }
    return {
        //用于调试时查看订阅情况
        check(){
            console.log('list',list);
            console.log('history',history);
            console.log('onceList',onceList);
        },
        //初始化name的list和history
        create(name){
            if(!list[name]){
                list[name]=[];
                history[name]=[];
            }
        },
        //注册一个name的订阅，func为回调，func的参数和publish给出的参数一致，readHistory缺省时为false，设置为true时，可以读取...
        //...注册之前的历史记录
        register(name,func,readHistory){
            this.create(name);
            list[name].push(func);
            if(readHistory){
                let current = history[name];
                for(let item of current){
                    try{
                        func.apply(this,item);
                    }catch(e){
                        console.log(e)
                    }
                }
            }
            count++;
            index[count]={
                name:name,
                index:list[name].length-1
            }
            return count;
        },
        //这个实现则需要一个新的清单来单独处理这类情况
        once(name,func,readHistory){
            if(!onceList[name]){
                onceList[name]=[];
            }
            if(readHistory){
                let current = history[name];
                if(current === undefined || current.length==0){
                    onceList[name].push(func);
                }else for(let item of current){
                    try{
                        func.apply(this,item);
                    }catch(e){
                        console.log(e)
                    }
                }
            }
            else onceList[name].push(func);
        },
        //name,auguments
        //发布一条消息，所有订阅了这个name的订阅者都会接受到这条信息
        publish(name){
            this.create(name);
            let current = list[arguments[0]];
            let currentOnce = onceList[arguments[0]];
            if(!current){
                console.log(`名为“${name}”的订阅不存在`);
            }
            let params = toArray(arguments, 1);
            for(let item of current){
                try{
                    item.apply(this,params);
                }catch(e){
                    console.log(e);
                }
            }
            if(currentOnce){
                for(let item of currentOnce){
                    try{
                        item.apply(this,params);
                    }catch(e){
                        console.log(e);
                    }
                }
                onceList[arguments[0]] = [];
            }
            history[name].push(params);
        },
        //name,auguments
        //和publish类似，但是新发布的值会覆盖前一个，也就是说，永远只会有一条历史记录
        cover(name){
            this.publish.apply(this,arguments);
            if(history[name].length>1){
                history[name].shift();
            }
        },
        //register--register时留下的一个index，指向了其所在的name和index
        //可能还有remove整个name的情况
        remove(register){
            let current = (index[register]);
            list[current.name].splice(current.index,1);
        },
        //清空name下所有记录，
        clear(name){
            history[name]=[];
        },
        refreshAll(){
            list = {},
            onceList = {},
            history = {},
            count = 0,
            index = {};
        }
    }
})();

export default Subscriber;
