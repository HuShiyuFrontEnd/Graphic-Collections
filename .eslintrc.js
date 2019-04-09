// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  env: {
    'browser': true
  },
  extends: [
    'standard'
    // 'plugin:vue/strongly-recommended'
  ],
  parserOptions: {
    'parser': 'babel-eslint'
  },
  rules: {
    'no-new': 0,
    'one-var': 0,
    'arrow-parens': 2,
    'lines-around-comment': [1, {
      'beforeBlockComment': true
    }],
    'generator-star-spacing': [2, {
      'before': true,
      'after': true
    }],
    'space-before-function-paren': [2, {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'always'
    }],
    'new-cap': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0

    // vue
    // 'vue/html-self-closing': 2,
    // 'vue/max-attributes-per-line': 0,
    // 'vue/html-quotes': 1,
    // 'vue/no-v-html': 1,
    // 'vue/order-in-components': [1, {
    //   'order': ['el', 'name', 'parent', 'functional', ['delimiters', 'comments'], ['components', 'directives', 'filters'], 'extends', 'mixins', 'inheritAttrs', 'model', ['props', 'propsData'], 'data', 'computed', 'watch', 'LIFECYCLE_HOOKS', 'methods', ['template', 'render'], 'renderError']
    // }],
    // 'vue/attributes-order': [1, {
    //   'order': ['DEFINITION', 'LIST_RENDERING', 'CONDITIONALS', 'RENDER_MODIFIERS', 'GLOBAL', 'UNIQUE', ['BINDING', 'OTHER_ATTR'], 'EVENTS', 'CONTENT']
    // }]
  }
}
