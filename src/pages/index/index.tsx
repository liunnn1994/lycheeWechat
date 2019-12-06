import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './index.scss'


interface IProps {
}
interface IState {
  isToggleOn?: boolean;
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
    this.state = { isToggleOn: true }
  }
  componentWillMount() { }

  componentDidMount() {
  }
  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }
  handleClick = (e) => {
    console.log(this.state.isToggleOn);

    this.setState({
      isToggleOn: !this.state.isToggleOn
    })
  }
  render() {
    return (
      <View className='index'>
        <Text className={this.state.isToggleOn ? "" : "flash animated"}>Hello3 world!</Text>
        <AtButton onClick={this.handleClick}>按钮</AtButton>
      </View>
    )
  }
}
