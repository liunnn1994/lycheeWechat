import Taro, {Component, Config} from "@tarojs/taro";
import {ScrollView, View, Image, Button, Text} from "@tarojs/components";
import {
  AtMessage,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtModal,
  AtLoadMore,
  AtFab,
  AtTabBar,
  AtActionSheet,
  AtActionSheetItem
} from "taro-ui";
import {getImagesByAlbumID, delPhotos} from "../../api/gallery";
import {domain} from "../../api/urls";
import {lazyLoad} from "../../utils/public";
import "./index.scss";

interface IProps {
}

interface IState {
  id: string;
  showReLogin: boolean;
  isClose: boolean;
  isPre: boolean;
  showBottomTabBar: boolean;
  showDelSheet: boolean;
  title: string;
  status: "loading" | "noMore" | "more" | undefined;
  value: string;
  photos: any[];
  tabList: any[];
  allPhotosUrl: string[];
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
      showBottomTabBar: false,
      showDelSheet: false,
      isClose: true,
      isPre: false,
      scrollViewHeight: 0,
      title: "",
      status: "loading",
      value: "",
      url: domain,
      photos: [],
      allPhotosUrl: [],
      tabList: [
        {
          title: "取消选择",
          iconType: "close",
          actionType: "cancel",
          key: 0
        },
        {
          title: "删除",
          iconType: "trash",
          actionType: "del",
          text: "0",
          key: 1
        }
      ],
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
    const {id, title} = this.$router.params;
    this.setState({
      id,
      title,
      isClose: false,
      scrollViewHeight: Taro.getSystemInfoSync().windowHeight
    });
    this.getAllImages(id);

    Taro.setNavigationBarTitle({
      title
    });
  }

  onPullDownRefresh() {
    // 下拉开始
    this.getAllImages(this.state.id, true);
  }

  resetDate() {
    return new Promise(res => {
      this.setState({
        loadData: {
          allArr: [],
          loadArr: [],
          index: 0,
          long: 50,
          finished: false
        }
      }, () => {
        res(true)
      })
    })
  }

  async getAllImages(id: string, refresh: boolean = false) {
    if (refresh) {
      await this.resetDate();
      Taro.pageScrollTo({
        selector: "#galleryDetails",
        scrollTop: 0
      })
    }
    Taro.atMessage({
      message: "时光机加载中，请稍后！",
      type: "info"
    });
    const {url} = this.state;
    getImagesByAlbumID(id).then(res => {
      if (res.data.photos === undefined) {
        this.setState({
          showReLogin: true
        });
        return false;
      }
      let photos = [];
      if (res.data.photos !== false) {
        photos = res.data.photos.map(photo => ({
          thumbUrl: photo.thumbUrl,
          id: photo.id,
          url: photo.url,
          selected: false
        }));
      }
      let obj = {
        ...this.state.loadData,
        allArr: photos
      };
      const loadData = lazyLoad(obj);
      this.setState(
        {
          loadData,
          photos: loadData.loadArr,
          allPhotosUrl: photos.map(photo => `${url}${photo["url"]}`)
        },
        () => {
          this.handleLoadMore();
        }
      );
      Taro.stopPullDownRefresh();

      Taro.atMessage({
        message: "欢迎来到刘家大院！",
        type: "success"
      });
    });
  }

  componentDidShow(): void {
    const {isPre, isClose, id} = this.state;
    if (!isClose && !isPre) {
      this.getAllImages(id, true);
    }
    if (isPre) {
      this.setState({
        isPre: false
      });
    }
  }

  handleReLogin() {
    Taro.reLaunch({
      url: "/pages/index/index"
    });
  }

  handleClickImage(photo) {
    const {url, showBottomTabBar} = this.state;
    if (showBottomTabBar) {
      let photos = [...this.state.photos];
      let clickPhoto = photos.find(pt => pt.id === photo.id);
      clickPhoto.selected = !clickPhoto.selected;
      let selectedPhotos = photos.filter(photo => photo.selected);
      let tabList = [...this.state.tabList];
      tabList.find(tab => tab.actionType === "del").text =
        selectedPhotos.length;
      this.setState({
        tabList,
        photos
      });
    } else {
      this.setState({
        isPre: true
      });
      Taro.previewImage({
        current: `${url}${photo.url}`, // 当前显示图片的http链接
        urls: this.state.allPhotosUrl // 需要预览的图片http链接列表
      });
    }
  }

  handleLoadMore() {
    const {loadData} = this.state;
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

  handleAddAlbum() {
    const {id, title} = this.state;
    Taro.navigateTo({
      url: `/pages/addPhotos/index?id=${id}&title=${title}`
    });
  }

  handleClickTabBar(index: number) {
    const {tabList} = this.state;
    switch (tabList[index].actionType) {
      case "cancel":
        let {photos} = this.state;
        photos.forEach(photo => {
          photo.selected = false;
        });
        this.setState({
          photos
        });
        this.setState({
          showBottomTabBar: false
        });
        break;
      case "del":
        this.setState({
          showDelSheet: true
        });
        break;
    }
  }

  handleSelect(index: number) {
    let photos = [...this.state.photos];
    photos[index].selected = !photos[index].selected;
    let selectedPhotos = photos.filter(photo => photo.selected);
    let tabList = [...this.state.tabList];
    tabList.find(tab => tab.actionType === "del").text = selectedPhotos.length;
    this.setState({
      photos,
      showBottomTabBar: true,
      tabList
    });
  }

  delAllSelectPhotos() {
    delPhotos(
      String(
        this.state.photos.filter(photo => photo.selected).map(photo => photo.id)
      )
    ).then(res => {
      if (res.data) {
        Taro.atMessage({
          message: "删除成功！",
          type: "success"
        });
      } else {
        Taro.atMessage({
          message: "删除失败！",
          type: "error"
        });
      }
      this.getAllImages(this.state.id, true);
    });
    this.setState({
      showDelSheet: false,
      showBottomTabBar: false
    });
  }

  handleCloseSheet() {
    this.setState({
      showDelSheet: false
    });
  }

  render() {
    const {
      photos,
      url,
      showReLogin,
      status,
      scrollViewHeight,
      showBottomTabBar,
      tabList,
      showDelSheet
    } = this.state;
    return (
      <View>
        <AtMessage/>
        <ScrollView
          id="galleryDetails"
          scrollY={true}
          lowerThreshold={100}
          scrollWithAnimation={true}
          onScrollToLower={this.handleLoadMore.bind(this)}
          style={`height:${scrollViewHeight}px`}
        >
          <View className="at-row at-row--wrap">
            {photos.map((photo, index) => {
              const className = `at-col galleryItems zoomInDown animated ${
                photo.selected ? "selected" : ""
              }`;
              return (
                <View
                  className={className}
                  key={index}
                  onClick={this.handleClickImage.bind(this, photo)}
                  onLongPress={this.handleSelect.bind(this, index)}
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
          <AtLoadMore status={status}/>
        </ScrollView>
        <AtModal isOpened={showReLogin}>
          <AtModalHeader>提示</AtModalHeader>
          <AtModalContent>登录失效，请重新登录！</AtModalContent>
          <AtModalAction>
            <Button onClick={this.handleReLogin}>确定</Button>
          </AtModalAction>
        </AtModal>
        <View className="fab-box">
          <AtFab>
            <Text
              className="at-fab__icon at-icon at-icon-add-circle"
              onClick={this.handleAddAlbum.bind(this)}
            />
          </AtFab>
        </View>
        {showBottomTabBar ? (
          <AtTabBar
            fixed
            tabList={tabList}
            onClick={this.handleClickTabBar.bind(this)}
            current={-1}
          />
        ) : null}
        <AtActionSheet
          isOpened={showDelSheet}
          title="是否要删除所选照片？删除后不可恢复！"
          onClose={this.handleCloseSheet.bind(this)}
        >
          <AtActionSheetItem onClick={this.delAllSelectPhotos.bind(this)}>
            <Text style="color:red">删除照片</Text>
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    );
  }
}
