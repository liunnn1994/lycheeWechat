import request from "../utils/request";
import qs from "qs";

export const getAlbums = () => {
  return request.post(
    "https://image.2077tech.com/php/index.php",
    qs.stringify({
      function: "Albums::get"
    })
  );
};

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
