import * as d3 from 'd3'

d3.selection.prototype.setSeriesAttrs = function(attrs) {
  for (let key in attrs) {
    this.attr(key, attrs[key])
  }
  return this
}

export default d3

// 柱图
// let data = [20, 30, 40, 50, 20, 25]
// let linear = d3.scaleLinear()
//   .domain([0, d3.max(data)])
//   .range([0, 250])
// let rectHeight = 10
// let rectGap = 2
// let svg = d3.select('#container')
//   .append('svg')
//   .setSeriesAttrs({
//     width: '100%',
//     height: '100%',
//     viewBox: '0 0 1000 800'
//   })
// svg.selectAll('rect')
//   .data(data)
//   .enter()
//   .append('rect')
//   .setSeriesAttrs({
//     x: 20,
//     y(d, i) {
//       return i * rectHeight + i * rectGap
//     },
//     width(d, i) {
//       return linear(d)
//     },
//     height: rectHeight
//   })
//   .attr('fill', 'steelblue')
