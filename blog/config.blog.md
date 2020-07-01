## 业务代码中的配置化

工作中有许多逻辑冗杂、迭代频繁的业务代码，随着迭代将越来越难以维护，一些场景适合通过配置化的方式来处理便于维护。

### 一、什么是业务代码配置化？

根据业务场景使用配置化的 `Object|Array|Map` 处理条件判断逻辑，通常需要配置文件 `CONFIG.js`，若逻辑复杂需添加 `getConfig` 的处理函数 - `tool.js`

- 本质上 if/else 逻辑是一种状态匹配

- 表驱动法，使用表数据，存储对应的状态处理

- 可读性好，减少了繁杂嵌套的 `if-else`，读取配置，逻辑更清晰

- 可维护性高，逻辑分支的增删只是 `CONFIG` 的增删

### 二、如何在业务场景中进行代码配置化？

#### 1. 简单的状态映射

- 按需使用 `Object|Map` 配置

##### 单一条件

- Object 形式:

```javascript
// CONFIG.JS
  export const STATUS = {
    STUDENT: 0,
    TEACHER: 1,
    MA_NONG: 2,
  };
  export const WORK_MAP = {
    STATUS.STUDENT: '学生',
    STATUS.TEACHER: '老师',
    STATUS.MA_NONG: '码农',
  };

// index.js
  this.setData({
    work: WORK_MAP[status],
  });

  axios.post(url, { status: STATUS.MA_NONG });
```

- Map 形式：

```javascript
// CONFIG.JS
export const WORK_MAP = new Map([
  [0, "学生"],
  [1, "老師"],
  [2, "码农"],
]);
// index.js
this.setData({
  work: WORK_MAP.get(status),
});
```

##### 多重条件

```javascript
const config = new Map([
  [
    (condition0, condition1, condition2) =>
      condition0 && condition1 && condition2,
    () => {
      console.log("map0");
    },
  ],
  [
    (condition0, condition1, condition2) =>
      condition0 || condition1 || condition2,
    () => {
      console.log("map1");
    },
  ],
]);
config.forEach((action, _if) => _if(0, 1, 0) && action());
```

#### 2. 每个状态有多种属性

- 多个属性
- 使用 `Array` 配置

```javascript
// CONFIG.JS
  export const CONFIG = [
    {
      status: STATUS.STUDENT,
      name: '学生',
      action: '谈恋爱',
    },
    {
      status: STATUS.TEACHER,
      name: '老师',
      action: '教书',
    },
    {
      status: STATUS.MA_NONG,
      name: '码农',
      action: '写bug',
    },
  ];

// index.js
  <!-- 根据状态不同的行为 -->
  function action(status) {
    const { name, work } = CONFIG.find(i => i.status === status);
    console.log(`${name}在${action}`);
  }
```

#### 3. 每个状态有多种属性且参数定制化

- 参数高度定制化，不同状态需要适配接口不同的字段
- 使用 `Array` 配置
- 通过配置函数并传参注入接口数据可满足定制化需求

```javascript
// CONFIG.JS
  export const CONFIG = [
    {
      status: STATUS.STUDENT,
      name: '学生',
      action: () => {
        console.log('学生的工作是谈恋爱');
      },
    },
    {
      status: STATUS.TEACHER,
      name: '老师',
      action: (info) => {
        alert(`老师${info.age}岁，每天${info.action}`);
      },
    },
    {
      status: STATUS.MA_NONG,
      name: '码农',
      action: (info) => {
        toast(`码农工作${info.workTime}年了，头发仅剩${info.hair}根了`);
      },
    },
  ];

// index.js
  <!-- 根据接口状态action -->
  function action(res) {
    const { action, info } = CONFIG.find(i => i.status === res.status);
    action && action(info); // 传参定制化
  }
```

### 三、实例

大首页瀑布流 item 样式

- 根据 list 接口下发的 item 的类型(`type`)&样式(`layout`)字段取 item 中的封面、标题、标签、头像...，字段各不相同
- 十几种 item 类型，有的还有不同的 `layout`，item 数据下发方式不同
- 公共组件，需要适配其他模块的接口数据作展示

![
瀑布流item](https://img.suv666.com/test/20200624150811_GGvX7iGu.png)

#### index.xml

- 数据驱动，减少模板中的判断逻辑

```xml
<view class="panel" bind:tap="goDetail">
  <!-- 封面 -->
  <image  wx:if="{{panel.cover}}" class="panel__cover" src="{{panel.cover.image}}">
      <view class="panel__tag {{panel.tagClass}}" wx:if="{{panel.tagClass}}">{{panel.tag}}</view>
  </image>
  <!-- 标题 -->
  <view class="panel__title" wx:if="{{panel.title}}">{{panel.title}}</view>
  <!-- footer -->
  <view class="panel__footer" wx:if="{{panel.showFooter}}">
    <image class="panel__footer-icon" wx:if="{{panel.user.icon}}" src="{{panel.user.icon}}"></image>
    <text class="panel__footer-name" wx:if="{{panel.user.nickname}}">{{panel.user.nickname}}</text>
    <text class="panel__footer-comment" wx:if="{{panel.commentCount}}">{{panel.commentCount}}评论</text>
  </view>
</view>
```

##### index.js

```javascript
import { getPanelData } from "./tool";
Component({
  properties: {
    item: Object,
  },
  attached() {
    this.setData({
      panel: getPanelData(this.data.item),
    });
  },
});
```

#### tool.js

```javascript
import { CONFIG, DEFAULT } from "./CONFIG";
// 获取瀑布流item数据
export const getPanelData = (item) => {
  const getConfigByTypeAndLayout = () => {
    let config = CONFIG.find((i) => i.type == item.type);
    if (config && config.layouts) {
      config = config.layouts.find((i) => i.layout === item.layout_type);
    }
    return config || DEFAULT;
  };
  const getPanelDataByConfig = (
    c,
    _item = c.itemWrap ? c.itemWrap(item) : item
  ) => {
    const panel = {};
    Object.keys(c).forEach((key) => {
      if (typeof c[key] === "function") {
        panel[key] = c[key](_item);
      } else {
        panel[key] = c[key];
      }
    });
    return panel;
  };
  // 根据item的类型、样式获取配置
  const config = getConfigByTypeAndLayout(item);
  // 根据配置获取瀑布流item信息
  return getPanelDataByConfig(config);
};
```

#### CONFIG.js

```javascript
import { Layout, NewsType, Redirect } from 'src/constant';
import { formatImage, formatUser } from './tool';

/**
 * 配置项
 * @param {String} title 标题
 * @param {String} cover 封面
 * @param {String} tag 标签
 * @param {Object} user 用户信息
 * @param {Boolean} showFooter 是否显示footer
 * @param {Boolean} isAd 是否广告
 * @param {Function} itemWrap 兼容接口数据函数，数据可能以ref_xxx下发，比如帖子：ref_post
 * ......
 */

<!-- 默认配置项 -->
export const DEFAULT = {
  title: ({ title = '' }) => title,
  cover: ({ image_list = [], article_images = [] }) =>
    formatImage(image_list[0]) || formatImage(article_images[0]),
  showFooter: true,
  user: ({ user, user_account, article_source_tx = '' }) =>
    user
      ? formatUser(user)
      : user_account
      ? formatUser(user_account)
      : {
          icon: '',
          nickname: article_source_tx,
        },
};

export const CONFIG = [
  {
    type: NewsType.NEWS,
    ...DEFAULT,
    tag: '资讯',
    tagClass: 'news',
  },
  {
    type: NewsType.VIDEO,
    ...DEFAULT,
    tag: '视频',
    video: ({ video_url = '', tencent_vid = '', image_gif_list = [] }) => ({
      hasVideo: true,
      src: tencent_vid || video_url,
      gifCover: formatImage(image_gif_list[0]),
    }),
  },
  {
    type: Redirect.EVAL_DETAIL,
    layouts: [
      {
        layout: Layout.EVALUATION,
        ...DEFAULT,
        tag: '口碑',
      },
      {
        layout: Layout.PRAISE_COMPONENT,
        ...DEFAULT,
        itemWrap: ({ ref_car_score = {} }) => ref_car_score,
        cover: ({ images = [], recommend_images = [] }) =>
          formatImage(images[0]) ||
          formatImage(getCoverFromRecommendImages(recommend_images)),
      },
    ],
  },
  ......
];
```

### 四、结语

所以，业务代码配置化很简单，大家也都一直在用，只是如果在一些业务场景中都形成配置化的习惯或者共识，可能更好维护吧。

---
