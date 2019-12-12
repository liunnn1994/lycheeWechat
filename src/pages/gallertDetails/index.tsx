import Taro, { Component, Config } from "@tarojs/taro";
import { ScrollView, View, Image, Text, Button } from "@tarojs/components";
import {
  AtSearchBar,
  AtMessage,
  AtFab,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtModal,
  AtLoadMore
} from "taro-ui";
import { getImagesByAlbumID } from "../../api/gallery";
import { lazyLoad } from "../../utils/public";
import "./index.scss";

interface IProps {}
interface IState {
  id: string;
  showReLogin: boolean;
  title: string;
  status: "loading" | "noMore" | "more" | undefined;
  value: string;
  photos: any[];
  allPhotosUrl: string[];
  timer: any;
  url: string;
  scrollViewHeight: number;
  loadData: {
    allArr: any[];
    loadArr: any[];
    index: number;
    long: number;
    finished: boolean;
  };
}

export default class GalleryDetails extends Component<IProps, IState> {
  config: Config = {
    navigationBarTitleText: "相册",
    backgroundTextStyle: "dark",
    enablePullDownRefresh: true,
    onReachBottomDistance: 150
  };
  static options = {
    addGlobalClass: true
  };
  constructor(props: IProps) {
    super(props);
    this.state = {
      id: "",
      showReLogin: false,
      scrollViewHeight: 0,
      title: "",
      status: "loading",
      value: "",
      url: "https://image.2077tech.com/",
      photos: [],
      allPhotosUrl: [],
      timer: null,
      loadData: {
        allArr: [],
        loadArr: [],
        index: 0,
        long: 50,
        finished: false
      }
    };
  }
  componentDidMount() {
    const { id, title } = this.$router.params;
    const query = Taro.createSelectorQuery();
    query.select("#search").boundingClientRect();
    query.exec(res => {
      //res就是 所有标签为mjltest的元素的信息 的数组
      this.setState({
        id,
        title,
        scrollViewHeight:
          Taro.getSystemInfoSync().windowHeight -
          res.find(item => item.id === "search").height
      });
    });
    this.getAllImages(id);

    Taro.setNavigationBarTitle({
      title
    });
  }
  onPullDownRefresh() {
    // 下拉开始
    this.getAllImages(this.state.id);
  }
  getAllImages(id: string) {
    Taro.atMessage({
      message: "时光机加载中，请稍后！",
      type: "info"
    });
    const { timer, url } = this.state;
    clearInterval(timer);
    getImagesByAlbumID(id)
      .then(res => {
        if (res.data.photos === undefined) {
          this.setState({
            showReLogin: true
          });
          return false;
        }
        let photos = res.data.photos.map(photo => ({
          thumbUrl: photo.thumbUrl,
          url: photo.url,
          showClassName: true
        }));
        const loadData = lazyLoad({
          ...this.state.loadData,
          allArr: photos
        });
        this.setState({
          loadData,
          photos: loadData.loadArr,
          allPhotosUrl: photos.map(photo => `${url}${photo.url}`)
        });
        Taro.stopPullDownRefresh();
        Taro.atMessage({
          message: "欢迎来到刘家大院！",
          type: "success"
        });
      })
      .catch(err => {
        Taro.atMessage({
          message: `加载失败！${err}`,
          type: "error"
        });
      });
  }
  handleReLogin() {
    Taro.reLaunch({
      url: "/pages/index/index"
    });
  }
  handleClickImage(photo) {
    const { url } = this.state;
    Taro.previewImage({
      current: `${url}${photo.url}`, // 当前显示图片的http链接
      urls: this.state.allPhotosUrl // 需要预览的图片http链接列表
    });
  }
  onChangeSearch(value: string) {
    this.setState({
      value
    });
  }
  onActionClick() {}
  handleAddImage() {
    Taro.atMessage({
      message: "上传图片暂未制作！",
      type: "info"
    });
  }
  handleLoadMore() {
    const { loadData } = this.state;
    if (loadData.finished) {
      this.setState({
        status: "noMore"
      });
    } else {
      this.setState({
        photos: lazyLoad(loadData).loadArr
      });
    }
  }
  render() {
    const { photos, url, showReLogin, status, scrollViewHeight } = this.state;
    return (
      <View>
        <AtMessage />
        <View id="search">
          <AtSearchBar
            placeholder="后续添加搜索功能"
            actionName="搜索"
            value={this.state.value}
            onChange={this.onChangeSearch.bind(this)}
            onActionClick={this.onActionClick.bind(this)}
          />
        </View>
        <ScrollView
          scrollY={true}
          lowerThreshold={100}
          scrollWithAnimation={true}
          onScrollToLower={this.handleLoadMore.bind(this)}
          style={`height:${scrollViewHeight}px`}
        >
          <View className="at-row at-row--wrap">
            {photos.map((photo, index) => {
              return (
                <View
                  className="at-col galleryItems zoomInDown animated"
                  key={index}
                  onClick={this.handleClickImage.bind(this, photo)}
                >
                  <Image
                    mode="aspectFill"
                    style="width:100%;height:100%;"
                    src={`${url}${photo.thumbUrl}`}
                    lazyLoad
                  />
                </View>
              );
            })}
          </View>
          <AtLoadMore status={status} />
        </ScrollView>
        <View className="fab-box">
          <AtFab>
            <Text
              className="at-fab__icon at-icon at-icon-add-circle"
              onClick={this.handleAddImage.bind(this)}
            />
          </AtFab>
        </View>
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
