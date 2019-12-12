import Taro, { Component, Config } from "@tarojs/taro";
import { View, Button } from "@tarojs/components";
import {
  AtToast,
  AtInput,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction
} from "taro-ui";
import { logIn } from "../../api/user";
import "./index.scss";

interface IProps {}
interface IState {
  isLogin: boolean;
  redirectLoading: boolean;
  showError: boolean;
  loginLoading: boolean;
  user: string;
  password: string;
  errorText: string;
  loginText: string;
  loginIcon: "error" | "success" | "loading" | undefined;
  userErrorClass: string;
  passwordErrorClass: string;
  timer: any;
}

export default class Index extends Component<IProps, IState> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  // eslint-disable-next-line react/sort-comp
  config: Config = {
    navigationBarTitleText: "首页"
  };
  constructor(props: IProps) {
    super(props);
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
  componentWillMount() {}

  componentDidMount() {
    const user = Taro.getStorageSync("user");
    const password = Taro.getStorageSync("password");
    if (user && password) {
      this.setState(
        {
          user,
          password
        },
        () => {
          this.handleLogin();
        }
      );
    }
  }
  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}
  closeError() {
    this.setState({
      showError: false,
      errorText: ""
    });
  }
  getCookie(name: string, c: []) {
    let arr,
      reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    const cookie = c.join(";");
    arr = cookie.match(reg);
    if (arr) return unescape(arr[2]);
    else return null;
  }
  handleLogin() {
    const { user, password } = this.state;
    this.setState({
      loginLoading: true
    });
    logIn(user, password)
      .then((res: any) => {
        this.setState({
          loginLoading: false
        });
        if (res.data) {
          Taro.setStorageSync("user", user);
          Taro.setStorageSync("password", password);
          Taro.setStorageSync(
            "cookie",
            this.getCookie("PHPSESSID", res.headers["set-cookie"])
          );
          this.setState({
            loginText: `登陆成功！即将跳转。`,
            redirectLoading: true,
            loginIcon: "success"
          });
          setTimeout(() => {
            Taro.redirectTo({
              url: "/pages/gallery/index"
            });
          }, 1000);
        } else {
          this.setState({
            loginText: `登陆失败，请重试！`,
            redirectLoading: true,
            loginIcon: "error"
          });
        }
      })
      .catch(err => {
        this.setState({
          loginLoading: false,
          loginText: `服务器错误：${err}`,
          loginIcon: "error",
          redirectLoading: true
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
    } else if (password === "") {
      this.setState({
        showError: true,
        errorText: "密码不能为空！",
        passwordErrorClass: "shake animated",
        userErrorClass: ""
      });
    } else {
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
  render() {
    const {
      errorText,
      isLogin,
      user,
      password,
      showError,
      loginLoading,
      redirectLoading,
      loginText,
      loginIcon,
      passwordErrorClass,
      userErrorClass
    } = this.state;
    return (
      <View>
        <AtModal isOpened={!isLogin} closeOnClickOverlay={false}>
          <AtModalHeader>欢迎来到刘家大院</AtModalHeader>
          <AtModalContent>
            <AtInput
              className={userErrorClass}
              name="user"
              title="用户名"
              type="text"
              placeholder="请输入用户名"
              value={user}
              onChange={this.handleChange.bind(this, "user")}
            />
            <AtInput
              className={passwordErrorClass}
              name="password"
              title="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={this.handleChange.bind(this, "password")}
            />
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.onSubmit.bind(this)}>登录</Button>
          </AtModalAction>
        </AtModal>
        <AtToast
          onClick={this.closeError.bind(this)}
          hasMask
          isOpened={showError}
          text={errorText}
          icon="close-circle"
        />
        <AtToast
          duration={0}
          hasMask
          isOpened={loginLoading}
          status="loading"
          text="登陆中，请稍后。"
          icon="loading"
        />
        <AtToast
          duration={0}
          hasMask
          isOpened={redirectLoading}
          text={loginText}
          status={loginIcon}
        />
      </View>
    );
  }
}
