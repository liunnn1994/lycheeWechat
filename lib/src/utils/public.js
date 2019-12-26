"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyLoad = function (params) {
    const { allArr, loadArr, index, long } = JSON.parse(JSON.stringify(params));
    let cutArr = [...allArr].splice(index, long);
    params.loadArr = [...loadArr, ...cutArr];
    if (allArr.length - loadArr.length < long) {
        params.finished = true;
        return params;
    }
    params.index = index + long;
    return params;
};
//# sourceMappingURL=public.js.map