## JavaScript-ES6

- [内置类型](#内置类型)
- [作用域](#作用域)
- [词法作用域](#词法作用域)
- [闭包](#闭包)
- [原型](#原型)
- [this](#this)
- [call|apply|bind实现](#call-apply-bind实现)
- [执行上下文](#执行上下文)
- [深浅拷贝](#深浅拷贝)
- [继承](#继承)
- [模块化](#模块化)
- [防抖与节流](#防抖与节流)
- [promise实现](#promise实现)
- [generate实现](#generate实现) 
- [async/await实现](#async/await实现) 
- [其他内置函数实现](#其他内置函数实现) 
- [V8下的垃圾回收机制](#V8下的垃圾回收机制) 

## 内置类型
## 作用域
- 理解:
  - 作用域是一套规则 用于确定在何处以及如何查找变量（标识符）
- 前言
  - 传统编译 三部曲
    - 词法分析
    - 生成抽象语法树
    - 根据ast生成计算机可识别的指令
::: tip
`js`动态，解释型语言，并不是不编译，只是编译后立即执行 时间很短 感觉像不编译 导致内存性能优化问题比较紧 利用`JIT`延迟编译
:::
- 模拟 
  - 代码执行三部分
    - js引擎
    - 编译器
    - 作用域
```txt
  引擎负责全局解析和执行代码
  引擎遇到声明 去作用域查找（LHS以及RHS）
  编译器把遇到的声明变量告诉作用域
  作用域有标识符，查询拿到给引擎
  左查询 操作目标是谁 取得目标引用
  右查询 取到目标原值 
```
- 作用域链

  - 全局，局部，函数作用域

  - 作用域链理解
    - 当前作用域中没有查找变量，回到上层继续查找，没有继续向上，这个查找过程形成一条链路，俗称作用域链s
## 词法作用域
  - 前言 js是基于词法作用域的(也有一些是属于动态作用域如: `eval(string), with (Object) {}`)
  - 定义 指的是在书写代码阶段就已经知道确定所在及其管理查询变量(标识符)了
  - 好处 静态确定，有更多的优化选择
  - 动态作用域 指的是能够在运行阶段，实现词法欺骗（即能修改书写代码时确定的作用域），使得引擎不好识别管理
    - `eval` 如果传入声明字符串，就能达到修改当前词法作用域的效果，使得这段代码就像原本就出现在这里一样
        ```js
        function example(str) {
          eval(str)
          console.log(a)
        }
        // 不使用const let 声明 因为会产生封闭效果，出现 RHS查询 引用错误
        // 使用var 演示
        var a = 2
        example('var a = 3') // 3
        ```
    - 安全系数低， `new Function()` 代替， 较为安全
    - `with` 大概描述 将对象作为执行上下文，并将对象属性标识符暴露在当下，使得引擎能识别找到
        ```js
        var obj = {
          a: 2
        }
        // 形成了一个局部作用域
        with (obj) {
          // obj.a = 3
          a = 3
        }
        with (obj) {
          // LHS查询 类型错误
          b = 3 // TypeError
        }

        ```
    - 性能差, `const` let 都可以代替
## 闭包
  - 当函数能记住并访问所在词法作用域时就产生了闭包，即使是在当前词法作用域之外执行
  - 从技术上讲，闭包是产生在定义时
  - 应用：IIFE, 回调函数，模块模式等随处都可见
  - 弊端：增大内存消耗（保留对变量标识符的引用，即使当前用不上)，不利已垃圾回收机制清理
## 原型
  - 双原型 __proto__ [[prototype]]
    - __proto__ 外部访问使用， [[prototype]] 内部访问使用
  - 每个对象在创建时内部都会生成一个[[prototype]]属性，这个属性值就是原型
    - 指向`Object.prototype`
  - 每个对象上的[[prototype]]属性都会关联一个[[prototype]]属性
  - 每当在实例上找不到属性或者方法时就会
  - 在自身的原型属性上找, 还是找不到，在原型属性上的原型上找，直到找到，或者原型属性为 `null`
  - 这个过程会形成一个查找链也就是常说的原型链
1. 通过构造函数生成的函数会有.prototype, .constructor 属性
2. .prototype 指向构造函数的原型 new Object() -> Object.prototype, new Function() -> Function.prototype
3. Function.prototype __proto__ 指向 Object.prototype
4. 每个函数在创建时对会自动生成 prototype 属性 指向函数原型

- 概括
  - 每个函数都有 `prototype` 属性，除了 `Function.prototype.bind()`，该属性指向原型。

  - 每个对象都有 `__proto__` 属性，指向了创建该对象的构造函数的原型。其实这个属性指向了 `[[prototype]]`，但是 `[[prototype]]` 是内部属性，我们并不能访问到，所以使用 `_proto_` 来访问。

  - 对象可以通过 `__proto__` 来寻找不属于该对象的属性，`__proto__` 将对象连接起来组成了原型链。
## this
  - js特有机制
  - 确定this方式 new > 显示 > 隐 > 默（基本| 可能会出现隐式丢失）
    - 默认方式
      - 函数单独调用 没有在任何上下文环境 this 即是全局对象(window | undefined | global)
    - 隐式
      - 函数被其他对象直接调用，或者说函数被其他对象所包含 this 即是所调用对象
    - 显示
      - 通过内置方式绑定 call, apply, bind this 就是传入的对象
    - new 方式
      - this 指的是新创建的对象
  - 箭头函数 方式
    - 即声明时this，不会改变,
## call-apply-bind实现
  - 原理 通过修改this 进行隐性方式调用实现
  - 说明 即通过把函数放到传入上下文中，然后通过上下文对象调用返回结果
  - call
```js
// this 记得就是当前函数
Function.prototype.call = function (context, ...rest) {
  if (!context) {
    context = global
  }
  const key = Symbol('fn')
  context[key] = this
  const result = context[key](...rest)
  delete context[key]
  return result
}
```
  - apply
```js
// this 记得就是当前函数
Function.prototype.apply = function (context, ...rest) {
  if (!context) {
    context = global
  }
  const key = Symbol('fn')
  context[key] = this
  const result = context[key](...rest[0])
  delete context[key]
  return result
}
```
  - bind(还可以柯里化，多参转单参)
```js
// this 记得就是当前函数
Function.prototype.call = function (context, ...args) {
  if (!context) {
    context = global
  }
  const _this = this
  const fn = Symbol('fn')
  // 普通函数， 构造函数， 需要继承原型上的属性方法
  const result = function (...args1) {
    if (this instanceof _this) {
      this[fn] = _this
      const res = this[fn](...args, ...args1)
      delete this[fn]
      return res
    } else {
      context[fn] = _this
      const res = context[fn](...args, ...args)
      delete context[fn]
      return res
    }
  }
  // 需要关联原型
  result.prototype = Object.create(_this.prototype)
  return result
}
```
## 执行上下文
- js引擎会在执行代码时会生成包含VO对象，作用域，this等的信息区块，这就是执行上下文
- 指当前执行环境中的变量、函数声明、作用域链、this等信息
1. 生命周期
  - 创建阶段
    - 生成变量对象、建立作用域链、确定this的指向
  - 执行阶段
    - 变量赋值、函数的引用、执行其他代码
2. 执行上下文里包含当前所有信息 大概三种
- VO变量对象 -> 存储变量，函数声明以及arguments对象等信息（只能全局执行上下文中访问）
- 作用域 -> 当前词法作用域的所有信息，通过通过[[scope]]访问
- this
- desc: 函数上下文只能访问AO活动对象其他对象信息，通过scope链访问

:::tip
闭包中的变量访问js是通过逃逸检测实现的，把信息放在堆上，而不是放在栈上，从而逃逸
:::

3. js引擎在执行代码是会生成3个执行上下文
- 全局执行上下文
- 函数执行上下文
- eval执行上下文

### 特点
1. 单线程，只在主线程上运行
2. 同步执行，从上向下按顺序执行
3. 全局上下文只有一个，也就是window对象
4. 函数每调用一次就会产生一个新的执行上下文环境

### 执行栈
- 描述：是一种先进后出的数据结构，用来存储代码运行的所有执行上下文
  1. 当 JS 引擎第一次遇到js脚本时，会创建一个全局的执行上下文并且压入当前执行栈
  2. 每当JS 引擎遇到一个函数调用，它会为该函数创建一个新的执行上下文并压入栈的顶部
  3. 当该函数执行结束时，执行上下文从栈中弹出，控制流程到达当前栈中的下一个上下文
  4. 一旦所有代码执行完毕，JS 引擎从当前栈中移除全局执行上下文

## 深浅拷贝
1. 浅拷贝
- Object.assign, cloneObj实现递归，展开运算符 ...
```js
const cloneObj = Object.assign({}, { a: 3 })
const cloneFn = function (obj) {
  if (!obj || typeof obj !== 'object') {
    return obj
  }
  const stringTag = Object.prototype.toString.call(obj)
  if (stringTag === '[object Array]') {
    return obj.reduce((pre, cur, index) => {
      pre[index] = cloneFn(cur[index])
      return pre
    }, [])
  }
  const keys = Object.keys(obj)
  return keys.reduce((pre, cur) => {
    pre[cur] = cloneFn(obj[cur])
    return pre
  }, {})
}
```
2. 深拷贝
- 对象中有对象，造成引用，从而使目的失效
- JSON.parse(JSON.stringify()), MessageChannle, deepCloneFn
- json
  - 不能识别undefined, symbol
  - 不能序列化函数
  - 不能处理循环引用，报错
- MessageChannle 信息频道订阅发布，数据传统，通过值的拷贝(proxy对象不能拷贝，需先序列化)
  - 解决内部属性识别，函数序列化，循环引用
```js
// 异步事件
function test(to) {
  return new Promise(resolve => {
    const {port1, port2} = new MessageChanel()
    port.onmessage = (ev) => { resolve(ev.data) }
    port.postMessage(to)
  })
}
(async () => {
  const clone = await test(to)
} )()
```
- 深拷贝实现
```js
// 内置类型不能识别，undefined,symbol等
// 函数序列化
// 循环引用 打破循环 新建存储区，所有都从里面去，避免编译器重新分配内存

function deepClone(source, hash = new WeakMap()) {
  const isObject = (obj) => {
    return typeof obj === 'object' && obj !== null
  }
  if (!isObject(source)) {
    return source
  }
  const stringTag = Object.prototype.toString.call(source)
  if (stringTag === '[object Date]') {
    return new Date(source)
  }
  if (stringTag === '[object RegExp]') {
    return new RegExp(source)
  }
  if (hash.has(source)) {
    return hash.get(source)
  }
  const target = Array.isArray(source) ? [] : {}
  hash.set(source, target)

  const symbolKeys = Object.getOwnPropertySymbols(source)
  symbolKeys.forEach((symkey) => {
    if (isObject(symbolKeys[symkey])) {
      target[symkey] = deepClone(source[symkey], hash)
    } else {
      target[symkey] = source[symkey]
    }
  })

  for (let key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (isObject(source[key])) {
        target[key] = deepClone(source[key], hash)
      } else {
        target[key] = source[key]
      }
    }
  }
  return target
}
const bb = {
  cc: 2,
  fn: function () {}
}
const aa = {
  date: new Date(),
  reg: /^sd/g,
  num: 2,
  sym: Symbol('sym'),
  number: new Number(2),
  obj: {
    _date: new Date('2022-10-01'),
    bb
  }
}
bb.aa = aa

const clone = deepClone(aa)
console.log(clone)
```
## 继承
- 原理 通过prototype属性实现
```js
function Super() {}
Super.prototype.getNumber = function() {
  return 1
}

function Sub() {}
let s = new Sub()
Sub.prototype = Object.create(Super.prototype, {
  constructor: {
    value: Sub,
    enumerable: false,
    writable: true,
    configurable: true
  }
})
```
在 ES6 中，我们可以通过 `class` 语法轻松解决这个问题

```js
class MyDate extends Date {
  test() {
    return this.getTime()
  }
}
let myDate = new MyDate()
myDate.test()
```
## 模块化
为了方便管理，扩展把代码抽出来到一个文件下
有 commonjs node特有 AMD 浏览器使用，esmodule es6实现

对于 `CommonJS` 和 ES6 中的模块化的两者区别是：

- 前者支持动态导入，也就是 `require(${path}/xx.js)`，后者目前不支持，但是已有提案
- 前者是同步导入，因为用于服务端，文件都在本地，同步导入即使卡住主线程影响也不大。而后者是异步导入，因为用于浏览器，需要下载文件，如果也采用同步导入会对渲染有很大影响

- 前者在导出时都是值拷贝，就算导出的值变了，导入的值也不会改变，所以如果想更新值，必须重新导入一次。但是后者采用实时绑定的方式，导入导出的值都指向同一个内存地址，所以导入值会跟随导出值变化
- 后者会编译成 `require/exports` 来执行的

AMD 是由 `RequireJS` 提出的 异步化

```js
// AMD
define(['./a', './b'], function(a, b) {
    a.do()
    b.do()
})
define(function(require, exports, module) {   
    var a = require('./a')  
    a.doSomething()   
    var b = require('./b')
    b.doSomething()
})
```

## 防抖与节流
在滚动事件中需要做个复杂计算或者实现一个按钮的防二次点击操作。

这些需求都可以通过函数防抖动来实现。
尤其是第一个需求，如果在频繁的事件回调中做复杂计算
很有可能导致页面卡顿，不如将多次计算合并为一次计算，只在一个精确点做操作。

特点：防抖和节流的作用都是防止函数多次调用
区别：假设一个用户一直触发这个函数，且每次触发函数的间隔小于wait，防抖的情况下只会调用一次
      而节流的 情况会每隔一定时间（参数wait）调用函数。

实现
```js
const debounce = (func, wait = 50) => {
  // 缓存一个定时器id
  let timer = 0
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
// 优化版，可以带有immediate选项
function _debounce (func, wait = 50, immediate = true) {
  let timer, context, args
  
  const later = () => setTimeout(() => {
    timer = null
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args)
      context = args = null
    }
  }, wait)

  return function(...params) {
    if (!timer) {
      timer = later()
      // 如果是立即执行，调用函数
      // 否则缓存参数和调用上下文
      if (immediate) {
        func.apply(this, params)
      } else {
        context = this
        args = params
      }
    // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
    // 这样做延迟函数会重新计时
    } else {
      clearTimeout(timer)
      timer = later()
    }
  }
}
```

```js
_.throttle = function(func, wait, options) {
    let context, args, result
    let timeout = null
    let previous = 0
    if (!options) options = {}
    const later = function() {
      previous = options.leading === false ? 0 : _.now()
      // 置空一是为了防止内存泄漏，二是为了下面的定时器判断
      timeout = null
      result = func.apply(context, args)
      if (!timeout) context = args = null
    };
    return function() {
      // 获得当前时间戳
      let now = _.now()
      if (!previous && options.leading === false) previous = now
      // 计算剩余时间
      let remaining = wait - (now - previous)
      context = this
      args = arguments
      if (remaining <= 0 || remaining > wait) {
        // 如果存在定时器就清理掉否则会调用二次回调
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        previous = now
        result = func.apply(context, args)
        if (!timeout) context = args = null
      } else if (!timeout && options.trailing !== false) {
        // 判断是否设置了定时器和 trailing
	      // 没有的话就开启一个定时器
        // 并且不能不能同时设置 leading 和 trailing
        timeout = setTimeout(later, remaining)
      }
      return result
    };
  };
```
## promise实现
## generate实现
## async/await实现
## 其他内置函数实现

## V8下的垃圾回收机制
早期使用： 标记清除和引用计数

V8 实现了准确式 GC，GC 算法采用了分代式垃圾回收机制。因此，V8 将内存（堆）分为新生代和老生代两部分。

1. 新生代算法

新生代中的对象一般存活时间较短，使用 Scavenge GC 算法。

在新生代空间中，内存空间分为两部分，分别为 From 空间和 To 空间。在这两个空间中，必定有一个空间是使用的，另一个空间是空闲的。新分配的对象会被放入 From 空间中，当 From 空间被占满时，新生代 GC 就会启动了。算法会检查 From 空间中存活的对象并复制到 To 空间中，如果有失活的对象就会销毁。当复制完成后将 From 空间和 To 空间互换，这样 GC 就结束了。

2. 老生代算法

老生代中的对象一般存活时间较长且数量也多，使用了两个算法，分别是标记清除算法和标记压缩算法。

在讲算法前，先来说下什么情况下对象会出现在老生代空间中：

- 新生代中的对象是否已经经历过一次 Scavenge 算法，如果经历过的话，会将对象从新生代空间移到老生代空间中。
- To 空间的对象占比大小超过 25 %。在这种情况下，为了不影响到内存分配，会将对象从新生代空间移到老生代空间中。

老生代中的空间很复杂，有如下几个空间

```c++
enum AllocationSpace {
  // TODO(v8:7464): Actually map this space's memory as read-only.
  RO_SPACE,    // 不变的对象空间
  NEW_SPACE,   // 新生代用于 GC 复制算法的空间
  OLD_SPACE,   // 老生代常驻对象空间
  CODE_SPACE,  // 老生代代码对象空间
  MAP_SPACE,   // 老生代 map 对象
  LO_SPACE,    // 老生代大空间对象
  NEW_LO_SPACE,  // 新生代大空间对象

  FIRST_SPACE = RO_SPACE,
  LAST_SPACE = NEW_LO_SPACE,
  FIRST_GROWABLE_PAGED_SPACE = OLD_SPACE,
  LAST_GROWABLE_PAGED_SPACE = MAP_SPACE
};
```

在老生代中，以下情况会先启动标记清除算法：

- 某一个空间没有分块的时候
- 空间中被对象超过一定限制
- 空间不能保证新生代中的对象移动到老生代中

在这个阶段中，会遍历堆中所有的对象，然后标记活的对象，在标记完成后，销毁所有没有被标记的对象。在标记大型对内存时，可能需要几百毫秒才能完成一次标记。这就会导致一些性能上的问题。为了解决这个问题，2011 年，V8 从 stop-the-world 标记切换到增量标志。在增量标记期间，GC 将标记工作分解为更小的模块，可以让 JS 应用逻辑在模块间隙执行一会，从而不至于让应用出现停顿情况。但在 2018 年，GC 技术又有了一个重大突破，这项技术名为并发标记。该技术可以让 GC 扫描和标记对象时，同时允许 JS 运行，你可以点击 [该博客](https://v8project.blogspot.com/2018/06/concurrent-marking.html) 详细阅读。

清除对象后会造成堆内存出现碎片的情况，当碎片超过一定限制后会启动压缩算法。在压缩过程中，将活的对象像一端移动，直到所有对象都移动完成然后清理掉不需要的内存。