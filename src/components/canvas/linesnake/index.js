//https://codepen.io/ninivert/pen/BOLewR
//不用clear从而用之前的内容透明度逐渐降低来模拟流星型的尾巴，代码相当精炼
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const WIDTH = window.innerWidth, HEIGHT = window.innerHeight
const COUNT = Math.floor(WIDTH * HEIGHT * 0.0001)
const PADDING = 10
const PRECISION = 10
const SIZE = 2
let gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
gradient.addColorStop(0, '#5f2c82')
gradient.addColorStop(1, '#49a09d')
const COLOR = '#f7f1e3'
const BGCOLOR = gradient
const WRAPPER = document.getElementById('container')

let NEXTFRAME, SNAKES
function init() {
    cancelAnimationFrame(NEXTFRAME)
    
    canvas.width = WIDTH
    canvas.height = HEIGHT
    
    SNAKES = new Array(COUNT).fill().map(() => {
        let length = Math.random() * 40 + 40;
        return {
            x: Math.random() * WIDTH,
            y: Math.random() * (HEIGHT - 2*PADDING) + PADDING,
            length: length,
            period: length,
            amplitude: length * 0.5,
            speed: Math.random() * 1 + 1
        }
    })
    
    WRAPPER.innerHTML = ''
    WRAPPER.appendChild(canvas)

    ctx.lineCap = 'round'
    ctx.lineWidth = SIZE
    ctx.strokeStyle = COLOR
    
    draw()
}

function draw() {
    ctx.globalAlpha = 0.1
    ctx.fillStyle = BGCOLOR
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.globalAlpha = 1
    
    let snake
    
    for (let i=0; i<COUNT; i++) {
        snake = SNAKES[i]
        snake.x += snake.speed

        if (snake.x > WIDTH) {
            snake.x = -snake.length
        }

        ctx.beginPath()
        ctx.moveTo(snake.x, snake.y + Math.sin(snake.x/ snake.period) * snake.amplitude)

        for (let dx=0, dy; dx<snake.length; dx+=PRECISION) {
            dy = Math.sin((dx + snake.x) / snake.period) * snake.amplitude
            ctx.lineTo(snake.x + dx, snake.y + dy)
        }

        ctx.stroke()
    }
    
    NEXTFRAME = requestAnimationFrame(draw)
}

window.onresize = init

init()