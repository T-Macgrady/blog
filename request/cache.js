import axios from "./axios";
import Buffer from "../utils/cache/Buffer";
import Storage from "../utils/cache/Storage";

/**
 * ajax Promise - 可选择buffer(内存)或local storage
 * 普通形式 - ajaxPromise(name, url, data) - no buffer & no storage
 * @param {String} name 缓存名称，命名空间；TODO：将url和请求参数共同作为缓存key值（map结构key值可为多种类型）
 * 缓存形式 - ajaxPromise(Object) - 可设置缓存，参数如下
 * @param {Boolean} useCache 是否使用缓存,默认不使用
 * @param {String} cacheType 缓存类型，buffer/storage/both，默认both
 * @param {Any} cacheLabel 缓存标志，请求前会对比该标志是否变化来决定是否使用缓存
 * @param {Boolean} useWxRequest 是否使用wx.request() 一般请求json时，默认false
 * @param {Function} formatFunc 数据处理函数-数据处理复杂时可达缓存操作目的
 */
export default function ajaxPromise($1, $2 = "", $3 = {}) {
  let { name = "", url = "", data = {}, useCache = false } = $1 || {};
  // 缓存形式 & 默认值设置
  const {
    cacheType = "both",
    cacheLabel,
    useWxRequest = false,
    formatFunc = null,
    expireTime = null,
  } = $1;
  // 普通形式
  if (typeof $1 !== "object") {
    name = $1;
    url = $2;
    data = $3;
  }

  const useBuffer = useCache && cacheType !== "storage";
  const useStorage = useCache && cacheType !== "buffer";
  const catchName = `${INJECTION_FROM_WEBPACK.serverType}iyourcar_cache_${name}`;

  // return buffer
  if (useBuffer && Buffer.has(catchName, cacheLabel)) {
    // console.log(catchName, '--------buffer-------', Buffer.get(catchName));
    return Buffer.get(catchName);
  }

  // return storage
  if (useStorage) {
    if (Storage.has(catchName, cacheLabel)) {
      const data = Storage.get(catchName);

      // storage => buffer
      if (useBuffer) {
        Buffer.set(catchName, data, expireTime, cacheLabel);
      }

      // console.log(catchName, '--------Storage-------', data);
      return Promise.resolve(data);
    }
  }
  const curPromise = new Promise((resolve, reject) => {
    const handleFunc = (data) => {
      const res = formatFunc ? formatFunc(data) : data;

      // do storage
      if (useStorage) {
        Storage.set(catchName, res, expireTime, cacheLabel);
      }

      return res;
    };

    if (useWxRequest) {
      wx.request({
        url,
        data,
        method: "POST",
        dataType: "json",
        success({ data }) {
          resolve(handleFunc(data));
        },
        fail() {
          reject();
        },
      });
    } else {
      axios.post(url, data)
        .then((res) => {
          resolve(handleFunc(res));
        })
        .catch(reject);
    }
  });

  // do buffer
  if (useBuffer) {
    Buffer.set(catchName, curPromise, expireTime, cacheLabel);
  }

  // console.log(catchName, '--------curPromise-------', curPromise);
  return curPromise;
}
