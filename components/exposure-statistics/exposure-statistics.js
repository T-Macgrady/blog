import { getNavBarHeight } from '../../utils/system';

const DomId = 'statistics-item';
Component({
  properties: {
    /**
     * 曝光埋点参数-埋点id
     */
    statisticsId: Number,
    /**
     * 曝光埋点参数-view
     */
    view: {
      type: Number,
      value: undefined,
    },
    /**
     * 曝光埋点参数-args
     */
    args: {
      type: Object,
      value: {},
    },
    /**
     * 组件在进入页面节点树时，页面onShow是否已执行，用于处理页面第二次onShow时重新监听上报
     */
    hasPageShow: {
      type: Boolean,
      value: true,
    },
    /**
     * 取消监听上报
     */
    cancelObserve: {
      type: Boolean,
      value: false,
    },
    /**
     * 立刻上报
     */
    reportImmediately: {
      type: Boolean,
      value: false,
    },
    /**
     * 曝光埋点参数对象-便于公共组件传递
     */
    exposureReporter: {
      type: Object,
      value: {},
    },
    /**
     * 用来扩展（或收缩）可视区域边界 - 默认去除顶部navbar高度，注意一般为负值，即向内收缩！！
     * IntersectionObserver.relativeToViewport(Object margins)
     * @link https://developers.weixin.qq.com/miniprogram/dev/api/wxml/IntersectionObserver.relativeToViewport.html
     */
    observerMargins: {
      type: Object,
      value: {
        top: -getNavBarHeight(),
        left: 0,
        right: 0,
        bottom: 0,
      },
    },
  },
  data: {
    DomId,
  },
  observers: {
    reportImmediately(newVal) {
      if (newVal && !this.viewHide && !this.pageHide) {
        this.report();
      }
    },
  },
  attached() {
    this.initData();
    this.exposureObserve();
  },
  detached() {
    this.disconnectObserver();
  },
  pageLifetimes: {
    /**
     * 非首次页面onShow，重新监听曝光再次上报
     */
    show() {
      this.pageHide = false;
      if (this.data.hasPageShow) {
        this.exposureObserve();
      } else {
        this.data.hasPageShow = true;
      }
    },
    hide() {
      this.pageHide = true;
    },
  },
  methods: {
    initData() {
      const {
        exposureReporter,
        exposureReporter: {
          statisticsId,
          hasPageShow,
          observerMargins,
          args,
          view,
          cancelObserve,
          reportImmediately,
        },
      } = this.data;
      if (exposureReporter) {
        this.setData({
          ...(statisticsId && { statisticsId }),
          ...(hasPageShow && { hasPageShow }),
          ...(observerMargins && { observerMargins }),
          ...(args && { args }),
          ...(view && { view }),
          ...(cancelObserve && { cancelObserve }),
          ...(reportImmediately && { reportImmediately }),
        });
      }
    },
    /**
     * 统计监听
     */
    exposureObserve() {
      this.disconnectObserver();
      this.observer =
        this.createIntersectionObserver() || wx.createIntersectionObserver();
      const { observerMargins } = this.data;
      this.observer
        .relativeToViewport(observerMargins)
        .observe(`#${DomId}`, ({ intersectionRatio }) => {
          this.viewHide = !intersectionRatio;
          if (intersectionRatio) {
            if (!this.data.cancelObserve && !this.pageHide) {
              this.report();
            }
          }
        });
    },
    /**
     * 埋点上报
     */
    report() {
      const { statisticsId, args, view } = this.data;
      getApp().globalData.reportExposure(statisticsId, Date.now(), args, view);
    },
    /**
     * 移除监听
     */
    disconnectObserver() {
      if (this.observer) {
        this.observer.disconnect();
      }
    },
  },
});
