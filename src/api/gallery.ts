// 所有接口都需要带上cookie
import request from "../utils/request";
import Taro from "@tarojs/taro";
import qs from "qs";

/**
 * @description 获取相册,带上cookie
 * */
export const getAlbums = () => {
  return request.post(
    "https://image.2077tech.com/php/index.php",
    qs.stringify({
      function: "Albums::get"
    })
  );
};

/**
 * @description 通过相册ID获取图片
 * @param {String} albumID - 相册ID
 * */
export const getImagesByAlbumID = (albumID: string) => {
  return request.post(
    "https://image.2077tech.com/php/index.php",
    qs.stringify({
      function: "Album::get",
      albumID,
      password: ""
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
    "https://image.2077tech.com/php/index.php",
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
    url: "https://image.2077tech.com/php/index.php", //仅为示例，非真实的接口地址
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
    "https://image.2077tech.com/php/index.php",
    qs.stringify({
      function: "Photo::delete",
      photoIDs
    })
  );
};
