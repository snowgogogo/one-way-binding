/*
 * Desc: DOM上内容和Object绑定
         定义binding类,类似java中Dao.
 */

let bindingId = 1;

export function Binding(compiler, key) {
  this.id = bindingId++;
  this.value = undefined;
  this.compiler = compiler;
  this.key = key;
  this.subs = [];
  this.deps = [];
  this.root = key.indexOf('.') === -1;
  this.unbound = false;
}

let BindingProto = Binding.prototype;

BindingProto.update = function(value) {
  // 当没有设定值时,直接更新.
  this.value = value;
}
