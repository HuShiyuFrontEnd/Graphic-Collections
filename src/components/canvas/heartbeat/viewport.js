import d3 from './d3.js'

class SvgPainter {
  // parent 是一个 d3 selector 对象
  constructor(parent, x = 0, y = 0, width = 500, height = 300) {
    this.rendererArea = [x, y, width, height]
    this._parent = parent
    this._svg = parent.append('svg')
    this._svg.setSeriesAttrs({
      'version': '1.1',
      'xmlns': 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'preserveAspectRatio': 'xMidYMid meet',
      'width': '100%',
      'height': '100%',
      'x': x,
      'y': y,
      'viewBox': `0 0 ${width} ${height}`
    })
  }
}

let viewInstanceId = 0
class Viewport extends SvgPainter {
  constructor(parent, x, y, width, height) {
    super(parent, x, y, width, height)
    this._svg.setSeriesAttrs({
      'width': width,
      'height': height
    })
    this._background = this._svg
      .append('rect')
      .setSeriesAttrs({
        'x': 0,
        'y': 0,
        'width': width,
        'height': height,
        'fill': 'none'
      })
    this._instanceId = viewInstanceId++
    this._renderer = null
  }
  set renderer(renderer) {
    this._renderer = renderer
    this.setLoading()
  }
  setBackground(color) {
    this._background.attr('fill', color)
    return this
  }
  setLoading() {
    this._loading = this._svg.append('svg')
    let size = [40, 40]
    this._loading.setSeriesAttrs({
      'viewBox': '0 0 38 38',
      'width': size[0],
      'height': size[1],
      'x': (this.rendererArea[2] - size[0]) / 2,
      'y': (this.rendererArea[3] - size[1]) / 2
    })
    this._loading.style('transition', 'opacity 0.3s')
    this._loading.html(`
      <text x="19" y="17" font-family="Monaco" font-size="5px" style="letter-spacing:0.6" text-anchor="middle" dominant-baseline="middle" fill="white">加载中...
        <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/>
      </text>
      <circle cx="19" cy="19" r="17" fill="none" stroke="#ccc" stroke-dashoffset="55" stroke-dasharray="119.32" stroke-width="0.6027" stroke-miterlimit="10">
        <animate attributeType="CSS" attributeName="stroke-dashoffset" from="119.32" to="55" dur="1s" />
        <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 19 19"
        to="360 19 19"
        dur="1.6s"
        repeatCount="indefinite" />
    </circle>
    <circle cx="19" cy="19" r="15" fill="none" stroke="#ddd" stroke-dashoffset="55" stroke-dasharray="119.32" stroke-width="0.2027" stroke-miterlimit="10">
        <animate attributeType="CSS" attributeName="stroke-dashoffset" from="119.32" to="55" dur="1s" />
        <animateTransform
        attributeName="transform"
        type="rotate"
        from="120 19 19"
        to="480 19 19"
        dur="1.2s"
        repeatCount="indefinite" />
      </circle>
    `)
  }
  endLoading() {
    this._loading.style('opacity', 0)
    setTimeout(() => {
      this._loading.style('display', 'none')
    }, 400)
  }
}

export default class ViewportManager extends SvgPainter {
  constructor({ selector, width = 500, height = 300 }) {
    super(d3.select(selector), 0, 0, width, height)
    this.viewports = []
  }
  plan(x, y, width, height) {
    let viewport = new Viewport(this._svg, x, y, width, height)
    this.viewports.push(viewport)
    return viewport
  }
  setBackground(color) {
    this._svg.style('background-color', color)
    return this
  }
}
