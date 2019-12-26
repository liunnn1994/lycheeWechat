"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taro_1 = require("@tarojs/taro");
const img = require("../static/netError.gif");
const Fly = require("./wx");
const request = new Fly();
// 请求拦截器
request.interceptors.request.use(conf => {
    const { headers, body } = conf;
    const cookie = taro_1.default.getStorageSync("cookie");
    if (cookie && !/login/.test(body)) {
        headers["Cookie"] = `PHPSESSID=${cookie};`;
    }
    return conf;
});
//添加响应拦截器，响应拦截器会在then/catch处理之前执行
request.interceptors.response.use(response => response, err => {
    //发生网络错误后会走到这里
    let errorLog = taro_1.default.getStorageSync("errorLog")
        ? JSON.parse(taro_1.default.getStorageSync("errorLog"))
        : [];
    errorLog.push(err);
    taro_1.default.setStorageSync("errorLog", JSON.stringify(errorLog));
    taro_1.default.showToast({
        title: `网络错误！`,
        icon: "none",
        image: img,
        duration: 2000
    });
});
exports.default = request;
//# sourceMappingURL=request.js.map