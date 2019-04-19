import d3 from '../heartbeat/d3.js'

console.log(d3)

let svg = d3
  .select('#container')
  .append('svg')
  .setSeriesAttrs({
    'version': '1.1',
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'preserveAspectRatio': 'xMidYMid meet',
    'width': '100%',
    'height': '100%',
    'x': 0,
    'y': 0,
    'viewBox': `0 0 ${window.innerWidth} ${window.innerHeight}`
  })
  .style('background', '#0D1135')

let defs = svg.append('defs')
defs.append('filter')
  .attr('id', 'viscous')
  .html(`
    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
    <feColorMatrix in="blur" mode="matrix" values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 13 -6" result="goo" />
    <feComposite in="SourceGraphic" in2="goo" operator="in" />
  `)

let bubbleContainer = svg.append('g')
  .attr('id', 'bubble-container')

const ellipseRadius = 150
const cx = window.innerWidth / 2
const cy = window.innerHeight / 2 - 100
let bubbles = bubbleContainer.selectAll('.bubble')
  .data([[709, 0], [709, 90], [2319, 150], [2087, 230], [1673, 290]])
  .enter()
  .append('ellipse')
  .setSeriesAttrs({
    class: 'bubble',
    cx,
    cy,
    rx: ellipseRadius * 0.8,
    ry: ellipseRadius,
    fill: 'rgba(5, 213, 89, 0.4)',
    transform(d, i, s) { // data index selectors
      return `rotate(${d[1]} ${cx} ${cy})`
    }
  })
bubbleContainer.append('circle')
  .setSeriesAttrs({
    cx,
    cy,
    r: ellipseRadius * 0.9,
    fill: '#0D1135'
  })

bubbles.append('animateTransform')
  .setSeriesAttrs({
    attributeName: 'transform',
    type: 'rotate',
    from(d, i, s) {
      return `${d[1]} ${cx} ${cy}`
    },
    to(d, i, s) {
      return `${d[1] + 360} ${cx} ${cy}`
    },
    dur(d, i, s) {
      return `${7000 / d[0]}s`
    },
    repeatCount: 'indefinite'
  })

let normalSpawner = d3.randomNormal(0, 1)
// 大于-1小于1
let normalSpawnerRange = function() {
  return Math.max(Math.min(normalSpawner(), 1), -1)
}
let sizes = []
for (let i = 0; i < 40; i++) sizes.push([8 + normalSpawnerRange() * 3, cx + normalSpawnerRange() * 40, 1.1 - 1.1 * normalSpawnerRange(), 2.2 - 0.6 * normalSpawnerRange()])
let particlesContainer = bubbleContainer.append('g')
  .setSeriesAttrs({
    id: 'particle-container',
    filter: 'url(#viscous)'
  })
let particles = particlesContainer.selectAll('.particles')
  .data(sizes)
  .enter()
  .append('circle')
  .setSeriesAttrs({
    class: 'particles',
    cx(d) {
      return d[1]
    },
    cy: window.innerHeight + 50,
    r(d) {
      return d[0]
    },
    fill(d) {
      let lerp = d[0] / 14
      return `rgba(${5 * lerp}, ${129 + 84 * lerp}, ${57 + 32 * lerp}, 1)`
    }
  })
particles.append('animateTransform')
  .setSeriesAttrs({
    attributeName: 'transform',
    type: 'translate',
    from(d, i, s) {
      return `0 0`
    },
    to(d, i, s) {
      return `${(d[1] - cx) * -0.2} -440`
    },
    begin(d) {
      return `${d[2]}s`
    },
    dur(d, i, s) {
      return `${d[3]}s`
    },
    repeatCount: 'indefinite'
  })

const scale = 0.5
const offset = [cx - 80, cy - 30]
const nodeType = ['M', 'L', 'L', 'L', 'L', 'L']
let points = [[50, 0], [0, 73.2], [50, 73.2], [50, 126.4], [100, 53.2], [50, 53.2]]
points = points.map((value, index) => {
  return `${nodeType[index]}${[value[0] * scale + offset[0], value[1] * scale + offset[1]].join(',')}`
})
let thunder = bubbleContainer.append('path')
  .setSeriesAttrs({
    d: points.join(' ') + ' Z',
    fill: '#fff'
  })

let text = bubbleContainer.append('text')
  .html('0%')
  .setSeriesAttrs({
    fill: '#fff',
    x: cx + 0,
    y: cy + 15,
    'text-anchor': 'start'
  })
  .style('font-size', '40px')

let count = 0
let interval = setInterval(() => {
  count++
  text.html(`${count}%`)
  if (count > 99) clearInterval(interval)
}, 100)
