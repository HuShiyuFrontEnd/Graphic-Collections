// 生成一个正态分布随机数 公式见 Box–Muller算法 https://blog.csdn.net/fengying2016/article/details/80601991
export function createNormalRandom(central, standard, isInt) {
  let a = Math.random()
  let b = Math.random()
  let value = Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b)
  value = value * standard + central
  if (isInt) value = Math.round(value)
  return value
}

export function createRandom(start, end, isInt) {
  let value = Math.random() * (end - start) + start
  if (isInt) value = Math.round(value)
  return value
}

/** **** 正态分布单元测试
  // 生成正态分布随机数据
  let vdData = {}
  for (let i = 0; i < 3000; i++) {
    let data = VD.random(50, 5, true)
    if (!vdData[data]) vdData[data] = 1
    else vdData[data]++
  }

  // 用ui测试数据是否为正态分布
  for (let key in vdData) {
    let div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.left = '0px'
    div.style.height = '2px'
    div.style.width = `${2 * vdData[key]}px`
    div.style.top = `${2 * (key - 0)}px`
    div.style.background = '#000'
    document.body.appendChild(div)
  }
*******/

let ReceiverInstanceId = 0
class Receiver {
  constructor() {
    this._instanceId = ReceiverInstanceId++
    this._listenId = -1
  }
  listen(dataSpawn) {
    dataSpawn.listen(this)
  }
  receive(cb, target) {
    this._cb = cb
    this._target = target
  }
}

/** **** 参数
  // 这三个值将模拟数据回传时不太稳定的状态，即时快时慢
  frequence: 30,
  frequenceFloat: 5,
  frequenceFloatType: 'random', // random 普通地生成 30 - 5 ~ 30 + 5 范围的随机数 normal 生成以30为中心，30 - 5 ~ 30 + 5范围内包含95%以上概率的正态分布随机数
  frequenceNoiseRate: 0.01, // 数据不稳定的概率
  frequenceNoiserange: [2, 10], // 数据不稳定时的数值范围
  average: 50, // 传回数据的平均线
  max: 100, // 最大数据范围
  min: 0, // 最小数据范围
  derivativeChangeRate: , // 导数变化量
  stableRate: 0.8 // 导数稳定率,越高数据的变化越趋于稳定
*******/
export class DataSpawn {
  constructor({
    frequence = 30,
    frequenceFloat = 5,
    frequenceFloatType = 'normal',
    frequenceNoiseRate = 0.05,
    frequenceNoiseRange = [2, 10],
    dataType = 'random',
    dataExt = {
      start: 0,
      end: 100,
      isInt: true
    }
  } = {}) {
    this._timeout = null
    this._listeners = []
    this._lastTime = 0
    this._frequence = frequence
    this._frequenceFloat = frequenceFloat
    this._frequenceFloatType = frequenceFloatType
    this._frequenceNoiseRate = frequenceNoiseRate
    this._frequenceNoiseRange = frequenceNoiseRange
    this._dataType = dataType
    this._dataExt = dataExt
    this._playingState = 'play'
  }
  // 不再使用listen直接绑定，转而使用接收器来接收
  listen(receiver = new Receiver()) {
    this._listeners.push(receiver)
    receiver._listenId = this._listeners.length - 1
    return receiver
  }
  // 和Receiver的cutoff是一组等价方法
  remove(listenId) {
    if (typeof listenId === 'object') listenId = listenId._listenId
    if (listenId === -1 || listenId === undefined) {
      console.error('错误的remove对象', listenId)
      return
    }
    this._listeners.splice(listenId, 1)
  }
  start() {
    let frequence
    if (this._playingState === 'play') {
      this.broadcast(this.createData())
      if (this._frequenceFloatType === 'normal') {
        frequence = createNormalRandom(this._frequence, this._frequenceFloat, false)
      } else if (this._frequenceFloatType === 'random') {
        frequence = createRandom(this._frequence - this._frequenceFloat, this._frequence + this._frequenceFloat, false)
      }
      if (Math.random() < this._frequenceNoiseRate) {
        frequence = createRandom(this._frequenceNoiseRange[0], this._frequenceNoiseRange[1], false)
      }
    } else frequence = 1
    this._lastTime = frequence === 0 ? 0 : 1000 / frequence
    this._timeout = setTimeout(() => {
      this.start()
    }, this._lastTime)
  }
  stop() {
    if (this._timeout) clearTimeout(this._timeout)
  }
  pause() {
    this._playingState = 'pause'
  }
  resume() {
    this._playingState = 'play'
  }
  createData() {
    switch (this._dataType) {
      case 'random':
        return createRandom(this._dataExt.start, this._dataExt.end, this._dataExt.isInt)
    }
  }
  broadcast(data) {
    // console.log(this._lastTime)
    for (let receiver of this._listeners) {
      receiver._cb.call(receiver._target || window, data, this._lastTime)
    }
  }
}
