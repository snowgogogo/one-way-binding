/*
 * Desc: 定义一个简单的MVVM框架
 */
import {Compiler} from './compiler';

window.ViewModel = function(options) {
  console.log('create new VM, options: ' + JSON.stringify(options));
  new Compiler(this, options);
}

