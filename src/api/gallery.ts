// 所有接口都需要带上cookie
import request from "../utils/request";
import Taro from "@tarojs/taro";
import qs from "qs";
import { apiUrl, noticeUri, authUri } from "./urls";

/**
 * @description 获取相册,带上cookie
 * */
export const getAlbums = () => {
  return request.post(
    apiUrl,
    qs.stringify({
      function: "Albums::get"
    })
  );
};

/**
 * @description 通过相册ID获取图片
 * @param {String} albumID - 相册ID
 * @param {String} password - 相册密码
 * */
export const getImagesByAlbumID = (albumID: string, password: string = "") => {
  return request.post(
    apiUrl,
    qs.stringify({
      function: "Album::get",
      albumID,
      password
    })
  );
};

/**
 * @description 新建相册
 * @param {string} title 相册名称
 * @param {number} parent_id 父级ID 根目录为0
 * */
export const addAlbum = (title: string, parent_id: number = 0) => {
  return request.post(
    apiUrl,
    qs.stringify({
      function: "Album::add",
      title,
      parent_id
    })
  );
};

/**
 * @description 添加图片到相册
 * @param {String} albumID - 相册ID
 * @param {String} filePath - 文件路径
 * */
export const addPhoto = (albumID: string, filePath: string) => {
  return Taro.uploadFile({
    url: apiUrl, //仅为示例，非真实的接口地址
    filePath,
    name: "0",
    header: {
      "Content-Type": "multipart/form-data",
      Cookie: `PHPSESSID=${Taro.getStorageSync("cookie")};`
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
export const delPhotos = (photoIDs: string) => {
  return request.post(
    apiUrl,
    qs.stringify({
      function: "Photo::delete",
      photoIDs
    })
  );
};

/**
 * @description 重命名相册
 * @param {String} albumIDs - 重命名相册ID的集合  ID1,ID2,ID3 ...
 * @param {String} title - 重命名的名称
 * */
export const renameAlbums = (albumIDs: string, title: string) => {
  return request.post(
    apiUrl,
    qs.stringify({
      function: "Album::setTitle",
      albumIDs,
      title
    })
  );
};

/**
 * @description 删除相册
 * @param {String} albumIDs - 删除相册ID的集合
 * */
export const delAlbums = (albumIDs: string) => {
  return request.post(
    apiUrl,
    qs.stringify({
      function: "Album::delete",
      albumIDs
    })
  );
};

/**
 * @description 获取通知
 * */
export const getNotice = () => request.get(noticeUri);
/**
 * @description 获取验证码
 * */
export const getAuthCode = () => request.get(authUri);
/**
 * @description 验证公共相册密码
 * @param {String} albumID - 相册id
 * @param {String} password - 相册密码
 * */
export const getPublic = (albumID: string, password: string = "") => {
  return request.post(
    apiUrl,
    qs.stringify({
      function: "Album::getPublic",
      albumID,
      password
    })
  );
};
