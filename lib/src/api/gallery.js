"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 所有接口都需要带上cookie
const request_1 = require("../utils/request");
const taro_1 = require("@tarojs/taro");
const qs_1 = require("qs");
const urls_1 = require("./urls");
/**
 * @description 获取相册,带上cookie
 * */
exports.getAlbums = () => {
    return request_1.default.post(urls_1.apiUrl, qs_1.default.stringify({
        function: "Albums::get"
    }));
};
/**
 * @description 通过相册ID获取图片
 * @param {String} albumID - 相册ID
 * */
exports.getImagesByAlbumID = (albumID) => {
    return request_1.default.post(urls_1.apiUrl, qs_1.default.stringify({
        function: "Album::get",
        albumID,
        password: ""
    }));
};
/**
 * @description 新建相册
 * @param {string} title 相册名称
 * @param {number} parent_id 父级ID 根目录为0
 * */
exports.addAlbum = (title, parent_id = 0) => {
    return request_1.default.post(urls_1.apiUrl, qs_1.default.stringify({
        function: "Album::add",
        title,
        parent_id
    }));
};
/**
 * @description 添加图片到相册
 * @param {String} albumID - 相册ID
 * @param {String} filePath - 文件路径
 * */
exports.addPhoto = (albumID, filePath) => {
    return taro_1.default.uploadFile({
        url: urls_1.apiUrl,
        filePath,
        name: "0",
        header: {
            "Content-Type": "multipart/form-data",
            Cookie: `PHPSESSID=${taro_1.default.getStorageSync("cookie")};`
        },
        formData: {
            function: "Photo::add",
            albumID
        }
    });
};
/**
 * @description 删除图片
 * @param {String} photoIDs - 删除图片ID的集合
 * */
exports.delPhotos = (photoIDs) => {
    return request_1.default.post(urls_1.apiUrl, qs_1.default.stringify({
        function: "Photo::delete",
        photoIDs
    }));
};
/**
 * @description 重命名相册
 * @param {String} albumIDs - 重命名相册ID的集合  ID1,ID2,ID3 ...
 * @param {String} title - 重命名的名称
 * */
exports.renameAlbums = (albumIDs, title) => {
    return request_1.default.post(urls_1.apiUrl, qs_1.default.stringify({
        function: "Album::setTitle",
        albumIDs,
        title
    }));
};
/**
 * @description 删除相册
 * @param {String} albumIDs - 删除相册ID的集合
 * */
exports.delAlbums = (albumIDs) => {
    return request_1.default.post(urls_1.apiUrl, qs_1.default.stringify({
        function: "Album::delete",
        albumIDs
    }));
};
/**
 * @description 获取通知
 * */
exports.getNotice = () => request_1.default.get(urls_1.noticeUri);
//# sourceMappingURL=gallery.js.map