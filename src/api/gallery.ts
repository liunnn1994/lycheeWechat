// 所有接口都需要带上cookie
import request from "../utils/request";
import qs from "qs";
import { apiUrl, noticeUri } from "./urls";

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
 * @description 获取通知
 * */
export const getNotice = () => request.get(noticeUri);
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
