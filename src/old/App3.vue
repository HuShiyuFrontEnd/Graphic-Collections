<template>
    <div class="container" @click='toggleFullscreen'>   <!--@click='toggleFullscreen'-->
        <!-- <video src='./src/bg.mp4' width=100% height=100% autoplay='true' preload='auto' loop='true'></video> -->
        <img id='gifBg' width=100% height=100% src='./src/bg.jpg' />
        <!-- <div id='gifBg' style='background-color:#ff5455;width:100%;height:100%;'></div> -->
        <div class='huge-title'>
            <img src='./src/title.png' width=100% height=100% />
        </div>
        <div class='huge-time'>
            <span class='huge-time-number'>{{time[0]}}</span><span class='huge-time-number'>{{time[1]}}</span><span class='huge-time-number'>{{time[2]}}</span><span class='huge-time-number'>{{time[3]}}</span><span class='huge-time-text'>年</span><span class='huge-time-number'>{{time[4]}}</span><span class='huge-time-number'>{{time[5]}}</span><span class='huge-time-text'>月</span><span class='huge-time-number'>{{time[6]}}</span><span class='huge-time-number'>{{time[7]}}</span><span class='huge-time-text mr48'>日</span><span class='huge-time-number'>{{time[8]}}</span><span class='huge-time-number'>{{time[9]}}</span><span class='huge-time-text'>时</span><span class='huge-time-number'>{{time[10]}}</span><span class='huge-time-number'>{{time[11]}}</span><span class='huge-time-text'>分</span><span class='huge-time-number'>{{time[12]}}</span><span class='huge-time-number'>{{time[13]}}</span><span class='huge-time-text'>秒</span>
        </div>
        <div class='huge-panel'>
            <img src='./src/panel.png' width=100% height=100% />
            <div class='huge-panel-list'>
                <div class='huge-panel-container' ref = 'panellist'>
                    <transition-group name="list" tag="p">
                        <div class='huge-panel-item' :key='"hugelist"+index' v-for='(item, index) of itemList'>
                            <div class='huge-item-name' :class='{"two-line-item-name":item.sellerName.length>6}'>{{item.sellerName}}</div>
                            <div class='huge-item-team' :class='{"two-line-item-team":item.teamName.length>6}'>{{item.teamName}}</div>
                            <div class='huge-item-amount'>{{item.amount | money}}</div>
                            <div class='huge-item-time' v-html=biggerInter(item.dealTime)></div>
                        </div>
                    </transition-group>
                </div>
            </div>
        </div>
        <transition name="fade" @after-enter='fadeEnter' @leave='fadeLeave' @after-leave='fadeAfterLeave'>
            <div class='huge-popup' :key=1 v-show=popupShow >
                <div class='huge-popup-bg'></div>
                <div class='huge-popup-main' ref='popup_main'>
                    <img class='huge-main-effect' ref='popup_effect' src='./src/popup_effect.png' />
                    <img class='huge-main-medal' width=100% height=100% src='./src/popup_main.png' />
                    <div class='huge-main-time'>{{toTime}}</div>
                    <div class='huge-main-team' :class='{"smaller-team":currentorder.teamName && currentorder.teamName.length + currentorder.sellerName.length > 10}' v-html='twoLineCheck(currentorder.teamName,currentorder.sellerName)'></div>
                    <div class='huge-main-amount'>进单<span>{{currentorder.amount}}</span>元</div>
                    <div class='huge-main-date'>{{toDate}}</div>
                </div>
            </div>
        </transition>
        <div id='testTool'>
            <div v-if='testToolOpen'>
                <div @click = 'messageSimulate(true)'>推送一条信息</div>
                <div @click = 'messageSimulate(false)'>开启自动推送</div>
                <div @click = 'refreshList'>刷新</div>
            </div>
        </div>
    </div>
</template>

<script>
import io from 'socket.io-client';
import Vue from 'vue'
import api from '@/api.js'

Vue.filter('money',(value) => {
    value = value + '';
    if(value < 1000) return '￥'+value;
    else if(value < 1000000) return '￥' + value.slice(0,value.length-3) + ',' + value.slice(-3);
    else return '￥' + value.slice(0,value.length-6) + ',' + value.slice(value.length-6,value.length-3) + ',' + value.slice(-3);
})

let transformMap = {
    Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
    Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12'
};

let messageIndex = 1;

export default {
    name: 'App',
    data () {
        return {
            socket:null,
            socketFirst:false,
            last:0,
            time:[2,0,1,8,0,1,0,1,0,0,0,0,0,0],
            itemList:[
            ],
            itemWaitList:[
            ],
            //订单详情
            currentorder:{
            },
            current: 0,
            length: 20,
            interval: 1,
            scrollLock:false,
            popupShow:false,//霸屏检测
            popup_el_main:null,
            popup_el_effect:null,
            popupStartTime:0,
            popupEndTime:0,
            popupNext:false,
            testToolOpen:false,
            listRefreshEnable:true,
            listRefreshTime:0,
            listRefreshInterval:60000,
            isfullscreen:false,
            fullscreen:[
                {
                    name:'webkit(chrome,opera,safari,edge)',
                    check:'webkitIsFullScreen',
                    request:'webkitRequestFullscreen',
                    exit:'webkitExitFullscreen'
                },
                {
                    name:'gecko',
                    check:'mozFullScreen',
                    request:'mozRequestFullScreen',
                    exit:'mozCancelFullScreen'
                },
                {
                    name:'IE',
                    check:null,
                    request:'msRequestFullscreen',
                    exit:'msExitFullscreen'
                },
            ]
        }
    },
    // sockets:{
    //     connect(){
    //         console.log('实时推送接通！');
    //     },
    //     disconnect(err){
    //         console.log('连接断开！',err);
    //     },
    //     error(err){
    //         console.log('出现错误！',err);
    //     },
    //     E0115(data){
    //         if(typeof data == 'string')
    //             data = JSON.parse(data);
    //         console.log('前端接收到新订单:'+data.sellerName+' '+data.amount);
    //         this.itemWaitList.push(data);
    //         if(!this.popupShow){
    //             this.showPopup();
    //         }
    //         else this.speedUpPrevPopup();
    //     },
    // },
    methods: {
        //所有轮询的触发位置
        update(){
            let current = Date.now();
            if(!this.listRefreshTime) this.listRefreshTime = current;
            else if(current - this.listRefreshTime > 60000){
                if(this.listRefreshEnable) this.refreshList();
                this.listRefreshEnable = true;
                this.listRefreshTime = current;
            }
            //处理离开浏览器的情况，离开时，绘制停止但是计时继续，不作处理回来会有问题
            if(current - this.last > 1500){
                this.last = current;
                RAF.call(window,this.update.bind(this));
                return false;
            }
            if(this.popupEndTime && this.popupShow){
                if(current > this.popupEndTime){
                    this.hidePopup();
                }
            }
            //控制时间刷新
            if(current - this.last > 1000){
                if(this.socket.disconnected){
                    console.log(this.socket.disconnected)
                    this.reconnect();
                }
                this.refreshTime();
                this.last += 1000;
                if(this.itemList.length > 9 && !this.scrollLock){
                    if(this.interval == 0){
                        if(this.current < this.itemList.length - 9) this.current++;
                        else this.current = 0;
                        this.scrollTo(this.current);
                        this.interval = 1;
                    }else this.interval--;
                }
            }
            RAF.call(window,this.update.bind(this));
        },
        //刷新时间
        refreshTime(){
            let info = new Date().toString().split(' ');
            this.time = (info[3]+transformMap[info[1]]+info[2]+info[4].replace(/:/g,'')).split('');
            // this.time = (info.substr(0,10).replace(/-/g,'') + info.substr(11,8).replace(/:/g,'')).split('');
        },
        //滚动
        scrollTo(index){
            if(this.$refs)
                this.$refs.panellist.style.transform = 'translateY(-' + this.current * 0.64 + 'rem)';
        },
        showPopup(){
            console.log((new Date().toString().split(' '))[4],'霸屏开始')
            this.currentorder = this.itemWaitList[0];
            this.popupShow = true;
            this.popupStartTime = Date.now();
            let playtime = -10000;
            // if(this.itemWaitList.length > 1) playtime = -3000;
            this.popupEndTime = this.popupStartTime - playtime;
        },
        hidePopup(){
            console.log((new Date().toString().split(' '))[4],'霸屏结束');
            try{
                let newItem = this.itemWaitList.shift();
                if(new Date(newItem.dealTime) <= new Date(this.itemList[0].dealTime)){
                    this.refreshList();
                }else{
                    this.itemList.unshift(newItem);
                    if(this.itemList.length > this.length) this.itemList.pop();
                }
            }catch(e){
                this.refreshList();
            }
            this.popupStartTime = 0;
            this.popupEndTime = 0;
            this.popupShow = false;
            if(this.listRefreshEnable){
                this.refreshList();
            }
            this.continuePopupCheck();
        },
        //检验有没有连续的订单霸屏
        continuePopupCheck(){
            //这个函数开始时，popupShow一定是false,且之前一个霸屏已经从等待序列中吐出去了
            if(this.itemWaitList.length > 0) this.popupNext = true;
        },
        //加速前一个订单霸屏
        speedUpPrevPopup(){
            // let current = Date.now();
            // let quicktime = this.popupStartTime - (-3000);
            // if(current > quicktime) this.popupEndTime = current;
            // else this.popupEndTime = quicktime;
        },
        fadeEnter(){
            this.popup_el_main.classList.add('showing');
            setTimeout(() => {
                this.popup_el_effect.classList.add('moveLeft');
            },300);
        },
        fadeLeave(){
            this.popup_el_main.classList.remove('showing');
        },
        fadeAfterLeave(){
            this.popup_el_effect.classList.remove('moveLeft');
            //继续下一个霸屏
            if(this.popupNext){
                this.showPopup();
                this.popupNext = false;
            }
        },
        //模拟信息生成
        messageSimulate(one){
            let info = new Date().toString().split(' ');
            let nextTime = Math.floor(Math.random() * 19500) - (-500);
            console.log(`${info[4]} 后台新订单生成！ 下一条订单将于${nextTime/1000}s后出现`)
            api.pushSimulate({
                "data":`{"sellerName":"测试${messageIndex}","teamName":"测试队伍","amount":"${(Math.pow(10,((Math.random()*5)<<0))*120)}","dealTime":"${info[3]}-${transformMap[info[1]]}-${info[2]} ${info[4]}"}`.replace(/\"/g,'\"'),
                "event": "E0115",
                "notifyAll": true
            });
            messageIndex++;
            if(!one)
                setTimeout(() => {
                    this.messageSimulate();
                },nextTime);
        },
        //刷新列表
        refreshList(){
            this.scrollLock = true;
            this.listRefreshEnable = false;
            api.getOrderList()
                .then((data) => {
                    try{
                        let length = data.data.data.length;
                        this.itemList.splice(0,this.itemList.length);
                        setTimeout(()=>{
                            for(let i = 0;i < length;i++){
                                this.itemList[i] = data.data.data[i];
                            }
                            setTimeout(() => {
                                this.scrollLock = false;
                            },800);
                        },100);
                    }catch(e){
                        console.log(e)
                        this.scrollLock = false;
                    }
                })
                .catch((err) => {
                    console.log(err)
                });
        },
        biggerInter(val){
            let data = val.split(' ');
            if(data.length == 0) return val;
            else return data[0]+'<span>&nbsp&nbsp&nbsp</span>'+data[1];
        },
        //切换全屏
        toggleFullscreen(){
            if(this.isfullscreen){
                document[this.fullscreen.exit]();
                this.isfullscreen = false;
            }else{
                document.body[this.fullscreen.request]();
                this.isfullscreen = true;
            }
        },
        twoLineCheck(teamName,sellerName){
            if(!teamName || !sellerName) return '';
            return `【<span></span>${teamName}<span></span>】${teamName.length+sellerName.length>10?'<br/>':''}${sellerName}`;
        },
        setSocket(){
            this.socket = io(api.socket);
            this.socket.on('E0115',(data) => {
                if(typeof data == 'string')
                    data = JSON.parse(data);
                console.log('前端接收到新订单:'+data.sellerName+' '+data.amount,data);
                this.itemWaitList.push(data);
                if(!this.popupShow){
                    this.showPopup();
                }
                else this.speedUpPrevPopup();
            });
            this.socket.on('connect',() => {
                if(!this.socketFirst){
                    this.socketFirst = true;
                    console.log("连接成功!")
                }
            })
            this.socket.on('disconnect',() => {
                if(this.socketFirst){
                    this.socketFirst = false;
                    console.log("连接断开!")
                }
            })
        },
        reconnect(){
            this.socket = io(api.socket);
        }
    },
    computed:{
        toTime(){
            if(this.currentorder.dealTime) return this.currentorder.dealTime.split(' ')[1];
            else return '';
        },
        toDate(){
            if(this.currentorder.dealTime){
                let date = this.currentorder.dealTime.split(' ')[0];
                date = date.split('-');
                return date[0] + '年' + date[1] + '月' + date[2] + '日';
            }else return '';
        },
    },
    created(){
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
    },
    mounted(){
        this.popup_el_main = this.$refs.popup_main;
        this.popup_el_effect = this.$refs.popup_effect;

        this.refreshList();
        window.openTestTool = () => this.testToolOpen = true ;
        window.refreshList = this.refreshList;
        window.messageSimulate = this.messageSimulate;

        //确认下浏览器的全屏API
        for(let item of this.fullscreen){
            if(document[item.exit] !== undefined){
                this.fullscreen = item;
                break;
            }
        }

        this.setSocket();

        this.last = Date.now();
        this.update();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style lang="scss" scoped>
    @function px1 ($px) {
        @return ($px / 100) * 1rem;
    }

    // @font-face {
    //     font-family: 'ltjh';
    //     src: url('/static/fzltjzht.TTF'),format('truetype');
    // }

    .list-enter-active, .list-leave-active {
        transition: all 0.3s;
    }
    .list-enter, .list-leave-to/* .list-leave-active for below version 2.1.8 */ {
        opacity: 0;
        transform: translateY(30px);
    }

    .fade-enter-active, .fade-leave-active {
        transition:opacity 0.2s ease-in;
    }
    .fade-leave-to {
        opacity:0;
    }
    .fade-enter > .huge-popup-bg, .fade-leave-to > .huge-popup-bg{
        opacity:0;
    }
    .fade-enter > .huge-popup-main, .fade-enter-to > .huge-popup-main{
        transform: scale(0);
    }
    .huge-popup-bg{
        // opacity:0;
        transition:opacity 0.2s ease-in;
    }
    .huge-popup-main{
        transform: scale(0);
        transition:transform 0.3s cubic-bezier(0, 0.84, 0.78, 1.27);
    }
    .showing.huge-popup-main{
        transform: scale(1);
    }

    video,#gifBg{
        position: fixed;
        left:0px;
        top:0px;
        z-index:-1;
        opacity:1 !important;
    }
// 'ltjh',
    .container{
        max-width:100%;
        max-height:100%;
        width:px1(1920);
        height:px1(1080);
        font-family:'微软雅黑', "ff-tisa-web-pro-1", "ff-tisa-web-pro-2", "Lucida Grande", "Hiragino Sans GB", "Hiragino Sans GB W3", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;;
        position:absolute;
        left:50%;
        top:50%;
        margin-left:px1(-960);
        margin-top:px1(-540);
        .huge-title{
            position: absolute;
            top: px1(60);
            left: px1(203);
            width: px1(1514);
            height: px1(119);
        }
        .huge-time{
            position: absolute;
            top: px1(200);
            left: px1(670);
            width: px1(620);
            height: px1(32);
            line-height: px1(32);
            font-size: 0;
            color:#fff;
            .huge-time-number,.huge-time-text{
                vertical-align: middle;
                display: inline-block;
                height: px1(32);
                line-height: px1(32);
                text-align: center;
            }
            .mr48{
                margin-right: px1(48);
            }
            .huge-time-number{
                width: px1(25);
                font-size: px1(24);
                margin-right: px1(1);
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: px1(5);
            }
            .huge-time-text{
                width: px1(31);
                font-size: px1(20);
            }
        }
        .huge-panel{
            position: absolute;
            top: px1(240);
            left: px1(197);
            width: px1(1524);
            height: px1(817);
            img{position:absolute;left:0;right:0;}
            .huge-panel-list{
                position:absolute;
                left:0;
                top:px1(120);
                width: 100%;
                height: px1(576);
                z-index:1;
                overflow: hidden;
                color: #da7758;
                // background-color:#000;
                .huge-panel-container{
                    transition: transform 0.5s ease-in-out;
                    .huge-panel-item{
                        height: px1(64);
                        line-height: px1(64);
                        font-size:0;
                        div{
                            width:px1(100);
                            white-space: nowrap;
                            display:inline-block;
                            vertical-align:top;
                            font-size:px1(28);
                        }
                        .huge-item-name{
                            margin-left: px1(166);
                            &.two-line-item-name{
                                white-space:pre-wrap;
                                font-size:0.24rem;
                                line-height:0.32rem;
                                width:1.5rem;
                                margin-right:-0.5rem;
                            }
                        }
                        .huge-item-team{
                            margin-left: px1(136);
                            &.two-line-item-team{
                                white-space:pre-wrap;
                                font-size:0.24rem;
                                line-height:0.64rem;
                                width:2.5rem;
                                margin-right:-1.5rem;
                            }
                        }
                        .huge-item-amount{
                            margin-left: px1(206)
                        }
                        .huge-item-time{
                            margin-left: px1(220);
                        }
                    }
                }
            }
        }
        .huge-popup{
            position: fixed;
            z-index:99;
            left:0;
            top:0;
            width:100%;
            height:100%;
            .huge-popup-bg{
                width:100%;
                height:100%;
                background-color:rgba(0, 0, 0, 0.5);
            }
            .huge-popup-main{
                position: absolute;
                z-index:100;
                width: px1(882);
                height: px1(897);
                left: 50%;
                top: 50%;
                margin-top:px1(-448);
                margin-left:px1(-441);
                .huge-main-medal{
                    position:absolute;
                    z-index:100;
                    left:0;
                    top:0;
                }
                .huge-main-effect{
                    position:absolute;
                    z-index:100;
                    width: px1(1280);
                    height: px1(920);
                    left: px1(-250);
                    top: px1(-65);
                    transform:translateX(px1(20));
                    opacity:0;
                    transition-duration:0.2s;
                    &.moveLeft{
                        transform:translateX(0px);
                        opacity:1;
                    }
                }
                div{
                    position:relative;
                    z-index:101;
                    color:#fff;
                    text-align: center;
                }
                .huge-main-time{
                    width: px1(335);
                    height: px1(92);
                    line-height: px1(92);
                    margin-top:px1(205);
                    margin-left:px1(265);
                    letter-spacing: px1(5);
                    background-color:rgba(255,255,255,0.1);
                    border-radius:px1(12);
                    font-size: px1(56);
                }
                .huge-main-team{
                    text-shadow:px1(3) px1(3) px1(25) rgba(200,40,80,0.4),
                    px1(0) px1(0) px1(20) rgba(200,40,80,0.5),
                    px1(8) px1(8) px1(25) rgba(200,40,80,0.4),
                    px1(5) px1(5) px1(20) rgba(200,40,80,0.4);//#d51297
                    text-indent:px1(-30);
                    margin-top:px1(94);
                    letter-spacing: px1(5);
                    font-size: px1(60);
                    span{
                        display:inline-block;
                        width: px1(4);
                    }
                    &.smaller-team{
                        margin-top:px1(64);
                        padding-bottom:px1(30);
                        font-size:px1(50);
                    }
                }
                .huge-main-amount{
                    text-shadow:px1(3) px1(3) px1(25) rgba(250,60,80,0.4),
                    px1(0) px1(0) px1(20) rgba(250,60,80,0.5),
                    px1(8) px1(8) px1(25) rgba(250,60,80,0.4),
                    px1(5) px1(5) px1(20) rgba(250,60,80,0.4);//#d51297
                    text-indent:px1(-10);
                    letter-spacing: px1(6);
                    margin-top:px1(36);
                    font-size: px1(60);
                    span{
                        letter-spacing: px1(10);
                        font-size:px1(85);
                        color:#fffaaa;
                    }
                }
                .huge-main-date{
                    text-indent:px1(-10);
                    margin-top:px1(126);
                    font-size:px1(32);
                    color:rgba(255,255,255,0.8);
                    letter-spacing: px1(3);
                }
            }
        }
    }

    #testTool{
        cursor:pointer;
        position:fixed;
        left:0;
        top:0;
        z-index:10000;
        width:0px;
        height:0px;
        background-color:rgba(255,255,255,0.5);
        white-space:nowrap;
        color:#fff;
        font-size:30px;
        input{
            width:24px;
            height:24px;
        }
    }
    #testTool.active{
        width:400px;
        height:200px;
    }
</style>
