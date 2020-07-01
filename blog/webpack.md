# 简述webpack核心原理

<img src="https://img-blog.csdnimg.cn/img_convert/da289751c161c83138c1078ed28d5e93.png"  />

## 初始化阶段
Webpack 开始编译的第一步，它从配置文件、配置对象、Shell 参数等获取参数，并将其与默认配置相结合得出最终的参数。初始化阶段主要包括以下步骤：

1. 创建编译器对象：根据获取的参数创建 Compiler 对象。

2. 初始化编译环境：包括注入内置插件、注册各种模块工厂、初始化 RuleSet 集合、加载配置的插件等。

3. 开始编译：执行 Compiler 对象的 run 方法。

在初始化阶段，Webpack 从多个来源获取参数，并将其与默认配置相结合得出最终的参数。这包括从配置文件、配置对象、Shell 参数等多个来源获取参数。在获取到参数后，Webpack 会调用 Compiler 对象的 run 方法，执行编译过程。在编译过程中，Webpack 会创建 Compiler 对象，并注入内置插件、注册各种模块工厂、初始化 RuleSet 集合、加载配置的插件等。这些步骤的目的是为后续的构建阶段和生成阶段做好准备。

## 构建阶段
是 Webpack 编译的核心步骤，它根据获取到的入口文件和依赖关系图，递归地处理每个模块，并将其转换为 JavaScript 代码。构建阶段主要包括以下步骤：

1. 编译模块(make):根据获取到的 entry 对应的 dependence 创建 module 对象，调用 loader 将模块转译为标准 JS 内容，调用 JS 解释器将内容转换为 AST 对象，从中找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。

2. 完成模块编译：上一步递归处理所有能触达到的模块后，得到了每个模块被翻译后的内容以及它们之间的 依赖关系图。

在构建阶段，Webpack 根据获取到的入口文件和依赖关系图，递归地处理每个模块，并将其转换为 JavaScript 代码。在这个过程中，Webpack 会调用各种Loader,如 JavaScript Loader、Module Loader、Object Loader 等，将模块转译为标准 JS 内容，并调用 JS 解释器将内容转换为 AST 对象。最终，Webpack 根据 AST 对象，找出该模块依赖的模块，并递归地处理这些模块，直到所有入口依赖的文件都经过了本步骤的处理。

## 生成阶段
是 Webpack 打包的核心步骤，它根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk,并把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会。生成阶段主要包括以下步骤：

1. 输出资源(seal):根据配置中的 entry 找出所有的入口文件，调用 compilition.addEntry 将入口文件转换为 dependence 对象。

2. 写入文件系统(emitAssets):在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

在生成阶段，Webpack 根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk,并把每个 Chunk 转换成一个单独的文件加入到输出列表。在这个过程中，Webpack 会遍历所有的入口文件，并将它们与依赖关系图联系起来，最终生成一个包含多个模块的 Chunk。这些 Chunk 可以通过 Webpack 的 GenerateChunks 方法

<img src="https://pic4.zhimg.com/80/v2-2e1d66f4a0900fdf4ae06010f45262fb_1440w.webp"  />

## webpack 简单实现

[/packages/webpack/simple_webpack.js](https://github.com/T-Macgrady/blog/blob/master/packages/webpack/simple_webpack.js)