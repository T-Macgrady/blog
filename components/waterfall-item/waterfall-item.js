/**
 * 瀑布流item
 */
import store from 'src/store';
import { C } from 'src/services/registerPage/index';
import { itemTypeToRedirect, isAd } from 'src/custom_components/news-item/tool';
import { getPanelData } from './tool';

C({
  properties: {
    item: Object,
  },
  data: {
    pageType: '',
    ycArgs: {},
    panel: {},
  },
  attached() {
    this.init();
  },
  methods: {
    init() {
      const {
        item,
        item: { gid, source_code, rank },
      } = this.data;
      const { pageType } = store.getState().newsState;

      this.setData({
        panel: getPanelData(item),
        ycArgs: {
          gid,
          page_type: pageType,
          rank,
          source_code,
        },
      });
    },
    goDetail(e) {
      this.itemRedirect(e);
      this.triggerEvent('onGoDetail', e);
    },
    onLongPress() {
      this._onFeedbackOpen();
    },
    /**
     * 兼容可视化埋点
     */
    _onFeedbackOpen() {
      const {
        item: { ref_recommend },
        ycArgs,
      } = this.data;
      if (!ref_recommend) return;
      const e = {
        currentTarget: {
          dataset: {
            feedbackData: { ...ref_recommend, yc_args: ycArgs },
            autoStatistics: ycArgs,
          },
        },
      };
      this.onFeedbackOpen(e);
    },
    onFeedbackOpen(e) {
      this.$emit('FEEDBACK_OPEN', e);
    },
    /**
     * item跳转
     * @param {Object} event 事件源
     */
    itemRedirect(event) {
      const e = event.detail.currentTarget ? event.detail : event;
      const { itemData } = e.currentTarget.dataset;
      let {
        item,
        panel: { redirectData },
      } = this.data;
      if (item.isAd) return;
      if (itemData) {
        item = itemData;
      }
      if (!item.redirect_type) {
        item = {
          ...item,
          ...itemTypeToRedirect(item.type, item.id, item.redirect_target),
        };
      }
      const { commentId } = e.currentTarget.dataset;
      const {
        redirect_type,
        redirect_target,
        redirect_target_applet,
        redirect_params,
      } = item;
      getApp().globalData.adRedirect({
        redirect_type,
        redirect_target,
        redirect_target_applet,
        redirect_params,
        ...(redirectData && redirectData),
        ...(commentId && {
          redirect_params: {
            commentId: -1,
          },
        }),
      });
    },
  },
});
