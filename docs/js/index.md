## JavaScript-ES6

- [内置类型](#内置类型)
- [作用域](#作用域)
- [词法作用域](#词法作用域)
- [闭包](#闭包)
- [原型](#原型)
- [this](#this)
- [call|apply|bind实现](#call-apply-bind实现)

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
  - 每个对象在创建时内部都会生成一个[[prototype]]属性，这个属性值就是原型
    - 指向`Object.prototype`
  - 每个对象上的[[prototype]]属性都会关联一个[[prototype]]属性
  - 每当在实例上找不到属性或者方法时就会
  - 在自身的原型属性上找, 还是找不到，在原型属性上的原型上找，直到找到，或者原型属性为 `null`
  - 这个过程会形成一个查找链也就是常说的原型链
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
