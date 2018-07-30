<template>
    <transition name="fade"  @after-leave='fadeAfterLeave'>
        <div v-show='isShow' class='img-viewer'
            v-finger:single-tap = "dealTap"
            v-finger:double-tap = 'dealDoubleTap'
            v-finger:swipe = 'dealSwipe'

            v-finger:touch-start = 'touchStart'
            v-finger:touch-move = 'touchMove'
            v-finger:touch-end = 'touchEnd'
            v-finger:touch-cancel = 'touchCancel'
        >
            <div class='img-viewer-parent' ref='myViewer'>
                <div class='img-viewer-child' :key=index  v-for='(item, index) in list'>
                    <img ref="img_viewer" :class='{"loaded":item.show,"horizontal":item.horizon,"portrait":!item.horizon}' @load=onload(index) :src=item.src />
                </div>
            </div>
            <div class='img-viewer-pagenation' v-if='usePagenation'>{{current-(-1)}}/{{length}}</div>
        </div>
    </transition>
</template>

<script>
    import Vue from 'vue'
    import AlloyFinger from './alloy_finger.js'
    import AlloyFingerPlugin from './alloy_finger.vue.js'
    import styleLoader from '../styleLoader'
    import To from './to.js'
    // import VueAwesomeSwiper from 'vue-awesome-swiper'

    Vue.use(AlloyFingerPlugin);
    // Vue.use(VueAwesomeSwiper);

    export default {
        data () {
            return {
                usePagenation:true,
                isShow:false,
                list:[],
                length:0,
                lastTime:0,
                current:0,
                expand:false,
            }
        },
        props:{
        },
        methods:{
            onload(index){
                let ele = this.$refs.img_viewer[index];
                this.list[index].horizon = !(ele.naturalHeight / ele.naturalWidth * window.innerWidth > window.innerHeight * 0.6);
                this.list[index].show = true;
            },
            analyse(itself){
                console.log(itself)
            },
            dealTap(){
                this.isShow = false;
                // console.log('tap')
            },
            fadeAfterLeave(){
                if(!this.isShow)
                    this.$refs.myViewer.translateX = 0;
                    this.$refs.myViewer.style.transform = 'translateX(' + this.$refs.myViewer.translateX + 'px)';
            },
            dealDoubleTap(){
                // console.log([this.$refs.myViewer]);
                if(!this.expand){
                    this.$refs.myViewer.querySelectorAll('img')[this.current].style.transform = 'scale(1.3)';
                    this.expand = this.$refs.myViewer.querySelectorAll('img')[this.current];
                }else this.cancelExpand();
            },
            cancelExpand(){
                if(!this.expand)
                    return false;
                this.expand.style.transform = 'scale(1)';
                this.expand = false;
            },
            dealSwipe(e){
                // console.log('swipe:'+e.direction);
                if(e.direction == 'Left' && this.current < this.length-1){
                    this.cancelExpand()
                    new To(this.$refs.myViewer, 'translateX', this.$refs.myViewer.translateX - window.innerWidth, 200, this.ease, () => {
                        this.current++;
                    },() => {
                        this.$refs.myViewer.style.transform = 'translateX(' + this.$refs.myViewer.translateX + 'px)';
                    });
                }
                if(e.direction == 'Right' && this.current > 0){
                    this.cancelExpand()
                    new To(this.$refs.myViewer, 'translateX', this.$refs.myViewer.translateX + window.innerWidth, 200, this.ease, () => {
                        this.current--;
                    },() => {
                        this.$refs.myViewer.style.transform = 'translateX(' + this.$refs.myViewer.translateX + 'px)';
                    });
                }
            },
            touchStart(e){
                // console.log(e);
                // this.lastTIme = e.timeStamp;
            },
            touchMove(e){
                // console.log('move',e.deltaX,e);
                // new To(this.$refs.myViewer, 'translateX', this.translateX - (-e.deltaX), e.timeStamp - this.lastTime, null)
                // this.lastTIme = e.timeStamp;
                // To.
            },
            touchEnd(){
                
            },
            touchCancel(){
                
            },
            moveTo(index){
                this.current = index;
                this.$refs.myViewer.translateX = - window.innerWidth * index;
                this.$refs.myViewer.style.transform ='translateX(' + this.$refs.myViewer.translateX + 'px)';
            }
        },
        mounted(){
            this.$refs.myViewer.translateX = 0;
        },
        watch:{
            isShow(val){
                if(val){
                    let innerWidth = window.innerWidth;
                    let innerHeight = window.innerHeight;
                    // console.log(styleLoader)
                    styleLoader.add(`.img-viewer-child{line-height:${innerHeight}px;}`);
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }
    @import '../../../common/css/swiper.min.css';

    .img-viewer{
        position:absolute;
        left:0;
        top:0;
        width:100%;
        height:100%;
        background-color:#000;
        color:#fff;
        .img-viewer-parent{
            height:100%;
            min-width:100%;
            white-space:nowrap;
            font-size:0;
            .img-viewer-child{
                width:100%;
                height:100%;
                display:inline-block;
                text-align:center;
                img{
                    opacity:0;
                    transition-duration:0.2s;
                    vertical-align:middle;
                    // max-width:100%;
                    // max-height:60%;
                    &.loaded{
                        opacity:1;
                    }
                    &.horizontal{
                        width:100%;
                        height:auto;
                    }
                    &.portrait{
                        height:60%;
                        width:auto;
                    }
                }
            }
        }
        .img-viewer-pagenation{
            position:absolute;
            width:100%;
            bottom:30px;
            text-align: center;
        }
    }
</style>