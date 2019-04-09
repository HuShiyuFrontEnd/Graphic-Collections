console.log('this is main js for piece - pointcollector in project cssonly')
require('../../common/jquery.js')

let $ = window.$

// 点采集器
let points = {}
let currentName = ''
let current = null
let $uploader = $('#uploader')
let $uploaderFace = $('#uploaderFace')
let $add = $('#addBranch')
let $output = $('#output')
let $tips = $('.tips')
let $img = $('img')
let $branchList = $('.branchList')
let $currentBranch = null
let $canvas = $('canvas')
let ctx = $canvas[0].getContext('2d')

$uploaderFace.on('click', function (e) {
  $uploader.click()
})
$uploader.on('change', function (e) {
  let imgUrl = window.URL.createObjectURL(e.target.files[0])

  $img[0].src = imgUrl
  $img.addClass('show')
  $tips.text('')
  setTimeout(function () { $img.addClass('visible') })
})
$add.on('click', function () {
  if (!$img.hasClass('show')) {
    $tips.text('请先导入一张图片')
    return false
  }
  let name = $('#branchName').val()
  if (!name) return false
  if (current) points[currentName] = current
  currentName = name
  current = []
  if ($currentBranch) $currentBranch.removeClass('current')
  $currentBranch = $(`<div class="branch current">${name}</div>`)
  $branchList.append($currentBranch)
  $('#branchName').val('')
})
$output.on('click', function () {
  if (current) {
    points[currentName] = current
    current = null
  }
  console.log(JSON.stringify(points))
})
// 点击画布
$canvas.on('click', function (e) {
  if (!current) {
    $tips.text('请添加一条路径名称')
    return false
  } else {
    $tips.text('')
  }
  current.push([e.offsetX, e.offsetY])
})
