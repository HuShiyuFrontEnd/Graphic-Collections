function runScriptManyTimes(func,times){
    var startTime = Date.now();
    var endTime;
    for(var i = 0;i < times;i++){
        func();
    }
    endTime = Date.now();
    console.log(`运行${times}次，使用了${endTime-startTime}ms`);
}
//测试目标，两种写法的优劣：
function func1(){
    var a = 1;
    a = 0;
}
function func2(){
    var a = 2;
    a = 0;
}
function func3(){
    var a = 3;
    a = 0;
}
var array = [1,2,3];
var length = array.length;
//方法1
runScriptManyTimes(function(){
    for(var i = 0 ;i < length; i++){
        switch(array[i]){
            case 1:func1();break;
            case 2:func2();break;
            case 3:func3();break;
        }
    }
},1000)

//方法2
var index = {
    1:func1,
    2:func2,
    3:func3
}
runScriptManyTimes(function(){
    for(var i = 0 ;i < length; i++){
        index[array[i]]();
    }
},1000)