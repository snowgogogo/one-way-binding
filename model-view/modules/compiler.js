/*
 * Desc: 编译
 */
import {Emitter} from './emitter';
import {Binding} from './binding';
import {Observer} from './observer';

let hasOwn = ({}).hasOwnProperty;
let def = Object.defineProperty;

export function Compiler(vm, options) {
  let compiler = this;
  // 设置root节点元素
  let el = compiler.el = compiler.setupElement(options);

  // 设置compiler
  compiler.vm = el.vue_vm = vm;
  // 创建一个纯净的hash对象
  compiler.bindings = Object.create(null);
  compiler.options = options || {};

  // 设置vm,也就是MVVM框架(ViewModel)属性
  vm.$el = el;
  vm.$options = options;
  vm.$compiler = compiler;

  // start: 处理数据 *************************
  // 将对应数据,设置到binding中。
  compiler.setupObserver();

  let data = compiler.data = options.data || {};
  vm.$data = data;
  // 这里有疑问,为啥还要这样处理一次.
  data = compiler.data = vm.$data;

  // 观察数据
  compiler.observeData(data);
  // end: 处理数据 *************************

}

let CompilerProto = Compiler.prototype;

CompilerProto.setupElement = function(options) {
  let el = document.querySelector(options.el);
  return el;
}

CompilerProto.setupObserver = function() {
  let compiler = this;
  let bindings = compiler.bindings;
  let options = compiler.options;
  let observer = compiler.observer = new Emitter(compiler.vm);

  observer.on('get', onGet);
  observer.on('set', onSet);

  function onGet(key) {
    // 待实现
  }
  function onSet(key, val) {
    observer.emit('change:' + key, val);
    check(key);
    bindings[key].update(val);
  }
  function check(key) {
    if (!bindings[key]) {
      compiler.createBinding(key);
    }
  }
}

CompilerProto.createBinding = function(key) {
  let compiler = this;
  let bindings = compiler.bindings;
  let binding = new Binding(compiler, key);
  bindings[key] = binding;
  /*
  // 如果绑定的为root level,需要设定get/set 方法
  if (binding.root) {
    if (key.charAt(0) !== '$') {
      compiler.defineDataProp(key, binding);
    } else {
      // 这里有疑问,什么时候会传入'$'开头的.
      compiler.defineVmProp(key, binding, compiler.data[key]);
      delete compiler.data[key];
    }
  }
  */
  return binding;
}

CompilerProto.defineDataProp = function(key, binding) {
  let compiler = this;
  let data = compiler.data;

  // 确保key对应data
  if (!(hasOwn.call(data, key))) {
    data[key] = undefined
  }
  binding.value = data[key];
  def(compiler.vm, key, {
    get: function() {
      return compiler.data[key]
    },
    set: function() {
      compiler.data[key] = val;
    }
  })
}

CompilerProto.defineVmProp = function(key, binding, value) {
  // 待实现...
}

CompilerProto.observeData = function(data) {

  var compiler = this,
    observer = compiler.observer

  // recursively observe nested properties
  Observer.observe(data, '', observer)

  // also create binding for top level $data
  // so it can be used in templates too
  var $dataBinding = compiler.bindings['$data'] = new Binding(compiler, '$data')
  $dataBinding.update(data)

  // allow $data to be swapped
  def(compiler.vm, '$data', {
    get: function() {
      compiler.observer.emit('get', '$data')
      return compiler.data
    },
    set: function(newData) {
      var oldData = compiler.data
      Observer.unobserve(oldData, '', observer)
      compiler.data = newData
      Observer.copyPaths(newData, oldData)
      Observer.observe(newData, '', observer)
      update()
    }
  })

  // emit $data change on all changes
  observer
    .on('set', onSet)
    .on('mutate', onSet)

  function onSet(key) {
    if (key !== '$data') update()
  }

  function update() {
    $dataBinding.update(compiler.data)
    observer.emit('change:$data', compiler.data)
  }
}
