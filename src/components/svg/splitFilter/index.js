import Dat from '@/components/threejs/lib/dat.gui.js'

let $main = document.getElementById('main')
let gui = new Dat()
let lastFilterName = '' // 记录上一个filter的name用于动态修改gui的表单

// 通用的设置表
let globalSetting = {
  filter: lastFilterName
}
// 某个滤镜的特定设置表
let specificSetting = {
  feFlood: {
    floodColor: '#000000',
    floodOpacity: 0.1
  },
  feMorphology: {
    operator: 'erode',
    radius: 5
  },
  feColorMatrix: {
    preset: 'matrixOrigin'
  },
  feComponentTransfer: {
    preset: 'identity'
  },
  feConvolveMatrix: {
    preset: 'origin'
  },
  feDiffuseLighting: {
    color: '#ffffff',
    x: 150,
    y: 60,
    z: 20
  },
  feGaussianBlur: {
    stdDeviation: 3
  },
  feTurbulence: {
    type: 'turbulence',
    baseFrequency: 0.05,
    numOctaves: 2
  }
}
// 滤镜对应的限制条件
let specificConstraint = {
  feFlood: {
    floodOpacity: {
      number: [0, 1] // min and max
    }
  },
  feMorphology: {
    operator: {
      option: ['erode', 'dilate']
    },
    radius: {
      number: [0, 20]
    }
  },
  feColorMatrix: {
    preset: {
      option: ['matrixOrigin', 'matrixGreen', 'matrixOnlyGreenShow', 'matrixRed', 'saturateLevelOne', 'saturateLevelTwo', 'saturateLevelThree', 'hueRotate120', 'hueRotate240', 'hueRotate360', 'luminanceToAlpha']
    }
  },
  feComponentTransfer: {
    preset: {
      option: ['identity', 'table', 'linear', 'gamma']
    }
  },
  feConvolveMatrix: {
    preset: {
      option: ['origin', 'blur', 'sharper']
    }
  },
  feDiffuseLighting: {
    x: {
      number: [-200, 400]
    },
    y: {
      number: [-150, 300]
    },
    z: {
      number: [-150, 150]
    }
  },
  feGaussianBlur: {
    stdDeviation: {
      number: [0, 10]
    }
  },
  feTurbulence: {
    type: {
      option: ['fractalNoise', 'turbulence']
    },
    baseFrequency: {
      number: [0.001, 0.999]
    },
    numOctaves: {
      number: [1, 10]
    }
  }
}
// 某些滤镜的设值比较麻烦，我们需要展示多种情况时，采用预设值，这里提供预设值的映射组
// resultR = R * a00 + G * a01 + B * a02 + A * a03 + a04
// resultG = R * a10 + G * a11 + B * a12 + A * a13 + a14
// resultB = R * a20 + G * a21 + B * a22 + A * a23 + a24
// resultA = R * a30 + G * a31 + B * a32 + A * a33 + a34
let specificPreset = {
  feColorMatrix: {
    matrixOrigin: {
      type: 'matrix',
      values: `1 0 0 0 0 
              0 1 0 0 0 
              0 0 1 0 0 
              0 0 0 1 0`
      // 0 0 0 0 1
    },
    matrixGreen: {
      type: 'matrix',
      values: `0 0 0 0 0 
              1 1 1 0 0 
              0 0 0 0 0 
              0 0 0 1 0`
      // 0 0 0 0 1
    },
    matrixOnlyGreenShow: {
      type: 'matrix',
      values: `0 0 0 0 0 
              0 1 0 0 0 
              0 0 0 0 0 
              0 1 0 0 0`
      // 0 0 0 0 1
    },
    matrixRed: {
      type: 'matrix',
      values: `1 1 1 0 0
              0 0 0 0 0 
              0 0 0 0 0 
              0 0 0 1 0`
      // 0 0 0 0 1
    },
    saturateLevelOne: {
      type: 'saturate',
      values: 0.2
    },
    saturateLevelTwo: {
      type: 'saturate',
      values: 0.6
    },
    saturateLevelThree: {
      type: 'saturate',
      values: 1
    },
    hueRotate120: {
      type: 'hueRotate',
      values: 120
    },
    hueRotate240: {
      type: 'hueRotate',
      values: 240
    },
    hueRotate360: {
      type: 'hueRotate',
      values: 360
    },
    luminanceToAlpha: {
      type: 'luminanceToAlpha',
      values: ''
    }
  },
  feComponentTransfer: {
    identity: {
      value: `
      <feFuncR type="identity"></feFuncR>
      <feFuncG type="identity"></feFuncG>
      <feFuncB type="identity"></feFuncB>
      <feFuncA type="identity"></feFuncA>`
    },
    table: {
      value: `
      <feFuncR type="table" tableValues="0 0 1 1"></feFuncR>
      <feFuncG type="table" tableValues="1 1 0 0"></feFuncG>
      <feFuncB type="table" tableValues="0 1 1 0"></feFuncB>`
    },
    linear: {
      value: `
      <feFuncR type="linear" slope="0.5" intercept="0"></feFuncR>
      <feFuncG type="linear" slope="0.5" intercept="0.25"></feFuncG>
      <feFuncB type="linear" slope="0.5" intercept="0.5"></feFuncB>`
    },
    gamma: {
      value: `
      <feFuncR type="gamma" amplitude="4" exponent="7" offset="0"></feFuncR>
      <feFuncG type="gamma" amplitude="4" exponent="4" offset="0"></feFuncG>
      <feFuncB type="gamma" amplitude="4" exponent="1" offset="0"></feFuncB>`
    }
  },
  feConvolveMatrix: {
    origin: {
      value: `0 0 0
              0 1 0
              0 0 0`
    },
    blur: {
      value: `0 2 0
              2 2 2
              0 2 0`
    },
    sharper: {
      value: `0 -2 0
              -2 9 -2
              0 -2 0`
    }
  }
}
// 滤镜设置表中的值变更时的响应函数
// 通用的设置属性的方法的工厂函数
let specificFuncFactory = function (filterName, attriName) {
  return function (value) {
    document.getElementById(`${filterName}Node`).setAttribute(attriName, value)
  }
}
// 可以是一个字符串，若为字符串，则自动映射到对应的attributeName，若为函数，则直接使用它
let freshMainToResetFilter = function () {
  let $main = document.getElementById('main')
  $main.style.display = 'none'
  setTimeout(function () {
    $main.style.display = 'block'
  })
}
let specificFunction = {
  feFlood: {
    floodColor: 'flood-color', // attriName
    floodOpacity: 'flood-opacity'
  },
  feMorphology: {
    operator: 'operator',
    radius: 'radius'
  },
  feColorMatrix: {
    preset (value) {
      let setting = specificPreset.feColorMatrix[value]
      let $filter = document.getElementById('feColorMatrixNode')
      $filter.setAttribute('type', setting.type)
      $filter.setAttribute('values', setting.values)
    }
  },
  feComponentTransfer: {
    preset (value) {
      document.getElementById('feComponentTransferNode').innerHTML = specificPreset.feComponentTransfer[value].value
      freshMainToResetFilter()
    }
  },
  feConvolveMatrix: {
    preset (value) {
      document.getElementById('feConvolveMatrixNode').setAttribute('kernelMatrix', specificPreset.feConvolveMatrix[value].value)
      freshMainToResetFilter()
    }
  },
  feDiffuseLighting: {
    color: 'lighting-color',
    x (value) {
      document.getElementById('feDiffuseLightingNodeChild').setAttribute('x', value)
    },
    y (value) {
      document.getElementById('feDiffuseLightingNodeChild').setAttribute('y', value)
    },
    z (value) {
      document.getElementById('feDiffuseLightingNodeChild').setAttribute('z', value)
    }
  },
  feGaussianBlur: {
    stdDeviation (value) {
      document.getElementById('feGaussianBlurNode').setAttribute('stdDeviation', value)
      freshMainToResetFilter()
    }
  },
  feTurbulence: {
    type (value) {
      document.getElementById('feTurbulenceNode').setAttribute('type', value)
      freshMainToResetFilter()
    },
    baseFrequency: 'baseFrequency',
    numOctaves (value) {
      document.getElementById('feTurbulenceNode').setAttribute('numOctaves', Math.round(value))
      freshMainToResetFilter()
    }
  }
}

let specificControllers = {}

// 增加一条controller
let addController = function (newName, key) {
  let newSetting = specificSetting[newName] || {}
  let settingFunc = specificFunction[newName] && specificFunction[newName][key]
  let settingConstraint = specificConstraint[newName] && specificConstraint[newName][key]
  let numberConstraint = settingConstraint && settingConstraint.number
  let optionConstraint = settingConstraint && settingConstraint.option
  let keyRelatedToColor = key.indexOf('color') > -1 || key.indexOf('Color') > -1
  let controller // dat.gui里add的一条表单的返回值被称为一个controller
  // 添加约束条件
  // 颜色类型
  if (keyRelatedToColor) controller = gui.addColor(newSetting, key)
  else if (numberConstraint) {
    controller = gui.add(newSetting, key, numberConstraint[0], numberConstraint[1])
  } else if (optionConstraint) {
    controller = gui.add(newSetting, key, optionConstraint)
  } else controller = gui.add(newSetting, key)
  // 添加回调
  switch (typeof settingFunc) {
    case 'string':
      controller.onChange(specificFuncFactory(newName, settingFunc))
      break
    case 'function':
      controller.onChange(settingFunc)
      break
  }
  return controller
}

let changeGui = function (lastName, newName) {
  let lastSetting = specificSetting[lastName] || {}
  let newSetting = specificSetting[newName] || {}
  for (let p in lastSetting) {
    gui.remove(specificControllers[p])
    delete specificControllers[p]
  }
  for (let p in newSetting) {
    specificControllers[p] = addController(newName, p)
  }
}

let whenChooseFilter = function (filterName) {
  let ifFilterNotChange = filterName === lastFilterName
  if (ifFilterNotChange) return false
  changeGui(lastFilterName, filterName)
  $main.setAttribute('class', filterName)
  lastFilterName = filterName
}
gui.add(globalSetting, 'filter', ['', 'feFlood', 'feMorphology', 'feColorMatrix', 'feComponentTransfer', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feGaussianBlur', 'feTurbulence'])
  .onChange(filterName => whenChooseFilter(filterName))
