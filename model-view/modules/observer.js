import {Emitter} from './emitter';

let def = Object.defineProperty;

function observe(obj, rawPath, observer) {
  let path = rawPath ? rawPath + '.' : '';
  let alreadyConverted = convert(obj);
  let emitter = obj.__emitter__;
  observer.proxies = observer.proxies || {};
  let proxies = observer.proxies[path] = {
    get: function(key) {
      observer.emit('get', path + key);
    },
    set: function(key, val) {
      if (key) {
        observer.emit('set', path + key, val);
      }
    }
  };

  emitter.on('get', proxies.get);
  emitter.on('set', proxies.set);

  if (alreadyConverted) {
    emitSet(obj);
  } else {
    watch(obj);
  }
}

function convert(obj) {
  if (obj.__emitter__) {
    return true;
  }
  let emitter = new Emitter();
  // 定义一个emitter
  def(obj, '__emitter__', emitter);
  emitter.values = Object.create(null);
  emitter.owners = [];
  return false;
}

/**
 *  When a value that is already converted is
 *  observed again by another observer, we can skip
 *  the watch conversion and simply emit set event for
 *  all of its properties.
 */
function emitSet(obj) {
  var emitter = obj && obj.__emitter__
  if (!emitter) return
  if (isArray(obj)) {
    emitter.emit('set', 'length', obj.length)
  } else {
    var key, val
    for (key in obj) {
      val = obj[key]
      emitter.emit('set', key, val)
      emitSet(val)
    }
  }
}

/**
 *  Watch target based on its type
 */
function watch(obj) {
  watchObject(obj)
}

/**
 *  Watch an Object, recursive.
 */
function watchObject(obj) {
  augment(obj, ObjProxy)
  for (var key in obj) {
    convertKey(obj, key)
  }
}

/**
 *  Augment target objects with modified
 *  methods
 */
function augment(target, src) {
  for (var key in src) {
    def(target, key, src[key])
  }
}

/**
 *  Define accessors for a property on an Object
 *  so it emits get/set events.
 *  Then watch the value itself.
 */
function convertKey(obj, key, propagate) {
  var keyPrefix = key.charAt(0)
  if (keyPrefix === '$' || keyPrefix === '_') {
    return
  }
  // emit set on bind
  // this means when an object is observed it will emit
  // a first batch of set events.
  var emitter = obj.__emitter__,
    values = emitter.values

  init(obj[key], propagate)

  // 使用 Object.defineProperty() 定义 get/set 方法,可以监听所有数据
  oDef(obj, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      var value = values[key]
      // only emit get on tip values
      if (pub.shouldGet) {
        emitter.emit('get', key)
      }
      return value
    },
    set: function(newVal) {
      var oldVal = values[key]
      unobserve(oldVal, key, emitter)
      copyPaths(newVal, oldVal)
      // an immediate property should notify its parent
      // to emit set for itself too
      init(newVal, true)
    }
  })

  function init(val, propagate) {
    values[key] = val
    emitter.emit('set', key, val, propagate)
    if (isArray(val)) {
      emitter.emit('set', key + '.length', val.length, propagate)
    }
    observe(val, key, emitter)
  }
}

/**
 *  Cancel observation, turn off the listeners.
 */
function unobserve(obj, path, observer) {

  if (!obj || !obj.__emitter__) return

  path = path ? path + '.' : ''
  var proxies = observer.proxies[path]
  if (!proxies) return

  // turn off listeners
  obj.__emitter__
    .off('get', proxies.get)
    .off('set', proxies.set)
    .off('mutate', proxies.mutate)

  // remove reference
  observer.proxies[path] = null
}
export {observe};
