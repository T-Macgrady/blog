/* eslint-disable no-nested-ternary */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-confusing-arrow */
import { Layout, NewsType, Redirect } from 'src/constant';
import { AD_DISPLAY_STYLE } from 'src/constant/news';
import { DISPLAY_TYPE } from 'src/utils/enum';
import { formatImage, formatUser, getCoverFromRecommendImages } from './tool';

export const DEFAULT = {
  title: ({ title = '' }) => title,
  cover: ({ image_list = [], article_images = [] }) =>
    formatImage(image_list[0]) || formatImage(article_images[0]),
  commentCount: ({ comments_count }) => comments_count,
  hotComment: ({ best_comment = null }) => best_comment,
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

// type-304(帖子)__layout-20(帖子组件样式)__display_type-2(新版高级贴)-cover(封面获取)
const ADVANCE_POST_COMPONENT_CONFIG_COVER = ({
  has_video,
  has_live_post_video,
  cover = '',
  cover_width = '',
  cover_height = '',
  cover_gif = '',
  cover_gif_width = '',
  cover_gif_height = '',
  live_post_video_image = '',
  images = [],
  recommend_images = [],
}) => {
  // 由于gif模糊暂时取消该逻辑
  // if ((has_video || has_live_post_video) && cover_gif) {
  //   return formatImage({
  //     image: cover_gif,
  //     width: cover_gif_width,
  //     height: cover_gif_height,
  //   });
  // }
  if (cover) {
    return formatImage({
      image: cover,
      width: cover_width,
      height: cover_height,
    });
  }
  const image =
    live_post_video_image ||
    (images[0] ? images[0].image_original : '') ||
    getCoverFromRecommendImages(recommend_images);
  return formatImage(image);
};

// type-304(帖子)__layout-20(帖子组件样式)__display_type-3(旧版高级贴)-cover(封面获取)   同小视频贴
const OLD_POST_COMPONENT_CONFIG_COVER = ({
  has_video,
  has_live_post_video,
  cover = '',
  cover_width = '',
  cover_height = '',
  cover_gif = '',
  cover_gif_width = '',
  cover_gif_height = '',
  video_image = '',
}) => {
  // if ((has_video || has_live_post_video) && cover_gif) {
  //   return formatImage({
  //     image: cover_gif,
  //     width: cover_gif_width,
  //     height: cover_gif_height,
  //   });
  // }
  if (cover) {
    return formatImage({
      image: cover,
      width: cover_width,
      height: cover_height,
    });
  }
  return formatImage(video_image);
};

// 小视频-cover(封面获取)
const SMALL_VIDEO_CONFIG_COVER = ({
  has_video,
  has_live_post_video,
  cover = '',
  cover_width = '',
  cover_height = '',
  cover_gif = '',
  cover_gif_width = '',
  cover_gif_height = '',
  video_image = '',
}) => {
  if ((has_video || has_live_post_video) && cover_gif) {
    return formatImage({
      image: cover_gif,
      width: cover_gif_width,
      height: cover_gif_height,
    });
  }
  if (cover) {
    return formatImage({
      image: cover,
      width: cover_width,
      height: cover_height,
    });
  }
  return formatImage(video_image);
};

// type-304(帖子)__layout-20(帖子组件样式) 配置
const POST_COMPONENT_CONFIG = {
  layout: Layout.POST_COMPONENT,
  ...DEFAULT,
  itemWrap: ({ ref_post = {} }) => ref_post,
  tag: '',
  tagClass: ({ has_video, has_live_post_video }) =>
    has_video || has_live_post_video ? 'video' : '',
  cover: (item) =>
    item.display_type === DISPLAY_TYPE.WXPARSE
      ? OLD_POST_COMPONENT_CONFIG_COVER(item) // 默认新版高级贴
      : ADVANCE_POST_COMPONENT_CONFIG_COVER(item),
  title: ({ chosen_topic = '', topic = '', content = '' }) =>
    chosen_topic || topic || content,
  commentCount: ({ follow_count = {} }) => follow_count,
  video: ({
    has_video,
    has_live_post_video,
    video_url = '',
    cover_gif = '',
    cover_gif_width = '',
    cover_gif_height = '',
  }) => ({
    hasVideo: has_video || has_live_post_video,
    src: video_url,
    gifCover: formatImage({
      image: cover_gif,
      width: cover_gif_width,
      height: cover_gif_height,
    }),
  }),
};

// 广告item配置
export const AD_CONFIG = {
  isAd: true,
  layouts: [
    {
      layout: AD_DISPLAY_STYLE.NEWS_INFO.BANNER,
      hidden: true,
    },
    {
      layout: AD_DISPLAY_STYLE.NEWS_INFO.IMAGE_TEXT,
      hidden: true,
    },
    {
      layout: AD_DISPLAY_STYLE.NEWS_INFO.BIG_IMAGE,
      hidden: true,
    },
    {
      layout: AD_DISPLAY_STYLE.WATERFALL.IMAGE_TEXT,
      ...DEFAULT,
      cover: ({ display_url }) => ({
        image: getApp().globalData.wCommand(display_url, '690x'),
        width: 354,
        height: 266,
      }),
      title: ({ content = '' }) => content,
      user: ({ sub_content = '', sub_display_url }) =>
        formatUser({
          icon: sub_display_url,
          nickname: sub_content,
        }),
      showFooter: ({ sub_content = '', sub_display_url }) => sub_content || sub_display_url,
      isAd: true,
      noExposure: true,
      tag: '广告',
      tagClass: (i) => (i.is_ad ? 'ad' : ''),
    },
    {
      layout: AD_DISPLAY_STYLE.WATERFALL.IMAGE,
      ...DEFAULT,
      cover: ({ display_url }) => ({
        image: getApp().globalData.wCommand(display_url, '690x'),
        width: 354,
        height: 472,
      }),
      title: null,
      showFooter: false,
      isAd: true,
      noExposure: true,
      tag: '广告',
      tagClass: (i) => (i.is_ad ? 'ad' : ''),
    },
  ],
};

export const CONFIG = [
  {
    type: NewsType.NEWS,
    ...DEFAULT,
    tag: '资讯',
    tagClass: 'news',
    // user: ({ user_account: user = {} }) => user,
  },
  {
    type: NewsType.VIDEO,
    ...DEFAULT,
    tag: '',
    tagClass: 'video',
    cover: ({ image_gif_list = [], image_list = [] }) => formatImage(image_gif_list[0] || image_list[0]),
    video: ({ video_url = '', tencent_vid = '', image_gif_list = [] }) => ({
      hasVideo: true,
      src: tencent_vid || video_url,
      video_url,
      tencent_vid,
      gifCover: formatImage(image_gif_list[0]),
    }),
  },
  {
    type: Redirect.POST,
    layouts: [
      POST_COMPONENT_CONFIG,
      {
        layout: Layout.POST,
        ...DEFAULT,
      },
      {
        layout: Layout.LIVE,
        ...DEFAULT,
      },
      {
        layout: Layout.NORMAL,
        ...DEFAULT,
      },
    ],
  },
  {
    type: Redirect.SMALL_VIDEO,
    ...POST_COMPONENT_CONFIG,
    cover: SMALL_VIDEO_CONFIG_COVER,
    title: ({ content = '', topic = '' }) => content || topic,
  },
  {
    type: Redirect.EVAL_DETAIL,
    layouts: [
      {
        layout: Layout.EVALUATION,
        ...DEFAULT,
        tag: '口碑',
        tagClass: 'praise',
      },
      {
        layout: Layout.PRAISE_COMPONENT,
        ...DEFAULT,
        tag: '口碑',
        tagClass: 'praise',
        itemWrap: ({ ref_car_score = {} }) => ref_car_score,
        title: ({ chosen_topic = '' }) => chosen_topic,
        commentCount: ({ comment_count = null }) => comment_count,
        cover: ({ images = [], recommend_images = [] }) =>
          formatImage(images[0]) ||
          formatImage(getCoverFromRecommendImages(recommend_images)),
      },
      {
        layout: Layout.NORMAL,
        ...DEFAULT,
      },
    ],
  },
  {
    type: Redirect.LIVE_SUBJECT,
    ...DEFAULT,
    tag: '现场直播',
    tagClass: 'live',
    showFooter: false,
  },
  {
    type: NewsType.SECTION, // 文章专栏
    ...DEFAULT,
    tag: ({ title }) => title,
    tagClass: 'column',
    // itemWrap: ({ article_item_list = [] }) => article_item_list[0] || {},
    cover: ({ image_list = [{}], article_item_list = [{}] }) =>
      formatImage(image_list[0] || article_item_list[0].icon),
    title: null,
    redirectData: ({ title }) => ({
      redirect_params: {
        title,
        type: 3,
      },
    }),
    showFooter: false,
  },
  {
    type: NewsType.ST_BIG,
    ...DEFAULT,
    tag: ({ title }) => title,
    tagClass: 'topic',
    title: null,
    showFooter: false,
  },
  {
    type: Redirect.TOPIC,
    layouts: [
      {
        layout: Layout.ST_BIG,
        ...DEFAULT,
        tag: ({ ref_post_theme = { theme: '' } }) => ref_post_theme.theme,
        tagClass: 'topic',
        title: null,
        showFooter: false,
      },
      {
        layout: Layout.TOPIC_COLUMN,
        ...DEFAULT,
        cover: ({ posts = [{}] }) =>
          formatImage({
            image: posts[0] && posts[0].cover,
            width: posts[0] && posts[0].cover_width,
            height: posts[0] && posts[0].cover_height,
          }),
        tag: ({ title = '' }) => title,
        tagClass: 'topic',
        title: null,
        showFooter: false,
      },
    ],
  },
];
