module.exports = {
    "extends": [
      "stylelint-config-standard"
    ],
    "plugins": [
      "stylelint-order"
    ],
    overrides: [
      {
          files: ['**/*.{less,css}'], // css 相关文件由 postcss-less 处理
          customSyntax: 'postcss-less'
      },
  ],

    "rules": {
      "selector-class-pattern": [null, "kebab-case"],
      // 颜色指定大写
      "color-hex-case": "upper",
      // 禁止空块
      'block-no-empty': true,
      // 颜色6位长度
      "color-hex-length": "long",
      // 兼容自定义标签名
      "selector-type-no-unknown": [true, {
        "ignoreTypes": []
      }],
      // 忽略伪类选择器 ::v-deep
      "selector-pseudo-element-no-unknown": [true, {
        "ignorePseudoElements": ["v-deep"]
      }],
      // 禁止低优先级的选择器出现在高优先级的选择器之后。
      "no-descending-specificity": null,
      // 不验证@未知的名字，为了兼容scss的函数
      "at-rule-no-unknown": null,
      // 禁止空注释
      "comment-no-empty": true,
      // 禁止简写属性的冗余值
      "shorthand-property-no-redundant-values": true,
      // 禁止值的浏览器引擎前缀
      "value-no-vendor-prefix": true,
      // property-no-vendor-prefix
      "property-no-vendor-prefix": true,
      // 禁止小于 1 的小数有一个前导零
      "number-leading-zero": "never",
      // 禁止空第一行
      "no-empty-first-line": true,
      // 属性的排序
      "order/properties-order": [
        "position",
        "top",
        "right",
        "bottom",
        "left",
        "z-index",
        "display",
        "justify-content",
        "align-items",
        "float",
        "clear",
        "overflow",
        "overflow-x",
        "overflow-y",
        "margin",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
        "border",
        "border-style",
        "border-width",
        "border-color",
        "border-top",
        "border-top-style",
        "border-top-width",
        "border-top-color",
        "border-right",
        "border-right-style",
        "border-right-width",
        "border-right-color",
        "border-bottom",
        "border-bottom-style",
        "border-bottom-width",
        "border-bottom-color",
        "border-left",
        "border-left-style",
        "border-left-width",
        "border-left-color",
        "border-radius",
        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "width",
        "min-width",
        "max-width",
        "height",
        "min-height",
        "max-height",
        "font-size",
        "font-family",
        "font-weight",
        "text-align",
        "text-justify",
        "text-indent",
        "text-overflow",
        "text-decoration",
        "white-space",
        "color",
        "background",
        "background-position",
        "background-repeat",
        "background-size",
        "background-color",
        "background-clip",
        "opacity",
        "filter",
        "list-style",
        "outline",
        "visibility",
        "box-shadow",
        "text-shadow",
        "resize",
        "transition"
      ],
    }
  }