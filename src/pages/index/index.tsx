import Taro, { Component, Config } from "@tarojs/taro";
import { Text, View, Button, ScrollView } from "@tarojs/components";
import {
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtSearchBar,
  AtList,
  AtListItem
} from "taro-ui";
import { getNotice, getAlbums } from "../../api/gallery";
import { familyGIF, lockGIF } from "../../static/base64Imgs";
import { domain } from "../../api/urls";
import { message } from "../../utils/public";
import "./index.scss";

const imageUrl = require("../../static/family.png");

interface IProps {}

interface IState {
  showNotice: boolean;
  notice: string;
  searchValue: string;
  scrollViewHeight: number;
  albums: {
    id: string;
    visible: boolean;
    title: string;
    sysdate: string;
    lock: string;
    thumb: string;
  }[];
  // 相册数据
  url: string;
}

export default class Gallery extends Component<IProps, IState> {
  config: Config = {
    navigationBarTitleText: "刘家大宅院",
    backgroundTextStyle: "dark",
    enablePullDownRefresh: true,
    onReachBottomDistance: 50
  };
  static options = {
    addGlobalClass: true
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      albums: [],
      showNotice: false,
      notice: "",
      searchValue: "",
      url: domain,
      scrollViewHeight: 0
    };
  }

  onPullDownRefresh() {
    // 下拉开始
    this.loadGallery();
  }

  loadGallery() {
    message("时光机加载中，请稍后！", "loading", 60000);
    this.setState(
      {
        albums: []
      },
      () => {
        getAlbums().then(res => {
          message("加载成功！", "success");
          Taro.stopPullDownRefresh();
          this.setState(
            {
              albums: res.data.albums.map(al => ({
                id: al.id,
                visible: false,
                title: al.title,
                sysdate: al.sysdate,
                lock: al.password.toString() === "1",
                thumb:
                  al.password.toString() === "1"
                    ? lockGIF
                    : al.thumbs[0]
                    ? `${domain}${al.thumbs[0]}`
                    : familyGIF
              }))
            },
            () => {
              this.showGallery();
            }
          );
        });
      }
    );
  }
  showGallery(index = 0) {
    const { albums } = this.state;
    this.setState(
      {
        albums: albums.map((al, i) => {
          if (i === index) {
            al.visible = true;
          }
          return al;
        })
      },
      () => {
        if (index < albums.length - 1) {
          this.showGallery(index + 1);
        }
      }
    );
  }
  getNotice() {
    getNotice().then(res => {
      const noticeAgain = Taro.getStorageSync("noticeAgain");
      const notice = Taro.getStorageSync("notice");
      if (noticeAgain !== false || notice !== res.data) {
        this.setState({
          showNotice: true,
          notice: res.data
        });
      }
      Taro.setStorageSync("notice", res.data);
    });
  }

  closeNotice(val) {
    if (!val) {
      Taro.setStorageSync("noticeAgain", val);
    }
    this.setState({
      showNotice: false
    });
  }

  onShareAppMessage() {
    return {
      title: "欢迎光临刘家大宅院",
      path: "/pages/index/index",
      imageUrl
    };
  }
  componentDidMount() {
    const query = Taro.createSelectorQuery();
    query.select("#search-bar").boundingClientRect();
    query.exec(res => {
      //res就是 所有标签为mjltest的元素的信息 的数组
      this.setState({
        scrollViewHeight:
          Taro.getSystemInfoSync().windowHeight -
          res.find(item => item.id === "search-bar").height
      });
    });
    this.getNotice();
    this.loadGallery();
  }
  handleChangeSearch(searchValue) {
    this.setState({
      searchValue
    });
  }
  handleActionClick() {
    const { searchValue } = this.state;
    if (searchValue === "") {
      this.setState({
        albums: this.state.albums.map(al => {
          al.visible = true;
          return al;
        })
      });
    } else {
      const reg = RegExp(searchValue, "gi");
      this.setState({
        albums: this.state.albums.map(al => {
          al.visible = !!reg.test(al.title);
          return al;
        })
      });
    }
  }
  handleClearSearch() {
    this.setState({
      albums: this.state.albums.map(al => {
        al.visible = true;
        return al;
      }),
      searchValue: ""
    });
  }
  handleClickAlbum(al) {
    Taro.navigateTo({
      url: `/pages/galleryDetails/index?id=${al.id}&title=${al.title}&lock=${al.lock}`
    });
  }
  render() {
    const {
      showNotice,
      notice,
      scrollViewHeight,
      searchValue,
      albums
    } = this.state;
    return (
      <View>
        <View id="search-bar">
          <AtSearchBar
            value={searchValue}
            onChange={this.handleChangeSearch.bind(this)}
            onClear={this.handleClearSearch.bind(this)}
            onActionClick={this.handleActionClick.bind(this)}
          />
        </View>

        <AtList>
          <ScrollView
            enableBackToTop={true}
            scrollY={true}
            scrollWithAnimation={true}
            style={`height:${scrollViewHeight}px`}
          >
            {albums.map((al, index) => {
              const sysdate = new Date(al.sysdate);
              return (
                <AtListItem
                  key={index}
                  className={al.visible ? "bounceInLeft animated" : "hide"}
                  title={al.title}
                  note={`创建时间：${sysdate.getFullYear()}年${sysdate.getMonth() +
                    1}月`}
                  extraText={`${al.lock ? "🔒 " : ""}查看相册`}
                  arrow="right"
                  thumb={al.thumb}
                  onClick={this.handleClickAlbum.bind(this, al)}
                />
              );
            })}
          </ScrollView>
        </AtList>
        <AtModal isOpened={showNotice}>
          <AtModalHeader>通知</AtModalHeader>
          <AtModalContent>
            <Text>{notice}</Text>
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.closeNotice.bind(this, false)}>
              有新消息前不再提示
            </Button>
            <Button onClick={this.closeNotice.bind(this, true)}>关闭</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}
