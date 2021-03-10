/*
 * Desc: 编译
 */
import {Emitter} from './emitter';
import {Binding} from './binding';
import Observer from './observer';
import TextParser from './text-parser';
import {Directive} from './directive';

let hasOwn = ({}).hasOwnProperty;
let def = Object.defineProperty;
let slice = [].slice;

export function Compiler(vm, options) {
  let compiler = this;
  // 设置root节点元素
  let el = compiler.el = compiler.setupElement(options);

  // 设置compiler
  compiler.vm = el.vue_vm = vm;
  // 创建一个纯净的hash对象, 用来维护绑定集合.
  compiler.bindings = Object.create(null);
  compiler.options = options || {};

  // 设置vm,也就是MVVM框架(ViewModel)属性
  vm.$el = el;
  vm.$options = options;
  vm.$compiler = compiler;

  // start: 处理数据 *************************
  /**
   * 设置一个订阅器,编写订阅方法.
   */
  compiler.setupObserver();

  /**
   * 拿到前面设置的订阅器,并对数据进行发布(emit)方法.
   */
  let data = compiler.data = options.data || {};
  vm.$data = data;
  compiler.observeData(data);
  // end: 处理数据 *************************

  // start: 编译 ********
  compiler.compile(el, true);
  // end: 编译 ********

}

let CompilerProto = Compiler.prototype;

CompilerProto.setupElement = function(options) {
  let el = document.querySelector(options.el);
  return el;
}

CompilerProto.setupObserver = function() {
  let compiler = this;
  let bindings = compiler.bindings;
  // 以viewMode为上下文环境,创建一个emitter.
  let observer = compiler.observer = new Emitter(compiler.vm);

  // 订阅 set 方法
  observer.on('set', onSet);

  /**
   * 主要做了2件事情:
   * 1. 根据 key|value 创建了一个 binding 数据类.
   * 2. 更新 binding 中 value 的值.
   */
  function onSet(key, val) {
    check(key);
    bindings[key].update(val);
  }
  // 检查是否有binding.
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
  /**
   * 这一步的主要目的当我们修改数据时,需要vm.$data.name = 'XXX' 这样,
   * 经过对vm进行额外的属性添加,设置属性就可以变为vm.name = 'xxx' 了,主要为了方便.
   */
  compiler.defineDataProp(key, binding);
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
    set: function(val) {
      compiler.data[key] = val;
    }
  })
}

CompilerProto.observeData = function(data) {

  let compiler = this;
  // 拿到前面创建好的订阅器.
  let observer = compiler.observer;

  // 对数据进行发布(emit).
  Observer.observe(data, observer)
}

/**
 *  Compile a DOM node (recursive)
 */
CompilerProto.compile = function(node) {
  // 获取元素节点类型: 1: 元素节点 | 2: 属性节点 | 3: Text
  var nodeType = node.nodeType;
  if (nodeType === 1) {
    this.compileElement(node)
  } else if (nodeType === 3) {
    // 对文本节点进行详细处理
    this.compileTextNode(node)
  }
}

/**
 *  Compile normal directives on a node
 */
CompilerProto.compileElement = function(node) {
  // 判断为节点时,继续编译子节点.
  if (node.hasChildNodes()) {
    slice.call(node.childNodes).forEach(this.compile, this)
  }
}

/**
 *  Compile a text node
 *  编译文字节点
 */
CompilerProto.compileTextNode = function(node) {
  var tokens = TextParser.parse(node.nodeValue);
  if (!tokens) return
  var el, token, directive;

  for (var i = 0, l = tokens.length; i < l; i++) {

    token = tokens[i]
    if (token.key) { // a binding
      el = document.createTextNode('');
      // 创建一个指令,比如{{message}} 这里就是一个指令
      directive = new Directive(token.key, el);
    } else { // a plain string
      el = document.createTextNode(token)
    }

    // insert node
    node.parentNode.insertBefore(el, node)
    // 将创建好的指令,绑定到对应的数据 binding 中. this.dirs[].push.
    this.bindDirective(directive)
  }
  node.parentNode.removeChild(node)
}

/**
*  Add a directive instance to the correct binding & viewmodel
*  添加指令到ViewModel
*/
CompilerProto.bindDirective = function(directive) {
  let compiler = this;
  let binding = compiler.bindings[directive.getKey()];
  binding.dirs.push(directive);
  directive.$update(binding.value);
}
