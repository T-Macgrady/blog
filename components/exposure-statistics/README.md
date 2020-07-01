# 曝光埋点组件

## Introduction

详见 Task - [曝光埋点事件逻辑优化](http://zentao.177suv.com:8010/zentao/task-view-15049.html)

- 整体而言，判断当前 item 是否处于可视化区域，是则上报，具体规则细分如下：

  - 某 item 初次进入可视化区域，进行上报（注：刷新会导致某 item 重新进入可视化区域，可正常上报）
  - 发生第一点后，某 item 一直处于可视化区域，不上报
  - 某 item 属于第二次进入可视化区域，进行上报，导致第二次进入场景情况包含如下：

    - 如从列表进入资讯详情页等其他页面后又返回原列表，上报
    - 在 app 列表页被用户放入手机后台，又从手机后台切回 app 列表页，上报
    - 同一个页面列表上下滑导致时而出现时而隐藏，这种情况下是，只要出现就正常上报

## Usage

- `json` 引入组件

```json
"usingComponents":{
	"exposure-reporter": "../iyourcar-components/components/exposure-statistics/exposure-statistics"
}
```

- `wxml` 添加该组件作为需要曝光节点的子节点

```html
<EXPOSURE-ITEM>
  <!-- some children nodes -->
  <child-nodes></child-nodes>
  <child-nodes></child-nodes>
  ...
  <!-- 曝光组件 -->
  <exposure-reporter
    statistics-id="{{11338}}"
    view="{{VIEW}}"
    args="{{ {gid: GID} }}"
    has-page-show="{{true}}"
    observer-margins="{{ {top: -NavBarHeight, bottom: -BottomBarHeight} }}"
  />
</EXPOSURE-ITEM>
```

- 设置需要曝光的节点属性 position 不为 static（曝光组件作为子节点需要绝对定位，使之与曝光 item 相同的占位以达到相同的曝光效果）

## API

埋点参数来源：[埋点后台管理系统 - 埋点系统 > 研发工作台 > 禅道需求](https://backend.suv666.com/iyourcar_data_platform/#/developer/workbench)

| 参数             | 说明                                                                                                                                                                                                                                                                      | 类型      | 默认值                                                    | 校验                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------- | ----------------------------------------- |
| statistics-id    | 埋点参数-埋点 id                                                                                                                                                                                                                                                          | `Number`  | -                                                         | -                                         |
| view             | 埋点参数-view                                                                                                                                                                                                                                                             | `Number`  | -                                                         | -                                         |
| args             | 埋点参数-args                                                                                                                                                                                                                                                             | `Object`  | {}                                                        | -                                         |
| has-page-show    | 组件在进入页面节点树时，页面 onShow 是否已执行，用于处理页面第二次 onShow 时重新监听上报；若曝光 item 没有 wx:if 或不需要等接口返回数据才显示的话，一般为 true；                                                                                                         | `Boolean` | true                                                     | 跳转下一页面后返回看是否正常曝光          |
| observer-margins | 用来扩展（或收缩）可视区域边界；注意一般为负值，即向内收缩！！默认只去除顶部 navbar 高度；参考: [IntersectionObserver.relativeToViewport(Object margins)接口文档](https://developers.weixin.qq.com/miniprogram/dev/api/wxml/IntersectionObserver.relativeToViewport.html) | `Object`  | { top: getNavBarHeight(), left: 0, right: 0, bottom: 0, } | 上下滚动页面 check 在可视区域边界时的曝光 |
