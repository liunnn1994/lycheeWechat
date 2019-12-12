import request from "../utils/request";
import qs from "qs";

export const logIn = (user: string, password: string) => {
  return request.post(
    "https://image.2077tech.com/php/index.php",
    qs.stringify({
      function: "Session::login",
      user,
      password
    })
  );
};
