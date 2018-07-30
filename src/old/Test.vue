<template>
    <div class='container' @click='addAnimation'>
        <div class='card topHalf next' ref='next_top'>
            <div>{{next}}</div>
        </div>
        <div class='card bottomHalf now' ref='now_bottom'>
            <div>{{current}}</div>
        </div>
        <div class='card topHalf now' @animationend='animationEnd1' ref='now_top'>  <!--flipDownHide-->
            <div>{{current}}</div>
        </div>
        <div class='card bottomHalf next' @animationend='animationEnd2' ref='next_bottom'> <!-- flipDownShow-->
            <div>{{next}}</div>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            current:10,
            next:11,
        }
    },
    methods:{
        addAnimation(){
            // this.$refs.next_top.classList.add('flipDownHide');
            this.$refs.next_bottom.classList.add('flipDownShow');
            this.$refs.now_top.classList.add('flipDownHide');
            // this.$refs.now_bottom.classList.add('flipDownShow');
        },
        animationEnd1(){
            console.log('d')
        },
        animationEnd2(){
            console.log('f')
            // this.current ++;
            // this.$refs.next_bottom.classList.remove('flipDownShow');
            // this.$refs.now_top.classList.remove('flipDownHide');
            // this.next ++;
        },
    },
    mounted(){
        // setInterval(() => {
            // this.addAnimation();
        // },1000);
    }
}
</script>

<style lang='scss' scoped>

    @font-face{
        font-family:'numberuse';
        src:url('./src/DINMittelschriftStd.otf');
    };
    
    .card{
        // border-radius:4px;
        position:absolute;
        width:4.5rem;
        height:2rem;
        line-height:4rem;
        overflow:hidden;
        background-color: #333;
        color:#fff;
        font-family:'numberuse';
        font-size:0;
        text-align: center;
        div{
            width:100%;
            height:4rem;
            font-size:3rem;
            display:inline-block;
            box-sizing:border-box;
        }
    }
    .now{
        // color:#0f0;
        color:#fff;
    }
    .topHalf{
        top:0;
        // border-bottom:1px solid #fff;
    }
    .next{
        // color:#f00;
        color:#fff;
    }
    .bottomHalf{
        top:2rem;
        // border-top:1px solid #fff;
        div{
            position:relative;
            height:4rem;
            top:-2rem;
        }
        &.next{
            transform-origin:0 0;
            transform:rotateX(-90deg);
        }
    }

    .animate{
        perspective:500;
        animation-fill-mode:forwards;
    }
    .flipDownHide{
        transform-origin:0 100%;
        animation-name:flipDownHide;
        animation-duration:2s;
        animation-timing-function:ease-in-out;
        @extend .animate;
    }
    .flipDownShow{
        animation-name:flipDownShow;
        animation-duration:2s;
        animation-delay: 2s;
        animation-timing-function:ease-in-out;
        @extend .animate;
    }
    @keyframes flipDownHide{
        0%{
            transform:rotateX(0);
        }
        100%{
            transform:rotateX(90deg);
        }
    }
    @keyframes flipDownShow{
        0%{
            transform:rotateX(-90deg);
        }
        100%{
            transform:rotateX(0deg);
        }
    }
</style>
