import Taro from "@tarojs/taro";

const Fly = require("./wx");
const request = new Fly();

// 请求拦截器
request.interceptors.request.use(conf => {
  const { headers, body } = conf;
  const cookie = Taro.getStorageSync("cookie");
  if (cookie && !/login/.test(body)) {
    headers["Cookie"] = `PHPSESSID=${cookie};`;
  }
  return conf;
});

//添加响应拦截器，响应拦截器会在then/catch处理之前执行
request.interceptors.response.use(
  response => response,
  err => {
    //发生网络错误后会走到这里
    Taro.showToast({
      title: `${err},网络连接失败！`,
      icon: "none",
      mask: true,
      duration: 1000
    });
  }
);

export default request;
