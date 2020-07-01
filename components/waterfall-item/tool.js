import { CONFIG, DEFAULT, AD_CONFIG } from './CONFIG';

export const formatImage = (_image = '', wCommand = '690x') => {
  if (!_image) {
    return null;
  }
  const DEFAULT_SIZE = {
    width: 354,
    height: 354,
  };
  const getHeight = (i) => Math.min(Math.max(266, i), 472);
  if (typeof _image === 'string') {
    return {
      image: getApp().globalData.wCommand(_image, wCommand),
      ...DEFAULT_SIZE,
    };
  }
  const { image, image_original, width, height } = _image;
  return {
    image: getApp().globalData.wCommand(
      image || image_original || '',
      wCommand
    ),
    ...DEFAULT_SIZE,
    ...(width &&
      height && {
        height: getHeight((height / width) * 354),
      }),
  };
};

export function formatUser(user = {}) {
  const formatIcon = (icon) => {
    if (!icon) return icon;
    return getApp().globalData.wCommand(icon, '1x1_100x100');
  };
  return {
    ...user,
    icon: formatIcon(user.icon),
  };
}

export const getPanelData = (item) => {
  const getConfig = () => {
    let config = CONFIG.find((i) => i.type == item.type);
    if (item.isAd) {
      config = AD_CONFIG;
    }
    if (config && config.layouts) {
      config = config.layouts.find(
        (i) => i.layout === item.layout_type || i.layout === item.display_style
      );
    }
    if (!config) {
      config = DEFAULT;
      console.log('no-config', item.type, item.layout_type, item);
    }
    return config;
  };
  const getPanelDataByConfig = (c) => {
    const panel = {};
    let _item = item;
    if (c.itemWrap) {
      _item = c.itemWrap(item);
    }
    Object.keys(c).forEach((key) => {
      if (typeof c[key] === 'function') {
        panel[key] = c[key](_item);
      } else {
        panel[key] = c[key];
      }
    });
    return panel;
  };
  const config = getConfig(item);
  return getPanelDataByConfig(config);
};

/**
 * 获取推荐图片作为瀑布流封面
 * @param {Array} images 推荐图片列表
 */
export const getCoverFromRecommendImages = (images = []) => {
  const IMAGE_TYPE = {
    BIG: 1,
    SMALL: 2,
  };
  const target =
    images.find((i) => i.image_type === IMAGE_TYPE.SMALL) || images[0];
  if (target) return target.image || '';
  return '';
};
