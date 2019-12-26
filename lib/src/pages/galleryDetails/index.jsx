"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const taro_ui_1 = require("taro-ui");
const gallery_1 = require("../../api/gallery");
const urls_1 = require("../../api/urls");
const public_1 = require("../../utils/public");
require("./index.scss");
class GalleryDetails extends taro_1.Component {
    constructor(props) {
        super(props);
        this.config = {
            navigationBarTitleText: "相册",
            backgroundTextStyle: "dark",
            enablePullDownRefresh: true,
            onReachBottomDistance: 150
        };
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
            url: urls_1.domain,
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
        const { id, title } = this.$router.params;
        this.setState({
            id,
            title,
            isClose: false,
            scrollViewHeight: taro_1.default.getSystemInfoSync().windowHeight
        });
        this.getAllImages(id);
        taro_1.default.setNavigationBarTitle({
            title
        });
    }
    onPullDownRefresh() {
        // 下拉开始
        this.getAllImages(this.state.id, true);
    }
    getAllImages(id, refresh = false) {
        taro_1.default.atMessage({
            message: "时光机加载中，请稍后！",
            type: "info"
        });
        const { url } = this.state;
        gallery_1.getImagesByAlbumID(id).then(res => {
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
            let obj = Object.assign(Object.assign({}, this.state.loadData), { allArr: photos });
            if (refresh) {
                obj.loadArr = [];
            }
            const loadData = public_1.lazyLoad(obj);
            this.setState({
                loadData,
                photos: loadData.loadArr,
                allPhotosUrl: photos.map(photo => `${url}${photo["url"]}`)
            }, () => {
                this.handleLoadMore();
            });
            taro_1.default.stopPullDownRefresh();
            taro_1.default.atMessage({
                message: "欢迎来到刘家大院！",
                type: "success"
            });
        });
    }
    componentDidShow() {
        const { isPre, isClose, id } = this.state;
        console.log("show");
        if (!isClose && !isPre) {
            console.log("all");
            this.getAllImages(id, true);
        }
        if (isPre) {
            this.setState({
                isPre: false
            });
        }
    }
    handleReLogin() {
        taro_1.default.reLaunch({
            url: "/pages/index/index"
        });
    }
    handleClickImage(photo) {
        const { url, showBottomTabBar } = this.state;
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
        }
        else {
            this.setState({
                isPre: true
            });
            taro_1.default.previewImage({
                current: `${url}${photo.url}`,
                urls: this.state.allPhotosUrl // 需要预览的图片http链接列表
            });
        }
    }
    handleLoadMore() {
        const { loadData } = this.state;
        if (loadData.finished) {
            this.setState({
                status: "noMore"
            });
        }
        else {
            this.setState({
                photos: public_1.lazyLoad(loadData).loadArr
            });
        }
    }
    handleAddAlbum() {
        const { id, title } = this.state;
        taro_1.default.navigateTo({
            url: `/pages/addPhotos/index?id=${id}&title=${title}`
        });
    }
    handleClickTabBar(index) {
        const { tabList } = this.state;
        switch (tabList[index].actionType) {
            case "cancel":
                let { photos } = this.state;
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
    handleSelect(index) {
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
        gallery_1.delPhotos(String(this.state.photos.filter(photo => photo.selected).map(photo => photo.id))).then(res => {
            if (res.data) {
                taro_1.default.atMessage({
                    message: "删除成功！",
                    type: "success"
                });
            }
            else {
                taro_1.default.atMessage({
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
        const { photos, url, showReLogin, status, scrollViewHeight, showBottomTabBar, tabList, showDelSheet } = this.state;
        return (<components_1.View>
        <taro_ui_1.AtMessage />
        <components_1.ScrollView scrollY={true} lowerThreshold={100} scrollWithAnimation={true} onScrollToLower={this.handleLoadMore.bind(this)} style={`height:${scrollViewHeight}px`}>
          <components_1.View className="at-row at-row--wrap">
            {photos.map((photo, index) => {
            const className = `at-col galleryItems zoomInDown animated ${photo.selected ? "selected" : ""}`;
            return (<components_1.View className={className} key={index} onClick={this.handleClickImage.bind(this, photo)} onLongPress={this.handleSelect.bind(this, index)}>
                  <components_1.Image mode="aspectFill" style="width:100%;height:100%;" src={`${url}${photo.thumbUrl}`} lazyLoad/>
                </components_1.View>);
        })}
          </components_1.View>
          <taro_ui_1.AtLoadMore status={status}/>
        </components_1.ScrollView>
        <taro_ui_1.AtModal isOpened={showReLogin}>
          <taro_ui_1.AtModalHeader>提示</taro_ui_1.AtModalHeader>
          <taro_ui_1.AtModalContent>登录失效，请重新登录！</taro_ui_1.AtModalContent>
          <taro_ui_1.AtModalAction>
            <components_1.Button onClick={this.handleReLogin}>确定</components_1.Button>
          </taro_ui_1.AtModalAction>
        </taro_ui_1.AtModal>
        <components_1.View className="fab-box">
          <taro_ui_1.AtFab>
            <components_1.Text className="at-fab__icon at-icon at-icon-add-circle" onClick={this.handleAddAlbum.bind(this)}/>
          </taro_ui_1.AtFab>
        </components_1.View>
        {showBottomTabBar ? (<taro_ui_1.AtTabBar fixed tabList={tabList} onClick={this.handleClickTabBar.bind(this)} current={-1}/>) : null}
        <taro_ui_1.AtActionSheet isOpened={showDelSheet} title="是否要删除所选照片？删除后不可恢复！" onClose={this.handleCloseSheet.bind(this)}>
          <taro_ui_1.AtActionSheetItem onClick={this.delAllSelectPhotos.bind(this)}>
            <components_1.Text style="color:red">删除照片</components_1.Text>
          </taro_ui_1.AtActionSheetItem>
        </taro_ui_1.AtActionSheet>
      </components_1.View>);
    }
}
exports.default = GalleryDetails;
GalleryDetails.options = {
    addGlobalClass: true
};
//# sourceMappingURL=index.jsx.map