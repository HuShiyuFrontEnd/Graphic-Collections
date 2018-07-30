<template>
    <div class='container'>
        <div class='content'>
            <!-- <swiper :options="swiperOption" class='swiper-parent'>
                <swiper-slide class='content-item' :key=item.name v-for="(item, index) in setting">
                    <div :style="'background-color:' + item.color">{{item.name}}</div>
                </swiper-slide>
            </swiper> -->
            <!-- <div  class='swiper-parent'
                v-finger:single-tap = "dealTap"
                v-finger:double-tap = 'dealDoubleTap'
                v-finger:swipe = 'dealTap' 

                v-finger:touch-start = 'touchStart'
                v-finger:touch-move = 'touchMove'
                v-finger:touch-end = 'touchEnd'
                v-finger:touch-cancel = 'touchCancel'
                ref = 'myViewer'
            > -->
            <div class='swiper-container swiper-parent'>
                <div class="swiper-wrapper">
                    <div class='content-item swiper-slide' :key=item.name v-for="(item, index) in setting">
                        <div :style="'background-color:' + item.color">{{item.name}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class='nav'>
            <svg class='nav-bg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60" :style='navbg.style' >
                <path fill='rgb(252,192,77)' ref='path' d='' />
            </svg>
            <div class='nav-item' :class='{active:current==0}'>a</div>
            <div class='nav-item' :class='{active:current==1}'>v</div>
            <div class='nav-item' :class='{active:current==2}'>b</div>
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

    export default {
        data(){
            return {
                ease:function(a){
                    return a/1.1;
                },
                length:3,
                lastTime:0,
                current:0,
                expand:false,
                setting:[
                    {
                        name:'照片',
                        color:'rgb(252,192,77)',
                        // color:'hsl(39,96%,64%)',
                    },
                    {
                        name:'视频',
                        color:'rgb(0,195,226)'
                        // color:'hsl(187,100%,44%)'
                    },
                    {
                        name:'统计',
                        color:'rgb(254,98,109)'
                        // color:'hsl(355,96%,69%)'
                    },
                ],
                swiperOption:{
                    speed:500,
                    // loop:true,
                    on:{
                        touchMove(event){
                            // console.log(event)
                        },
                        progress(progress){
                            Subscriber.cover('progress', progress);
                        },  
                        slideNextTransitionStart: function(){
                            Subscriber.cover('move', 1);
                        },
                        slidePrevTransitionStart: function(){
                            Subscriber.cover('move', -1);
                        },
                    }
                },
                navbg:{
                    style:{
                        strokeWidth:0,
                    },
                },
                direct:0,
                swiping:false,
            }
        },
        methods:{
            createCircleByBezier(d, e, x){
                let r = 30;
                let y = 30;
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
                return p;
            },
        },
        mounted(){
            // this.$refs.myViewer.translateX = 0;
            let that = this;
            let $path = this.$refs.path;
            let mySwiper = new Swiper('.swiper-parent',{
                speed:500,
                direction: 'horizontal',
                freeMode:false,
                // touchRatio:0.5,
                // loop: true,
                watchSlidesProgress : true,
                on:{
                    slidePrevTransitionStart(){
                        // mySwiper.allowTouchMove = false;
                        that.direct = -1;
                    },
                    slidePrevTransitionEnd(){
                        // mySwiper.allowTouchMove = true;
                        that.direct = 0;
                    },
                    slideNextTransitionStart(){
                        // mySwiper.allowTouchMove = false;
                        that.direct = 1;
                    },
                    slideNextTransitionEnd(){
                        // mySwiper.allowTouchMove = true;
                        that.direct = 0;
                    },
                }
            });
            console.log(mySwiper)
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
            let lastValue;
            function anim(){
                let value = (mySwiper.progress * 2);
                // value = value - Math.floor(value);
                $path.style.fill = COLOR_LINEAR(value);
                that.current = BORDER_LINEAR(value);
                
                // if(that.direct == 0)
                    $path.setAttribute('d', that.createCircleByBezier( ...BEZIER_LINEAR(value , that.direct) ));
                // else {

                // }
                RAF(anim);
            }
            anim();
        },
        components:{
        }
    }
</script>

<style>
    .swiper-wrapper{
        transition-timing-function:cubic-bezier(0, 0, 0.35, 1.6);
    }
</style>
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
        position:absolute;
        width:100%;
        height:100%;
        font-size:px375(40);
        font-family:"ff-tisa-web-pro-1", "ff-tisa-web-pro-2", "Lucida Grande", "Hiragino Sans GB", "Hiragino Sans GB W3", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
        color:#fff;
        z-index:1;
        overflow:hidden;
        &:before{
            content:'';
            position:absolute;
            display:block;
            left:-20%;
            top:-20%;
            width:140%;
            height:140%;
            z-index:2;
            background-image:url('./src/bg1.jpg');
            background-position:center;
            background-repeat: no-repeat;
            @include createBlur(30px);
        }
        .content{
            position:relative;
            z-index:3;
            width:100%;
            height:40%;
            .swiper-parent{
                // transform:translate3D(0);
                width:100%;
                height:100%;
                .swiper-wrapper{
                    width:100%;
                }
                .content-item{
                    position:relative;
                    display:block;
                    width:100%;
                    height:100%;
                    box-sizing:border-box;
                    padding:px375(42) px375(37) px375(21) px375(38);
                    div{
                        width:100%;
                        height:100%;
                        border-radius:px375(25);
                        line-height:px375(100);
                        font-size:px375(30);
                        text-indent:px375(40);
                    }
                }
            }
        }
        .nav{
            position:relative;
            z-index:3;
            left:px375(38);
            width:px375(300);
            height:20%;
            text-align:left;
            font-size:0;
            .nav-item{
                position:relative;
                display:inline-block;
                width:px375(60);
                height:px375(60);
                line-height:px375(58);
                box-sizing:border-box;
                border-radius:px375(40);
                border:px375(1) solid #fff;
                background-color:rgba(150,150,150,0.1);
                text-align:center;
                font-family:icon;
                font-size:px375(24);
                color:#fff;
                margin-left:px375(30);
                &.active{
                    border:none;
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
