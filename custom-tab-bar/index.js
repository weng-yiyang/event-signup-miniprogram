// custom-tab-bar/index.js
const NORMAL_COLOR = '#999999';
const ACTIVE_COLOR = '#2B6CB0';

/**
 * 生成线性风格 SVG 图标 data URI（单色、统一描边，随选中态变色）。
 * 使用双引号作为 SVG 属性引号，经 encodeURIComponent 后双引号会被编码为 %22，
 * 因此生成的 data URI 中不含裸引号，可直接放入 CSS url() 中。
 * @param {string} paths SVG 内部路径
 * @param {string} color 描边颜色
 * @return {string} data:image/svg+xml 形式的 URI
 */
function buildIcon(paths, color) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
    'stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    paths + '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// 四个 tab 对应的线性图标路径（统一 24x24 描边风格）
const ICON_PATHS = {
  home: "<path d='M3 10.5 12 3l9 7.5'/><path d='M5 9.5V21h14V9.5'/>",
  detail: "<path d='M6 3h8l4 4v14H6z'/><path d='M9 9h6'/><path d='M9 13h6'/><path d='M9 17h4'/>",
  signup: "<path d='M4 20h4L19 9l-4-4L4 16z'/><path d='M14 6l4 4'/><path d='M4 20h4'/>",
  records: "<path d='M5 4h14v16H5z'/><path d='M9 8h6'/><path d='M9 12h6'/><path d='M9 16h4'/>",
};

/** 生成某 key 对应的常态/选中态图标 */
function makeIcon(key) {
  return {
    normal: buildIcon(ICON_PATHS[key], NORMAL_COLOR),
    active: buildIcon(ICON_PATHS[key], ACTIVE_COLOR),
  };
}

Component({
  data: {
    selected: 0,
    color: NORMAL_COLOR,
    selectedColor: ACTIVE_COLOR,
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: makeIcon('home') },
      { pagePath: '/pages/detail/index', text: '详情', icon: makeIcon('detail') },
      { pagePath: '/pages/signup/index', text: '报名', icon: makeIcon('signup') },
      { pagePath: '/pages/records/index', text: '记录', icon: makeIcon('records') },
    ],
  },
  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path;
      const index = e.currentTarget.dataset.index;
      wx.switchTab({ url: path });
      this.setData({ selected: index });
    },
  },
});
