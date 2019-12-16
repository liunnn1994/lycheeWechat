// eslint-disable-next-line no-unused-vars
import Taro, { Component, Config } from "@tarojs/taro";
import { Text, View, Button } from "@tarojs/components";
import {
  AtToast,
  AtList,
  AtListItem,
  AtSearchBar,
  AtMessage,
  AtFab,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtInput,
  AtSwipeAction
} from "taro-ui";
import {
  getAlbums,
  addAlbum,
  delAlbums,
  renameAlbums,
  getNotice
} from "../../api/gallery";
import { familyGIF } from "../../static/base64Imgs";
import "./index.scss";

interface IProps {}
interface IState {
  fetchGalleryLoading: boolean;
  showReLogin: boolean;
  showNotice: boolean;
  showNoticeAgain: boolean;
  showCreateAlbum: boolean;
  confirmDelAlbum: boolean;
  renameAlbum: boolean;
  value: string;
  actionIndex: number;
  newAlbumName: string;
  swipeActionOptions: any[];
  notice: string;
  // 显示的相册
  albums: {
    id: string;
    title: string;
    sysdate: string;
    showClassName: boolean;
    thumbs: string[];
  }[];
  // 相册数据
  albumsData: {
    id: string;
    title: string;
    sysdate: string;
    showClassName: boolean;
    thumbs: string[];
  }[];
  url: string;
  timer: any;
}

export default class Gallery extends Component<IProps, IState> {
  // eslint-disable-next-line react/sort-comp
  config: Config = {
    navigationBarTitleText: "相册",
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
      fetchGalleryLoading: true,
      confirmDelAlbum: false,
      renameAlbum: false,
      showNoticeAgain: false,
      actionIndex: -1,
      value: "",
      notice: "",
      showNotice: false,
      newAlbumName: "新建相册",
      albums: [],
      albumsData: [],
      showReLogin: false,
      showCreateAlbum: false,
      url: "https://image.2077tech.com/",
      timer: null,
      swipeActionOptions: [
        {
          text: "重命名",
          action: "rename",
          style: {
            backgroundColor: "#6190E8"
          }
        },
        {
          text: "删除",
          action: "del",
          style: {
            backgroundColor: "#FF4949"
          }
        }
      ]
    };
  }
  handleAddAlbum() {
    this.setState({
      showCreateAlbum: true
    });
  }
  onPullDownRefresh() {
    // 下拉开始
    this.loadGallery();
  }
  loadGallery() {
    this.message("时光机加载中，请稍后！");
    const { timer } = this.state;
    clearInterval(timer);
    getAlbums()
      .then(res => {
        if (res.data.albums === undefined) {
          this.setState({
            showReLogin: true
          });
          return false;
        }
        let albums = res.data.albums.map(album => ({
          ...album,
          showClassName: false
        }));
        this.setState({
          fetchGalleryLoading: false,
          albums,
          albumsData: albums
        });
        Taro.stopPullDownRefresh();
        this.message("欢迎来到刘家大院！", "success");
        let len = albums.length;
        let i = 0;
        let timer = setInterval(() => {
          if (i > len - 1) {
            clearInterval(timer);
            return false;
          }
          let albums = this.state.albums;
          albums[i].showClassName = true;
          this.setState({
            fetchGalleryLoading: false,
            albums
          });
          i++;
        }, 100);
        this.setState({
          fetchGalleryLoading: false,
          timer
        });
      })
      .catch(err => {
        this.message(`加载失败！${err.message}`, "error");
      });
  }
  handleClickAlbum(al: { id: string; title: string }) {
    Taro.navigateTo({
      url: `/pages/galleryDetails/index?id=${al.id}&title=${al.title}`
    });
  }
  componentWillMount() {
    this.setState({
      showNoticeAgain: Taro.getStorageSync("showNoticeAgain")
    });
  }

  componentDidMount() {
    this.getNotice();
    this.loadGallery();
  }
  getNotice() {
    getNotice().then(res => {
      const { data } = res;
      if (
        !this.state.showNoticeAgain ||
        Taro.getStorageSync("notice") !== data
      ) {
        this.setState({
          showNotice: data !== "",
          notice: data,
          showNoticeAgain: false
        });
      }
      Taro.setStorageSync("notice", data);
    });
  }
  message(
    message: string,
    type: "info" | "success" | "error" | "warning" | undefined = "info"
  ) {
    Taro.atMessage({
      message,
      type
    });
  }
  handleCreateAlbum(bool: boolean) {
    if (bool) {
      const { newAlbumName } = this.state;
      if (newAlbumName === "") {
        this.message("相册名不能为空！", "error");
      } else {
        this.message("新建相册中，请稍后。");
        addAlbum(newAlbumName).then(() => {
          this.message(`${newAlbumName}相册新建成功！`);
          this.loadGallery();
        });
      }
    }
    this.setState({
      showCreateAlbum: false
    });
  }
  handleChangeAlbumName(newAlbumName) {
    this.setState({
      newAlbumName
    });
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return newAlbumName;
  }
  onChangeSearch(value: string) {
    const albumsData = JSON.parse(JSON.stringify(this.state.albumsData));
    let albums: any[] = [];
    if (value === "") {
      albums = albumsData;
    } else {
      albums = albumsData.filter(al => new RegExp(value).test(al.title));
    }
    this.setState({
      value,
      albums
    });
  }
  onActionClick() {
    const { value } = this.state;
    const { albumsData } = this.state;
    let albums = albumsData.filter(al => new RegExp(value).test(al.title));
    this.setState({
      albums
    });
  }
  handleReLogin() {
    Taro.reLaunch({
      url: "/pages/index/index"
    });
  }
  handleClickAction(actionIndex, e) {
    this.setState({
      actionIndex
    });
    if (e.action === "del") {
      this.setState({
        confirmDelAlbum: true
      });
    } else if (e.action === "rename") {
      this.setState({
        renameAlbum: true,
        newAlbumName: this.state.albumsData[actionIndex].title
      });
    }
  }
  renameAlbum(val) {
    if (val) {
      const { actionIndex, albumsData, newAlbumName } = this.state;
      renameAlbums(albumsData[actionIndex].id, newAlbumName).then(res => {
        if (res.data === true) {
          this.message("重命名成功！", "success");
          this.loadGallery();
        } else {
          this.message(`重命名失败！${res.data}`, "error");
        }
      });
    }
    this.setState({
      renameAlbum: false
    });
  }
  delAlbum(val) {
    if (val) {
      const { actionIndex, albumsData } = this.state;
      delAlbums(albumsData[actionIndex].id).then(res => {
        if (res.data === true) {
          this.message("删除成功！", "success");
          this.loadGallery();
        } else {
          this.message(`删除失败！${res.data}`, "error");
        }
      });
    }
    this.setState({
      confirmDelAlbum: false
    });
  }
  closeNotice(val) {
    if (val) {
      this.setState({
        showNoticeAgain: val
      });
    }
    this.setState({
      showNotice: false
    });
    Taro.setStorageSync("showNoticeAgain", val);
  }
  handleCloseToast(key) {
    let obj = {};
    obj[key] = false;
    this.setState(obj);
  }
  render() {
    const {
      fetchGalleryLoading,
      albums,
      url,
      showReLogin,
      showCreateAlbum,
      newAlbumName,
      swipeActionOptions,
      confirmDelAlbum,
      renameAlbum,
      showNotice,
      notice
    } = this.state;
    return (
      <View>
        <AtMessage />
        <AtSearchBar
          placeholder="搜索相册名称"
          actionName="搜索"
          value={this.state.value}
          onChange={this.onChangeSearch.bind(this)}
          onActionClick={this.onActionClick.bind(this)}
        />
        <AtList>
          {albums.map((al, index) => (
            <AtSwipeAction
              onClick={this.handleClickAction.bind(this, index)}
              options={swipeActionOptions}
            >
              <AtListItem
                className={al.showClassName ? "slideInLeft animated" : "opt0"}
                title={al.title}
                note={`修改日期：${al.sysdate}`}
                extraText="查看相册"
                arrow="right"
                thumb={al.thumbs.length ? url + al.thumbs[0] : familyGIF}
                key={index}
                onClick={this.handleClickAlbum.bind(this, al)}
              />
            </AtSwipeAction>
          ))}
        </AtList>
        <View className="fab-box">
          <AtFab>
            <Text
              className="at-fab__icon at-icon at-icon-add-circle"
              onClick={this.handleAddAlbum.bind(this)}
            />
          </AtFab>
        </View>
        <AtToast
          duration={0}
          hasMask
          isOpened={fetchGalleryLoading}
          text="相册加载中"
          status="loading"
          onClose={this.handleCloseToast.bind(this, "fetchGalleryLoading")}
        />
        <AtModal isOpened={showReLogin}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>登录失效，请重新登录！</AtModalContent>
          <AtModalAction>
            <Button onClick={this.handleReLogin}>确定</Button>
          </AtModalAction>
        </AtModal>
        <AtModal isOpened={showCreateAlbum}>
          <AtModalHeader>新建相册</AtModalHeader>
          <AtModalContent>
            <AtInput
              name="value"
              title="相册名称"
              type="text"
              placeholder="请输入相册名称"
              value={newAlbumName}
              onChange={this.handleChangeAlbumName.bind(this)}
            />
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.handleCreateAlbum.bind(this, false)}>
              取消
            </Button>
            <Button onClick={this.handleCreateAlbum.bind(this, true)}>
              确定
            </Button>
          </AtModalAction>
        </AtModal>
        <AtModal isOpened={confirmDelAlbum}>
          <AtModalHeader>警告！</AtModalHeader>
          <AtModalContent>
            是否删除相册？此操作同时会删除相册中的照片，删除操作不可逆！
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.delAlbum.bind(this, false)}>取消</Button>
            <Button onClick={this.delAlbum.bind(this, true)}>
              确定（无法恢复）
            </Button>
          </AtModalAction>
        </AtModal>
        <AtModal isOpened={renameAlbum}>
          <AtModalHeader>重命名</AtModalHeader>
          <AtModalContent>
            <AtInput
              name="value"
              title="相册名称"
              type="text"
              placeholder="请输入相册名称"
              value={newAlbumName}
              onChange={this.handleChangeAlbumName.bind(this)}
            />
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.renameAlbum.bind(this, false)}>取消</Button>
            <Button onClick={this.renameAlbum.bind(this, true)}>重命名</Button>
          </AtModalAction>
        </AtModal>
        <AtModal isOpened={showNotice}>
          <AtModalHeader>通知</AtModalHeader>
          <AtModalContent>
            <Text>{notice}</Text>
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.closeNotice.bind(this, true)}>
              有新消息前不再提示
            </Button>
            <Button onClick={this.closeNotice.bind(this, false)}>关闭</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}
