import Taro, { Component, Config } from "@tarojs/taro";
import { ScrollView, View, Image, Button } from "@tarojs/components";
import {
  AtLoadMore,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtInput
} from "taro-ui";
import { getImagesByAlbumID, getPublic } from "../../api/gallery";
import { domain } from "../../api/urls";
import "./index.scss";
import { message } from "../../utils/public";

interface IProps {}

interface IState {
  id: string;
  title: string;
  password: string;
  status: "noMore" | "more" | "loading" | undefined;
  scrollViewHeight: number;
  loadIndex: number;
  lock: boolean;
  allPhotos: any[];
  photos: any[];
}

export default class GalleryDetails extends Component<IProps, IState> {
  config: Config = {
    navigationBarTitleText: "相册",
    backgroundTextStyle: "dark",
    onReachBottomDistance: 150
  };
  static options = {
    addGlobalClass: true
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      id: "",
      title: "",
      password: "",
      status: "loading",
      scrollViewHeight: 0,
      loadIndex: 0,
      lock: false,
      allPhotos: [],
      photos: []
    };
  }

  componentDidMount() {
    const { id, title, lock } = this.$router.params;
    Taro.setNavigationBarTitle({
      title
    });
    this.setState(
      {
        id,
        title,
        scrollViewHeight: Taro.getSystemInfoSync().windowHeight,
        lock: lock === "true"
      },
      () => {
        if (lock !== "true") {
          this.getAllImages(id);
        }
      }
    );
  }

  async getAllImages(id: string, password = "") {
    getImagesByAlbumID(id, password).then(res => {
      let allPhotos = res.data.photos;
      if (!Array.isArray(allPhotos)) {
        allPhotos = [];
      }
      this.setState(
        {
          allPhotos: allPhotos.map(photo => ({
            id: photo.id,
            title: photo.title,
            thumbUrl: `${domain}${photo.thumbUrl}`,
            url: `${domain}${photo.url}`
          }))
        },
        () => {
          this.loadPhotos().then(() => {
            if (allPhotos.length <= 50) {
              this.setState({
                loadIndex: this.state.allPhotos.length,
                status: "noMore"
              });
            }
          });
        }
      );
    });
  }
  loadPhotos(index = 0) {
    return new Promise(resolve => {
      const { allPhotos, photos } = this.state;
      let loadIndex = index + 50;
      console.log(index);
      if (index > allPhotos.length) {
        resolve("finished");
        return;
      }
      if (index >= allPhotos.length - 50) {
        this.setState({
          loadIndex: this.state.allPhotos.length,
          status: "noMore"
        });
      }
      let newPhotos = [...photos, ...[...allPhotos].slice(index, loadIndex)];
      this.setState(
        {
          photos: newPhotos,
          loadIndex
        },
        () => {
          resolve(loadIndex);
        }
      );
    });
  }
  handleClickImage(current) {
    Taro.previewImage({
      current,
      urls: this.state.allPhotos.map(photo => photo.url)
    });
  }
  async handleLoadMore() {
    await this.loadPhotos(this.state.loadIndex);
  }
  handleChangePassword(password) {
    this.setState({
      password
    });
    return password;
  }
  handleConfirm() {
    const { id, password } = this.state;
    message("登陆中", "loading", 60000);
    getPublic(id, password).then(res => {
      console.log(res);
      if (res.data) {
        this.getAllImages(id, password);
        message("登陆成功", "success");
        this.setState({
          lock: false
        });
      } else {
        message("密码错误！", "none");
      }
    });
  }
  render() {
    const { status, scrollViewHeight, photos, lock } = this.state;
    return (
      <View>
        <ScrollView
          scrollY={true}
          lowerThreshold={100}
          scrollWithAnimation={true}
          onScrollToLower={this.handleLoadMore.bind(this)}
          style={`height:${scrollViewHeight}px`}
          enableBackToTop={true}
        >
          <View className="at-row at-row--wrap">
            {photos.map(photo => (
              <View
                onClick={this.handleClickImage.bind(this, photo.url)}
                className={`galleryItems`}
              >
                <Image
                  mode="aspectFill"
                  style="width:100%;height:100%;"
                  src={photo.thumbUrl}
                  lazyLoad
                />
              </View>
            ))}
          </View>
          <AtLoadMore status={status} />
        </ScrollView>
        <AtModal isOpened={lock}>
          <AtModalHeader>请输入相册密码</AtModalHeader>
          <AtModalContent>
            <AtInput
              name="value"
              title="密码"
              type="text"
              placeholder="请输入密码"
              value={this.state.password}
              onChange={this.handleChangePassword.bind(this)}
            />
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.handleConfirm}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}
