import { DataSpawn, createRandom } from '../lib/virtualData'
import ViewportManager from './viewport.js'
import HeartBeat from './heartbeat.js'

let view = new ViewportManager({
  selector: '#container',
  width: '1000',
  height: '800'
}).setBackground('#333333')
let heartbeat1 = view
  .plan(0, 0, 250, 50)
  // .setBackground('#000')
// let heartbeat2 = view.plan(250, 0, 250, 100).setBackground('#ACA67F')
// let heartbeat3 = view.plan(500, 0, 250, 100).setBackground('#5C6F4C')
// let heartbeat4 = view.plan(750, 0, 250, 100).setBackground('#5D4B7F')
let heartBeatRenderer1 = new HeartBeat(heartbeat1, 0, 0, 250, 50)
// 我们取到了累计6个点才开始动画,数据接入时，可以先给进好几条数据
// 假设数据隔了很久都没有到达，即我们预留的数据量的动画都跑完了，依然没有新数据进来，我们将停住动画，转而增加一种新的动画，一个光点从头跑到尾，然后显示代表数据正在获取中的图标
heartBeatRenderer1
  .prepare(3)
  .setRange([0, 250], [5, 45])
  .setDensity(25, 100)
  .setType('curve')
  .setLinearColor(3, [
    { offset: '0%', colorStop: 'rgba(172, 131, 98, 0.4)' },
    { offset: '20%', colorStop: 'rgba(172, 131, 98, 1)' },
    { offset: '60%', colorStop: 'rgba(172, 131, 98, 1)' },
    { offset: '80%', colorStop: 'rgba(255, 255, 255, 1)' },
    { offset: '100%', colorStop: 'rgba(255, 255, 255, 1)' }
  ])
  .addOutsideLight({
    color: 'rgba(245, 213, 188, 0.4)',
    blur: 1,
    spread: 1
  })
setTimeout(() => {
  heartBeatRenderer1.initial({
    startTime: 36,
    data: [
      { x: 0, y: createRandom(0, 100, true) },
      { x: createRandom(3, 5), y: createRandom(0, 100, true) },
      { x: createRandom(7, 8), y: createRandom(0, 100, true) },
      { x: createRandom(11, 13), y: createRandom(0, 100, true) },
      { x: createRandom(15, 17), y: createRandom(0, 100, true) },
      { x: createRandom(19, 21), y: createRandom(0, 100, true) },
      { x: createRandom(23, 25), y: createRandom(0, 100, true) },
      { x: createRandom(27, 29), y: createRandom(0, 100, true) },
      { x: createRandom(31, 33), y: createRandom(0, 100, true) },
      { x: createRandom(35, 37), y: createRandom(0, 100, true) }
    ]
  })
  ds.start()
}, 1500)

let ds = new DataSpawn({
  frequence: 0.5,
  frequenceFloatType: 'random',
  frequenceFloat: 0,
  frequenceNoiseRate: 0,
  frequenceNoiseRange: [0.05, 0.1]
})
console.log(ds)
let receiver = ds.listen()
// 隐藏3个控制点
receiver.receive(function(data, interval) {
  if (interval === 0) return false
  heartBeatRenderer1.incrementData(data, interval / 1000)
}, this)
