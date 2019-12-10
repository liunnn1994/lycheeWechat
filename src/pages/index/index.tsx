import Taro, { Component, Config } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { AtToast, AtInput, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtMessage } from 'taro-ui'
import qs from "qs"
import './index.scss'
const Fly = require("flyio/dist/npm/wx");
const fly = new Fly;

interface IProps {
}
interface IState {
  isLogin: boolean;
  showError: boolean;
  loginLoading: boolean;
  user: string;
  password: string;
  errorText: string;
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
  config: Config = {
    navigationBarTitleText: '首页'
  }
  constructor(props: IProps) {
    super(props)
    this.state = {
      isLogin: false,
      showError: false,
      loginLoading: false,
      user: "",
      password: "",
      errorText: "",
      timer: null
    }
  }
  componentWillMount() {
  }

  componentDidMount() {
  }
  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }
  closeError() {
    this.setState({
      showError: false,
      errorText: ""
    })
  }
  onSubmit() {
    const { user, password, timer } = this.state;
    clearTimeout(timer);
    if (user === "") {
      this.setState({
        showError: true,
        errorText: "用户名不能为空！"
      })
    } else if (password === "") {
      this.setState({
        showError: true,
        errorText: "密码不能为空！"
      })
    } else {
      this.setState({
        loginLoading: true
      });
      fly.post("https://image.2077tech.com/php/index.php", qs.stringify({
        function: "Session::login",
        user,
        password
      })).then(res => {

        this.setState({
          loginLoading: false
        });
        if (res.data) {
          Taro.atMessage({
            'message': `登陆成功！`,
            'type': "success",
          })
        } else {
          Taro.atMessage({
            'message': `密码错误！`,
            'type': "error",
          })
        }
      }).catch(err => {
        this.setState({
          loginLoading: false
        });
        Taro.atMessage({
          'message': `服务器错误：${err}`,
          'type': "error",
        })
      })
    }
    this.setState({
      timer: setTimeout(() => {
        this.setState({
          showError: false,
          errorText: ""
        });
      }, 3000)
    })

  }
  handleChange(type, val) {
    let state = {};
    state[type] = val;
    this.setState(state);
  }
  render() {
    const { errorText, isLogin, user, password, showError, loginLoading } = this.state;
    return (
      <View>
        <AtModal
          isOpened={!isLogin}
          closeOnClickOverlay={false}
        >
          <AtModalHeader>标题</AtModalHeader>
          <AtModalContent>
            <AtInput
              name='user'
              title='用户名'
              type='text'
              placeholder='请输入用户名'
              value={user}
              onChange={this.handleChange.bind(this, "user")}
            />
            <AtInput
              name='password'
              title='密码'
              type='password'
              placeholder='请输入密码'
              value={password}
              onChange={this.handleChange.bind(this, "password")}
            />
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.onSubmit.bind(this)}>登录</Button>
          </AtModalAction>
        </AtModal>
        <AtToast onClick={this.closeError.bind(this)} hasMask isOpened={showError} text={errorText} icon="close-circle"></AtToast>
        <AtToast duration={0} hasMask isOpened={loginLoading} text="登陆中，请稍后。" icon="close-circle"></AtToast>

      </View>
    )
  }
}
