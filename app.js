import axios from "./request/axios";

App({
  onLaunch: function () {
    initAxios();
  },
});

function initAxios() {
  const baseUrl = "https://suggest.taobao.com";
  const header = {
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  };
  const transformRequest = (data) => {
    return {
      transformRequest: "这是使用transformRequest给请求参数加上的字段",
      ...data,
    };
  };
  const transformResponse = (res) => ({
    ...res,
    transformResponse: "这是使用transformResponse给response加上的字段",
  });
  const resolveWrap = (res) => {
    console.log("resolveWrap:", "这里可以统一处理resolve状态");
    return res.data.result;
  };
  const rejectWrap = (res) => {
    console.log("rejectWrap:", "这里可以统一处理reject状态");
    return res;
  };
  const validateStatus = (res) => {
    console.log(
      "validateStatus:",
      "使用validateStatus验证请求状态为2xx时才resolve"
    );
    return /^2/.test(res.statusCode.toString());
  };

  axios.creat({
    baseUrl,
    header,
    validateStatus,
    transformRequest,
    transformResponse,
    resolveWrap,
    rejectWrap,
  });
}
