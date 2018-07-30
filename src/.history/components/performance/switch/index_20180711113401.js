function runTestManyTimes(func,scripttimes,testTimes){
    let result = [];
    for(var i = 0;i < testTimes;i++){
        result.push(runScriptManyTimes(func,scripttimes));
    }
    let timesword = '';
    let maxtime = 0;
    let mintime = 0;
    let averagetime = 0;
    for(var i = 0;i < testTimes;i++){
        let current = result[i];
        maxtime = Math.max(maxtime, current);
        mintime = Math.min(mintime, current);
        averagetime += current;
        timesword += (i > 0?',':'') + current; 
    }
    let resultWord = `运行${testTimes}次测试，每次运行代码${scripttimes}次，平均每次测试时间为${averagetime/testTimes},最大值为${maxtime},最小值为${mintime},所有值为${timesword}`;
}

function runScriptManyTimes(func,times){
    var startTime = Date.now();
    var endTime;
    for(var i = 0;i < times;i++){
        func();
    }
    endTime = Date.now();
    console.log(`运行${times}次，使用了${endTime-startTime}ms`);
    return endTime-startTime;
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
runTestManyTimes(function(){
    for(var i = 0 ;i < length; i++){
        switch(array[i]){
            case 1:func1();break;
            case 2:func2();break;
            case 3:func3();break;
        }
    }
},100000,5)

//方法2
var index = {
    1:func1,
    2:func2,
    3:func3
}
runTestManyTimes(function(){
    for(var i = 0 ;i < length; i++){
        index[array[i]]();
    }
},100000,5)