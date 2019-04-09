// import datGUI from '../../threejs/lib/dat.gui.js'
import DI from '../../common/dependenceInject'

DI.insertDOM(`
  <div style="position:fixed;left:50%;top:20px;font-size:16px;color:rgba(255, 255, 255, 0.5);transform: translate(-50%, 0)">
    在地址后添加#+数字，来控制粒子的数量
  </div>
`)

// https://codepen.io/akm2/pen/rHIsa

window.requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60)
        }
})()

let MathVector = {
  // Vector Math
  add (a, b) {
    return new Vector(a.x + b.x, a.y + b.y)
  },
  sub (a, b) {
    return new Vector(a.x - b.x, a.y - b.y)
  },
  scale (v, s) {
    return v.clone().scale(s)
  },
  random () {
    return new Vector(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    )
  }
}

// Vector
// 点和向量是同一种数值的不同表现形式
class Vector {
  constructor (x, y) {
    this.x = x || 0
    this.y = y || 0
  }
  copy () {
    return new Vector(this.x, this.y)
  }
  //
  set (x, y) {
    if (typeof x === 'object') {
      this.x = x.x || 0
      this.y = x.y || 0
    } else {
      this.x = x || 0
      this.y = y || 0
    }
    return this
  }
  add (v) {
    this.x += v.x
    this.y += v.y
    return this
  }
  sub (v) {
    this.x -= v.x
    this.y -= v.y
    return this
  }
  scale (s) {
    this.x *= s
    this.y *= s
    return this
  }
  get length () {
    return Math.hypot(this.x, this.y)
  }
  get lengthSq () {
    return this.x * this.x + this.y * this.y
  }
  get angle () {
    return Math.atan2(this.y, this.x)
  }
  normalize () {
    let length = this.length
    // if (length === 0) throw new TypeError('你不能归一化一个零向量')
    if (length) {
      this.x /= length
      this.y /= length
    }
    return this
  }
  angleTo (v) {
    return Math.atan2(v.y - this.y, v.x - this.x)
  }
  distanceTo (v) {
    return Math.hypot(v.x - this.x, v.y - this.y)
  }
  distanceToSq (v) {
    let dx = v.x - this.x
    let dy = v.y - this.y
    return dx * dx + dy * dy
  }
  // 插值, t 0~1
  lerp (v, t) {
    this.x += (v.x - this.x) * t
    this.y += (v.y - this.y) * t
    return this
  }
  clone () {
    return new Vector(this.x, this.y)
  }
  toString () {
    return `(X:${this.x},y:${this.y})`
  }
}

class GravityPoint extends Vector {
  constructor (x, y, radius, targets) {
    super(x, y)
    this.radius = radius
    this.currentRadius = radius * 0.5

    this._targets = {
      particles: targets.particles || [],
      gravities: targets.gravities || []
    }
    this._speed = new Vector()

    this.RADIUS_LIMIT = 65
    this.interferenceToPoint = true

    this.gravity = 0.05
    this.isMouseOver = false
    this.dragging = false
    this.destroyed = false
    this._easeRadius = 0
    this._dragDistance = null // 拖拽点和中心点的初始距离
    this._collapsing = false
  }
  hitTest (p) {
    return this.distanceTo(p) < this.radius
  }
  startDrag (dragStartPoint) {
    this._dragDistance = MathVector.sub(dragStartPoint, this)
    this.dragging = true
  }
  drag (dragToPoint) {
    this.x = dragToPoint.x - this._dragDistance.x
    this.y = dragToPoint.y - this._dragDistance.y
  }
  endDrag () {
    this._dragDistance = null
    this.dragging = false
  }
  addSpeed (d) {
    this._speed = this._speed.add(d)
  }
  collapse (e) {
    this.currentRadius *= 1.75
    this._collapsing = true
  }
  render (ctx) {
    if (this.destroyed) return

    let particles = this._targets.particles
    let i
    let len

    for (i = 0, len = particles.length; i < len; i++) {
      particles[i].addSpeed(MathVector.sub(this, particles[i]).normalize().scale(this.gravity))
    }

    this._easeRadius = (this._easeRadius + (this.radius - this.currentRadius) * 0.07) * 0.95
    this.currentRadius += this._easeRadius
    if (this.currentRadius < 0) this.currentRadius = 0

    if (this._collapsing) {
      this.radius *= 0.75
      if (this.currentRadius < 1) this.destroyed = true
      this._draw(ctx)
      return
    }

    let gravities = this._targets.gravities
    let g
    let absorp
    let area = this.radius * this.radius * Math.PI
    let garea

    for (i = 0, len = gravities.length; i < len; i++) {
      g = gravities[i]

      if (g === this || g.destroyed) continue

      if (
        (this.currentRadius >= g.radius || this.dragging) &&
                this.distanceTo(g) < (this.currentRadius + g.radius) * 0.85
      ) {
        g.destroyed = true
        this.gravity += g.gravity

        absorp = MathVector.sub(g, this).scale(g.radius / this.radius * 0.5)
        this.addSpeed(absorp)

        garea = g.radius * g.radius * Math.PI
        this.currentRadius = Math.sqrt((area + garea * 3) / Math.PI)
        this.radius = Math.sqrt((area + garea) / Math.PI)
      }

      g.addSpeed(MathVector.sub(this, g).normalize().scale(this.gravity))
    }

    if (this.interferenceToPoint && !this.dragging) { this.add(this._speed) }

    this._speed = new Vector()

    if (this.currentRadius > this.RADIUS_LIMIT) this.collapse()

    this._draw(ctx)
  }
  _draw (ctx) {
    let grd
    let r

    ctx.save()

    grd = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius * 5)
    grd.addColorStop(0, 'rgba(0, 0, 0, 0.1)')
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * 5, 0, Math.PI * 2, false)
    ctx.fillStyle = grd
    ctx.fill()

    r = Math.random() * this.currentRadius * 0.7 + this.currentRadius * 0.3
    grd = ctx.createRadialGradient(this.x, this.y, r, this.x, this.y, this.currentRadius)
    grd.addColorStop(0, 'rgba(0, 0, 0, 1)')
    grd.addColorStop(1, Math.random() < 0.2 ? 'rgba(255, 196, 0, 0.15)' : 'rgba(103, 181, 191, 0.75)')
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2, false)
    ctx.fillStyle = grd
    ctx.fill()
    ctx.restore()
  }
}

class Particle extends Vector {
  constructor (x, y, radius) {
    super(x, y)

    this._latest = new Vector()
    this._speed = new Vector()
  }
  addSpeed (d) {
    this._speed.add(d)
  }
  update () {
    if (this._speed.length > 12) this._speed.normalize().scale(12)

    this._latest.set(this)
    this.add(this._speed)
  }
}

class Main {
  // Configs
  BACKGROUND_COLOR = 'rgba(11, 51, 56, 1)'
  PARTICLE_RADIUS = 1
  G_POINT_RADIUS = 10
  G_POINT_RADIUS_LIMITS = 65
  // Vars
  canvas
  context
  bufferCvs
  bufferCtx
  screenWidth
  screenHeight
  mouse = new Vector()
  gravities = []
  particles = []
  grad
  gui
  control
  constructor (containerDom) {
    let childCanvas = document.createElement('canvas')
    containerDom.appendChild(childCanvas)
    this.canvas = childCanvas
    this.bufferCvs = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.bufferCtx = this.bufferCvs.getContext('2d')

    this.resize(null)
    window.addEventListener('resize', this.resize.bind(this), false)

    this.canvas.addEventListener('mousemove', this.mouseMove.bind(this), false)
    this.canvas.addEventListener('mousedown', this.mouseDown.bind(this), false)
    this.canvas.addEventListener('mouseup', this.mouseUp.bind(this), false)
    this.canvas.addEventListener('dblclick', this.doubleClick.bind(this), false)
  }
  // 事件
  resize () {
    this.screenWidth = this.canvas.width = window.innerWidth
    this.screenHeight = this.canvas.height = window.innerHeight
    this.bufferCvs.width = this.screenWidth
    this.bufferCvs.height = this.screenHeight

    let cx = this.canvas.width * 0.5
    let cy = this.canvas.height * 0.5

    this.grad = this.context.createRadialGradient(cx, cy, 0, cx, cy, Math.sqrt(cx * cx + cy * cy))
    this.grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
    this.grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)')
  }
  mouseMove (e) {
    this.mouse.set(e.clientX, e.clientY)

    let i
    let g
    let hit = false
    for (i = this.gravities.length - 1; i >= 0; i--) {
      g = this.gravities[i]
      if ((!hit && g.hitTest(this.mouse)) || g.dragging) {
        g.isMouseOver = hit = true
        break
      } else {
        g.isMouseOver = false
      }
    }

    this.canvas.style.cursor = hit ? 'pointer' : 'default'
  }
  mouseDown (e) {
    for (var i = this.gravities.length - 1; i >= 0; i--) {
      if (this.gravities[i].isMouseOver) {
        this.gravities[i].startDrag(this.mouse)
        return
      }
    }
    this.gravities.push(new GravityPoint(e.clientX, e.clientY, this.G_POINT_RADIUS, {
      particles: this.particles,
      gravities: this.gravities
    }))
  }
  mouseUp () {
    for (var i = 0, len = this.gravities.length; i < len; i++) {
      if (this.gravities[i].dragging) {
        this.gravities[i].endDrag()
        break
      }
    }
  }
  doubleClick () {
    for (var i = this.gravities.length - 1; i >= 0; i--) {
      if (this.gravities[i].isMouseOver) {
        this.gravities[i].collapse()
        break
      }
    }
  }
  addParticle (num) {
    var i, p
    for (i = 0; i < num; i++) {
      p = new Particle(
        Math.floor(Math.random() * this.screenWidth - this.PARTICLE_RADIUS * 2) + 1 + this.PARTICLE_RADIUS,
        Math.floor(Math.random() * this.screenHeight - this.PARTICLE_RADIUS * 2) + 1 + this.PARTICLE_RADIUS,
        this.PARTICLE_RADIUS
      )
      p.addSpeed(MathVector.random())
      this.particles.push(p)
    }
  }
  removeParticle (num) {
    if (this.particles.length < num) num = this.particles.length
    for (var i = 0; i < num; i++) {
      this.particles.pop()
    }
  }
  update () {
    let i
    let len
    let g
    let p

    this.context.save()
    this.context.fillStyle = this.BACKGROUND_COLOR
    this.context.fillRect(0, 0, this.screenWidth, this.screenHeight)
    this.context.fillStyle = this.grad
    this.context.fillRect(0, 0, this.screenWidth, this.screenHeight)
    this.context.restore()

    for (i = 0, len = this.gravities.length; i < len; i++) {
      g = this.gravities[i]
      g.render(this.context)
      if (g.dragging) g.drag(this.mouse)
      if (g.destroyed) {
        this.gravities.splice(i, 1)
        len--
        i--
      }
    }

    this.bufferCtx.save()
    this.bufferCtx.globalCompositeOperation = 'destination-out'
    this.bufferCtx.globalAlpha = 0.35
    this.bufferCtx.fillRect(0, 0, this.screenWidth, this.screenHeight)
    this.bufferCtx.restore()

    len = this.particles.length
    this.bufferCtx.save()
    this.bufferCtx.fillStyle = this.bufferCtx.strokeStyle = '#fff'
    this.bufferCtx.lineCap = this.bufferCtx.lineJoin = 'round'
    this.bufferCtx.lineWidth = this.PARTICLE_RADIUS * 2
    this.bufferCtx.beginPath()
    for (i = 0; i < len; i++) {
      p = this.particles[i]
      p.update()
      this.bufferCtx.moveTo(p.x, p.y)
      this.bufferCtx.lineTo(p._latest.x, p._latest.y)
    }
    this.bufferCtx.stroke()
    this.bufferCtx.beginPath()
    for (i = 0; i < len; i++) {
      p = this.particles[i]
      this.bufferCtx.moveTo(p.x, p.y)
      this.bufferCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false)
    }
    this.bufferCtx.fill()
    this.bufferCtx.restore()

    this.context.drawImage(this.bufferCvs, 0, 0)

    requestAnimationFrame(this.update.bind(this))
  }
}

let main = new Main(document.getElementById('container'))
let number = (location.href.split('#')[1] - 0) || 50
main.addParticle(number)
main.update()
