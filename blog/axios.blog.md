# 基于小程序请求接口 wx.request 封装的类 axios 请求

## Introduction

- wx.request 的配置、axios 的调用方式
- [源码戳我](https://github.com/T-Macgrady/blog/tree/master/request)

## feature

- 支持 wx.request 所有配置项
- 支持 axios 调用方式
- 支持 自定义 baseUrl
- 支持 自定义响应状态码对应 resolve 或 reject 状态
- 支持 对响应（resolve/reject）分别做统一的额外处理
- 支持 转换请求数据和响应数据
- 支持 请求缓存（内存或本地缓存），可设置缓存标记、过期时间

## use

### app.js @onLaunch

```javascript
  import axios form 'axios'
  axios.creat({
    header: {
      content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    baseUrl: 'https://api.baseurl.com',
    ...
  });
```

### page.js

```javascript
axios
  .post("/url", { id: 123 })
  .then((res) => {
    console.log(response);
  })
  .catch((err) => {
    console.log(err);
  });
```

## API

```javascript
  axios(config) - 默认get
  axios(url[, config]) - 默认get
  axios.get(url[, config])
  axios.post(url[, data[, config]])
  axios.cache(url[, data[, config]]) - 缓存请求（内存）
  axios.cache.storage(url[, data[, config]]) - 缓存请求（内存 & local storage）
  axios.creat(config) - 初始化定制配置，覆盖默认配置
```

## config

默认配置项说明

```javascript
export default {
  // 请求接口地址
  url: undefined,
  // 请求的参数
  data: {},
  // 请求的 header
  header: "application/json",
  // 超时时间，单位为毫秒
  timeout: undefined,
  // HTTP 请求方法
  method: "GET",
  // 返回的数据格式
  dataType: "json",
  // 响应的数据类型
  responseType: "text",
  // 开启 http2
  enableHttp2: false,
  // 开启 quic
  enableQuic: false,
  // 开启 cache
  enableCache: false,

  /** 以上为wx.request的可配置项，参考 https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html */
  /** 以下为wx.request没有的新增配置项 */

  // {String} baseURL` 将自动加在 `url` 前面，可以通过设置一个 `baseURL` 便于传递相对 URL
  baseUrl: "",
  // {Function} （同axios的validateStatus）定义对于给定的HTTP 响应状态码是 resolve 或 reject  promise 。如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 否则，promise 将被 reject
  validateStatus: undefined,
  // {Function} 请求参数包裹（类似axios的transformRequest），通过它可统一补充请求参数需要的额外信息（appInfo/pageInfo/场景值...），需return data
  transformRequest: undefined,
  // {Function} resolve状态下响应数据包裹（类似axios的transformResponse），通过它可统一处理响应数据，需return res
  transformResponse: undefined,
  // {Function} resolve状态包裹，通过它可做接口resolve状态的统一处理
  resolveWrap: undefined,
  // {Function} reject状态包裹，通过它可做接口reject状态的统一处理
  rejectWrap: undefined,
  // {Boolean} _config.useCache 是否开启缓存
  useCache: false,
  // {String} _config.cacheName 缓存唯一key值，默认使用url&data生成
  cacheName: undefined,
  // {Boolean} _config.cacheStorage 是否开启本地缓存
  cacheStorage: false,
  // {Any} _config.cacheLabel 缓存标志，请求前会对比该标志是否变化来决定是否使用缓存，可用useCache替代
  cacheLabel: undefined,
  // {Number} _config.cacheExpireTime 缓存时长，计算缓存过期时间，单位-秒
  cacheExpireTime: undefined,
};
```

## 实现

### axios.js

```javascript
import Axios from "./axios.class.js";

// 创建axios实例
const axiosInstance = new Axios();
// 获取基础请求axios
const { axios } = axiosInstance;
// 将实例的方法bind到基础请求axios上，达到支持请求别名的目的
axios.creat = axiosInstance.creat.bind(axiosInstance);
axios.get = axiosInstance.get.bind(axiosInstance);
axios.post = axiosInstance.post.bind(axiosInstance);
axios.cache = axiosInstance.cache.bind(axiosInstance);
axios.cache.storage = axiosInstance.storage.bind(axiosInstance);
```

### Axios class

#### 初始化

- defaultConfig 默认配置，即 defaults.js
- axios.creat 用户配置覆盖默认配置
- 注意配置初始化后 mergeConfig 不能被污染，config 需通过参数传递

```javascript
constructor(config = defaults) {
    this.defaultConfig = config;
  }
creat(_config = {}) {
  this.defaultConfig = mergeConfig(this.defaultConfig, _config);
}
```

#### 请求别名

- axios 兼容 axios(config) 或 axios(url[, config])；
- 别名都只是 config 合并，最终都通过 axios.requst()发起请求;

```javascript
  axios($1 = {}, $2 = {}) {
    let config = $1;
    // 兼容axios(url[, config])方式
    if (typeof $1 === 'string') {
      config = $2;
      config.url = $1;
    }
    return this.request(config);
  }

  post(url, data = {}, _config = {}) {
    const config = {
      ..._config,
      url,
      data,
      method: 'POST',
    };
    return this.request(config);
  }
```

#### 请求方法 \_request

请求配置预处理

- 实现 baseUrl
- 实现 transformRequest（转换请求数据）

```javascript
  _request(_config = {}) {
    let config = mergeConfig(this.defaultConfig, _config);
    const { baseUrl, url, header, data = {}, transformRequest } = config;
    const computedConfig = {
      header: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        ...header,
      },
      ...(baseUrl && {
        url: combineUrl(url, baseUrl),
      }),
      ...(transformRequest &&
        typeof transformRequest === 'function' && {
          data: transformRequest(data),
        }),
    };
    config = mergeConfig(config, computedConfig);
    return wxRequest(config);
  }
```

#### wx.request

发起请求、处理响应

- 实现 validateStatus（状态码映射 resolve）
- 实现 transformResponse（转换响应数据）
- 实现 resolveWrap、rejectWrap（响应状态处理）

```javascript
export default function wxRequest(config) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...config,
      success(res) {
        const {
          resolveWrap,
          rejectWrap,
          transformResponse,
          validateStatus,
        } = config;
        if ((validateStatus && validateStatus(res)) || ifSuccess(res)) {
          const _resolve = resolveWrap ? resolveWrap(res) : res;
          return resolve(
            transformResponse ? transformResponse(_resolve) : _resolve
          );
        }
        return reject(rejectWrap ? rejectWrap(res) : res);
      },
      fail(res) {
        const { rejectWrap } = config;
        reject(rejectWrap ? rejectWrap(res) : res);
      },
    });
  });
}
```

### 请求缓存的实现

- 默认使用内存缓存，可配置使用 localStorage
- 封装了 Storage 与 Buffer 类，与 Map 接口一致：get/set/delete
- 支持缓存标记&过期时间
- 缓存唯一 key 值，默认使用 url&data 生成，无需指定

```javascript
  import Buffer from '../utils/cache/Buffer';
  import Storage from '../utils/cache/Storage';
  import StorageMap from '../utils/cache/StorageMap';


  /**
   * 请求缓存api，缓存于本地缓存中
   */
  storage(url, data = {}, _config = {}) {
    const config = {
      ..._config,
      url,
      data,
      method: 'POST',
      cacheStorage: true,
    };
    return this._cache(config);
  }

  /**
   * 请求缓存
   * @param {Object} _config 配置
   * @param {Boolean} _config.useCache 是否开启缓存
   * @param {String} _config.cacheName 缓存唯一key值，默认使用url&data生成
   * @param {Boolean} _config.cacheStorage 是否开启本地缓存
   * @param {Any} _config.cacheLabel 缓存标志，请求前会对比该标志是否变化来决定是否使用缓存，可用useCache替代
   * @param {Number} _config.cacheExpireTime 缓存时长，计算缓存过期时间，单位-秒
   */
  _cache(_config) {
    const {
      url = '',
      data = {},
      useCache = true,
      cacheName: _cacheName,
      cacheStorage,
      cacheLabel,
      cacheExpireTime,
    } = _config;
    const computedCacheName = _cacheName || `${url}#${JSON.stringify(data)}`;
    const cacheName = StorageMap.getCacheName(computedCacheName);

    // return buffer
    if (useCache && Buffer.has(cacheName, cacheLabel)) {
      return Buffer.get(cacheName);
    }

    // return storage
    if (useCache && cacheStorage) {
      if (Storage.has(cacheName, cacheLabel)) {
        const data = Storage.get(cacheName);
        // storage => buffer
        Buffer.set(
          cacheName,
          Promise.resolve(data),
          cacheExpireTime,
          cacheLabel
        );
        return Promise.resolve(data);
      }
    }
    const curPromise = new Promise((resolve, reject) => {
      const handleFunc = (res) => {
        // do storage
        if (useCache && cacheStorage) {
          Storage.set(cacheName, res, cacheExpireTime, cacheLabel);
        }
        return res;
      };

      this._request(_config)
        .then((res) => {
          resolve(handleFunc(res));
        })
        .catch(reject);
    });

    // do buffer
    Buffer.set(cacheName, curPromise, cacheExpireTime, cacheLabel);

    return curPromise;
  }
```
