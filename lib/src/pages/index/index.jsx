"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const taro_ui_1 = require("taro-ui");
const user_1 = require("../../api/user");
require("./index.scss");
const imageUrl = require("../../static/family.png");
class Index extends taro_1.Component {
    constructor(props) {
        super(props);
        /**
         * 指定config的类型声明为: Taro.Config
         *
         * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
         * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
         * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
         */
        // eslint-disable-next-line react/sort-comp
        this.config = {
            navigationBarTitleText: "刘家大院"
        };
        this.state = {
            isLogin: false,
            showError: false,
            loginLoading: false,
            redirectLoading: false,
            user: "",
            password: "",
            errorText: "",
            loginText: "",
            loginIcon: "error",
            userErrorClass: "",
            passwordErrorClass: "",
            timer: null
        };
    }
    closeError() {
        this.setState({
            showError: false,
            errorText: ""
        });
    }
    getCookie(name, c) {
        let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        const cookie = c.join(";");
        arr = cookie.match(reg);
        if (arr)
            return unescape(arr[2]);
        else
            return null;
    }
    handleLogin() {
        const { user, password } = this.state;
        this.setState({
            loginLoading: true
        });
        user_1.logIn(user, password)
            .then((res) => {
            this.setState({
                loginLoading: false
            });
            if (res.data) {
                taro_1.default.setStorageSync("user", user);
                taro_1.default.setStorageSync("password", password);
                taro_1.default.setStorageSync("cookie", this.getCookie("PHPSESSID", res.headers["set-cookie"]));
                this.setState({
                    loginText: `登陆成功！即将跳转。`,
                    redirectLoading: true,
                    loginIcon: "success"
                });
                setTimeout(() => {
                    taro_1.default.redirectTo({
                        url: "/pages/gallery/index"
                    });
                }, 1000);
            }
            else {
                this.setState({
                    loginText: `密码错误，请重试！`,
                    redirectLoading: true,
                    loginIcon: "error"
                });
            }
        })
            .catch(() => {
            this.setState({
                loginLoading: false
            });
        });
    }
    onSubmit() {
        const { user, password, timer } = this.state;
        clearTimeout(timer);
        if (user === "") {
            this.setState({
                showError: true,
                errorText: "用户名不能为空！",
                userErrorClass: "shake animated",
                passwordErrorClass: ""
            });
            "shake animated";
        }
        else if (password === "") {
            this.setState({
                showError: true,
                errorText: "密码不能为空！",
                passwordErrorClass: "shake animated",
                userErrorClass: ""
            });
        }
        else {
            this.handleLogin();
        }
        this.setState({
            timer: setTimeout(() => {
                this.setState({
                    showError: false,
                    errorText: ""
                });
            }, 3000)
        });
    }
    handleChange(type, val) {
        let state = {};
        state[type] = val;
        this.setState(state);
    }
    handleCloseToast(key) {
        let obj = {};
        obj[key] = false;
        this.setState(obj);
    }
    onShareAppMessage() {
        return {
            title: "欢迎光临刘家大宅院",
            path: "/page/index/index",
            imageUrl
        };
    }
    componentDidMount() {
        const user = taro_1.default.getStorageSync("user");
        const password = taro_1.default.getStorageSync("password");
        if (user && password) {
            this.setState({
                user,
                password
            }, () => {
                this.handleLogin();
            });
        }
    }
    render() {
        const { errorText, isLogin, user, password, showError, loginLoading, redirectLoading, loginText, loginIcon, passwordErrorClass, userErrorClass } = this.state;
        return (<components_1.View>
        <taro_ui_1.AtModal isOpened={!isLogin} closeOnClickOverlay={false}>
          <taro_ui_1.AtModalHeader>欢迎来到刘家大院</taro_ui_1.AtModalHeader>
          <taro_ui_1.AtModalContent>
            <taro_ui_1.AtInput className={userErrorClass} name="user" title="用户名" type="text" placeholder="请输入用户名" value={user} onChange={this.handleChange.bind(this, "user")}/>
            <taro_ui_1.AtInput className={passwordErrorClass} name="password" title="密码" type="password" placeholder="请输入密码" value={password} onChange={this.handleChange.bind(this, "password")}/>
          </taro_ui_1.AtModalContent>
          <taro_ui_1.AtModalAction>
            <components_1.Button onClick={this.onSubmit.bind(this)}>登录</components_1.Button>
          </taro_ui_1.AtModalAction>
        </taro_ui_1.AtModal>
        <taro_ui_1.AtToast onClick={this.closeError.bind(this)} hasMask isOpened={showError} text={errorText} icon="close-circle" onClose={this.handleCloseToast.bind(this, "showError")}/>
        <taro_ui_1.AtToast duration={0} hasMask isOpened={loginLoading} status="loading" text="登陆中，请稍后。" icon="loading" onClose={this.handleCloseToast.bind(this, "loginLoading")}/>
        <taro_ui_1.AtToast duration={0} hasMask isOpened={redirectLoading} text={loginText} status={loginIcon} onClose={this.handleCloseToast.bind(this, "redirectLoading")}/>
      </components_1.View>);
    }
}
exports.default = Index;
//# sourceMappingURL=index.jsx.map