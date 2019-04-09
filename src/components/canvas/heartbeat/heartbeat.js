// import d3 from './d3.js'
import Renderer from './renderer.js'
import { createLinearGradient, createFilterForHeartBeat, Tick } from './utils.js'
import { DefaultLoadingManager } from '../../threejs/lib/three.js'

Tick.openStats()

let hbInstanceId = 0
export default class HeartBeat extends Renderer {
  constructor(painter, x, y, width, height) {
    super(painter, x, y, width, height)
    this._instanceId = hbInstanceId++
    this._data = []
    this._prepareNum = 3
    this._loading = true
    this.setStyle()
    painter.renderer = this
    this._tick = null
    this._ticking = false

    this._timecounter = 0
    this._rectMoveCount = 0

    // this.addClipPath()
  }
  // 设置准备数据的量
  // 数据必须达到一个量以后才开始，之前播放一个等待动画（一方面是为了绘图的必要，一个点之后的曲线的形状，取决于它和之后两个点的位置，所以必须最少进来三个点才能开始绘图，另外，预留一些点，当数据不稳定时，动画上看到的至少是动态继续的数据（只是稍微有点延后））
  prepare(number) {
    this._prepareNum = number || 3
    return this
  }
  // 相比prepare后用incrementData一个个地接收增量，初始initial具备更多的优势，比如开头动画更加容易做出效果，一出来即是一个完整的线
  initial({ startTime, data }) {
    this._data = data.map((value) => {
      return {
        x: this.scalerX(value.x),
        y: this.scalerY(value.y)
      }
    })
    this._timecounter = startTime
    this.updatePoints()
    this.endloading()
    this._tick = new Tick(`heartbeat${this._instanceId}`, this.renderer.bind(this))
    this._ticking = true
    return this
  }
  // 数据增量更新
  incrementData(data, interval) {
    this._timecounter += interval
    // console.log(this._timecounter)
    this._data.push({ x: this.scalerX(this._timecounter), y: this.scalerY(data) })
    // console.log(this.timecounter)
    if (!this._path) throw new TypeError('heartbeat: 不存在输出渲染的目标')
    // this.updatePoints()
    // if (this._data.length > this._prepareNum) {
    //   this.updatePoints()
    // } else this.loading()
    return this
  }
  // 数据全量更新
  freshData() {}
  // 渲染
  renderer(delt, total) {
    this._rectMoveCount += this.scalerX(delt) / 1000
    // console.log(this._rectMoveCount)
    this.updatePoints()
    // this._painter.attr('x', this.scalerX(this._rectMoveCount / 1000))
    // this._clipRect.attr('width', Math.min(this.rendererArea.width, this.scalerX(total / 1000)))
  }
  // 更新点的信息
  updatePoints() {
    // this._path.attr('x', -(this._outRenderDataLength - this._densityX) * (this._rangeX[1] - this._rangeX[0]) / this._densityX)
    let path = []
    if (this._lineType === 'curve') {
      let datas = this._data
      for (let i = 0, length = datas.length - this._prepareNum; i < length; i++) {
        if (i === 0) path.push(`M${datas[i].x - this._rectMoveCount} ${datas[i].y}`)
        let cp = this.getControlPoint(datas, i)
        path.push(`C${cp.pA.x - this._rectMoveCount},${cp.pA.y} ${cp.pB.x - this._rectMoveCount},${cp.pB.y} ${datas[i + 1].x - this._rectMoveCount},${datas[i + 1].y}`)
        if (datas[i].x - this._rectMoveCount > this.rendererArea.width) break
      }
      if (datas[1] && (datas[1].x - this._rectMoveCount) < 0) this._data.shift()
    } else {
      path = this._data.map((value, index) => {
        if (index === 0) return `M${this.scalerX(index)},${value}`
        else return `L${this.scalerX(index)},${value}`
      })
    }
    this._path.attr('d', path.join(' '))
    return this
  }
  getControlPoint(ps, i, a, b) {
    if (!a || !b) {
      a = 0.25
      b = 0.25
    }
    var pAx, pAy, pBx, pBy
    // 处理两种极端情形
    if (i < 1) {
      pAx = ps[0].x + (ps[1].x - ps[0].x) * a
      pAy = ps[0].y + (ps[1].y - ps[0].y) * a
    } else {
      pAx = ps[i].x + (ps[i + 1].x - ps[i - 1].x) * a
      pAy = ps[i].y + (ps[i + 1].y - ps[i - 1].y) * a
    }
    if (i > ps.length - 3) {
      var last = ps.length - 1
      pBx = ps[last].x - (ps[last].x - ps[last - 1].x) * b
      pBy = ps[last].y - (ps[last].y - ps[last - 1].y) * b
    } else {
      pBx = ps[i + 1].x - (ps[i + 2].x - ps[i].x) * b
      pBy = ps[i + 1].y - (ps[i + 2].y - ps[i].y) * b
    }
    return {
      pA: {
        x: pAx,
        y: pAy
      },
      pB: {
        x: pBx,
        y: pBy
      }
    }
  }
  // 枚举值type: polyline / curve / step
  setType(type) {
    this._lineType = type
    return this
  }
  // 设置一些样式
  setStyle() {
    this._path.style('fill', 'none')
    this._path.style('stroke', '#fff')
    this._path.style('stroke-width', 2)
  }
  // 添加一个线性渐变
  setLinearColor(direct, colorArray) {
    let linearId = ''
    if (!colorArray) linearId = 'direct'
    else linearId = createLinearGradient(direct, colorArray)(this._defs)
    this._path.style('stroke', `url(#${linearId})`)
    return this
  }
  // 添加外发光
  addOutsideLight({ color, blur, offset, spread }) {
    let filterId = createFilterForHeartBeat(this._defs, { color, blur, offset, spread })
    this._path.style('filter', `url(#${filterId})`)
    return this
  }
  // 增加一个剪辑区域
  addClipPath() {
    let clipPath = this._defs.append('clipPath')
    clipPath.attr('id', `startClip${this._instanceId}`)
    this._clipRect = clipPath
      .append('rect')
      .setSeriesAttrs({
        'x': 0,
        'y': 0,
        'stroke': 'none',
        'fill': '#fff',
        'width': 0,
        'height': this.rendererArea.height
      })
    this._path.attr('clip-path', `url(#startClip${this._instanceId})`)
  }
}
