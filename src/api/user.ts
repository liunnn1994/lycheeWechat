import request from "../utils/request";
import qs from "qs";
import { apiUrl } from "./urls";

export const logIn = (user: string, password: string) => {
  return request.post(
    apiUrl,
    qs.stringify({
      function: "Session::login",
      user,
      password
    })
  );
};
