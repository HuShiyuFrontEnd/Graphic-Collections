import Utils from './utils'

class Texture {
  constructor(img) {
    if (!img) {
      console.error('create Texture error:不存在的img参数')
      return false
    }
    this.nodeType = 'texture'
    this.name = img.name
    this.buffer = document.createElement('canvas')
    this.context = this.buffer.getContext('2d')
    this.width = img.width
    this.height = img.height
    this.buffer.width = this.width
    this.buffer.height = this.height
    this.context.drawImage(img, 0, 0)
  }
}

function log(context) {
  Utils.log(`[Res模组提示]:${context}`)
}

class Res {
  constructor() {
    this._sheetPath = ''
    this._sheetList = {}
    this._sheetStack = {}
    this._sheetProgress = {}
  }

  /**
     * 设置加载列表的参数
     * @param {Object} setting 可配置参数
     *     in {String} sheetPath 资源列表的根路径点
     *     in {Object} sheetList 资源列表
     *          in key {String} groupname 这一资源组的名字preload
     *          in value {[String]} list 资源列表
     *          @example 'preload':['pic1.jpg','pic2.jpg']
     */
  config(setting) {
    this._sheetPath = setting.sheetPath
    this._sheetList = setting.sheetList
  }
  // 加载一个资源组
  load(groupname) {
    let list = this._sheetList[groupname]
    if (!list || !list.length) {
      log(`设置中没有名为${groupname}的资源组`)
    } else {
      this._sheetProgress[groupname] = [0, 0, list.length]
      for (let url of list) {
        url = this._sheetPath + url
        let name = (url.split('/')).pop().replace(/\./g, '_')
        if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(url)) {
          this.imgLoader(url, name, groupname)
        } else {
          log(`没有为${url}找到适合的loader`)
        }
      }
    }
    return this
  }
  // 获取name对应的texture
  getResByName(name) {
    return this._sheetStack[name]
  }
  // 图像类型资源的加载器
  imgLoader(url, name, groupname) {
    let img = new Image()
    let that = this
    img.src = url
    img.name = name
    img.onload = () => {
      if (that._sheetStack[name]) log(`同名资源${name}`)
      let texture = new Texture(img)
      that._sheetStack[name] = texture
      that.loadedOne(name, texture, groupname)
      img = null
    }
    img.onerror = () => {
      log(`img:${url} 加载失败，请检查资源是否存在`)
      that.loadedOne(name, undefined, groupname, true)
      img = null
    }
  }
  // 加载完毕一个的处理
  loadedOne(name, texture, groupname, error) {
    let progress = this._sheetProgress[groupname]
    progress[0]++
    if (error) { progress[1]++ }
    // 留给用户的注入接口
    if (this.onLoadEach) { this.onLoadEach(arguments) }
    if (this.onLoadProgress) { this.onLoadProgress(...progress) }
  }
  // 未测试功能
  addAsyncTexture(name, url) {
    if (/\.(png|jpe?g|gif|svg)(\?.*)?$/.test(url)) {
      this.imgLoader(url, name)
    } else {
      log(`没有为${url}找到适合的loader`)
    }
  }
  addShapeTexture(name, shape) {
    if (this._sheetStack[name]) {
      log(`已有名为${name}的贴图了`)
      return false
    }
    let texture = new Texture(shape.buffer)
    this._sheetStack[name] = texture
  }
  // event
  // 针对单个加载项信息处理的事件
  // onLoadEach
  // 针对加载过程数量处理的事件
  // onLoadProgress
  // loadend请在onLoadProgress里判断
}

export default Res
