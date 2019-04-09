// import d3 from './d3.js'

// direct 用一个0~12 （0和12一样）的数字代表方向（如同一个时钟表盘的指针方向）,举例来讲，向右就是3向上是12/0
let linearGradientInstanceId = 0
const SPECIAL_DIRECT = {
  0: [50, 100, 50, 0],
  3: [0, 50, 100, 50],
  6: [50, 0, 50, 100],
  9: [100, 50, 0, 50],
  12: [50, 100, 50, 0]
}

function normalize(num) {
  if (num === 0) return 0
  return Math.abs(num) / num
}

export function createLinearGradient(direct, colorArray) {
  if (typeof direct !== 'number' || direct > 12 || direct < 0) throw TypeError('createLinearGradient的第一个参数必须是一个介于0到12的数字')
  // 请接一个d3 selector 对象，选中的内容是一个defs
  return function(defs) {
    let linear = defs.append('linearGradient')
    let id = `linearGradient_${linearGradientInstanceId++}`
    let directParam = [0, 0, 0, 0]
    if ([0, 3, 6, 9, 12].includes(direct)) {
      directParam = SPECIAL_DIRECT[direct]
    } else if (direct < 1.5 || direct > 10.5 || (direct > 4.5 && direct < 7.5)) {
      directParam[0] = Math.round(50 - Math.tan(direct * Math.PI / 6) * 50)
      directParam[1] = Math.round(50 + normalize(Math.cos(direct * Math.PI / 6)) * 50)
      directParam[2] = Math.round(50 + Math.tan(direct * Math.PI / 6) * 50)
      directParam[3] = Math.round(50 - normalize(Math.cos(direct * Math.PI / 6)) * 50)
    } else {
      directParam[0] = Math.round(50 - normalize(Math.sin(direct * Math.PI / 6)) * 50)
      directParam[1] = Math.round(50 + 50 / Math.tan(direct * Math.PI / 6))
      directParam[2] = Math.round(50 + normalize(Math.sin(direct * Math.PI / 6)) * 50)
      directParam[3] = Math.round(50 - 50 / Math.tan(direct * Math.PI / 6))
    }
    linear.setSeriesAttrs({
      x1: `${directParam[0]}%`,
      y1: `${directParam[1]}%`,
      x2: `${directParam[2]}%`,
      y2: `${directParam[3]}%`,
      id: id
    })
    linear.selectAll('stop')
      .data(colorArray)
      .enter()
      .append('stop')
      .setSeriesAttrs({
        offset(d) {
          return d.offset
        },
        'stop-color'(d) {
          return d.colorStop
        }
      })
    return id
  }
}

let outsideShadowInstanceId = 0
// 这个滤镜需要完成动态渐变、外发光效果
export function createFilterForHeartBeat(defs, {
  color = '#fff',
  offset = [0, 0],
  blur = 4,
  spread = 3
}) {
  let shadow = defs.append('filter')
  let id = `outsideShadow_${outsideShadowInstanceId++}`
  shadow.attr('id', id)
  shadow.html(`
    <feGaussianBlur stdDeviation="${blur}" result="blur"/>
    <feMorphology in="blur" operator="dilate" radius="${spread}" result="extendblur" />
    <feOffset dx="${offset[0]}" dy="${offset[1]}" in="extendblur" result="offsetblur"/>
    <feFlood flood-color="${color}" result="color"/>
    <feComposite in="color" in2="offsetblur" operator="in" result="colorblur" />
    <feComposite in="colorblur" in2="SourceAlpha" operator="out" result="outShadow" />
    <feMerge>
      <feMergeNode in="SourceGraphic" />
      <feMergeNode in="outShadow" />
    </feMerge>`)
  return id
}

export { default as Tick } from './update/update.js'
