

let consoleStyle = 'padding:50px 50px;background-size:100px 100px;background-image:url("https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1242104799,803898156&fm=200&gp=0.jpg);';
console.log('%c', consoleStyle);
console.log('%c只有真的大佬才能看到我','color:#A15C20;font-family:PingFang SC');

document.body.ontouchstart = function(e){
    e.preventDefault();
    return false;
}
document.body.ontouchmove = function(e){
    e.preventDefault();
    return false;
}
document.body.ontouchend = function(e){
    e.preventDefault();
    return false;
}
document.body.oncontextmenu = function(e){
    e.preventDefault();
    return false;
}