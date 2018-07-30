function runTestManyTimes(name,func,scripttimes,testTimes){
    let result = [];
    for(var i = 0;i < testTimes;i++){
        result.push(runScriptManyTimes(func,scripttimes));
    }
    let timesword = '';
    let maxtime = 0;
    let mintime = 10000000;
    let averagetime = 0;
    for(var i = 0;i < testTimes;i++){
        let current = result[i];
        maxtime = Math.max(maxtime, current);
        mintime = Math.min(mintime, current);
        averagetime += current;
        timesword += (i > 0?',':'') + current; 
    }
    let resultWord = `运行${testTimes}次测试，每次运行代码${scripttimes}次，平均每次测试时间为${averagetime/testTimes},最大值为${maxtime},最小值为${mintime},所有值为${timesword}`;
    console.log(name,resultWord);
}

function runScriptManyTimes(func,times){
    var startTime = Date.now();
    var endTime;
    for(var i = 0;i < times;i++){
        func();
    }
    endTime = Date.now();
    // console.log(`运行${times}次，使用了${endTime-startTime}ms`);
    return endTime-startTime;
}
//测试目标，两种写法的优劣：
function func1(){
    var a = 1 + 2 + 3 *41/0.21321312 + Math.pow(2,2)/0.12321321; 
    a = 0;
}
function func2(){
    var a = 1 + 2 + 3 *41/0.21321312 + Math.pow(2,2)/0.12321321; 
    a = 0;
}
function func3(){
    var a = 1 + 2 + 3 *41/0.21321312 + Math.pow(2,2)/0.12321321; 
    a = 0;
}
var array = [1,2,3];
var length = array.length;

//方法2
var index = [null, func1, func2, func3];
// {
//     1:func1,
//     2:func2,
//     3:func3
// }
runTestManyTimes('index方式',function(){
    for(var i = 0 ;i < length; i++){
        index[array[i]]();
    }
},10000,100);

runTestManyTimes('if else方式',function(){
    for(var i = 0 ;i < length; i++){
        if(i==1)func1();
        else if(i==2)func2();
        else if(i==3)func3();
    }
},10000,100);

//方法1
runTestManyTimes('switch方式',function(){
    for(var i = 0 ;i < length; i++){
        switch(array[i]){
            case 1:func1();break;
            case 2:func2();break;
            case 3:func3();break;
        }
    }
},10000,100);
console.log('目前测试的是分支较少的情况')

//测试结果：index方式总体最慢，但时间比较平均，switch比较均衡，ifelse方式，在某些判断出现的较为突出时，明显由于switch，否则差不多