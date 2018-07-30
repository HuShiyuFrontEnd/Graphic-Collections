<template>
    <div class='container'>
        
        <div class='nav'>
            <!-- <svg class='nav-bg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60" :style='navbg.style' >
                <path fill='rgb(252,192,77)' ref='path' d='' />
            </svg> -->
            <canvas id='canvas' ref='canvas'></canvas>
            <div ref='btn1' class='nav-item active'>a</div>
            <div ref='btn2' class='nav-item'>v</div>
            <div ref='btn3' class='nav-item'>b</div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    // import AlloyFinger from './alloy_finger.js'
    // import AlloyFingerPlugin from './alloy_finger.vue.js'
    // import To from './to.js'
    import Subscriber from '@/components/common/subscriber.js'
    import Swiper from 'swiper'
    import 'swiper/dist/css/swiper.css'

    // Vue.use(AlloyFingerPlugin);

    const CIRCLE_BEZIER = 0.55228475;
    //t=当前动画运行了多长时间,b=动画开始位置,c动画结束位置,d=动画总时长
    const LINEAR = function(t, b, c, d){
        if(t > d) t = d;
        return ((c - b) * t / d + b) ;
    }
    const IntLINEAR= function(t, b, c, d){
        if(t > d) t = d;
        return Math.round((c - b) * t / d + b) ;
    }
    let stickArea = 0.2;
    let area1 = [0 + stickArea, 1 - stickArea, 1 - 2 * stickArea];//start end length
    let area2 = [1 + stickArea, 2 - stickArea, 1 - 2 * stickArea];//start end length
    let colors = ['rgb(252,192,77)', 'rgb(0,195,226)', 'rgb(254,98,109)'];
    const COLOR_LINEAR = function(value){
        if( value < area1[1] & value > area1[0] ){
            return `rgb(${IntLINEAR(value - stickArea, 252, 0, area1[2])},${IntLINEAR(value - stickArea, 192, 195, area1[2])},${IntLINEAR(value - stickArea, 77, 226, area1[2])})`;
        }else if( value < area2[1] & value > area2[0] ){
            return `rgb(${IntLINEAR(value - 1 - stickArea, 0, 254, area2[2])},${IntLINEAR(value - 1 - stickArea, 195, 98, area2[2])},${IntLINEAR(value - 1 - stickArea, 226, 109, area2[2])})`;
        }else{
            return colors[Math.round(value)];
        }
    }
    const BEZIER_LINEAR = function(value, direct){
        let currentPoint = Math.round(value);
        if(direct == 0){
            let offset = value - currentPoint;
            if(offset < 0)
                return [0, offset, 60 + currentPoint * 90];
            else return [offset, 0, 60 + currentPoint * 90]
        }
        // if(Math.abs(value - currentPoint) < stickArea)
        //     return  [0, 0, 60 + currentPoint * 90];
        // else 
        return [0, 0, 60 + currentPoint * 90];
    }
    const BORDER_LINEAR = function(value){
        if(Math.abs(Math.round(value) - value) < stickArea){
            return Math.round(value);
        }else return -1;
    }
    
    function createCircleByBezier(x, y, r, d, e){
        let l = r * CIRCLE_BEZIER;
        d = d * r;
        e = e * r;
        let points = [
            x - r + 1.1 * e, y, //起始点
            //第一条贝塞尔曲线（每一条都以上一个点作为起始点
            x - r + e, y + l, //控制点1
            x - l, y + r, //控制点2
            x, y + r, //结束点
            //第二条贝塞尔曲线
            x + l, y + r, //控制点1
            x + r + d, y + l, //控制点2
            x + r + 1.1 * d, y, //结束点
            //第三条贝塞尔曲线
            x + r + d, y - l, //控制点1
            x + l, y - r, //控制点2
            x, y - r, //结束点
            //第四条贝塞尔曲线
            x - l, y - r, //控制点1
            x - r + e, y - l, //控制点2
            x - r + 1.1 * e, y, //结束点
        ];
        let p = `M${points[0]},${points[1]}`;
        for(let i = 2;i < points.length; i=i+6 ){
            p = p + `C${points[i]} ${points[i + 1]}, ${points[i + 2]} ${points[i + 3]}, ${points[i + 4]} ${points[i + 5]}`;
        }
        return points;
    }
    export default {
        mounted(){
            // this.$refs.myViewer.translateX = 0;
            let that = this;
            
            let $canvas = this.$refs.canvas;
            $canvas.width = 700;
            $canvas.height = 60;
            let ctx = $canvas.getContext('2d');
            let index = 0;
            let target = 0;
            let targetCanChange = true;
            let $btn = [this.$refs.btn1, this.$refs.btn2, this.$refs.btn3];

            let ps = [0, 0, 0];//d,e,f
            let speed = 2;
            let l1 = 0 * speed;
            let l2 = 400 * speed;
            let l3 = 100 * speed;
            let l4 = 100 * speed;
            let t1 = l1;
            let t2 = l1 + l2;
            let t3 = l1 + l2 + l3;
            let t4 = l1 + l2 + l3 + l4;
            let ps0 = ps[0];
            let ps1 = ps[1];
            let direct = 1;
            let startX = 0;
            let endX = 0;

            $btn[0].onclick = function(){
                bounceTo(0)
            };
            $btn[1].onclick = function(){
                bounceTo(1)
            };
            $btn[2].onclick = function(){
                bounceTo(2)
            };
            let isMouseStart = false;
            let mouseStart = 0;
            let moveOffset = 0;
            // let mouseEnd = 0;
            $btn[0].onmousedown = function(e){
                console.log(targetCanChange,'mousedown')
                if(!targetCanChange)
                    return false;
                mouseStart = e.clientX;
                isMouseStart = true;
            };
            $btn[0].onmousemove = function(e){
                console.log(isMouseStart,'mousemove')
                if(!isMouseStart)
                    return false;
                moveOffset = e.clientX - mouseStart;
            };
            document.body.onmouseup = function(){
                if(isMouseStart){
                    isMouseStart = false;
                    if(moveOffset > 0)
                        targetCanChange = false;
                }
            }

            function bounceTo(i){
                if(index == i || !targetCanChange)
                    return false;
                firsttime = Date.now();
                targetCanChange = false;
                startX = index * 220;
                endX = i * 220;
                direct = i - index > 0 ? 1 : -1;
                ps0 = (1 - direct) / 2;
                ps1 = (1 + direct) / 2;
                target = i;
                console.log(ps0,ps1)
                $btn[index].classList.remove('active');
            }
            //从某个位置跳往某个位置
            function drawAnimCircle(delt, total){
                // if(total < l1){
                //     ps[0] = LINEAR(total, 0, 0.6, l1);
                //     ps[2] = startX;
                // }else 
                //不同的方向，掉头
                if(total < t2){
                    ps[ps0] = LINEAR(total - t1, 0, 0, l2);
                    ps[ps1] = LINEAR(total - t1, 0, -0.8 * direct, l2);
                    ps[2] = LINEAR(total - t1, startX, endX, l2);
                }else if(total < t3){
                    if(!$btn[target].classList.contains('active'))
                        $btn[target].classList.add('active');
                    ps[ps0] = LINEAR(total - t2, 0, -0.2 * direct, l3);
                    ps[ps1] = LINEAR(total - t2, -0.8 * direct, 0.1 * direct, l3);
                    ps[2] = LINEAR(total - t2, endX, endX + 6 * direct, l3);
                }else if(total < t4){
                    ps[ps0] = LINEAR(total - t3, -0.2 * direct, 0, l4);
                    ps[ps1] = LINEAR(total - t3, 0.1 * direct, 0, l4);
                    ps[2] = LINEAR(total - t3, endX + 6 * direct, endX, l4);
                }else{
                    index = target;
                    targetCanChange = true;
                }
                drawOneframe(...ps);
            }
            //恢复由拖拽产生的变形
            var inRecover = false;
            var recoverLength = 0;
            function tranformRecover(delt, total){
                if(total < 300){
                    moveOffset = LINEAR(total, recoverLength, 0, 300);
                }else if(total < 400){
                    moveOffset = LINEAR(total - 300, 0, recoverLength * 0.1, 100);
                }else if(total < 500){
                    moveOffset = LINEAR(total - 400, recoverLength * 0.1, 0, 100);
                }else{
                    moveOffset = 0; 
                    targetCanChange = true;
                    inRecover = false;
                }
            } 
            //用三个参数确定某一帧的图形
            function drawOneframe(d,e,f){
                ctx.clearRect(0, 0, 700, 60);
                let points = createCircleByBezier(60 + f, 30, 30, d, e);
                //贝塞尔曲线画圆有一个参数，那就是控制点到绘制点的距离为圆半径的 4/3 * (Math.sqrt(2) - 1) 倍
                ctx.beginPath();
                ctx.moveTo(points[0], points[1]);
                ctx.bezierCurveTo(...points.slice(2, 8));
                ctx.bezierCurveTo(...points.slice(8, 14));
                ctx.bezierCurveTo(...points.slice(14, 20));
                ctx.bezierCurveTo(...points.slice(20, 26));
                ctx.closePath();
                ctx.fill();
            }

            window.RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback, element) {
                var start,
                    finish;
                window.setTimeout(function(){
                    start =+ new Date();
                    callback(start);
                    finish =+ new Date();
                    self.timeout = 1000 / 60 - (finish - start);
                },self.timeout);
            };
            var lasttime = Date.now();
            var firsttime = lasttime;
            function anim(){
                var now = Date.now();
                var delt = now - lasttime;
                var total = now - firsttime;

                if(delt < 500 && index != target){
                    drawAnimCircle(delt, total);
                }else if(moveOffset > 0){
                    console.log("inreover",inRecover)
                    if(inRecover){
                        tranformRecover(delt, total);
                        if(moveOffset > 0)
                            drawOneframe(moveOffset / 60, 0, index * 220);
                        else drawOneframe(0, moveOffset / 60, index * 220);
                    }else if(!isMouseStart){
                        console.log('recover')
                        //如果放手，则设置
                        inRecover = true;
                        recoverLength = moveOffset;
                        firsttime = now; 
                    }else{
                        if(moveOffset > 0)
                            drawOneframe(moveOffset / 60, 0, index * 220);
                        else drawOneframe(0, moveOffset / 60, index * 220);
                    }
                }else drawOneframe(0, 0, index * 220);
                
                lasttime = now;
                RAF(anim);
            }
            anim();
        },
        data(){
            return {
            }
        },
        methods:{
        },
        components:{
        }
    }
</script>

<style lang='scss' scoped>
    @import '../../common/public.scss';

    @font-face {
        font-family:icon;
        src:url('./fonts/icomoon.eot?ktu7wz#iefix') format('embedded-opentype'),
            url('./fonts/icomoon.ttf?ktu7wz') format('truetype'),
            url('./fonts/icomoon.woff?ktu7wz') format('woff'),
            url('./fonts/icomoon.svg?ktu7wz#icomoon') format('svg'),;
        font-weight: normal;
        font-style: normal;
    }
    .container{
        #canvas{
            z-index:0;
            position:absolute;
            top:0px;
            left:-30px;
            width:700px;
            height:60px;
        }
        .nav{
            user-select:none;
            z-index:1;
            position:relative;
            z-index:3;
            top:100px;
            left:120px;
            width:660px;
            height:60px;
            text-align:left;
            font-size:0;
            .nav-item{
                transition:color 0.2s;
                cursor:pointer;
                position:relative;
                display:inline-block;
                width:60px;
                height:60px;
                line-height:58px;
                box-sizing:border-box;
                border-radius:40px;
                border:1px solid #000;
                text-align:center;
                font-family:icon;
                font-size:24px;
                color:#000;
                margin-right:160px;
                &.active{
                    color:#fff;
                    // background-color:#000;
                }
            }
            .nav-bg{
                position:absolute;
                left:0;
                width:100%;
                height:px375(60);
                transition:0.2s linear;
            }
        }
    }
</style>
