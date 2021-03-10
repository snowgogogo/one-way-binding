/*
 * Desc: 将 data 中的数据创建 binding 数据集合.
         定义binding类,类似java中Dao.
 */

let bindingId = 1;

export function Binding(compiler, key) {
  this.id = bindingId++;
  this.value = undefined;
  this.compiler = compiler;
  this.key = key;
  // 指令集合
  this.dirs = [];
}

let BindingProto = Binding.prototype;

BindingProto.update = function(value) {
  this.value = value;
  // 更新 binding 的同时,也需要更新对应指令的数据,也就是 Dom 中的值.
  if (this.dirs.length > 0) {
    for (var i = 0; i < this.dirs.length; i++)
      this.dirs[i].$update(value);
  }
}
