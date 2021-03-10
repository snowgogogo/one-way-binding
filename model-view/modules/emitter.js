/*
 * Desc: 发布/订阅模式 消息中心
 */


export function Emitter(ctx) {
  // 定义上下文环境,默认this
  this._ctx = ctx || this;
  // 定义事件集合
  this._cbs = this._cbs || {};
}

var emitterProto = Emitter.prototype;

emitterProto.on = function(event, fn) {
  this._cbs[event] = this._cbs[event] || [];
  this._cbs[event].push(fn);
  return this;
}

emitterProto.off = function(event, fn) {
  // all
  if (!arguments.length) {
    this._cbs = {};
    return this;
  }
  // 删除某个事件下所有订阅
  if (arguments.length === 1) {
    delete this._cbs[event];
    return this;
  }
  var callbacks = this._cbs[event];
  // 如果为空,则不用删除直接返回
  if (!callbacks) {
    return this;
  }
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
}
emitterProto.emit = function(event, a, b, c) {
  var callbacks = this._cbs[event];
  if (callbacks) {
    for (var i = 0, len = callbacks.length; i < len; i++) {
      callbacks[i].call(this._ctx, a, b, c);
    }
  }
  return this;
}
