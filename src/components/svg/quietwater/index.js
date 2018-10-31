console.log("this is main js for piece - quietwater in project svg");
//http://wow.techbrood.com/fiddle/30865
import {Easing, Tween} from '@/components/canvas/engineremake/core/tween.js';

let count = 0;

let script = document.createElement('script');
script.src = 'http://wow.techbrood.com/libs/gsap/TweenMax.min.js';
document.body.appendChild(script);
script.onload = function() {
    count ++;
    if(count == 2) main();
}

let script2 = document.createElement('script');
script2.src = 'http://wow.techbrood.com/libs/jquery/jquery-1.11.1.min.js';
document.body.appendChild(script2);
script2.onload = function() {
    count ++;
    if(count == 2) main();
}

function main(){
    var timeline = new TimelineMax({
        repeat: -1,
        yoyo: true
    }),feTurb = document.querySelector('#feturbulence');
    timeline.add(
        new TweenMax.to(feTurb, 18, {
            onUpdateParams: [feTurb], //pass the filter element to onUpdate
            onUpdate: function(fe) {
                var bfX = this.progress() * 0.005 + 0.015, //base frequency x
                    bfY = this.progress() * 0.05 + 0.1, //base frequency y
                    bfStr = bfX.toString() + ' ' + bfY.toString(); //base frequency string
                fe.setAttribute('baseFrequency', bfStr);
            }
        }), 0
    );
}
// var feTurb = document.querySelector('#feturbulence');
// var valueX = 0.0015;
// var valueY = 0.1;
// setInterval(() => {
//     valueX += 0.0000001;
//     valueY += 0.0001;
//     feTurb.setAttribute('baseFrequency', `${valueX} ${valueY}`)
// },20);

// let pic = document.getElementById('feturbulence');
// let picTween = new Tween('pic').
// get(pic).
// setMap((target, key, val) => {
//     target.setAttribute(key, val);
// }).
// getMap((target, key) => {
//     return target.getAttribute(key);
// });

// picTween.from({numOctaves:0}).to({numOctaves:10}, 5000)