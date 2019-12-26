"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../utils/request");
const qs_1 = require("qs");
const urls_1 = require("./urls");
exports.logIn = (user, password) => {
    return request_1.default.post(urls_1.apiUrl, qs_1.default.stringify({
        function: "Session::login",
        user,
        password
    }));
};
//# sourceMappingURL=user.js.map