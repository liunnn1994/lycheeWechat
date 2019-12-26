"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const taro_ui_1 = require("taro-ui");
const gallery_1 = require("../../api/gallery");
require("./index.scss");
class AddPhotos extends taro_1.Component {
    constructor(props) {
        super(props);
        this.config = {
            navigationBarTitleText: "上传图片"
        };
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
    componentDidMount() {
        const { id, title } = this.$router.params;
        const query = taro_1.default.createSelectorQuery();
        query.select("#bottom-fixed-btn").boundingClientRect();
        query.exec(res => {
            //res就是 所有标签为mjltest的元素的信息 的数组
            this.setState({
                id,
                title,
                scrollViewHeight: taro_1.default.getSystemInfoSync().windowHeight -
                    res.find(item => item.id === "bottom-fixed-btn").height
            });
        });
        taro_1.default.setNavigationBarTitle({
            title: title + "-上传图片"
        });
    }
    handleChangeSelect(files) {
        this.setState({
            files
        });
    }
    onFail(mes) {
        taro_1.default.atMessage({
            message: `选择图片出错！${mes}`,
            type: "error"
        });
    }
    handleUpload(file, id, files, index = 0, errorCount = 0) {
        files = files ? files : this.state.files;
        if (!this.state.isUploading) {
            this.setState({
                isUploading: true
            });
        }
        if (index > files.length - 1) {
            taro_1.default.navigateBack();
            return false;
        }
        id = id ? id : this.state.id;
        this.setState({
            step: index,
            errorCount
        });
        gallery_1.addPhoto(id, files[index].url).then(res => {
            if (isNaN(Number(res.data))) {
                errorCount++;
            }
            this.handleUpload(file, id, files, index + 1, errorCount);
        });
    }
    handleCloseToast(key) {
        let obj = {};
        obj[key] = false;
        this.setState(obj);
    }
    render() {
        const { files, scrollViewHeight, isUploading, step, errorCount } = this.state;
        return (<components_1.View>
        <components_1.ScrollView scrollY={true} scrollWithAnimation={true} style={`height:${scrollViewHeight}px`}>
          <components_1.View>
            <taro_ui_1.AtImagePicker multiple mode="aspectFill" files={files} onChange={this.handleChangeSelect.bind(this)} onFail={this.onFail.bind(this)}/>
          </components_1.View>
        </components_1.ScrollView>
        <components_1.View className="bottom-fixed-btn" id="bottom-fixed-btn">
          <taro_ui_1.AtButton type="primary" onClick={this.handleUpload.bind(this)}>
            <components_1.Text className="at-icon at-icon-upload"/>
            上传图片({files.length})
          </taro_ui_1.AtButton>
        </components_1.View>
        <taro_ui_1.AtToast isOpened={isUploading} duration={0} text={`正在上传，成功${step - errorCount}，失败：${errorCount}(${((step / files.length) *
            100).toFixed(2)}%)`} status="loading" onClose={this.handleCloseToast.bind(this, "isUploading")}/>
      </components_1.View>);
    }
}
exports.default = AddPhotos;
AddPhotos.options = {
    addGlobalClass: true
};
//# sourceMappingURL=index.jsx.map