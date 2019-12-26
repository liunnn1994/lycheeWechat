"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const taro_1 = require("@tarojs/taro");
require("taro-ui/dist/style/index.scss");
const index_1 = require("./pages/index");
require("./css/animate.css");
require("./app.scss");
class App extends taro_1.Component {
    constructor() {
        super(...arguments);
        /**
         * 指定config的类型声明为: Taro.Config
         *
         * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
         * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
         * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
         */
        this.config = {
            pages: [
                "pages/index/index",
                "pages/gallery/index",
                "pages/galleryDetails/index",
                "pages/addPhotos/index"
            ],
            window: {
                backgroundTextStyle: "light",
                navigationBarBackgroundColor: "#fff",
                navigationBarTitleText: "WeChat",
                navigationBarTextStyle: "black"
            }
        };
    }
    componentDidMount() { }
    componentDidShow() { }
    componentDidHide() { }
    componentDidCatchError() { }
    // 在 App 类中的 render() 函数没有实际作用
    // 请勿修改此函数
    render() {
        return <index_1.default />;
    }
}
taro_1.default.render(<App />, document.getElementById("app"));
//# sourceMappingURL=app.jsx.map