console.log("this is main js for piece - ripple in project svg");
console.log('PS:这个示例所需的核心技术feDisplacementMap滤镜在新的chrome浏览器中不支持，可以尝试在手机上或者火狐浏览器上查看效果')
import {Easing, Tween} from '@/components/canvas/engineremake/core/tween.js';

window.onload = function(){
    let pic = document.getElementById('image');
    let scale = document.getElementById('scale');
    let testDog = document.getElementById('testDog');
    let offsetFix = document.getElementById('fix');

    let picTween = new Tween('pic').
    get(pic).
    setMap((target, key, val) => {
        target.setAttribute(key, val);
    }).
    getMap((target, key) => {
        return target.getAttribute(key);
    });
    let scaleTween = new Tween('scale').
    get(scale).
    setMap((target, key, val) => {
        target.setAttribute(key, val);
    }).
    getMap((target, key) => {
        return target.getAttribute(key);
    });;
    let offsetFixTween = new Tween('x').
    get(offsetFix).
    setMap((target, key, val) => {
        target.setAttribute(key, val);
    }).
    getMap((target, key) => {
        return target.getAttribute(key);
    });;

    let animating = false;
    testDog.onclick = (e) => {
        testDog.style.filter = 'url(#test)';
        // if(animating) return false;
        // else animating= true;
        picTween.
        from({width:10, height:10, x:e.offsetX, y:e.offsetY}).
        to({width:512, height:512, x:e.offsetX - 256, y:e.offsetY - 256}, 2000).
        call(() => {
            testDog.style.filter = '';
        })

        offsetFixTween.
        from({scale:50}).
        to({scale:0}, 2000)

        scaleTween.
        from({scale:50}).
        to({scale:0}, 2000);
    }

    // new Tween('test').
    // get(document.getElementsByClassName('test')[0].style).
    // map((target, key, val) => {
    //     target[key] = `${val}px`;
    // }).
    // from({left:0, top:0}).
    // to({left:100, top:100}, 100).
    // call(() => {
    // });
}