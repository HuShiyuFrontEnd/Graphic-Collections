//测试目标，两种写法的优劣：
function func1(){
    console.log(1);
}
function func2(){
    console.log(2);
}
function func3(){
    console.log(3);
}
var array = [1,2,3];
var length = array.length;
//方法1
for(var i = 0 ;i < length; i++){
    switch(array[i]){
        case 1:func1();break;
        case 2:func2();break;
        case 3:func3();break;
    }
}
//方法2
var index = {
    1:func1,
    2:func2,
    3:func3
}
for(var i = 0 ;i < length; i++){
    index[array[i]]();
}