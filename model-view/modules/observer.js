/*
 * Desc: 劫持所有 data 数据,通过 Object.defineProperty 来实现.
 *       使 data 数据都变为被观察的状态.
 */


import {Emitter} from './emitter';

let def = Object.defineProperty;

function observe(obj, observer) {
  convert(obj);
  let emitter = obj.__emitter__;
  // 这里定义临时变量,方便取消绑定时获取fun.
  observer.proxies = {};
  let proxies = observer.proxies = {
    set: function(key, val) {
      if (key) {
        observer.emit('set', key, val);
      }
    }
  };
  emitter.on('set', proxies.set);

  /**
   * 关键点: 对data中所有数据通过Object.defineProperty
   * 设置get/set 方法.
   * 将所有数据都设置为被观察状态.
   */
  watchObject(obj);

}

function convert(obj) {
  // 这里定义一个新的emitter
  let emitter = new Emitter();
  // 对整个 data 进行属性添加.
  def(obj, '__emitter__', {
    value: emitter,
    configurable: true,
    enumerable: false
  });
  emitter.values = Object.create(null);
}

/**
 *  Watch an Object, recursive.
 */
function watchObject(obj) {
  for (var key in obj) {
    convertKey(obj, key)
  }
}

/**
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
function convertKey(obj, key) {
  // emit set on bind
  // this means when an object is observed it will emit
  // a first batch of set events.
  let emitter = obj.__emitter__;
  let values = emitter.values;

  // 编译的时,进行数据初始化渲染.
  init(obj[key]);

  def(obj, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      var value = values[key]
      return value
    },
    set: function(newVal) {
      // 改变值时,对数据进行渲染.
      init(newVal)
    }
  })

  function init(val) {
    // 给emitter的value赋值.
    values[key] = val;
    emitter.emit('set', key, val);
  }
}

export default {observe};
