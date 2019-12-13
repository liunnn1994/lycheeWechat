import Taro, { Component, Config } from "@tarojs/taro";
import { View, Text, ScrollView } from "@tarojs/components";
import { AtButton, AtImagePicker, AtToast } from "taro-ui";
import { addPhoto } from "../../api/gallery";
import "./index.scss";

interface IProps {}
interface IState {
  id: string;
  isUploading: boolean;
  title: string;
  scrollViewHeight: number;
  step: number;
  errorCount: number;
  files: any[];
}

export default class AddPhotos extends Component<IProps, IState> {
  config: Config = {
    navigationBarTitleText: "上传图片"
  };
  static options = {
    addGlobalClass: true
  };
  constructor(props: IProps) {
    super(props);
    this.state = {
      id: "",
      isUploading: false,
      step: 0,
      errorCount: 0,
      title: "",
      scrollViewHeight: 0,
      files: []
    };
  }
  componentDidMount(): void {
    const { id, title } = this.$router.params;
    const query = Taro.createSelectorQuery();
    query.select("#bottom-fixed-btn").boundingClientRect();
    query.exec(res => {
      //res就是 所有标签为mjltest的元素的信息 的数组
      this.setState({
        id,
        title,
        scrollViewHeight:
          Taro.getSystemInfoSync().windowHeight -
          res.find(item => item.id === "bottom-fixed-btn").height
      });
    });

    Taro.setNavigationBarTitle({
      title: title + "-上传图片"
    });
  }
  handleChangeSelect(files) {
    this.setState({
      files
    });
  }
  onFail(mes) {
    Taro.atMessage({
      message: `选择图片出错！${mes}`,
      type: "error"
    });
  }
  handleUpload(
    file,
    id: string,
    files: any[],
    index: number = 0,
    errorCount: number = 0
  ) {
    files = files ? files : this.state.files;
    if (!this.state.isUploading) {
      this.setState({
        isUploading: true
      });
    }
    if (index > files.length - 1) {
      Taro.navigateBack();
      return false;
    }
    id = id ? id : this.state.id;
    this.setState({
      step: index,
      errorCount
    });
    addPhoto(id, files[index].url).then(res => {
      if (isNaN(Number(res.data))) {
        errorCount++;
      }
      this.handleUpload(file, id, files, index + 1, errorCount);
    });
  }
  render() {
    const {
      files,
      scrollViewHeight,
      isUploading,
      step,
      errorCount
    } = this.state;
    return (
      <View>
        <ScrollView
          scrollY={true}
          scrollWithAnimation={true}
          style={`height:${scrollViewHeight}px`}
        >
          <View>
            <AtImagePicker
              multiple
              mode="aspectFill"
              files={files}
              onChange={this.handleChangeSelect.bind(this)}
              onFail={this.onFail.bind(this)}
            />
          </View>
        </ScrollView>
        <View className="bottom-fixed-btn" id="bottom-fixed-btn">
          <AtButton type="primary" onClick={this.handleUpload.bind(this)}>
            <Text className="at-icon at-icon-upload" />
            上传图片({files.length})
          </AtButton>
        </View>
        <AtToast
          isOpened={isUploading}
          duration={0}
          text={`正在上传，成功${step - errorCount}，失败：${errorCount}(${(
            (step / files.length) *
            100
          ).toFixed(2)}%)`}
          status="loading"
        />
      </View>
    );
  }
}
