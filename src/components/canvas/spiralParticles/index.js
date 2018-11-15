//this guy is in a wrong place

//https://codepen.io/comehope/pen/xJrOqd

import DI from '../../common/dependenceInject.js';
DI.import([
    '/static/common/d3.js',
]).then(function(){
    document.body.innerHTML = '<section class="container"></section>';

    DI.addCSSStyle(`
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: black;
        }
        
        .container {
            width: 70vmin;
            height: 70vmin;
            display: flex;
            align-items: center;
            justify-content: center;
            --particles: calc(var(--particles-per-circle) * var(--circles));
        }
        
        .container div {
            position: absolute;
            width: 10vmin;
            height: 10vmin;
            transform: rotate(calc(var(--n) / var(--particles-per-circle) *  -360deg));
        }
        
        .container div span {
            position: absolute;
            width: inherit;
            height: inherit;
            border-radius: 50%;
            background-color: orangered;
            animation: 
                move 2s linear infinite,
                change-color 2s linear infinite;
            animation-delay: calc(var(--n) / var(--particles) * -2s);
        }
        
        @keyframes move {
            from {
                transform: translateX(0) scale(0);
            }
        
            70% {
                transform: translateX(210%) scale(0.55);
            }
        
            to {
                transform: translateX(300%) scale(0);
            }
        }
        
        @keyframes change-color {
            to {
                filter: hue-rotate(1turn);
            }
        }
    `);

    const PARTICLES_PER_CIRCLE = 14;
    const CIRCLES = 4;
    const COUNT_OF_PARTICLES = PARTICLES_PER_CIRCLE * CIRCLES;

    d3.select('.container')
        .style('--particles-per-circle', PARTICLES_PER_CIRCLE)
        .style('--circles', CIRCLES)
        .selectAll('div')
        .data(d3.range(COUNT_OF_PARTICLES))
        .enter()
        .append('div')
        .style('--n', (d) => d + 1)
        .append('span');
})