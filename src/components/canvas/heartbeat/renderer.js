import d3 from './d3.js'

export default class Renderer {
  constructor(painter, x, y, width, height) {
    painter._renderer = this
    this._container = painter
    this._painter = painter._svg
    this.rendererArea = { x, y, width, height }
    this._defs = this._painter.append('defs')
    this._path = this._painter.append('path')
  }
  // 这个应该是一个transition的效果
  setRange(rangeX, rangeY) {
    this._hasRange = true
    this._rangeX = rangeX
    this._rangeY = rangeY
    if (this._hasDensity) this.setScaler()
    return this
  }
  setDensity(dx, dy) {
    this._hasDensity = true
    this._densityX = dx
    this._densityY = dy
    if (this._hasRange) this.setScaler()
    return this
  }
  setScaler() {
    this.scalerX = d3.scaleLinear()
      .domain([0, this._densityX])
      .rangeRound(this._rangeX)
    this.scalerY = d3.scaleLinear()
      .domain([0, this._densityY])
      .rangeRound(this._rangeY)
  }
  renderer() {}
  endloading() {
    this._loading = false
    this._container.endLoading()
    return this
  }
}
