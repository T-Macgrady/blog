import axios from "../request/axios";

Page({
  data: {},
  onLoad: function () {
    // get
    console.log("发起get请求");
    axios
      .get("/sug?code=utf-8&q=玩具")
      .then((res) => {
        console.log("发起get请求-res", res);
      })
      .catch((err) => {
        console.log("发起get请求-err", err);
      });
    // post
    console.log("发起post请求");
    axios
      .post(
        "https://api.apiopen.top/getWangYiNews",
        {
          page: 1,
          count: 5,
        },
        {
          baseUrl: "",
        }
      )
      .then((res) => {
        console.log("发起post请求-res", res);
      })
      .catch((err) => {
        console.log("发起post请求-err", err);
      });
  },
  onShow() {
    // cache
    console.log(
      "发起post请求并缓存该请求、再次请求会从内存中取，不会发起请求，可切换小程序前后台测试，支持缓存过期时间设置cacheExpireTime字段"
    );
    axios
      .cache(
        "https://api.apiopen.top/getWangYiNews",
        {
          page: 1,
          count: 5,
        },
        {
          baseUrl: "",
          cacheExpireTime: 20,
        }
      )
      .then((res) => {
        console.log("发起post请求并缓存-res", res);
      })
      .catch((err) => {
        console.log("发起post请求并缓存-err", err);
      });
    // cache.storage
    // console.log(
    //   "发起post请求并缓存该请求、再次请求会从本地缓存中取，不会发起请求"
    // );
    // axios.cache
    //   .storage(
    //     "https://api.apiopen.top/getWangYiNews",
    //     {
    //       page: 1,
    //       count: 5,
    //     },
    //     {
    //       baseUrl: "",
    //     }
    //   )
    //   .then((res) => {
    //     console.log("发起post请求并本地缓存-res", res);
    //   })
    //   .catch((err) => {
    //     console.log("发起post请求并本地缓存-err", err);
    //   });
  },
});
