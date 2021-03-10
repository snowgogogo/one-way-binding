var dirId = 1;

/**
 *  Directive class
 *  represents a single directive instance in the DOM
 */
function Directive(name, el) {
  this.id = dirId++
  this.name = name
  this.el = el
}

var DirProto = Directive.prototype


DirProto.$update = function(value) {
  // 更新 view 中内容, 其实就是改变 el textContent 的值 ...
  this.el['textContent'] = value;
}

DirProto.getKey = function() {
  return this.name;
}

export {Directive};
