// eslint-disable-next-line no-unused-vars
import Taro, { Component, Config } from "@tarojs/taro";
import { View, Button } from "@tarojs/components";
import {
  AtToast,
  AtList,
  AtListItem,
  AtSearchBar,
  AtMessage,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtNoticebar
} from "taro-ui";
import { getAlbums } from "../../api/gallery";
import "./index.scss";

interface IProps {}
interface IState {
  fetchGalleryLoading: boolean;
  showReLogin: boolean;
  value: string;
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
      value: "",
      albums: [],
      albumsData: [],
      showReLogin: false,
      url: "https://image.2077tech.com/",
      timer: null
    };
  }
  onPullDownRefresh() {
    // 下拉开始
    this.loadGallery();
  }
  loadGallery() {
    Taro.atMessage({
      message: "时光机加载中，请稍后！",
      type: "info"
    });
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
        Taro.atMessage({
          message: "欢迎来到刘家大院！",
          type: "success"
        });
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
        Taro.atMessage({
          message: `加载失败！${err}`,
          type: "error"
        });
      });
  }
  handleClickAlbum(al: { id: string; title: string }) {
    Taro.navigateTo({
      url: `/pages/gallertDetails/index?id=${al.id}&title=${al.title}`
    });
  }
  componentWillMount() {}

  componentDidMount() {
    this.loadGallery();
  }
  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}
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
  render() {
    const { fetchGalleryLoading, albums, url, showReLogin } = this.state;
    return (
      <View>
        <AtNoticebar marquee>
          图片较大，加载请耐心等待。相册使用卷积神经网络把老照片放大到4K，然后使用NoGAN训练模型把黑白和褪色的照片进项32位深上色。
        </AtNoticebar>
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
            <AtListItem
              className={al.showClassName ? "slideInLeft animated" : "opt0"}
              title={al.title}
              note={`修改日期：${al.sysdate}`}
              extraText="查看相册"
              arrow="right"
              thumb={`${url}${al.thumbs[0]}`}
              key={index}
              onClick={this.handleClickAlbum.bind(this, al)}
            />
          ))}
        </AtList>
        <AtToast
          duration={0}
          hasMask
          isOpened={fetchGalleryLoading}
          text="相册加载中"
          status="loading"
        />
        <AtModal isOpened={showReLogin}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>登录失效，请重新登录！</AtModalContent>
          <AtModalAction>
            <Button onClick={this.handleReLogin}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}
