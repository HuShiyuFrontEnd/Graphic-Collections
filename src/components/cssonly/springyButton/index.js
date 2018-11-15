console.log("this is main js for piece - springyButton in project cssonly");
//https://codepen.io/danwilson/pen/hndiK

import DI from '../../common/dependenceInject.js';
DI.import([
    '/static/common/jquery.js',
    '/static/common/hammer.js',
]).then(function(){
    //adapted from Framer.js calculations, https://github.com/koenbok/Framer/
    var Spring, SpringCurve, Springer, defaults;
    //等价于fn.bind(me);
    var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
    var _SPRINGER_CSS_ID = 'springer-css-added';

    defaults = {
        tension: 80, //张力系数
        friction: 8, //摩擦力系数
        velocity: 0,
        speed: 1 / 60.0,
        tolerance: 0.1 //公差？
    };

    // declare interface state{
    //     tension
    //     friction
    //     x
    //     v
    // }

    // - tension * x - friction * v
    function springAccelerationForState(state) {
        return (-state.tension * state.x) - (state.friction * state.v);
    }

    //evaluate 求值
    function springEvaluateState(initial) {
        var output = {
        dx: initial.v,
        dv: springAccelerationForState(initial)
        };
        return output;
    }

    //Derivative 导数
    function springEvaluateStateWithDerivative(initial, dt, derivative) {
        var state = {
            x: initial.x + derivative.dx * dt,
            v: initial.v + derivative.dv * dt,
            tension: initial.tension,
            friction: initial.friction
        };
        var output = {
            dx: state.v,
            dv: springAccelerationForState(state)
        };
        return output;
    }

    //Integrate 使一体化 【数学】进行积分运算
    function springIntegrateState(state, speed) {
        var a, b, c, d, dvdt, dxdt;
        a = springEvaluateState(state); //当前时间点上，求距离和速度的变化率（求导，结果是速度和加速度
        // b = springEvaluateStateWithDerivative(state, speed * 0.5, a); 
        // c = springEvaluateStateWithDerivative(state, speed * 0.5, b);
        // d = springEvaluateStateWithDerivative(state, speed, c);
        dxdt = a.dx // 1.0 / 6.0 * (a.dx + 2.0 * (b.dx + c.dx) + d.dx);
        dvdt = a.dv // 1.0 / 6.0 * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);
        state.x = state.x + dxdt * speed;
        state.v = state.v + dvdt * speed;
        return state;
    }

    Spring = (function() {
        function Spring(args) {
            this.next = __bind(this.next, this);
            this.reset = __bind(this.reset, this);
            args = args || {};
            this.velocity = args.velocity || defaults.velocity;
            this.tension = args.tension || defaults.tension;
            this.friction = args.friction || defaults.friction;
            this.speed = args.speed || defaults.speed;
            this.tolerance = args.tolerance || defaults.tolerance;
            this.reset();
        }

        Spring.prototype.reset = function() {
            this.startValue = 0;
            this.currentValue = this.startValue;
            this.endValue = 100;
            this.moving = true;
            return this.moving;
        };

        Spring.prototype.next = function() {
            var targetValue = this.currentValue;
            var stateBefore = {
                x: targetValue - this.endValue,
                v: this.velocity,
                tension: this.tension,
                friction: this.friction
            };
            var stateAfter = springIntegrateState(stateBefore, this.speed);
            this.currentValue = this.endValue + stateAfter.x;
            var finalVelocity = stateAfter.v;
            var netFloat = stateAfter.x;
            var net1DVelocity = stateAfter.v;
            var netValueIsLow = Math.abs(netFloat) < this.tolerance;
            var netVelocityIsLow = Math.abs(net1DVelocity) < this.tolerance;
            var stopSpring = netValueIsLow && netVelocityIsLow;
            this.moving = !stopSpring;
            if (stopSpring) {
                finalVelocity = 0;
                this.currentValue = this.endValue;
            }
            this.velocity = finalVelocity;
            return this.currentValue;
        };

        Spring.prototype.all = function() {
            var count = 0,
                results = [];
            this.reset();
            while (this.moving) {
                if (count > 3000) {
                    throw Error("Spring: too many values");
                }
                count++;
                results.push(this.next());
            }

            return results;
        };

        Spring.prototype.time = function() {
            return this.all().length * this.speed;
        };

        return Spring;

    })();

    SpringCurve = function(tension, friction, velocity, fps) {
        var spring;
        spring = new Spring({
            tension: tension,
            friction: friction,
            velocity: velocity,
            speed: 1 / fps
        });
        return spring.all();
    };

    Springer = (function() {
        function Keyframer(args) {
            args = args || {};
            args.initial = args.initial || {};
            args.result = args.result || {};
            this.tension = args.tension;
            this.friction = args.friction;
            this.animationName = args.animationName || ('animation' + Math.floor(Math.random() *100000));
            this.initial = {
                scale: args.initial.scale || 1,
                translateX: args.initial.translateX || 0,
                translateY: args.initial.translateY || 0,
                translateZ: args.initial.translateZ || 0,
            };
            this.result = {
                scale: args.result.scale || 1,
                translateX: args.result.translateX || 0,
                translateY: args.result.translateY || 0,
                translateZ: args.result.translateZ || 0,
            };
            this.staticTransform = args.staticTransform || '';
            //add distanceX and distanceY
            this.curve = SpringCurve(this.tension, this.friction);
            this.generate();
        }

        Keyframer.prototype.generate = function() {
            var length = this.curve.length;
            var animation = '';
            var animationw = '';
            var differences = {
                scale: this.result.scale - this.initial.scale,
                translateX: (this.result.translateX - this.initial.translateX),
                translateY: (this.result.translateY - this.initial.translateY),
                translateZ: (this.result.translateZ - this.initial.translateZ)
            };
            var frames = [{
                step: '0%',
                scale: (this.initial.scale),
                translateX: this.initial.translateX + 'px',
                translateY: this.initial.translateY + 'px',
                translateZ: this.initial.translateZ + 'px'
            }];
            var isScale = (differences.scale !== 0);
            var isTranslate = (differences.translateX !== 0 ||
                differences.translateY !== 0 ||
                differences.translateZ !== 0);


            var originalDirection = true;

            for (var i = 1; i < length; ++i) {
                if ((originalDirection && this.curve[i] <= this.curve[i - 1])
                || (!originalDirection && this.curve[i] > this.curve[i - 1])) {
                frames.push({
                    step: (i/length*100).toFixed(3)+'%',
                    scale: this.initial.scale + (this.curve[i] / (100))*differences.scale,
                    translateX: Math.round(this.initial.translateX + (parseFloat(differences.translateX) * this.curve[i]) / 100) + 'px',
                    translateY: Math.round(this.initial.translateY + (parseFloat(differences.translateY) * this.curve[i]) / 100) + 'px',
                    translateZ: Math.round(this.initial.translateZ + (parseFloat(differences.translateZ) * this.curve[i]) / 100) + 'px'
                });
                originalDirection = !originalDirection;
                }
            }
            
            frames.push( {
                step: '100%',
                scale: this.result.scale,
                translateX: this.result.translateX+'px',
                translateY: this.result.translateY+'px',
                translateZ: this.result.translateZ+'px'
            });
            
            animation = '@keyframes ' + this.animationName + ' {';
            animationw = '@-webkit-keyframes ' + this.animationName + ' {';
            for (var j = 0, l = frames.length; j < l; ++j) {
                var frame = frames[j];
                var animationStep = frame.step +
                ' {transform:'+ this.staticTransform +
                (isScale ? ' scale('+frame.scale+')' : '' )+
                (isTranslate ? ' translate3d('+frame.translateX+','+frame.translateY+','+frame.translateZ+')' : '' )+
                ';animation-timing-function:ease-in-out;} ';
                animation += animationStep;
                animationw += animationStep.replace('{transform:', '{-webkit-transform:');
            }
            animation += '}';
            animationw += '}';
            var style = document.getElementById(_SPRINGER_CSS_ID);
            if (!style) {
                style = document.createElement('style');
                style.id = _SPRINGER_CSS_ID;
                style.appendChild(document.createTextNode(animationw + ' ' + animation));
                document.head.appendChild(style);
            } else {
                style.textContent = ((animationw + ' ' + animation));
            }
            
            return this.animationName;
        };

        return Keyframer;
    })();


    //interactive pieces for hold/scale, tap/translate
    var _tension = 5;
    var _friction = 2;
    var timer = 0;
    var holdTime = 8000;

    //hold/scale
    var item = $('i')[0];
    Hammer(item).on('touch', function(e) {
    //timer = Date.now();
    $('section').addClass('hold').removeClass('animate');
    });
    Hammer(item).on('release', function(e) {
    var currentTime = e.gesture.deltaTime;
    var keyframer;
    
    if (currentTime > holdTime) {
        keyframer = new Springer({
        tension: (currentTime > 15000) ? 350 : 150,
        friction: _friction,
        animationName: 'spring-scale',
        initial: {
            scale: 0.25
        },
        staticTransform: 'translate3d(-50%,-50%,0)'
        });
    } else {
        var seconds = currentTime/1000;
        var tension = seconds >= 1 ? seconds*15 : 15;
        var linearScale = (1 - ((seconds)*750/holdTime));
        var currentScale = getCurrentScale($(item).closest('section')[0]);

        keyframer = new Springer({
        tension: tension,
        friction: _friction,
        animationName: 'spring-scale',
        initial: {
            scale: currentScale
        },
        result: {
            scale: 1
        },
        staticTransform: 'translate3d(-50%,-50%,0)'
        });
    }
    setTimeout(function() {
        $('section').removeClass('hold').toggleClass('animate');
    }, 1);

    function getCurrentScale(el) {
        var st = window.getComputedStyle(el, null);
        var tr = st.getPropertyValue("-webkit-transform") ||
                st.getPropertyValue("transform") ||
                "fail...";

        var values = tr.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');
        var a = values[0];
        var b = values[1];

        var scale = Math.sqrt(a*a + b*b);

        return scale;
    }
    });

    //tap
    var translation = $('h2')[0];
    var animateAway = true;
    Hammer(translation).on('touch', function(e) {
        var h = $('h2');
        animateAway = !h.hasClass('animate');
        h.removeClass('animate');
    });
    Hammer(translation).on('release', function(e) {
        if (animateAway) {
            var keyframer = new Springer({
            tension: 75,
            friction: _friction,
            animationName: 'spring-translate',
            result: {
                translateX: 300,
                translateY: 0,
                translateZ: 0
            }
            });
            timer = 0;
            setTimeout(function() {
            $('h2').toggleClass('animate');
            }, 1);
        }
    });




    var translation2 = $('h3');
    var animateAway = true;
    Hammer(translation2[0]).on('dragstart', function(e) {
        animateAway = true;
        translation2.removeClass('animate');
    });
    Hammer(translation2[0]).on('drag', function(e) {
        e.gesture.preventDefault();
        var x = e.gesture.deltaX;
        var y = e.gesture.deltaY;
        
        translation2.css({
            '-webkit-transform': 'translate3d(' + x + 'px,' + y + 'px,0)',
            'transform': 'translate3d(' + x + 'px,' + y + 'px,0)'
        });
    });
    Hammer(translation2[0]).on('dragend', function(e) {
        var x = e.gesture.deltaX;
        var y = e.gesture.deltaY;
        
        var tension = e.gesture.distance/10;
        
        if (animateAway) {
            var keyframer = new Springer({
            tension: tension,
            friction: _friction,
            animationName: 'spring-translate',
            initial: {
                translateX: x,
                translateY: y,
                translateZ: 0
            }
            });
            setTimeout(function() {
            $(translation2).css({
                '-webkit-transform': 'translate3d(0,0,0)',
                'transform': 'translate3d(0,0,0)'
            }).toggleClass('animate');
            }, 1);
            animateAway = false;
        }
    });

})
