import Stats from '../heartbeat/update/stats.js'

let stats = new Stats()
stats.setMode(0) // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute'
stats.domElement.style.left = '0px'
stats.domElement.style.top = '0px'
document.body.appendChild(stats.domElement)

let container = document.getElementById('container')
let canvas = document.createElement('canvas')
container.appendChild(canvas)
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let ctx = canvas.getContext('2d')

const Green = '#05D559'
// const COLOR_DANGER = 0xFE3C36
// function createDangerColor(offset) {
//   if (offset > 1) offset = 1
//   if (offset < 0) offset = 0
//   return COLOR_DANGER * (1 - offset) + 0xffffff * offset
// }

let img = new Image()
img.onload = startAnime
img.src = '/static/assets/dog.jpg'

class Bubble {
  constructor({ color, radius, x, y, delay }) {
    this.color = color
    this.radius = radius
    this.originX = x
    this.originY = y
    this.delay = delay
    this.oc = document.createElement('canvas') // offscreen canvas
    this.oc.width = this.oc.height = this.radius * 2
    this.octx = this.oc.getContext('2d')
    this.octx.globalAlpha = 0.4
    this.octx.arc(this.radius, this.radius, radius, 0, 2 * Math.PI, true)
    this.octx.fillStyle = this.color
    this.octx.fill()
    // document.body.appendChild(this.oc)
  }
  render(delt, total) {
    let radius = this.radius

    ctx.save()
    ctx.transform(...this.computeMatrix(total / 709, 0.8, 1, this.oc.width, this.oc.height, this.originX - this.radius * 0.8, this.originY - this.radius))
    ctx.drawImage(this.oc, 0, 0, this.oc.width, this.oc.height)
    ctx.restore()

    ctx.save()
    ctx.transform(...this.computeMatrix((total / 709 + Math.PI / 2), 0.8, 1, this.oc.width, this.oc.height, this.originX - this.radius * 0.8, this.originY - this.radius))
    ctx.drawImage(this.oc, 0, 0, this.oc.width, this.oc.height)
    ctx.restore()

    ctx.save()
    ctx.transform(...this.computeMatrix((total / 3319 + Math.PI), 0.8, 1, this.oc.width, this.oc.height, this.originX - this.radius * 0.8, this.originY - this.radius))
    ctx.drawImage(this.oc, 0, 0, this.oc.width, this.oc.height)
    ctx.restore()

    ctx.save()
    ctx.transform(...this.computeMatrix((total / 5087 + Math.PI * 1.5), 0.8, 1, this.oc.width, this.oc.height, this.originX - this.radius * 0.8, this.originY - this.radius))
    ctx.drawImage(this.oc, 0, 0, this.oc.width, this.oc.height)
    ctx.restore()

    ctx.fillStyle = 'hsl(235, 60%, 13%)'
    ctx.beginPath()
    ctx.arc(this.originX, this.originY, radius * 0.9, 0, 2 * Math.PI, true)
    ctx.closePath()
    ctx.fill()
    // this.octx.arc(this.radius, this.radius, radius, 0, 2 * Math.PI, true)
    // // this.octx.drawImage(img, 0, 0, this.oc.width, this.oc.height)
    // this.octx.fill()
    // this.octx.restore()
    // ctx.globalCompositeOperation = 'color-dodge'
    // let gradient = ctx.createRadialGradient(this.originX, this.originY, 0, this.originX, this.originY, radius)
    // gradient.addColorStop(0, '#ffff82')
    // gradient.addColorStop(0.5, '#ffce72')
    // gradient.addColorStop(1, 'rgba(250,76,43,0)')
    // ctx.fillStyle = gradient // `#${Math.floor(this.color).toString(16)}`
    // ctx.beginPath()
    // ctx.arc(this.originX, this.originY, radius, 0, 2 * Math.PI, true)
    // ctx.fill()
    // ctx.closePath()
    // ctx.fillStyle = '#00B24E'
    // console.log()
    // ctx.fill()
    ctx.restore()
  }
  computeMatrix(angle, scaleX = 1, scaleY = 1, width = this.oc.width, height = this.oc.height, offsetX, offsetY) {
    let sina = Math.sin(angle)
    let cosa = Math.cos(angle)
    let w = width * scaleX
    let h = height * scaleY
    return [
      scaleX * cosa, scaleX * -sina,
      scaleY * sina, scaleY * cosa,
      -(w * cosa + h * sina) * 0.5 + w * 0.5 + offsetX, (w * sina - h * cosa) * 0.5 + h * 0.5 + offsetY
      // - ( w * cosa + h * sina ) * 0.5, ( w * sina - h * cosa ) * 0.5
    ]
  }
}

class Vector {
  constructor(x, y) {
    this.x = x || 0
    this.y = y || 0
  }
  copy() {
    return new Vector(this.x, this.y)
  }
  //
  set(x, y) {
    if (typeof x === 'object') {
      this.x = x.x || 0
      this.y = x.y || 0
    } else {
      this.x = x || 0
      this.y = y || 0
    }
    return this
  }
  add(v) {
    this.x += v.x
    this.y += v.y
    return this
  }
  sub(v) {
    this.x -= v.x
    this.y -= v.y
    return this
  }
  scale(s) {
    this.x *= s
    this.y *= s
    return this
  }
  get length() {
    return Math.hypot(this.x, this.y)
  }
  get lengthSq() {
    return this.x * this.x + this.y * this.y
  }
  get angle() {
    return Math.atan2(this.y, this.x)
  }
  normalize() {
    let length = this.length
    // if (length === 0) throw new TypeError('你不能归一化一个零向量')
    if (length) {
      this.x /= length
      this.y /= length
    }
    return this
  }
  angleTo(v) {
    return Math.atan2(v.y - this.y, v.x - this.x)
  }
  distanceTo(v) {
    return Math.hypot(v.x - this.x, v.y - this.y)
  }
  distanceToSq(v) {
    let dx = v.x - this.x
    let dy = v.y - this.y
    return dx * dx + dy * dy
  }
  // 插值, t 0~1
  lerp(v, t) {
    this.x += (v.x - this.x) * t
    this.y += (v.y - this.y) * t
    return this
  }
  clone() {
    return new Vector(this.x, this.y)
  }
  toString() {
    return `(X:${this.x},y:${this.y})`
  }
}
// declare interface RangeValue {
//   value: number // 值的中位数
//   range: number // 值的偏差值
// }
// let ParticleDict = function() {

// }
class Particle extends Vector {
  constructor(ctx, source, target, size, speed, aspeed, opacity) {
    super(source.x, source.y)
    this.ctx = ctx
    this._source = source
    this._target = target
    this._size = size
    this._speed = speed
    this._aspeed = aspeed
    this._opacity = opacity
    this.reset()

    this.oc = document.createElement('canvas')
    this.oc.width = this.oc.height = this.size * 2
    this.octx = this.oc.getContext('2d')

    this.octx.globalAlpha = this.opacity
    this.octx.arc(this.size, this.size, this.size, 0, 2 * Math.PI, true)
    this.octx.fillStyle = Green
    this.octx.fill()

    document.body.appendChild(this.oc)
  }
  render(delt, total) {
    ctx.drawImage(this.oc, this.position.x, this.position.y, this.oc.width, this.oc.height)
  }
  reset() {
    if (!this.source) this.source = new Vector()
    this.source.x = this.createRandom(this._source.x)
    this.source.y = this.createRandom(this._source.y)
    if (!this.position) this.position = new Vector()
    this.position.x = this.source.x
    this.position.y = this.source.y
    if (!this.vector) this.vector = new Vector()
    this.vector.x = this.createRandom(this._target.x) - this.source.x
    this.vector.y = this.createRandom(this._target.y) - this.source.y
    this.speed = this.createRandom(this._speed)
    this.size = this.createRandom(this._size)
    this.opacity = this.size / this._size.full
    this.lifeCycle = this.vector.length / this.speed
  }
  createRandom(rangeValue) {
    if (typeof rangeValue.value === 'number') return rangeValue.value + (Math.random() - 0.5) * rangeValue.range
    else {
      return rangeValue.value.map((value, index) => {
        return value + (Math.random() - 0.5) * rangeValue.range[index]
      })
    }
  }
}
class ParticleSpawner {
  // 所有参数都是RangeValue
  constructor({sourceX, sourceY, targetX, targetY, size, speed, aspeed, opacity}) {
    this.sourceX = sourceX
    this.sourceY = sourceY
    this.targetX = targetX
    this.targetY = targetY
    this.size = size
    this.speed = speed
    this.opacity = opacity
    this.aspeed = aspeed

    this.particles = []
  }
  spawn(number) {
    for (let i = 0; i < number; i++) {
      this.particles.push(new Particle(ctx, { x: this.sourceX, y: this.sourceY }, { x: this.targetX, y: this.targetY }, this.size, this.speed, this.aspeed, this.opacity))
    }
  }
  update(delt, total) {
    for (let particle of this.particles) {
      particle.render(delt, total)
    }
  }
}

let bubbles = []
const BUBBLE_NUM = 1
for (let i = 0; i < BUBBLE_NUM; i++) {
  bubbles.push(new Bubble({
    color: Green,
    radius: 160,
    x: canvas.width / 2,
    y: 300,
    delay: Math.floor(Math.random() * Math.PI * 1000) / 1000
  }))
}

function startAnime() {
  let lasttime = 0
  let starttime = Date.now()
  let spawner = new ParticleSpawner({
    sourceX: {
      value: window.innerWidth / 2,
      range: 200
    },
    sourceY: {
      value: 700,
      range: 0
    },
    targetX: {
      value: window.innerWidth / 2,
      range: 100
    },
    targetY: {
      value: 700,
      range: 0
    },
    size: {
      value: 14,
      range: 12,
      full: 24
    },
    speed: {
      value: 5,
      range: 4
    },
    aspeed: {
      value: 0,
      range: 0
    }
    // opacity: {
    //   value: 0.7,
    //   range: 0.6
    // }
  })
  spawner.spawn(20)
  function anime() {
    let delt
    let now = Date.now()
    if (lasttime) delt = now - lasttime
    lasttime = now
    ctx.save()
    ctx.fillStyle = 'hsl(235, 60%, 13%)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    for (let bubble of bubbles) {
      bubble.render(delt, now - starttime)
    }
    spawner.update()
    stats.update()
    requestAnimationFrame(anime)
  }
  requestAnimationFrame(anime)
}
