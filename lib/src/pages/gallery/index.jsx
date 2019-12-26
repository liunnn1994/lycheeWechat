"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line no-unused-vars
const taro_1 = require("@tarojs/taro");
const components_1 = require("@tarojs/components");
const taro_ui_1 = require("taro-ui");
const gallery_1 = require("../../api/gallery");
const base64Imgs_1 = require("../../static/base64Imgs");
const urls_1 = require("../../api/urls");
require("./index.scss");
const imageUrl = require("../../static/family.png");
class Gallery extends taro_1.Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line react/sort-comp
        this.config = {
            navigationBarTitleText: "相册",
            backgroundTextStyle: "dark",
            enablePullDownRefresh: true,
            onReachBottomDistance: 50
        };
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
            url: urls_1.domain,
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
        gallery_1.getAlbums().then(res => {
            if (res.data.albums === undefined) {
                this.setState({
                    showReLogin: true
                });
                return false;
            }
            let albums = res.data.albums.map(album => (Object.assign(Object.assign({}, album), { showClassName: false })));
            this.setState({
                fetchGalleryLoading: false,
                albums,
                albumsData: albums
            });
            taro_1.default.stopPullDownRefresh();
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
        });
    }
    handleClickAlbum(al) {
        taro_1.default.navigateTo({
            url: `/pages/galleryDetails/index?id=${al.id}&title=${al.title}`
        });
    }
    getNotice() {
        gallery_1.getNotice().then(res => {
            const { data } = res;
            if (!this.state.showNoticeAgain ||
                taro_1.default.getStorageSync("notice") !== data) {
                this.setState({
                    showNotice: data !== "",
                    notice: data,
                    showNoticeAgain: false
                });
            }
            taro_1.default.setStorageSync("notice", data);
        });
    }
    message(message, type = "info") {
        taro_1.default.atMessage({
            message,
            type
        });
    }
    handleCreateAlbum(bool) {
        if (bool) {
            const { newAlbumName } = this.state;
            if (newAlbumName === "") {
                this.message("相册名不能为空！", "error");
            }
            else {
                this.message("新建相册中，请稍后。");
                gallery_1.addAlbum(newAlbumName).then(() => {
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
    onChangeSearch(value) {
        const albumsData = JSON.parse(JSON.stringify(this.state.albumsData));
        let albums = [];
        if (value === "") {
            albums = albumsData;
        }
        else {
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
        taro_1.default.reLaunch({
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
        }
        else if (e.action === "rename") {
            this.setState({
                renameAlbum: true,
                newAlbumName: this.state.albumsData[actionIndex].title
            });
        }
    }
    renameAlbum(val) {
        if (val) {
            const { actionIndex, albumsData, newAlbumName } = this.state;
            gallery_1.renameAlbums(albumsData[actionIndex].id, newAlbumName).then(res => {
                if (res.data === true) {
                    this.message("重命名成功！", "success");
                    this.loadGallery();
                }
                else {
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
            gallery_1.delAlbums(albumsData[actionIndex].id).then(res => {
                if (res.data === true) {
                    this.message("删除成功！", "success");
                    this.loadGallery();
                }
                else {
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
        taro_1.default.setStorageSync("showNoticeAgain", val);
    }
    handleCloseToast(key) {
        let obj = {};
        obj[key] = false;
        this.setState(obj);
    }
    onShareAppMessage() {
        return {
            title: "欢迎光临刘家大宅院",
            path: "/page/index/index",
            imageUrl
        };
    }
    componentWillMount() {
        this.setState({
            showNoticeAgain: taro_1.default.getStorageSync("showNoticeAgain")
        });
    }
    componentDidMount() {
        this.getNotice();
        this.loadGallery();
    }
    render() {
        const { fetchGalleryLoading, albums, url, showReLogin, showCreateAlbum, newAlbumName, swipeActionOptions, confirmDelAlbum, renameAlbum, showNotice, notice } = this.state;
        return (<components_1.View>
        <taro_ui_1.AtMessage />
        <taro_ui_1.AtSearchBar placeholder="搜索相册名称" actionName="搜索" value={this.state.value} onChange={this.onChangeSearch.bind(this)} onActionClick={this.onActionClick.bind(this)}/>
        <taro_ui_1.AtList>
          {albums.map((al, index) => {
            const sysdate = new Date(al.sysdate);
            return (<taro_ui_1.AtSwipeAction onClick={this.handleClickAction.bind(this, index)} options={swipeActionOptions}>
                <taro_ui_1.AtListItem className={al.showClassName ? "slideInLeft animated" : "opt0"} title={al.title} note={`创建时间：${sysdate.getFullYear()} 年 ${sysdate.getMonth() +
                1} 月`} extraText="查看相册" arrow="right" thumb={al.thumbs.length ? url + al.thumbs[0] : base64Imgs_1.familyGIF} key={index} onClick={this.handleClickAlbum.bind(this, al)}/>
              </taro_ui_1.AtSwipeAction>);
        })}
        </taro_ui_1.AtList>
        <components_1.View className="fab-box">
          <taro_ui_1.AtFab>
            <components_1.Text className="at-fab__icon at-icon at-icon-add-circle" onClick={this.handleAddAlbum.bind(this)}/>
          </taro_ui_1.AtFab>
        </components_1.View>
        <taro_ui_1.AtToast duration={0} hasMask isOpened={fetchGalleryLoading} text="相册加载中" status="loading" onClose={this.handleCloseToast.bind(this, "fetchGalleryLoading")}/>
        <taro_ui_1.AtModal isOpened={showReLogin}>
          <taro_ui_1.AtModalHeader>提示</taro_ui_1.AtModalHeader>
          <taro_ui_1.AtModalContent>登录失效，请重新登录！</taro_ui_1.AtModalContent>
          <taro_ui_1.AtModalAction>
            <components_1.Button onClick={this.handleReLogin}>确定</components_1.Button>
          </taro_ui_1.AtModalAction>
        </taro_ui_1.AtModal>
        <taro_ui_1.AtModal isOpened={showCreateAlbum}>
          <taro_ui_1.AtModalHeader>新建相册</taro_ui_1.AtModalHeader>
          <taro_ui_1.AtModalContent>
            <taro_ui_1.AtInput name="value" title="相册名称" type="text" placeholder="请输入相册名称" value={newAlbumName} onChange={this.handleChangeAlbumName.bind(this)}/>
          </taro_ui_1.AtModalContent>
          <taro_ui_1.AtModalAction>
            <components_1.Button onClick={this.handleCreateAlbum.bind(this, false)}>
              取消
            </components_1.Button>
            <components_1.Button onClick={this.handleCreateAlbum.bind(this, true)}>
              确定
            </components_1.Button>
          </taro_ui_1.AtModalAction>
        </taro_ui_1.AtModal>
        <taro_ui_1.AtModal isOpened={confirmDelAlbum}>
          <taro_ui_1.AtModalHeader>警告！</taro_ui_1.AtModalHeader>
          <taro_ui_1.AtModalContent>
            是否删除相册？此操作同时会删除相册中的照片，删除操作不可逆！
          </taro_ui_1.AtModalContent>
          <taro_ui_1.AtModalAction>
            <components_1.Button onClick={this.delAlbum.bind(this, false)}>取消</components_1.Button>
            <components_1.Button onClick={this.delAlbum.bind(this, true)}>
              确定（无法恢复）
            </components_1.Button>
          </taro_ui_1.AtModalAction>
        </taro_ui_1.AtModal>
        <taro_ui_1.AtModal isOpened={renameAlbum}>
          <taro_ui_1.AtModalHeader>重命名</taro_ui_1.AtModalHeader>
          <taro_ui_1.AtModalContent>
            <taro_ui_1.AtInput name="value" title="相册名称" type="text" placeholder="请输入相册名称" value={newAlbumName} onChange={this.handleChangeAlbumName.bind(this)}/>
          </taro_ui_1.AtModalContent>
          <taro_ui_1.AtModalAction>
            <components_1.Button onClick={this.renameAlbum.bind(this, false)}>取消</components_1.Button>
            <components_1.Button onClick={this.renameAlbum.bind(this, true)}>重命名</components_1.Button>
          </taro_ui_1.AtModalAction>
        </taro_ui_1.AtModal>
        <taro_ui_1.AtModal isOpened={showNotice}>
          <taro_ui_1.AtModalHeader>通知</taro_ui_1.AtModalHeader>
          <taro_ui_1.AtModalContent>
            <components_1.Text>{notice}</components_1.Text>
          </taro_ui_1.AtModalContent>
          <taro_ui_1.AtModalAction>
            <components_1.Button onClick={this.closeNotice.bind(this, true)}>
              有新消息前不再提示
            </components_1.Button>
            <components_1.Button onClick={this.closeNotice.bind(this, false)}>关闭</components_1.Button>
          </taro_ui_1.AtModalAction>
        </taro_ui_1.AtModal>
      </components_1.View>);
    }
}
exports.default = Gallery;
Gallery.options = {
    addGlobalClass: true
};
//# sourceMappingURL=index.jsx.map