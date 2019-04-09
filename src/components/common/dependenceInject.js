import axios from 'axios'

let publicStyle = document.createElement('style')
publicStyle.setAttribute('class', 'public-style')
document.getElementsByTagName('head')[0].appendChild(publicStyle)

export default {
  import (urls) {
    let urlPromises = []
    for (let url of urls) {
      let urlPromise = this.createScriptPromise(url)
      urlPromises.push(urlPromise)
    }
    return Promise.all(urlPromises)
  },
  createScriptPromise (url) {
    return new Promise(function (resolve, reject) {
      let script = document.createElement('script')
      document.body.appendChild(script)
      script.onload = function () {
        resolve()
      }
      script.onerror = function () {
        reject(new Error('script load failed'))
      }
      script.src = url
    })
  },
  // 按次序导入url资源
  async importUrlArray (array) {
    let urlArray = array.slice()
    let url = urlArray.shift()
    while (url) {
      let promise = this.createScriptPromise(url)
      await promise
      url = urlArray.shift()
    }
  },
  addCSSStyle (stylestring) {
    publicStyle.appendChild(document.createTextNode(stylestring))
    return this
  },
  insertDOM (domString) {
    var div = document.createElement('div')
    div.innerHTML = domString
    div.childNodes.forEach(element => {
      if (element.nodeType == '1') {
        document.body.appendChild(element)
      }
    })
    return this
  }
}
