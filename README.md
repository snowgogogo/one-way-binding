# 单向绑定

对数据进行单向绑定实现。

## view -> model

**视图改变,引起model变化**。这种场景实现方式很简单,监听input即可。

[view -> model](https://github.com/snowgogogo/one-way-binding/tree/main/view-model)

## model -> view

**model改变,引起视图变化**。实现完全参考**Vue0.10版本**。

之前也看过其他文章,但很多作者都是读完**Vue框架**然后**转化为自己的思路去实现**,对于想去阅读理解**原生态Vue源代码**如何实现还是很困难。

所以我直接参考了**Vue0.10**早期版本来实现数据绑定,能够更好的贴合框架。选择这个版本的原因**初期Vue版本**复杂度还不是很高,更容易理解。但是数据绑定的**核心概念**已经包含了。

感谢**Evan You**。

[model -> view](https://github.com/snowgogogo/one-way-binding/model-view)

### 如何使用

1. 安装。

下载代码后,进入*model-view*文件夹,这里**包含整个项目**。

```
npm install
```

2. 测试。

```
npm run dev
```

此时可以在*dev*文件夹修改*index.html*进行测试,对项目进行断点调试。

3. 打包。

```
npm run build
```

4. 示例。

示例在*example*文件夹中。

## License

MIT





