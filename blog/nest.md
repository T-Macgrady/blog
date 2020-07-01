# 简述Nest依赖注入实现原理

- Nest 是 Node.js 的后端框架，其核心就是 IOC 容器，可以自动扫描依赖并创建实例对象，并自动依赖注入。
- 要深入了解 Nest 的实现原理，需要先学习 Reflect metadata 的 API。
  - Reflect metadata 的 API 是给类或对象添加元数据的。可以通过 Reflect.metadata 给类或对象添加元数据，之后在需要使用这个类或对象时，可以通过 Reflect.getMetadata 把它们取出来。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f2bb578b9b624bf993aaedc250ec053d~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp" />

- Nest 的 Controller、Module、Service 等等所有的装饰器都是通过 Reflect. Meatdata 给类或对象添加元数据的。装饰器在初始化时通过 Reflect. Meatdata 获取类或对象的元数据，然后做依赖的扫描和依赖注入。


- 实例化对象还需要构造器参数的类型。开启 TypeScript 的 emitDecoratorMetadata 的编译选项之后，TypeScript 会自动添加一些元数据，例如 design:type、design:paramtypes、design:returntype。
- Reflect metadata 的 API 还在草案阶段，需要引入 refelect metadata 的包做 polyfill。nest 的一系列装饰器就是给 class 和对象添加 metadata 的，然后依赖扫描和依赖注入的时候就把 metadata 取出来做一些处理。