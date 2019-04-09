import DI from '../../common/dependenceInject'

DI.importUrlArray([
  '/static/common/ht/de2MtGHixexY.js',
  '/static/common/ht/core/ht.js',
  '/static/common/ht/product_generated.js'
]).then(() => {
  var ht = window.ht

  // 创建视图、视图模型等
  let dataModel = new ht.DataModel()
  let graphView = new ht.graph.GraphView(dataModel)
  let view = graphView.getView()

  // 向body加入视图
  view.className = 'main'
  document.body.appendChild(view)
  window.addEventListener('resize', function (e) {
    graphView.invalidate()
  }, false)

  let shape1 = new ht.Shape()
  dataModel.add(shape1)
  shape1.setStyle('shape.background', 'yellow')
  shape1.setPoints([
    {x: 0, y: 100},
    {x: 0, y: 0},
    {x: 200, y: 0},
    {x: 200, y: 100}
  ])
  // segments 1~5 moveto lineto quadraticCurveTo bezierCurveTo closePath
  shape1.setSegments([
    1, // moveTo
    4 // bezierCurveTo
  ])

  graphView.translate(30, 30)
  graphView.setEditable(true)
})
